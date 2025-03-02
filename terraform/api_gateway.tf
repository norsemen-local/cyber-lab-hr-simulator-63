
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

# Add wildcard resource that allows ANY method (security vulnerability)
resource "aws_api_gateway_resource" "wildcard_resource" {
  rest_api_id = aws_api_gateway_rest_api.hr_portal_api.id
  parent_id   = aws_api_gateway_rest_api.hr_portal_api.root_resource_id
  path_part   = "{proxy+}"
}

# ANY method on wildcard resource (security vulnerability)
resource "aws_api_gateway_method" "wildcard_any_method" {
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id   = aws_api_gateway_resource.wildcard_resource.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

# Integration for ANY method (security vulnerability)
resource "aws_api_gateway_integration" "wildcard_any_integration" {
  rest_api_id             = aws_api_gateway_rest_api.hr_portal_api.id
  resource_id             = aws_api_gateway_resource.wildcard_resource.id
  http_method             = aws_api_gateway_method.wildcard_any_method.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_lb.hr_portal_alb.dns_name}/{proxy}"

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# Lambda function with overly permissive role (security vulnerability)
resource "aws_iam_role" "lambda_overly_permissive_role" {
  name = "hr-portal-lambda-overly-permissive-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# Overly permissive policy attachment (security vulnerability)
resource "aws_iam_role_policy_attachment" "lambda_overly_permissive_attachment" {
  role       = aws_iam_role.lambda_overly_permissive_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"  # Excessive privileges
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.api_get_integration,
    aws_api_gateway_integration.api_post_integration,
    aws_api_gateway_integration.api_put_integration,
    aws_api_gateway_integration.api_delete_integration,
    aws_api_gateway_integration.wildcard_any_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.hr_portal_api.id
  stage_name  = ""  # Empty stage name as we're using a separate stage resource
  
  # Force a new deployment on changes by using a trigger
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.api_resource.id,
      aws_api_gateway_resource.wildcard_resource.id,
      aws_api_gateway_method.api_get_method.id,
      aws_api_gateway_method.api_post_method.id,
      aws_api_gateway_method.api_put_method.id,
      aws_api_gateway_method.api_delete_method.id,
      aws_api_gateway_method.wildcard_any_method.id,
      aws_api_gateway_integration.api_get_integration.id,
      aws_api_gateway_integration.api_post_integration.id,
      aws_api_gateway_integration.api_put_integration.id,
      aws_api_gateway_integration.api_delete_integration.id,
      aws_api_gateway_integration.wildcard_any_integration.id
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "api_stage" {
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.hr_portal_api.id
  stage_name    = "prod"
  
  tags = local.common_tags
}
