
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

# API Gateway GET Method
resource "aws_api_gateway_method" "api_get_method" {
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway POST Method
resource "aws_api_gateway_method" "api_post_method" {
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

# API Gateway PUT Method
resource "aws_api_gateway_method" "api_put_method" {
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "PUT"
  authorization = "NONE"
}

# API Gateway DELETE Method
resource "aws_api_gateway_method" "api_delete_method" {
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "DELETE"
  authorization = "NONE"
}

# API Gateway GET Integration
resource "aws_api_gateway_integration" "api_get_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.api_get_method.http_method
  integration_http_method = "GET"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_lb.hr_portal_alb.dns_name}/api"
}

# API Gateway POST Integration
resource "aws_api_gateway_integration" "api_post_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.api_post_method.http_method
  integration_http_method = "POST"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_lb.hr_portal_alb.dns_name}/api"
}

# API Gateway PUT Integration
resource "aws_api_gateway_integration" "api_put_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.api_put_method.http_method
  integration_http_method = "PUT"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_lb.hr_portal_alb.dns_name}/api"
}

# API Gateway DELETE Integration
resource "aws_api_gateway_integration" "api_delete_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id             = aws_api_gateway_resource.api_resource.id
  http_method             = aws_api_gateway_method.api_delete_method.http_method
  integration_http_method = "DELETE"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_lb.hr_portal_alb.dns_name}/api"
}

# ... keep existing code (API Gateway Deployment, API Gateway Stage)
