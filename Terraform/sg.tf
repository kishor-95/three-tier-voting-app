# Security Group
# ----------------------
resource "aws_security_group" "project_sg" {
  name   = "${var.project_name}-sg"
  vpc_id = aws_vpc.project_vpc.id

  ingress {
    description = "Port 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubernetes related ports
  ingress {
    description = "K8s API Server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    description = "NodePort Range"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Etcd"
    from_port   = 2379
    to_port     = 2380
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }

  ingress {
    description = "Kubelet"
    from_port   = 10250
    to_port     = 10255
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }

    ingress {
    description = "Kubelet"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-security-group"
  }
}