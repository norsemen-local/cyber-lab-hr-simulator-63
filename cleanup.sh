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
EXISTS=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE_ID" --query "DBInstances[0].DBInstanceIdentifier" --output text 2>/dev/null)

if [[ -z "$EXISTS" ]]; then
    log "✅ RDS instance '$DB_INSTANCE_ID' does not exist. Nothing to delete."
else
    log "🔎 RDS instance '$DB_INSTANCE_ID' found. Preparing to delete..."

    # Get associated Subnet Group Name
    SUBNET_GROUP=$(aws rds describe-db-instances --db-instance-identifier "$DB_INSTANCE_ID" --query "DBInstances[0].DBSubnetGroup.DBSubnetGroupName" --output text)

    # Delete the RDS instance
    log "🗑 Deleting RDS instance: $DB_INSTANCE_ID..."
    aws rds delete-db-instance --db-instance-identifier "$DB_INSTANCE_ID" --skip-final-snapshot &>/dev/null
    log "⏳ Waiting for RDS instance deletion to complete..."
    aws rds wait db-instance-deleted --db-instance-identifier "$DB_INSTANCE_ID"
    log "✅ RDS instance '$DB_INSTANCE_ID' deleted."

    # Delete the associated subnet group
    if [[ -n "$SUBNET_GROUP" ]]; then
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
    INSTANCE_IDS=$(aws ec2 describe-instances --region $AWS_REGION --filters "Name=tag:$TAG_KEY,Values=$TAG_VALUE" --query "Reservations[].Instances[].InstanceId" --output text)
    
    if [[ -z "$INSTANCE_IDS" ]]; then
        log "✅ No EC2 instances found."
    else
        log "🔎 Terminating EC2 instances: $INSTANCE_IDS"
        aws ec2 terminate-instances --region $AWS_REGION --instance-ids $INSTANCE_IDS &>/dev/null
        aws ec2 wait instance-terminated --region $AWS_REGION --instance-ids $INSTANCE_IDS &>/dev/null
        log "✅ EC2 instances terminated."
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
}

delete_load_balancer() {
    log "🔎 Checking for Load Balancer '$LOAD_BALANCER_NAME'..."
    ALB_ARN=$(aws elbv2 describe-load-balancers --region $AWS_REGION --query "LoadBalancers[?LoadBalancerName=='$LOAD_BALANCER_NAME'].LoadBalancerArn" --output text)

    if [[ -z "$ALB_ARN" ]]; then
        log "✅ Load Balancer '$LOAD_BALANCER_NAME' does not exist."
    else
        log "🗑 Deleting Load Balancer: $LOAD_BALANCER_NAME..."
        aws elbv2 delete-load-balancer --region $AWS_REGION --load-balancer-arn "$ALB_ARN" &>/dev/null
        aws elbv2 wait load-balancers-deleted --region $AWS_REGION --load-balancer-arns "$ALB_ARN"
        log "✅ Load Balancer deleted."
    fi
}

delete_vpcs() {
    log "🔎 Checking for VPCs tagged '$TAG_KEY=$TAG_VALUE'..."
    VPC_IDS=$(aws ec2 describe-vpcs --region $AWS_REGION --filters "Name=tag:$TAG_KEY,Values=$TAG_VALUE" --query "Vpcs[].VpcId" --output text)

    if [[ -z "$VPC_IDS" ]]; then
        log "✅ No VPCs found."
    else
        for VPC in $VPC_IDS; do
            log "🔎 Cleaning up VPC: $VPC"

            # Delete VPC Endpoints
            VPCE_IDS=$(aws ec2 describe-vpc-endpoints --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "VpcEndpoints[].VpcEndpointId" --output text)
            for VPCE in $VPCE_IDS; do
                aws ec2 delete-vpc-endpoints --region $AWS_REGION --vpc-endpoint-ids "$VPCE" &>/dev/null
                log "✅ Deleted VPC Endpoint: $VPCE"
            done

            # Delete Security Groups (except default)
            SG_IDS=$(aws ec2 describe-security-groups --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
            for SG in $SG_IDS; do
                aws ec2 delete-security-group --region $AWS_REGION --group-id "$SG" &>/dev/null
                log "✅ Deleted Security Group: $SG"
            done

            # Delete Subnets
            SUBNETS=$(aws ec2 describe-subnets --region $AWS_REGION --filters "Name=vpc-id,Values=$VPC" --query "Subnets[].SubnetId" --output text)
            for SUBNET in $SUBNETS; do
                aws ec2 delete-subnet --region $AWS_REGION --subnet-id "$SUBNET" &>/dev/null
                log "✅ Deleted Subnet: $SUBNET"
            done

            # Delete Internet Gateways
            IGW_IDS=$(aws ec2 describe-internet-gateways --region $AWS_REGION --filters "Name=attachment.vpc-id,Values=$VPC" --query "InternetGateways[].InternetGatewayId" --output text)
            for IGW in $IGW_IDS; do
                aws ec2 detach-internet-gateway --region $AWS_REGION --internet-gateway-id "$IGW" --vpc-id "$VPC" &>/dev/null
                aws ec2 delete-internet-gateway --region $AWS_REGION --internet-gateway-id "$IGW" &>/dev/null
                log "✅ Deleted Internet Gateway: $IGW"
            done


            # Get Route Table ID
            ROUTE_TABLE_ID=$(aws ec2 describe-route-tables --region $AWS_REGION \
                --filters "Name=tag:Name,Values=$ROUTE_TABLE_NAME" \
                --query "RouteTables[0].RouteTableId" --output text)

            if [[ -z "$ROUTE_TABLE_ID" || "$ROUTE_TABLE_ID" == "None" ]]; then
                log "✅ Route Table '$ROUTE_TABLE_NAME' does not exist or is already deleted."
            else
                log "🔎 Found Route Table ID: $ROUTE_TABLE_ID"
            fi

            # Get and Disassociate Route Table Associations
            ASSOCIATION_IDS=$(aws ec2 describe-route-tables --region $AWS_REGION \
                --route-table-ids "$ROUTE_TABLE_ID" \
                --query "RouteTables[0].Associations[?Main==false].RouteTableAssociationId" --output text)

            for ASSOCIATION in $ASSOCIATION_IDS; do
                log "🔄 Disassociating Route Table: $ROUTE_TABLE_ID from Association: $ASSOCIATION"
                aws ec2 disassociate-route-table --region $AWS_REGION --association-id "$ASSOCIATION"
            done

            # Delete Route Table
            log "🗑 Deleting Route Table: $ROUTE_TABLE_ID..."
            DELETE_RESULT=$(aws ec2 delete-route-table --region $AWS_REGION --route-table-id "$ROUTE_TABLE_ID" 2>&1)

            if [[ $? -ne 0 ]]; then
                log "❌ ERROR: Failed to delete Route Table '$ROUTE_TABLE_ID': $DELETE_RESULT"
            else
                log "✅ Route Table deleted successfully."
            fi

            # Finally, delete VPC
            log "🔎 Deleting VPC: $VPC..."
            aws ec2 delete-vpc --region $AWS_REGION --vpc-id "$VPC" &>/dev/null
            log "✅ Deleted VPC: $VPC"
        done
    fi
}


delete_apigateway_restapis() {
    log "🔎 Checking for API Gateways tagged '$TAG_KEY=$TAG_VALUE'..."
    REST_APIS=$(aws apigateway get-rest-apis --region $AWS_REGION --query "items[?tags.$TAG_KEY=='$TAG_VALUE'].id" --output text)
    
    if [[ -z "$REST_APIS" ]]; then
        log "✅ No API Gateways found."
    else
        for API in $REST_APIS; do
            log "🔎 Deleting API Gateway: $API"
            aws apigateway delete-rest-api --region $AWS_REGION --rest-api-id "$API" &>/dev/null
        done
        log "✅ API Gateways deleted."
    fi
}

delete_iam_policies_roles_profiles() {
    log "🔎 Checking for IAM Policies, Roles, and Instance Profiles tagged '$TAG_KEY=$TAG_VALUE'..."

    IAM_PROFILES=$(aws iam list-instance-profiles --query "InstanceProfiles[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].InstanceProfileName" --output text || echo "")
    IAM_ROLES=$(aws iam list-roles --query "Roles[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].RoleName" --output text || echo "")
    IAM_POLICIES=$(aws iam list-policies --scope Local --query "Policies[?Tags[?Key=='$TAG_KEY' && Value=='$TAG_VALUE']].Arn" --output text || echo "")

    for PROFILE in $IAM_PROFILES; do
        ROLE=$(aws iam get-instance-profile --instance-profile-name "$PROFILE" --query "InstanceProfile.Roles[0].RoleName" --output text)
        if [[ -n "$ROLE" ]]; then
            log "🔎 Detaching IAM Role: $ROLE from Instance Profile: $PROFILE"
            aws iam remove-role-from-instance-profile --instance-profile-name "$PROFILE" --role-name "$ROLE" &>/dev/null
        fi
        aws iam delete-instance-profile --instance-profile-name "$PROFILE" &>/dev/null
        log "✅ IAM Instance Profile deleted: $PROFILE"
    done

    for ROLE in $IAM_ROLES; do
        ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "$ROLE" --query "AttachedPolicies[].PolicyArn" --output text || echo "")
        for POLICY in $ATTACHED_POLICIES; do
            log "🔎 Detaching Policy: $POLICY from Role: $ROLE"
            aws iam detach-role-policy --role-name "$ROLE" --policy-arn "$POLICY" &>/dev/null
        done
    done

    for POLICY in $IAM_POLICIES; do
        log "🔎 Deleting IAM Policy: $POLICY"
        aws iam delete-policy --policy-arn "$POLICY" &>/dev/null
    done

    for ROLE in $IAM_ROLES; do
        log "🔎 Deleting IAM Role: $ROLE"
        aws iam delete-role --role-name "$ROLE" &>/dev/null
    done

    log "✅ IAM Policies, Roles, and Instance Profiles deleted."
}

deleteIntanceProfile(){
# Check if the Instance Profile exists
EXISTS=$(aws iam get-instance-profile --instance-profile-name "$PROFILE_NAME" --query "InstanceProfile.InstanceProfileName" --output text 2>/dev/null)

if [[ -z "$EXISTS" ]]; then
    log "✅ Instance Profile '$PROFILE_NAME' does not exist. Nothing to delete."
else
    log "🔎 Instance Profile '$PROFILE_NAME' found. Preparing to delete..."

    # Get attached roles
    ROLE_NAME=$(aws iam get-instance-profile --instance-profile-name "$PROFILE_NAME" --query "InstanceProfile.Roles[0].RoleName" --output text)

    if [[ -n "$ROLE_NAME" ]]; then
        log "🔄 Detaching Role: $ROLE_NAME from Instance Profile: $PROFILE_NAME..."
        aws iam remove-role-from-instance-profile --instance-profile-name "$PROFILE_NAME" --role-name "$ROLE_NAME" &>/dev/null
        log "✅ Role $ROLE_NAME detached."
    fi

    # Delete the instance profile
    log "🗑 Deleting Instance Profile: $PROFILE_NAME..."
    aws iam delete-instance-profile --instance-profile-name "$PROFILE_NAME" &>/dev/null
    log "✅ Instance Profile '$PROFILE_NAME' deleted successfully."
fi
}

deleteIAMPolicy(){
    # Get Policy ARN
POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)

if [[ -z "$POLICY_ARN" ]]; then
    log "✅ IAM Policy '$POLICY_NAME' does not exist. Nothing to delete."
else
    log "🔎 Found IAM Policy: $POLICY_ARN"

    # Detach policy from roles
    ATTACHED_ROLES=$(aws iam list-entities-for-policy --policy-arn "$POLICY_ARN" --query "PolicyRoles[].RoleName" --output text)

    for ROLE in $ATTACHED_ROLES; do
        log "🔄 Detaching IAM Policy from Role: $ROLE..."
        aws iam detach-role-policy --role-name "$ROLE" --policy-arn "$POLICY_ARN"
    done

    # Delete the IAM policy
    log "🗑 Deleting IAM Policy: $POLICY_NAME..."
    aws iam delete-policy --policy-arn "$POLICY_ARN" &>/dev/null
    log "✅ IAM Policy '$POLICY_NAME' deleted successfully."
fi
}

deleteIAMRole_hr_portal_ec2_role(){

# Check if the IAM Role exists
EXISTS=$(aws iam get-role --role-name "$ROLE_NAME" --query "Role.RoleName" --output text 2>/dev/null)

if [[ -z "$EXISTS" ]]; then
    log "✅ IAM Role hr-portal-ec2-role does not exist. Nothing to delete."
else
    log "🔎 Found IAM Role: hr-portal-ec2-role"

    # Detach all policies
    POLICIES=$(aws iam list-attached-role-policies --role-name hr-portal-ec2-role --query "AttachedPolicies[].PolicyArn" --output text)
    for POLICY in $POLICIES; do
        log "🔄 Detaching policy $POLICY from role hr-portal-ec2-role..."
        aws iam detach-role-policy --role-name hr-portal-ec2-role --policy-arn "$POLICY"
    done

    # Remove the role from any instance profiles
    INSTANCE_PROFILES=$(aws iam list-instance-profiles-for-role --role-name hr-portal-ec2-role --query "InstanceProfiles[].InstanceProfileName" --output text)
    for PROFILE in $INSTANCE_PROFILES; do
        log "🔄 Removing IAM Role from Instance Profile: $PROFILE..."
        aws iam remove-role-from-instance-profile --instance-profile-name "$PROFILE" --role-name hr-portal-ec2-role
    done

    # Delete the IAM Role
    log "🗑 Deleting IAM Role: hr-portal-ec2-role..."
    aws iam delete-role --role-name hr-portal-ec2-role &>/dev/null
    log "✅ IAM Role hr-portal-ec2-role deleted successfully."
fi
}

deleteIAMRole_hr_portal_lambda_overly_permissive() {
    
    log "🔎 Checking for IAM Role hr-portal-lambda-overly-permissive-role..."
    EXISTS=$(aws iam get-role --role-name hr-portal-lambda-overly-permissive-role --query "Role.RoleName" --output text 2>/dev/null)

    if [[ -z "$EXISTS" ]]; then
        log "✅ IAM Role hr-portal-lambda-overly-permissive-role does not exist."
    else
        log "🗑 Deleting IAM Role: hr-portal-lambda-overly-permissive-role..."
        POLICIES=$(aws iam list-attached-role-policies --role-name hr-portal-lambda-overly-permissive-role --query "AttachedPolicies[].PolicyArn" --output text)
        for POLICY in $POLICIES; do
            aws iam detach-role-policy --role-name hr-portal-lambda-overly-permissive-role --policy-arn "$POLICY" &>/dev/null
        done
        aws iam delete-role --role-name hr-portal-lambda-overly-permissive-role &>/dev/null
        log "✅ IAM Role deleted."
    fi
}


# Execute in Correct Order
check_aws_cli
delete_rds_instance &
delete_target_group
delete_load_balancer
delete_ec2_instances
delete_apigateway_restapis
delete_iam_policies_roles_profiles
delete_vpcs
deleteIntanceProfile
deleteIAMPolicy
deleteIAMRole_hr_portal_ec2_role
deleteIAMRole_hr_portal_lambda_overly_permissive

log "🎉 AWS cleanup completed for Demo-HR-Application resources."
