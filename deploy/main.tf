terraform {
  backend "s3" {
    region         = "us-west-2"
    bucket         = "terraform-state-700942521824-us-west-2"
    key            = "recipe/primary/terraform.tfstate"
    dynamodb_table = "terraform-locks"
  }
}
