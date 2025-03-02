
# VPC Configuration
resource "aws_vpc" "hr_portal_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "hr-portal-vpc"
  })
}

# Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.hr_portal_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = merge(local.common_tags, {
    Name = "hr-portal-public-subnet"
  })
}

# Second Public Subnet for ALB (in a different AZ)
resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.hr_portal_vpc.id
  cidr_block              = "10.0.4.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}b"

  tags = merge(local.common_tags, {
    Name = "hr-portal-public-subnet-2"
  })
}

# Private Subnet for RDS
resource "aws_subnet" "private_subnet_1" {
  vpc_id            = aws_vpc.hr_portal_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = merge(local.common_tags, {
    Name = "hr-portal-private-subnet-1"
  })
}

# Second Private Subnet for RDS (required for DB subnet group)
resource "aws_subnet" "private_subnet_2" {
  vpc_id            = aws_vpc.hr_portal_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}b"

  tags = merge(local.common_tags, {
    Name = "hr-portal-private-subnet-2"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.hr_portal_vpc.id

  tags = merge(local.common_tags, {
    Name = "hr-portal-igw"
  })
}

# Route Table for Public Subnet
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.hr_portal_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = merge(local.common_tags, {
    Name = "hr-portal-public-route-table"
  })
}

# Associate Public Subnet with Route Table
resource "aws_route_table_association" "public_subnet_association" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}

# Associate Second Public Subnet with Route Table
resource "aws_route_table_association" "public_subnet_2_association" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_route_table.id
}
