
# Application Load Balancer
resource "aws_lb" "hr_portal_alb" {
  name               = "hr-portal-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet.id, aws_subnet.private_subnet_2.id]

  enable_deletion_protection = false

  tags = merge(local.common_tags, {
    Name = "hr-portal-alb"
  })
}

# ALB Target Group
resource "aws_lb_target_group" "hr_portal_tg" {
  name     = "hr-portal-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.hr_portal_vpc.id

  health_check {
    enabled             = true
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    matcher             = "200"
  }

  tags = merge(local.common_tags, {
    Name = "hr-portal-tg"
  })
}

# Register EC2 Instance with Target Group
resource "aws_lb_target_group_attachment" "hr_portal_tg_attachment" {
  target_group_arn = aws_lb_target_group.hr_portal_tg.arn
  target_id        = aws_instance.hr_portal_ec2.id
  port             = 80
}

# ALB Listener
resource "aws_lb_listener" "hr_portal_listener" {
  load_balancer_arn = aws_lb.hr_portal_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.hr_portal_tg.arn
  }

  tags = local.common_tags
}

# Security Group for ALB
resource "aws_security_group" "alb_sg" {
  name        = "hr-portal-alb-sg"
  description = "Security group for HR Portal ALB"
  vpc_id      = aws_vpc.hr_portal_vpc.id

  # Allow HTTP traffic from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP traffic"
  }

  # Allow HTTPS traffic from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS traffic"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "hr-portal-alb-sg"
  })
}
