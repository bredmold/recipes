# Manage infrastructure for the recipe application

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"

  skip_credentials_validation = var.local_testing
  skip_metadata_api_check     = var.local_testing
  skip_requesting_account_id  = var.local_testing
}

data "aws_region" "region" {}

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

data "aws_cognito_user_pools" "recipe_users" {
  name = "us-west-2_djFbovgCe"
}

data "aws_cognito_user_pool_clients" "recipe_users_clients" {
  user_pool_id = data.aws_cognito_user_pools.recipe_users.id
}

locals {
  provider_name = "cognito-idp.${data.aws_region.region.name}.amazonaws.com/${data.aws_cognito_user_pool_clients.recipe_users_clients.id}"
  client_id     = data.aws_cognito_user_pool_clients.recipe_users_clients.client_ids[0]
}

resource "aws_cognito_identity_pool" "recipe_identities" {
  identity_pool_name               = "recipe identities"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id     = local.client_id
    provider_name = local.provider_name
  }
}

resource "aws_iam_role_policy" "recipe_user_policy" {
  name = "recipe-app-user-policy"
  role = aws_iam_role.recipe_user_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:BatchGetItem",
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.recipe_table.arn,
          "${aws_dynamodb_table.recipe_table.arn}/*",
        ]
      }
    ]
  })
}

resource "aws_iam_role" "recipe_user_role" {
  name = "recipe-app-user-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" : aws_cognito_identity_pool.recipe_identities.id
          }
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "recipe_unauth_policy" {
  name = "recipe-unauth-policy"
  role = aws_iam_role.recipe_unauth_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "*"
        Effect   = "Deny"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "recipe_unauth_role" {
  name = "recipe-app-unauth-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" : data.aws_cognito_user_pools.recipe_users.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" : "authenticated"
          }
        }
      },
    ]
  })
}

resource "aws_cognito_identity_pool_roles_attachment" "recipe_auth_role_attach" {
  identity_pool_id = aws_cognito_identity_pool.recipe_identities.id

  role_mapping {
    identity_provider         = "${local.provider_name}:${local.client_id}"
    type                      = "Token"
    ambiguous_role_resolution = "AuthenticatedRole"
  }

  roles = {
    "authenticated"   = aws_iam_role.recipe_user_role.arn
    "unauthenticated" = aws_iam_role.recipe_unauth_role.arn
  }
}

resource "aws_s3_bucket" "recipe_hosting" {
  bucket = "recipe-hosting"
}

resource "aws_s3_bucket_versioning" "recipe_versioning" {
  bucket = aws_s3_bucket.recipe_hosting.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "recipe_acl" {
  bucket = aws_s3_bucket.recipe_hosting.id
  acl    = "public-read"
}

locals {
  ext_map = {
    ".txt"  = "text/plain"
    ".cjs"  = "application/javascript"
    ".js"   = "application/javascript"
    ".html" = "text/html"
    ".css"  = "text/css"
    ".ico"  = "image/png"
  }

  dist_folder = "../dist/recipe"
}

resource "aws_s3_object" "root" {
  for_each = fileset(local.dist_folder, "*")

  bucket       = aws_s3_bucket.recipe_hosting.bucket
  key          = each.value
  source       = "../dist/recipe/${each.value}"
  etag         = filemd5("${local.dist_folder}/${each.value}")
  content_type = lookup(local.ext_map, regex(".*(\\.[a-zA-Z0-9]+)$", each.value)[0], "text/plain")
}

resource "aws_s3_object" "browser" {
  for_each = fileset("${local.dist_folder}/browser", "*")

  bucket       = aws_s3_bucket.recipe_hosting.bucket
  key          = each.value
  source       = "../dist/recipe/browser/${each.value}"
  etag         = filemd5("${local.dist_folder}/browser/${each.value}")
  content_type = lookup(local.ext_map, regex(".*(\\.[a-zA-Z0-9]+)$", each.value)[0], "text/plain")
}
