# Manage infrastructure for the recipe application

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

variable "local_testing" {
  type        = bool
  default     = true
  description = "If true, run local testing"
}

provider "aws" {
  region = "us-west-2"

  skip_credentials_validation = var.local_testing
  skip_metadata_api_check     = var.local_testing
  skip_requesting_account_id  = var.local_testing
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
