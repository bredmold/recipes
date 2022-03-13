#!/bin/sh

DDB_VAR='-var=ddb_endpoint=http://dynamodb-local:8000'
terraform init "$DDB_VAR" &&
  terraform plan "$DDB_VAR" -out recipe.plan &&
  terraform apply -auto-approve recipe.plan
