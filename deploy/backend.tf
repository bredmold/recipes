/*
Backend lambda function
*/

locals {
  backend_dist = "../recipe-backend/dist"
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "backend_role" {
  name               = "recipe-backend-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

data "aws_iam_policy_document" "lambda_logging" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_role_policy" "lambda_logging" {
  role   = aws_iam_role.backend_role.name
  policy = data.aws_iam_policy_document.lambda_logging.json
}

data "aws_iam_policy_document" "dynamodb" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchGetItem",
      "dynamodb:Query",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:BatchWriteItem"
    ]

    resources = [
      aws_dynamodb_table.recipe_table.arn,
      "${aws_dynamodb_table.recipe_table.arn}/index/*",
    ]
  }
}

resource "aws_iam_role_policy" "dynamodb" {
  role   = aws_iam_role.backend_role.name
  policy = data.aws_iam_policy_document.dynamodb.json
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${local.backend_dist}/index.js"
  output_path = "${local.backend_dist}/recipe-backend.zip"
}

resource "aws_lambda_function" "recipe_backend" {
  function_name = "recipe-backend"
  filename      = data.archive_file.lambda_zip.output_path
  role          = aws_iam_role.backend_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

resource "aws_lambda_permission" "apigw_lambda_invoke" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recipe_backend.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.backend_api.execution_arn}/*/*/*"
}

resource "aws_cloudwatch_log_group" "recipe_backend" {
  name              = "/aws/lambda/${aws_lambda_function.recipe_backend.function_name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_api" "backend_api" {
  name                         = "Recipe API"
  version                      = var.application_version
  protocol_type                = "HTTP"
  fail_on_warnings             = true
  disable_execute_api_endpoint = false

  body = templatefile("recipe-backend.openapi.yaml", {
    recipe_version     = var.application_version
    backend_lambda_arn = aws_lambda_function.recipe_backend.invoke_arn
    timeoutInMillis    = 2000
  })

  cors_configuration {
    allow_origins = ["https://${aws_s3_bucket.recipe_hosting.bucket_regional_domain_name}"]
    allow_headers = ["*"]
    allow_methods = ["*"]
  }
}

resource "aws_cloudwatch_log_group" "backend_api_logs" {
  name              = "/aws/ApiGateway/logs/backend-api"
  retention_in_days = 14
}

resource "aws_apigatewayv2_stage" "backend_api" {
  api_id = aws_apigatewayv2_api.backend_api.id
  name   = "$default"

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.backend_api_logs.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      ip                      = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      httpMethod              = "$context.httpMethod"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      protocol                = "$context.protocol"
      responseLength          = "$context.responseLength"
      extendedRequestId       = "$context.extendedRequestId"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }

  default_route_settings {
    detailed_metrics_enabled = true
    throttling_burst_limit   = 5000
    throttling_rate_limit    = 10000
  }
}

resource "aws_apigatewayv2_deployment" "backend_api" {
  api_id      = aws_apigatewayv2_api.backend_api.id
  description = "Recipe backend API Deploy"

  triggers = {
    redeployment = sha256(aws_apigatewayv2_api.backend_api.body)
  }

  lifecycle {
    create_before_destroy = true
  }
}
