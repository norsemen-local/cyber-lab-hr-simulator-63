
output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.hr_portal_ec2.public_ip
}

output "rds_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = aws_db_instance.hr_portal_db.address
}

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = "${aws_api_gateway_deployment.api_deployment.invoke_url}/api"
}
