
provider "aws" {
  region = var.aws_region
}

# Define common tags to be applied to all resources
locals {
  common_tags = {
    App = "Demo-HR-Application"
    Note = "For security testing"
    Name = "DemoHRApp"
    Link = "https://github.com/SilentProcess87/cyber-lab-hr-simulator"
  }
}
