
#!/bin/bash

TAG_KEY="App"
TAG_VALUE="Demo-HR-Application"
AWS_REGION="us-east-1"
LOG_FILE="aws_hrapp_cleanup.log"
PROFILE_NAME="hr-portal-ec2-profile"
DB_INSTANCE_ID="hr-portal-db"
POLICY_NAME="hr-portal-ec2-ssh-policy"
ROLE_NAME="hr-portal-ec2-role"
TARGET_GROUP_NAME="hr-portal-tg"
LOAD_BALANCER_NAME="hr-portal-alb"
ROUTE_TABLE_NAME="hr-portal-public-route-table"


log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log "❌ AWS CLI not found. Install and configure it before running this script."
        exit 1
    fi
}

delete_rds_instance(){
    # Check if the RDS instance exists
    EXISTS=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE_ID" --query "DBInstances[0].DBInstanceIdentifier" --output text 2>/dev/null || echo "")

    if [[ -z "$EXISTS" || "$EXISTS" == "None" ]]; then
        log "✅ RDS instance '$DB_INSTANCE_ID' does not exist. Nothing to delete."
    else
        log "🔎 RDS instance '$DB_INSTANCE_ID' found. Preparing to delete..."

        # Get associated Subnet Group Name
        SUBNET_GROUP=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE_ID" --query "DBInstances[0].DBSubnetGroup.DBSubnetGroupName" --output text)

        # Delete the RDS instance
        log "🗑 Deleting RDS instance: $DB_INSTANCE_ID..."
        aws rds modify-db-instance --db-instance-identifier "$DB_INSTANCE_ID" --deletion-protection false &>/dev/null || true
        aws rds delete-db-instance --db-instance-identifier "$DB_INSTANCE_ID" --skip-final-snapshot &>/dev/null
        log "⏳ Waiting for RDS instance deletion to complete..."
        aws rds wait db-instance-deleted --db-instance-identifier "$DB_INSTANCE_ID"
        log "✅ RDS instance '$DB_INSTANCE_ID' deleted."

        # Delete the associated subnet group
        if [[ -n "$SUBNET_GROUP" && "$SUBNET_GROUP" != "None" ]]; then
            log "🗑 Deleting associated RDS Subnet Group: $SUBNET_GROUP..."
            aws rds delete-db-subnet-group --db-subnet-group-name "$SUBNET_GROUP" &>/dev/null
            log "✅ RDS Subnet Group '$SUBNET_GROUP' deleted."
        else
            echo "⚠ No associated subnet group found for '$DB_INSTANCE_ID'."
        fi
    fi
}

delete_ec2_instances() {
    log "🔎 Checking for EC2 instances tagged '$TAG_KEY=$TAG_VALUE'..."
    INSTANCE_IDS=$(aws ec2 describe-instances --region $AWS_REGION --filters "Name=tag:$TAG_KEY,Values=$TAG_VALUE" "Name=instance-state-name,Values=pending,running,stopped,stopping" --query "Reservations[].Instances[].InstanceId" --output text)
    
    if [[ -z "$INSTANCE_IDS" ]]; then
        log "✅ No EC2 instances found."
    else
        log "🔎 Terminating EC2 instances: $INSTANCE_IDS"
        # Force terminate the instances
        aws ec2 modify-instance-attribute --instance-id $INSTANCE_IDS --no-disable-api-termination &>/dev/null || true
        aws ec2 terminate-instances --region $AWS_REGION --instance-ids $INSTANCE_IDS &>/dev/null
        aws ec2 wait instance-terminated --region $AWS_REGION --instance-ids $INSTANCE_IDS &>/dev/null
        log "✅ EC2 instances terminated."
    fi

    # Also search for instances by Name tag containing 'hr-portal'
    HR_PORTAL_INSTANCES=$(aws ec2 describe-instances --region $AWS_REGION --filters "Name=tag:Name,Values=*hr-portal*" "Name=instance-state-name,Values=pending,running,stopped,stopping" --query "Reservations[].Instances[].InstanceId" --output text)
    
    if [[ -n "$HR_PORTAL_INSTANCES" && "$HR_PORTAL_INSTANCES" != "$INSTANCE_IDS" ]]; then
        log "🔎 Found additional HR portal instances: $HR_PORTAL_INSTANCES"
        aws ec2 modify-instance-attribute --instance-id $HR_PORTAL_INSTANCES --no-disable-api-termination &>/dev/null || true
        aws ec2 terminate-instances --region $AWS_REGION --instance-ids $HR_PORTAL_INSTANCES &>/dev/null
        aws ec2 wait instance-terminated --region $AWS_REGION --instance-ids $HR_PORTAL_INSTANCES &>/dev/null
        log "✅ Additional HR portal instances terminated."
    fi
}

delete_target_group() {
    log "🔎 Checking for Target Group '$TARGET_GROUP_NAME'..."
    TG_ARN=$(aws elbv2 describe-target-groups --region $AWS_REGION --query "TargetGroups[?TargetGroupName=='$TARGET_GROUP_NAME'].TargetGroupArn" --output text)

    if [[ -z "$TG_ARN" ]]; then
        log "✅ Target Group '$TARGET_GROUP_NAME' does not exist."
    else
        log "🗑 Deleting Target Group: $TARGET_GROUP_NAME..."
        aws elbv2 delete-target-group --region $AWS_REGION --target-group-arn "$TG_ARN" &>/dev/null
        log "✅ Target Group deleted."
    fi
    
    # Find and delete any other target groups with 'hr-portal' in the name
    OTHER_TGS=$(aws elbv2 describe-target-groups --region $AWS_REGION --query "TargetGroups[?contains(TargetGroupName, 'hr-portal')].TargetGroupArn" --output text)
    for TG in $OTHER_TGS; do
        if [[ -n "$TG" && "$TG" != "$TG_ARN" ]]; then
            log "🗑 Deleting additional Target Group: $TG..."
            aws elbv2 delete-target-group --region $AWS_REGION --target-group-arn "$TG" &>/dev/null
            log "✅ Additional Target Group deleted."
        fi
    done
}

delete_load_balancer() {
    log "🔎 Checking for Load Balancer '$LOAD_BALANCER_NAME'..."
    ALB_ARN=$(aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?LoadBalancerName=='$LOAD_BALANCER_NAME'].LoadBalancerArn" --output text)

    if [[ -z "$ALB_ARN" ]]; then
        log "✅ Load Balancer '$LOAD_BALANCER_NAME' does not exist."
    else
        # Disable deletion protection if enabled
        aws elbv2 modify-load-balancer-attributes --region $AWS_REGION --load-balancer-arn "$ALB_ARN" --attributes Key=deletion_protection.enabled,Value=false &>/dev/null
        
        log "🗑 Deleting Load Balancer: $LOAD_BALANCER_NAME..."
        aws elbv2 delete-load-balancer --region $AWS_REGION --load-balancer-arn "$ALB_ARN" &>/dev/null
        aws elbv2 wait load-balancers-deleted --region $AWS_REGION --load-balancer-arns "$ALB_ARN"
        log "✅ Load Balancer deleted."
    fi
    
    # Find and delete any other ALBs with 'hr-portal' in the name
    OTHER_ALBS=$(aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?contains(LoadBalancerName, 'hr-portal')].LoadBalancerArn" --output text)
    for ALB in $OTHER_ALBS; do
        if [[ -n "$ALB" && "$ALB" != "$ALB_ARN" ]]; then
            # Disable deletion protection
            aws elbv2 modify-load-balancer-attributes --region $AWS_REGION --load-balancer-arn "$ALB" --attributes Key=deletion_protection.enabled,Value=false &>/dev/null
            
            log "🗑 Deleting additional Load Balancer: $ALB..."
            aws elbv2 delete-load-balancer --region $AWS_REGION --load-balancer-arn "$ALB" &>/dev/null
            aws elbv2 wait load-balancers-deleted --region $AWS_REGION --load-balancer-arns "$ALB"
            log "✅ Additional Load Balancer deleted."
        fi
    done
}

delete_vpcs() {
    log "🔎 Checking for VPCs tagged '$TAG_KEY=$TAG_VALUE'..."
    VPC_IDS=$(aws ec2 describe-vpcs --region $AWS_REGION --filters "Name=tag:$TAG_KEY,Values=$TAG_VALUE" --query "Vpcs[].VpcId" --output text)

    # Also check for VPCs with 'hr-portal' in any tag value
    HR_PORTAL_VPCS=$(aws ec2 describe-vpcs --region $AWS_REGION --filters "Name=tag-value,Values=*hr-portal*" --query "Vpcs[].VpcId" --output text)
    
    # Combine and deduplicate VPC IDs
    ALL_VPCS=$(echo "$VPC_IDS $HR_PORTAL_VPCS" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')

    if [[ -z "$ALL_VPCS" ]]; then
        log "✅ No HR Portal VPCs found."
    else
        for VPC in $ALL_VPCS; do
            log "🔎 Cleaning up VPC: $VPC"

            # Delete VPC Endpoints
            VPCE_IDS=$(aws ec2 describe-vpc-endpoints --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "VpcEndpoints[].VpcEndpointId" --output text)
            for VPCE in $VPCE_IDS; do
                if [[ -n "$VPCE" ]]; then
                    aws ec2 delete-vpc-endpoints --region $AWS_REGION --vpc-endpoint-ids "$VPCE" &>/dev/null
                    log "✅ Deleted VPC Endpoint: $VPCE"
                fi
            done

            # Detach and delete Network Interfaces
            NI_IDS=$(aws ec2 describe-network-interfaces --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "NetworkInterfaces[].NetworkInterfaceId" --output text)
            for NI in $NI_IDS; do
                if [[ -n "$NI" ]]; then
                    ATTACHMENT=$(aws ec2 describe-network-interfaces --region $AWS_REGION --network-interface-ids "$NI" --query "NetworkInterfaces[0].Attachment.AttachmentId" --output text)
                    if [[ -n "$ATTACHMENT" && "$ATTACHMENT" != "None" ]]; then
                        aws ec2 detach-network-interface --region $AWS_REGION --attachment-id "$ATTACHMENT" --force &>/dev/null
                        sleep 5
                    fi
                    aws ec2 delete-network-interface --region $AWS_REGION --network-interface-id "$NI" &>/dev/null
                    log "✅ Deleted Network Interface: $NI"
                fi
            done

            # Delete NAT Gateways
            NAT_IDS=$(aws ec2 describe-nat-gateways --region $AWS_REGION --filter "Name=vpc-id,Values=$VPC" --query "NatGateways[?State!='deleted'].NatGatewayId" --output text)
            for NAT in $NAT_IDS; do
                if [[ -n "$NAT" ]]; then
                    aws ec2 delete-nat-gateway --region $AWS_REGION --nat-gateway-id "$NAT" &>/dev/null
                    log "✅ Deleted NAT Gateway: $NAT - Waiting for deletion to complete..."
                    aws ec2 wait nat-gateway-deleted --region $AWS_REGION --nat-gateway-ids "$NAT"
                fi
            done

            # Delete Security Groups (except default)
            SG_IDS=$(aws ec2 describe-security-groups --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
            for SG in $SG_IDS; do
                if [[ -n "$SG" ]]; then
                    aws ec2 delete-security-group --region $AWS_REGION --group-id "$SG" &>/dev/null
                    log "✅ Deleted Security Group: $SG"
                fi
            done

            # Delete Subnets
            SUBNETS=$(aws ec2 describe-subnets --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "Subnets[].SubnetId" --output text)
            for SUBNET in $SUBNETS; do
                if [[ -n "$SUBNET" ]]; then
                    aws ec2 delete-subnet --region $AWS_REGION --subnet-id "$SUBNET" &>/dev/null
                    log "✅ Deleted Subnet: $SUBNET"
                fi
            done

            # Delete Internet Gateways
            IGW_IDS=$(aws ec2 describe-internet-gateways --region $AWS_REGION --filters "Name=attachment.vpc-id,Values=$VPC" --query "InternetGateways[].InternetGatewayId" --output text)
            for IGW in $IGW_IDS; do
                if [[ -n "$IGW" ]]; then
                    aws ec2 detach-internet-gateway --region $AWS_REGION --internet-gateway-id "$IGW" --vpc-id "$VPC" &>/dev/null
                    aws ec2 delete-internet-gateway --region $AWS_REGION --internet-gateway-id "$IGW" &>/dev/null
                    log "✅ Deleted Internet Gateway: $IGW"
                fi
            done

            # Delete Route Tables (except the main one which is deleted with the VPC)
            RT_IDS=$(aws ec2 describe-route-tables --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "RouteTables[?Associations[0].Main!=\`true\`].RouteTableId" --output text)
            for RT in $RT_IDS; do
                if [[ -n "$RT" ]]; then
                    # Get and Disassociate Route Table Associations
                    ASSOC_IDS=$(aws ec2 describe-route-tables --region $AWS_REGION --route-table-ids "$RT" --query "RouteTables[0].Associations[?Main==\`false\`].RouteTableAssociationId" --output text)
                    for ASSOC in $ASSOC_IDS; do
                        if [[ -n "$ASSOC" ]]; then
                            aws ec2 disassociate-route-table --region $AWS_REGION --association-id "$ASSOC" &>/dev/null
                        fi
                    done
                    aws ec2 delete-route-table --region $AWS_REGION --route-table-id "$RT" &>/dev/null
                    log "✅ Deleted Route Table: $RT"
                fi
            done

            # Delete VPC Peering Connections
            PEERING_IDS=$(aws ec2 describe-vpc-peering-connections --region $AWS_REGION --filters "Name=requester-vpc-info.vpc-id,Values=$VPC" --query "VpcPeeringConnections[].VpcPeeringConnectionId" --output text)
            for PEERING in $PEERING_IDS; do
                if [[ -n "$PEERING" ]]; then
                    aws ec2 delete-vpc-peering-connection --region $AWS_REGION --vpc-peering-connection-id "$PEERING" &>/dev/null
                    log "✅ Deleted VPC Peering Connection: $PEERING"
                fi
            done

            # Try to delete the VPC after all resources are cleaned up
            log "🗑 Deleting VPC: $VPC..."
            aws ec2 delete-vpc --region $AWS_REGION --vpc-id "$VPC" &>/dev/null
            if [ $? -eq 0 ]; then
                log "✅ Deleted VPC: $VPC"
            else
                log "❌ Failed to delete VPC: $VPC. There may be remaining resources attached to it."
                
                # Additional forceful cleanup of any remaining resources
                log "Attempting forceful cleanup of remaining resources..."
                
                # Force detach any remaining ENIs
                REMAINING_NI_IDS=$(aws ec2 describe-network-interfaces --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "NetworkInterfaces[].NetworkInterfaceId" --output text)
                for NI in $REMAINING_NI_IDS; do
                    if [[ -n "$NI" ]]; then
                        aws ec2 modify-network-interface-attribute --region $AWS_REGION --network-interface-id "$NI" --attachment AttachmentId=$(aws ec2 describe-network-interfaces --region $AWS_REGION --network-interface-ids "$NI" --query "NetworkInterfaces[0].Attachment.AttachmentId" --output text),DeleteOnTermination=true &>/dev/null || true
                        ATTACHMENT=$(aws ec2 describe-network-interfaces --region $AWS_REGION --network-interface-ids "$NI" --query "NetworkInterfaces[0].Attachment.AttachmentId" --output text)
                        if [[ -n "$ATTACHMENT" && "$ATTACHMENT" != "None" ]]; then
                            aws ec2 detach-network-interface --region $AWS_REGION --attachment-id "$ATTACHMENT" --force &>/dev/null || true
                            sleep 10
                        fi
                        aws ec2 delete-network-interface --region $AWS_REGION --network-interface-id "$NI" &>/dev/null || true
                    fi
                done
                
                # Try again to delete the VPC
                aws ec2 delete-vpc --region $AWS_REGION --vpc-id "$VPC" &>/dev/null
                if [ $? -eq 0 ]; then
                    log "✅ VPC deleted after forceful cleanup: $VPC"
                else
                    log "❌ Still unable to delete VPC: $VPC"
                fi
            fi
        done
    fi
}

delete_apigateway_restapis() {
    log "🔎 Checking for API Gateways tagged '$TAG_KEY=$TAG_VALUE'..."
    REST_APIS=$(aws apigateway get-rest-apis --region $AWS_REGION --query "items[?tags.$TAG_KEY=='$TAG_VALUE'].id" --output text)
    
    # Also find API Gateways with 'hr-portal' in the name
    HR_PORTAL_APIS=$(aws apigateway get-rest-apis --region $AWS_REGION --query "items[?contains(name, 'hr-portal')].id" --output text)
    
    # Combine and deduplicate API IDs
    ALL_APIS=$(echo "$REST_APIS $HR_PORTAL_APIS" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
    
    if [[ -z "$ALL_APIS" ]]; then
        log "✅ No HR Portal API Gateways found."
    else
        for API in $ALL_APIS; do
            if [[ -n "$API" ]]; then
                log "🔎 Deleting API Gateway: $API"
                aws apigateway delete-rest-api --region $AWS_REGION --rest-api-id "$API" &>/dev/null
                log "✅ API Gateway deleted: $API"
            fi
        done
    fi
}

delete_iam_policies_roles_profiles() {
    log "🔎 Checking for IAM Policies, Roles, and Instance Profiles tagged '$TAG_KEY=$TAG_VALUE'..."

    # Search for tagged resources
    IAM_PROFILES=$(aws iam list-instance-profiles --query "InstanceProfiles[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].InstanceProfileName" --output text || echo "")
    IAM_ROLES=$(aws iam list-roles --query "Roles[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].RoleName" --output text || echo "")
    IAM_POLICIES=$(aws iam list-policies --scope Local --query "Policies[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].Arn" --output text || echo "")

    # Also search for resources with 'hr-portal' in the name
    HR_PORTAL_PROFILES=$(aws iam list-instance-profiles --query "InstanceProfiles[?contains(InstanceProfileName, 'hr-portal')].InstanceProfileName" --output text || echo "")
    HR_PORTAL_ROLES=$(aws iam list-roles --query "Roles[?contains(RoleName, 'hr-portal')].RoleName" --output text || echo "")
    HR_PORTAL_POLICIES=$(aws iam list-policies --scope Local --query "Policies[?contains(PolicyName, 'hr-portal')].Arn" --output text || echo "")

    # Combine and deduplicate
    ALL_PROFILES=$(echo "$IAM_PROFILES $HR_PORTAL_PROFILES" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
    ALL_ROLES=$(echo "$IAM_ROLES $HR_PORTAL_ROLES" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
    ALL_POLICIES=$(echo "$IAM_POLICIES $HR_PORTAL_POLICIES" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')

    for PROFILE in $ALL_PROFILES; do
        if [[ -n "$PROFILE" ]]; then
            # Get roles from profile
            ROLES=$(aws iam get-instance-profile --instance-profile-name "$PROFILE" --query "InstanceProfile.Roles[].RoleName" --output text 2>/dev/null || echo "")
            for ROLE in $ROLES; do
                if [[ -n "$ROLE" ]]; then
                    log "🔎 Detaching IAM Role: $ROLE from Instance Profile: $PROFILE"
                    aws iam remove-role-from-instance-profile --instance-profile-name "$PROFILE" --role-name "$ROLE" &>/dev/null || true
                fi
            done
            log "🔎 Deleting IAM Instance Profile: $PROFILE"
            aws iam delete-instance-profile --instance-profile-name "$PROFILE" &>/dev/null || true
            log "✅ IAM Instance Profile deleted: $PROFILE"
        fi
    done

    for ROLE in $ALL_ROLES; do
        if [[ -n "$ROLE" ]]; then
            # Detach managed policies
            ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "$ROLE" --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null || echo "")
            for POLICY in $ATTACHED_POLICIES; do
                if [[ -n "$POLICY" ]]; then
                    log "🔎 Detaching Policy: $POLICY from Role: $ROLE"
                    aws iam detach-role-policy --role-name "$ROLE" --policy-arn "$POLICY" &>/dev/null || true
                fi
            done
            
            # Delete inline policies
            INLINE_POLICIES=$(aws iam list-role-policies --role-name "$ROLE" --query "PolicyNames[]" --output text 2>/dev/null || echo "")
            for POLICY in $INLINE_POLICIES; do
                if [[ -n "$POLICY" ]]; then
                    log "🔎 Deleting inline policy: $POLICY from Role: $ROLE"
                    aws iam delete-role-policy --role-name "$ROLE" --policy-name "$POLICY" &>/dev/null || true
                fi
            done
            
            log "🔎 Deleting IAM Role: $ROLE"
            aws iam delete-role --role-name "$ROLE" &>/dev/null || true
            log "✅ IAM Role deleted: $ROLE"
        fi
    done

    for POLICY in $ALL_POLICIES; do
        if [[ -n "$POLICY" ]]; then
            POLICY_NAME=$(echo "$POLICY" | awk -F '/' '{print $NF}')
            log "🔎 Deleting IAM Policy: $POLICY_NAME"
            
            # First detach from all entities
            ENTITIES=$(aws iam list-entities-for-policy --policy-arn "$POLICY" 2>/dev/null || echo "")
            ATTACHED_ROLES=$(echo "$ENTITIES" | jq -r '.PolicyRoles[].RoleName' 2>/dev/null || echo "")
            ATTACHED_USERS=$(echo "$ENTITIES" | jq -r '.PolicyUsers[].UserName' 2>/dev/null || echo "")
            ATTACHED_GROUPS=$(echo "$ENTITIES" | jq -r '.PolicyGroups[].GroupName' 2>/dev/null || echo "")
            
            for ROLE in $ATTACHED_ROLES; do
                aws iam detach-role-policy --role-name "$ROLE" --policy-arn "$POLICY" &>/dev/null || true
            done
            
            for USER in $ATTACHED_USERS; do
                aws iam detach-user-policy --user-name "$USER" --policy-arn "$POLICY" &>/dev/null || true
            done
            
            for GROUP in $ATTACHED_GROUPS; do
                aws iam detach-group-policy --group-name "$GROUP" --policy-arn "$POLICY" &>/dev/null || true
            done
            
            # Delete all versions except the default
            VERSIONS=$(aws iam list-policy-versions --policy-arn "$POLICY" --query "Versions[?!IsDefaultVersion].VersionId" --output text 2>/dev/null || echo "")
            for VERSION in $VERSIONS; do
                if [[ -n "$VERSION" ]]; then
                    aws iam delete-policy-version --policy-arn "$POLICY" --version-id "$VERSION" &>/dev/null || true
                fi
            done
            
            aws iam delete-policy --policy-arn "$POLICY" &>/dev/null || true
            log "✅ IAM Policy deleted: $POLICY_NAME"
        fi
    done

    log "✅ IAM Policies, Roles, and Instance Profiles cleanup completed."
}

delete_s3_buckets() {
    log "🔎 Checking for S3 buckets with 'hr-portal' in the name..."
    
    # List buckets with hr-portal in the name
    HR_PORTAL_BUCKETS=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'hr-portal')].Name" --output text)
    
    for BUCKET in $HR_PORTAL_BUCKETS; do
        if [[ -n "$BUCKET" ]]; then
            log "🔎 Emptying and deleting S3 bucket: $BUCKET"
            # Empty the bucket including all versions and delete markers
            aws s3api list-object-versions --bucket "$BUCKET" --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' --output json > /tmp/delete_bucket_versions.json 2>/dev/null || echo "[]" > /tmp/delete_bucket_versions.json
            if [ -s /tmp/delete_bucket_versions.json ] && [ "$(cat /tmp/delete_bucket_versions.json)" != "[]" ]; then
                aws s3api delete-objects --bucket "$BUCKET" --delete file:///tmp/delete_bucket_versions.json &>/dev/null || true
            fi
            
            # Delete delete markers
            aws s3api list-object-versions --bucket "$BUCKET" --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' --output json > /tmp/delete_bucket_markers.json 2>/dev/null || echo "[]" > /tmp/delete_bucket_markers.json
            if [ -s /tmp/delete_bucket_markers.json ] && [ "$(cat /tmp/delete_bucket_markers.json)" != "[]" ]; then
                aws s3api delete-objects --bucket "$BUCKET" --delete file:///tmp/delete_bucket_markers.json &>/dev/null || true
            fi
            
            # Delete remaining objects (non-versioned)
            aws s3 rm "s3://$BUCKET" --recursive &>/dev/null || true
            
            # Delete the bucket
            aws s3api delete-bucket --bucket "$BUCKET" --region $AWS_REGION &>/dev/null
            log "✅ S3 bucket deleted: $BUCKET"
        fi
    done
    
    # Also check for temp docker buckets that might have been created during CI/CD
    DOCKER_TEMP_BUCKETS=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'docker-temp')].Name" --output text)
    
    for BUCKET in $DOCKER_TEMP_BUCKETS; do
        if [[ -n "$BUCKET" ]]; then
            log "🔎 Emptying and deleting temporary Docker S3 bucket: $BUCKET"
            aws s3 rm "s3://$BUCKET" --recursive &>/dev/null || true
            aws s3api delete-bucket --bucket "$BUCKET" --region $AWS_REGION &>/dev/null
            log "✅ Temporary Docker S3 bucket deleted: $BUCKET"
        fi
    done
}

# Function to handle multiple AWS regions if needed
clean_region() {
    local region=$1
    AWS_REGION=$region
    log "🧹 Cleaning up resources in region: $AWS_REGION"
    
    # Execute all cleanup functions sequentially
    delete_target_group
    delete_load_balancer
    delete_rds_instance
    delete_apigateway_restapis
    delete_ec2_instances
    delete_vpcs
}

deleteIAMRole_hr_portal_lambda_overly_permissive() {
    
    log "🔎 Checking for IAM Role hr-portal-lambda-overly-permissive-role..."
    EXISTS=$(aws iam get-role --role-name hr-portal-lambda-overly-permissive-role --query "Role.RoleName" --output text 2>/dev/null || echo "")

    if [[ -z "$EXISTS" || "$EXISTS" == "None" ]]; then
        log "✅ IAM Role hr-portal-lambda-overly-permissive-role does not exist."
    else
        log "🗑 Deleting IAM Role: hr-portal-lambda-overly-permissive-role..."
        POLICIES=$(aws iam list-attached-role-policies --role-name hr-portal-lambda-overly-permissive-role --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null || echo "")
        for POLICY in $POLICIES; do
            if [[ -n "$POLICY" ]]; then
                aws iam detach-role-policy --role-name hr-portal-lambda-overly-permissive-role --policy-arn "$POLICY" &>/dev/null || true
            fi
        done
        aws iam delete-role --role-name hr-portal-lambda-overly-permissive-role &>/dev/null || true
        log "✅ IAM Role deleted."
    fi
}

# Execute in Correct Order
check_aws_cli

# Multi-region cleanup if needed
# Primary region cleanup
clean_region $AWS_REGION

# Run IAM cleanup (global services)
delete_iam_policies_roles_profiles
deleteIAMRole_hr_portal_lambda_overly_permissive

# S3 bucket cleanup (global service)
delete_s3_buckets

log "🎉 AWS cleanup completed for Demo-HR-Application resources."
