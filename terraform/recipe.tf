# Manage infrastructure for the recipe application

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

variable "ddb_endpoint" {
  type        = string
  default     = "http://127.0.0.1:8000"
  description = "DynamoDB host"
}

provider "aws" {
  region     = "us-east-2"
  access_key = "nope"
  secret_key = "nope"

  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb = var.ddb_endpoint
  }
}

resource "aws_dynamodb_table" "recipe_table" {
  name = "recipes"

  attribute {
    name = "ownerEmail"
    type = "S"
  }

  attribute {
    name = "recipeId"
    type = "S"
  }

  attribute {
    name = "recipeTitle"
    type = "S"
  }

  hash_key  = "ownerEmail"
  range_key = "recipeId"

  global_secondary_index {
    name            = "owner-title"
    hash_key        = "ownerEmail"
    range_key       = "recipeTitle"
    projection_type = "ALL"
  }

  billing_mode = "PAY_PER_REQUEST"
}
