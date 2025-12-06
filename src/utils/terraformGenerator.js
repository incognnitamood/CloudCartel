// Terraform Code Generator

export function generateTerraform(nodes, edges) {
  const resources = [];
  const variables = [];
  const outputs = [];

  // Provider configuration
  const provider = `terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

`;

  // Generate resources for each node
  const nodeCounts = {};
  nodes.forEach((node) => {
    const type = node.type;
    nodeCounts[type] = (nodeCounts[type] || 0) + 1;
    const index = nodeCounts[type];

    switch (type) {
      case 'server': {
        const name = `server_${index}`;
        resources.push(`
resource "aws_instance" "${name}" {
  ami           = var.ami_id
  instance_type = "t3.medium"
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}
`);
        outputs.push(`
output "${name}_id" {
  value = aws_instance.${name}.id
}

output "${name}_public_ip" {
  value = aws_instance.${name}.public_ip
}
`);
        break;
      }

      case 'database': {
        const name = `database_${index}`;
        resources.push(`
resource "aws_db_instance" "${name}" {
  identifier     = "${name}"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  allocated_storage = 20
  
  db_name  = "cloudcartel${index}"
  username = var.db_username
  password = var.db_password
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}
`);
        variables.push(`
variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}
`);
        outputs.push(`
output "${name}_endpoint" {
  value = aws_db_instance.${name}.endpoint
}
`);
        break;
      }

      case 'loadBalancer': {
        const name = `load_balancer_${index}`;
        resources.push(`
resource "aws_lb" "${name}" {
  name               = "${name}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.${name}_sg.id]
  subnets            = var.public_subnet_ids
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}

resource "aws_security_group" "${name}_sg" {
  name        = "${name}-sg"
  description = "Security group for ${name}"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${name}-sg"
  }
}
`);
        variables.push(`
variable "public_subnet_ids" {
  description = "List of public subnet IDs for load balancer"
  type        = list(string)
}
`);
        outputs.push(`
output "${name}_dns_name" {
  value = aws_lb.${name}.dns_name
}
`);
        break;
      }

      case 'storage': {
        const name = `storage_${index}`;
        const bucketName = `cloudcartel-storage-${index}-${Date.now()}`;
        resources.push(`
resource "aws_s3_bucket" "${name}" {
  bucket = "${bucketName}"
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}

resource "aws_s3_bucket_versioning" "${name}" {
  bucket = aws_s3_bucket.${name}.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "${name}" {
  bucket = aws_s3_bucket.${name}.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
`);
        outputs.push(`
output "${name}_bucket_name" {
  value = aws_s3_bucket.${name}.bucket
}
`);
        break;
      }

      case 'cache': {
        const name = `cache_${index}`;
        resources.push(`
resource "aws_elasticache_cluster" "${name}" {
  cluster_id           = "${name}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}
`);
        outputs.push(`
output "${name}_endpoint" {
  value = aws_elasticache_cluster.${name}.configuration_endpoint
}
`);
        break;
      }

      case 'cdn': {
        const name = `cdn_${index}`;
        resources.push(`
resource "aws_cloudfront_distribution" "${name}" {
  origin {
    domain_name = var.cdn_origin_domain
    origin_id   = "${name}-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${name}-origin"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}
`);
        variables.push(`
variable "cdn_origin_domain" {
  description = "Origin domain for CDN"
  type        = string
}
`);
        outputs.push(`
output "${name}_domain_name" {
  value = aws_cloudfront_distribution.${name}.domain_name
}
`);
        break;
      }

      case 'queue': {
        const name = `queue_${index}`;
        resources.push(`
resource "aws_sqs_queue" "${name}" {
  name                      = "${name}"
  message_retention_seconds = 345600
  visibility_timeout_seconds = 30
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}
`);
        outputs.push(`
output "${name}_url" {
  value = aws_sqs_queue.${name}.url
}
`);
        break;
      }

      case 'apiGateway': {
        const name = `api_gateway_${index}`;
        resources.push(`
resource "aws_apigatewayv2_api" "${name}" {
  name          = "${name}"
  protocol_type = "HTTP"
  
  tags = {
    Name        = "${name}"
    Environment = "production"
    ManagedBy   = "CloudCartel"
  }
}
`);
        outputs.push(`
output "${name}_endpoint" {
  value = aws_apigatewayv2_api.${name}.api_endpoint
}
`);
        break;
      }
    }
  });

  // Combine all parts
  const uniqueVariables = Array.from(new Set(variables)).join('\n');
  const allResources = resources.join('\n');
  const allOutputs = outputs.join('\n');

  return `${provider}${uniqueVariables}${allResources}${allOutputs}`;
}

export function downloadTerraform(code, filename = 'cloudcartel-infrastructure.tf') {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

