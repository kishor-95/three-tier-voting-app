# -----------------------
# VPC
# -----------------------
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.project_vpc.id
}

# -----------------------
# Security Group
# -----------------------
output "security_group_name" {
  description = "Security Group Name"
  value       = aws_security_group.project_sg.name
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.project_sg.id
}

# -----------------------
# Route Table
# -----------------------
output "route_table_id" {
  description = "Public Route Table ID"
  value       = aws_route_table.project_route_table.id
}

# -----------------------
# EC2 Instance Names
# -----------------------
output "instance_names" {
  description = "Names of EC2 Instances"
  value       = aws_instance.project_instance[*].tags["Name"]
}

# -----------------------
# Public IPs
# -----------------------
output "instance_public_ips" {
  description = "Public IPs of EC2 Instances"
  value       = aws_instance.project_instance[*].public_ip
}
