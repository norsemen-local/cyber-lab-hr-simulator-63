
# API Gateway
resource "aws_api_gateway_rest_api" "hr_portal_api" {
  name        = "hr-portal-api"
  description = "HR Portal API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# API Gateway Resource
resource "aws_api_gateway_resource" "api_resource" {
  rest_api_id = aws_api_gateway_rest_api.hr_portal_api.id
  parent_id   = aws_api_gateway_rest_api.hr_portal_api.root_resource_id
  path_part   = "api"
}

# API Gateway Method
resource "aws_api_gateway_method" "api_method" {
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Integration
resource "aws_api_gateway_integration" "api_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.api_method.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_instance.hr_portal_ec2.public_ip}:3000/api"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [aws_api_gateway_integration.api_integration]

  rest_api_id = aws_api_gateway_rest_api.hr_portal_api.id
  stage_name  = "prod"

  lifecycle {
    create_before_destroy = true
  }
}
