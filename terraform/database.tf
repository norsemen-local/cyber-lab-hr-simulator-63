
# RDS Subnet Group
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "hr-portal-rds-subnet-group"
  subnet_ids = [aws_subnet.public_subnet.id, aws_subnet.public_subnet_2.id]  # Use public subnets for testing

  tags = merge(local.common_tags, {
    Name = "HR Portal RDS Subnet Group"
  })
}


# RDS MySQL Instance
resource "aws_db_instance" "hr_portal_db" {
  identifier              = "hr-portal-db"
  allocated_storage       = 20
  storage_type            = "gp2"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t3.micro"
  db_name                 = "hr_portal"
  username                = var.db_username
  password                = var.db_password
  parameter_group_name    = "default.mysql8.0"
  db_subnet_group_name    = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  skip_final_snapshot     = true
  publicly_accessible     = true  # Make publicly accessible for testing
  multi_az                = false
  deletion_protection     = false  # Ensure deletion protection is disabled

  tags = merge(local.common_tags, {
    Name = "hr-portal-db"
  })
}
