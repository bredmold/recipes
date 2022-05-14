#!/bin/sh

export AWS_ACCESS_KEY_ID='nope'
export AWS_SECRET_ACCESS_KEY='nope'
export TF_AWS_DYNAMODB_ENDPOINT='http://127.0.0.1:8000'

TEST_VAR='-var=local_testing=true'

if [ "$1" = "docker" ]; then
  export TF_AWS_DYNAMODB_ENDPOINT='http://dynamodb-local:8000'
  shift
fi

if [ "$1" = "aws" ]; then
  unset TF_AWS_DYNAMODB_ENDPOINT
  unset AWS_ACCESS_KEY_ID
  unset AWS_SECRET_ACCESS_KEY
  TEST_VAR='-var=local_testing=false'
  shift
fi

terraform init "$TEST_VAR" &&
  terraform plan "$TEST_VAR" -out recipe.plan &&
  terraform apply -auto-approve recipe.plan
