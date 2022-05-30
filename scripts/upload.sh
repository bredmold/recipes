#!/usr/bin/env bash

die() {
  echo >&2 "$@"
  exit 1
}

PRG_DIR=$(dirname "$0")
cd "${PRG_DIR}/.." || die "Unable to locate project dir"

STATUS=$(git status --porcelain | wc -l)
if [ "$STATUS" != "1" ]; then
  die "Cannot deploy a dirty workspace"
fi

npm run test:once &&
  npm run build:prod &&
  aws s3 sync dist/recipe s3://recipe-hosting
