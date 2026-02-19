variable "project_name" {
  description = "Name of the project"
  type        = string
  default = "three-tier-voting-app"
}

variable "cidr_block" {
    description = "This is default cidr range for my vpc"
    default = "10.0.0.0/16"
    type = string
}
variable "subnet_block" {
    description = "This is default cidr range for my vpc"
    default = "10.0.1.0/24"
    type = string
}

variable "key_name" {
  description = "Name of the SSH key pair to use for EC2 instances"
  type        = string
  default   = "terraform-key"
}
