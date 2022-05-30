#!/usr/bin/env bash

die() {
  echo >&2 "$@"
  exit 1
}

PRG_DIR=$(dirname "$0")
cd "${PRG_DIR}/.." || die "Unable to locate project dir"

npm run test:once &&
  npm run build:prod &&
  aws s3 cp --recursive dist/recipe s3://recipe-hosting
