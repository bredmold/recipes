resource "aws_api_gateway_account" "account" {
  cloudwatch_role_arn = aws_iam_role.apigw_cloudwatch.arn
}

data "aws_iam_policy_document" "apigw_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "apigw_cloudwatch" {
  name               = "api-gateway-logging-role"
  assume_role_policy = data.aws_iam_policy_document.apigw_assume_role.json
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "apigw_cloudwatch" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogDelivery",
      "logs:PutResourcePolicy",
      "logs:UpdateLogDelivery",
      "logs:DeleteLogDelivery",
      "logs:CreateLogGroup",
      "logs:DescribeResourcePolicies",
      "logs:GetLogDelivery",
      "logs:ListLogDeliveries"
    ]

    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:GetLogEvents",
      "logs:FilterLogEvents"
    ]

    resources = ["arn:aws:logs:*:${data.aws_caller_identity.current.account_id}:log-group:*"]
  }
}

resource "aws_iam_role_policy" "apigw_cloudwatch" {
  name   = "api-gateway-logging-policy"
  role   = aws_iam_role.apigw_cloudwatch.id
  policy = data.aws_iam_policy_document.apigw_cloudwatch.json
}
