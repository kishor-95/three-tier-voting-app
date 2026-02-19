data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_key_pair" "generated" {
  key_name   = var.key_name
  public_key = file("${path.module}/${var.key_name}.pub")
}


resource "aws_instance" "project_instance" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.small"   # free tier not supporting t2.medium or t2.large, so using t2.small chage to t2.medium or t2.large if you want to use those types
  vpc_security_group_ids = [aws_security_group.project_sg.id]
  subnet_id   = aws_subnet.project_subnet.id
  associate_public_ip_address = true
  count = 2 
  key_name = aws_key_pair.generated.key_name

  tags = {
    Name = "${var.project_name}-ec2-instance-${count.index + 1}"
  }
}