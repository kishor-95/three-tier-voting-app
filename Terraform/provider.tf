terraform {
  required_version = ">= 1.2"
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
       backend "s3" {
       bucket = "three-tier-application-backend-2026-02-19" # replace with your bucket name
       key    = "devops/project/terraform.tfstate"
       region = "ap-south-1" # replace with your bucket region
       use_lockfile = true
    }
}
provider "aws" {
  region = "ap-south-1"
}
  
