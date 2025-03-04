
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

        # Disable deletion protection first
        log "🔧 Disabling deletion protection for RDS instance..."
        aws rds modify-db-instance --db-instance-identifier "$DB_INSTANCE_ID" --no-deletion-protection --apply-immediately &>/dev/null || true
        sleep 30  # Wait for modification to apply

        # Delete the RDS instance
        log "🗑 Deleting RDS instance: $DB_INSTANCE_ID..."
        aws rds delete-db-instance --db-instance-identifier "$DB_INSTANCE_ID" --skip-final-snapshot &>/dev/null
        log "⏳ Waiting for RDS instance deletion to complete (this may take a while)..."
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
    
    # Also look for instances with specific names
    HR_PORTAL_INSTANCES=$(aws ec2 describe-instances --region $AWS_REGION --filters "Name=tag:Name,Values=*hr-portal*,Demo-Jenkins" "Name=instance-state-name,Values=pending,running,stopped,stopping" --query "Reservations[].Instances[].InstanceId" --output text)
    
    # Combine and deduplicate instance IDs
    ALL_INSTANCES=$(echo "$INSTANCE_IDS $HR_PORTAL_INSTANCES" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
    
    if [[ -z "$ALL_INSTANCES" ]]; then
        log "✅ No relevant EC2 instances found."
    else
        for INSTANCE in $ALL_INSTANCES; do
            if [[ -n "$INSTANCE" ]]; then
                log "🔎 Terminating EC2 instance: $INSTANCE"
                # Disable termination protection first
                aws ec2 modify-instance-attribute --instance-id $INSTANCE --no-disable-api-termination &>/dev/null || true
                # Terminate the instance
                aws ec2 terminate-instances --region $AWS_REGION --instance-ids $INSTANCE &>/dev/null
            fi
        done
        
        # Wait for all instances to terminate
        log "⏳ Waiting for all instances to terminate..."
        for INSTANCE in $ALL_INSTANCES; do
            if [[ -n "$INSTANCE" ]]; then
                aws ec2 wait instance-terminated --region $AWS_REGION --instance-ids $INSTANCE &>/dev/null
                log "✅ Instance $INSTANCE terminated."
            fi
        done
    fi
}

delete_target_groups() {
    log "🔎 Finding load balancer target groups..."
    
    # Find target groups with 'hr-portal' in the name
    TG_ARNS=$(aws elbv2 describe-target-groups --region $AWS_REGION --query "TargetGroups[?contains(TargetGroupName, 'hr-portal')].TargetGroupArn" --output text)
    
    for TG_ARN in $TG_ARNS; do
        if [[ -n "$TG_ARN" ]]; then
            # Before deleting, remove any targets
            TARGETS=$(aws elbv2 describe-target-health --region $AWS_REGION --target-group-arn $TG_ARN --query 'TargetHealthDescriptions[*].Target.Id' --output text || echo "")
            for TARGET in $TARGETS; do
                if [[ -n "$TARGET" ]]; then
                    log "🔎 Deregistering target $TARGET from target group..."
                    aws elbv2 deregister-targets --region $AWS_REGION --target-group-arn $TG_ARN --targets Id=$TARGET &>/dev/null || true
                fi
            done
            
            # Now delete the target group
            log "🗑 Deleting target group: $TG_ARN..."
            aws elbv2 delete-target-group --region $AWS_REGION --target-group-arn $TG_ARN &>/dev/null
            log "✅ Target group deleted."
        fi
    done
}

delete_load_balancers() {
    log "🔎 Finding load balancers..."
    
    # Find load balancers with 'hr-portal' in the name
    LB_ARNS=$(aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?contains(LoadBalancerName, 'hr-portal')].LoadBalancerArn" --output text)
    
    for LB_ARN in $LB_ARNS; do
        if [[ -n "$LB_ARN" ]]; then
            # First, delete all listeners attached to this load balancer
            log "🔎 Finding and deleting listeners for load balancer..."
            LISTENERS=$(aws elbv2 describe-listeners --region $AWS_REGION --load-balancer-arn $LB_ARN --query "Listeners[*].ListenerArn" --output text || echo "")
            for LISTENER in $LISTENERS; do
                if [[ -n "$LISTENER" ]]; then
                    log "🗑 Deleting listener: $LISTENER..."
                    aws elbv2 delete-listener --region $AWS_REGION --listener-arn $LISTENER &>/dev/null || true
                fi
            done
            
            # Disable deletion protection
            log "🔧 Disabling deletion protection for load balancer..."
            aws elbv2 modify-load-balancer-attributes --region $AWS_REGION --load-balancer-arn $LB_ARN --attributes Key=deletion_protection.enabled,Value=false &>/dev/null || true
            
            # Delete the load balancer
            log "🗑 Deleting load balancer: $LB_ARN..."
            aws elbv2 delete-load-balancer --region $AWS_REGION --load-balancer-arn $LB_ARN &>/dev/null
            log "⏳ Waiting for load balancer deletion..."
            aws elbv2 wait load-balancers-deleted --region $AWS_REGION --load-balancer-arns $LB_ARN
            log "✅ Load balancer deleted."
        fi
    done
}

delete_security_groups() {
    log "🔎 Finding security groups..."
    
    # Find security groups with 'hr-portal' in the name or tag
    SG_IDS=$(aws ec2 describe-security-groups --region $AWS_REGION --filters "Name=tag:$TAG_KEY,Values=$TAG_VALUE" --query 'SecurityGroups[*].GroupId' --output text)
    HR_SG_IDS=$(aws ec2 describe-security-groups --region $AWS_REGION --filters "Name=group-name,Values=*hr-portal*,*jenkins*" --query 'SecurityGroups[*].GroupId' --output text)
    
    # Combine and deduplicate
    ALL_SG_IDS=$(echo "$SG_IDS $HR_SG_IDS" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
    
    if [[ -z "$ALL_SG_IDS" ]]; then
        log "✅ No relevant security groups found."
    else
        # Wait before trying to delete security groups (allow time for dependent resources to be deleted)
        log "⏳ Waiting for dependent resources to be deleted before removing security groups..."
        sleep 30
        
        for SG_ID in $ALL_SG_IDS; do
            if [[ -n "$SG_ID" ]]; then
                # First, remove all ingress and egress rules to avoid dependency issues
                log "🔧 Removing all rules from security group: $SG_ID..."
                aws ec2 revoke-security-group-ingress --region $AWS_REGION --group-id $SG_ID --ip-permissions "$(aws ec2 describe-security-groups --region $AWS_REGION --group-ids $SG_ID --query 'SecurityGroups[0].IpPermissions' --output json)" &>/dev/null || true
                aws ec2 revoke-security-group-egress --region $AWS_REGION --group-id $SG_ID --ip-permissions "$(aws ec2 describe-security-groups --region $AWS_REGION --group-ids $SG_ID --query 'SecurityGroups[0].IpPermissionsEgress' --output json)" &>/dev/null || true
                
                # Try to delete the security group
                log "🗑 Deleting security group: $SG_ID..."
                aws ec2 delete-security-group --region $AWS_REGION --group-id $SG_ID &>/dev/null || log "⚠ Unable to delete security group $SG_ID at this time. May have dependencies."
            fi
        done
        
        # Second pass to catch any that failed due to dependencies
        sleep 30
        for SG_ID in $ALL_SG_IDS; do
            if [[ -n "$SG_ID" ]]; then
                # Check if security group still exists
                EXISTS=$(aws ec2 describe-security-groups --region $AWS_REGION --group-ids $SG_ID --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || echo "")
                if [[ -n "$EXISTS" && "$EXISTS" != "None" ]]; then
                    log "🔁 Retrying deletion of security group: $SG_ID..."
                    aws ec2 delete-security-group --region $AWS_REGION --group-id $SG_ID &>/dev/null || log "⚠ Unable to delete security group $SG_ID. May need manual cleanup."
                fi
            fi
        done
    fi
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
                log "⚠ Failed to delete VPC: $VPC. There may be remaining resources attached to it."
                
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
                    log "⚠ Still unable to delete VPC: $VPC"
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
                log "🗑 Deleting API Gateway: $API"
                aws apigateway delete-rest-api --region $AWS_REGION --rest-api-id "$API" &>/dev/null
                log "✅ API Gateway deleted: $API"
            fi
        done
    fi
}

delete_iam_resources() {
    log "🔎 Checking for IAM Policies, Roles, and Instance Profiles tagged '$TAG_KEY=$TAG_VALUE'..."

    # Find instance profiles by name pattern
    HR_PROFILE_NAMES=$(aws iam list-instance-profiles --query "InstanceProfiles[?contains(InstanceProfileName, 'hr-portal')].InstanceProfileName" --output text)
    
    # Process each instance profile
    for PROFILE in $HR_PROFILE_NAMES; do
        if [[ -n "$PROFILE" ]]; then
            log "🔎 Processing IAM instance profile: $PROFILE"
            
            # Get roles attached to the profile
            ROLES=$(aws iam get-instance-profile --instance-profile-name $PROFILE --query "InstanceProfile.Roles[].RoleName" --output text 2>/dev/null || echo "")
            
            # Remove roles from profile
            for ROLE in $ROLES; do
                if [[ -n "$ROLE" ]]; then
                    log "🔧 Removing role $ROLE from instance profile $PROFILE"
                    aws iam remove-role-from-instance-profile --instance-profile-name $PROFILE --role-name $ROLE &>/dev/null || true
                fi
            done
            
            # Delete the instance profile
            log "🗑 Deleting instance profile: $PROFILE"
            aws iam delete-instance-profile --instance-profile-name $PROFILE &>/dev/null || true
        fi
    done
    
    # Find roles by name pattern
    HR_ROLE_NAMES=$(aws iam list-roles --query "Roles[?contains(RoleName, 'hr-portal') || contains(RoleName, 'lambda-overly-permissive')].RoleName" --output text)
    
    # Process each role
    for ROLE in $HR_ROLE_NAMES; do
        if [[ -n "$ROLE" ]]; then
            log "🔎 Processing IAM role: $ROLE"
            
            # Detach managed policies
            POLICIES=$(aws iam list-attached-role-policies --role-name $ROLE --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null || echo "")
            for POLICY in $POLICIES; do
                if [[ -n "$POLICY" ]]; then
                    log "🔧 Detaching policy $POLICY from role $ROLE"
                    aws iam detach-role-policy --role-name $ROLE --policy-arn $POLICY &>/dev/null || true
                fi
            done
            
            # Delete inline policies
            INLINE_POLICIES=$(aws iam list-role-policies --role-name $ROLE --query "PolicyNames[]" --output text 2>/dev/null || echo "")
            for POLICY in $INLINE_POLICIES; do
                if [[ -n "$POLICY" ]]; then
                    log "🗑 Deleting inline policy $POLICY from role $ROLE"
                    aws iam delete-role-policy --role-name $ROLE --policy-name $POLICY &>/dev/null || true
                fi
            done
            
            # Delete the role
            log "🗑 Deleting role: $ROLE"
            aws iam delete-role --role-name $ROLE &>/dev/null || true
        fi
    done
    
    # Find customer managed policies by name pattern
    HR_POLICY_ARNS=$(aws iam list-policies --scope Local --query "Policies[?contains(PolicyName, 'hr-portal')].Arn" --output text)
    
    # Process each policy
    for POLICY_ARN in $HR_POLICY_ARNS; do
        if [[ -n "$POLICY_ARN" ]]; then
            log "🔎 Processing IAM policy: $POLICY_ARN"
            
            # Delete all non-default versions
            VERSIONS=$(aws iam list-policy-versions --policy-arn $POLICY_ARN --query "Versions[?!IsDefaultVersion].VersionId" --output text 2>/dev/null || echo "")
            for VERSION in $VERSIONS; do
                if [[ -n "$VERSION" ]]; then
                    log "🗑 Deleting policy version $VERSION from $POLICY_ARN"
                    aws iam delete-policy-version --policy-arn $POLICY_ARN --version-id $VERSION &>/dev/null || true
                fi
            done
            
            # Delete the policy
            log "🗑 Deleting policy: $POLICY_ARN"
            aws iam delete-policy --policy-arn $POLICY_ARN &>/dev/null || true
        fi
    done
}

delete_s3_buckets() {
    log "🔎 Checking for S3 buckets with 'hr-portal' or 'docker-temp' in the name..."
    
    # List buckets with hr-portal or docker-temp in the name
    HR_PORTAL_BUCKETS=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'hr-portal') || contains(Name, 'docker-temp')].Name" --output text)
    
    for BUCKET in $HR_PORTAL_BUCKETS; do
        if [[ -n "$BUCKET" ]]; then
            log "🔎 Emptying and deleting S3 bucket: $BUCKET"
            
            # Remove any bucket policy
            aws s3api delete-bucket-policy --bucket $BUCKET &>/dev/null || true
            
            # Empty the bucket - handle versioned objects
            log "🔧 Removing all versions and delete markers..."
            aws s3api list-object-versions --bucket $BUCKET --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' --output json 2>/dev/null > /tmp/delete_versions.json || echo "{\"Objects\":[]}" > /tmp/delete_versions.json
            if [ -s /tmp/delete_versions.json ] && [ "$(grep -c "Key" /tmp/delete_versions.json)" -gt 0 ]; then
                aws s3api delete-objects --bucket $BUCKET --delete file:///tmp/delete_versions.json &>/dev/null || true
            fi
            
            # Delete delete markers
            aws s3api list-object-versions --bucket $BUCKET --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' --output json 2>/dev/null > /tmp/delete_markers.json || echo "{\"Objects\":[]}" > /tmp/delete_markers.json
            if [ -s /tmp/delete_markers.json ] && [ "$(grep -c "Key" /tmp/delete_markers.json)" -gt 0 ]; then
                aws s3api delete-objects --bucket $BUCKET --delete file:///tmp/delete_markers.json &>/dev/null || true
            fi
            
            # Delete remaining objects (non-versioned)
            log "🔧 Removing all objects..."
            aws s3 rm s3://$BUCKET --recursive &>/dev/null || true
            
            # Delete the bucket
            log "🗑 Deleting bucket: $BUCKET"
            aws s3api delete-bucket --bucket $BUCKET &>/dev/null || true
            if [ $? -eq 0 ]; then
                log "✅ S3 bucket deleted: $BUCKET"
            else
                log "⚠ Failed to delete S3 bucket: $BUCKET. May require manual cleanup."
            fi
        fi
    done
}

# Main cleanup sequence
cleanup_resources() {
    log "🧹 Starting AWS resource cleanup for Demo-HR-Application"
    
    # Delete resources in the correct order to handle dependencies
    delete_target_groups
    delete_load_balancers
    delete_rds_instance
    delete_apigateway_restapis
    delete_ec2_instances
    delete_security_groups
    delete_vpcs
    delete_iam_resources
    delete_s3_buckets
    
    log "🎉 AWS cleanup completed for Demo-HR-Application resources."
}

# Check for AWS CLI and start cleanup
check_aws_cli
cleanup_resources
