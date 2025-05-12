variable "local_testing" {
  type        = bool
  default     = true
  description = "If true, run local testing"
}

variable "application_version" {
  type        = string
  description = "Application version (pulled from package.json)"
}
