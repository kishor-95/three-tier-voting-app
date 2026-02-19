## 
resource "aws_vpc" "project_vpc" {
    cidr_block = var.cidr_block

    tags = {
        Name = "${var.project_name}-vpc"
    }
}

## Subnet
resource "aws_subnet" "project_subnet" {
  vpc_id     = aws_vpc.project_vpc.id
  cidr_block = var.subnet_block
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-subnet"
  }
}

## Internet Gateway

resource "aws_internet_gateway" "project_igw" {
  vpc_id = aws_vpc.project_vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

## Gateway Attachment

# resource "aws_internet_gateway_attachment" "project_igw_attachment" {
#   internet_gateway_id = aws_internet_gateway.project_igw.id
#   vpc_id              = aws_vpc.project_vpc.id
# }


## Route Table

resource "aws_route_table" "project_route_table" {
  vpc_id = aws_vpc.project_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.project_igw.id
  }

  tags = {
    Name = "${var.project_name}-route-table"
  }
}


##Associate the Route Table with a Public Subnet

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.project_subnet.id
  route_table_id = aws_route_table.project_route_table.id
}
