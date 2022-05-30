#!/usr/bin/env bash

die() {
  echo >&2 "$@"
  exit 1
}

PRG_DIR=$(dirname "$0")
cd "${PRG_DIR}/.." || die "Unable to locate project dir"

VERSION="$1"

if [ "$VERSION" = "" ]; then
  die "First arg must be one of: major minor patch"
fi
shift

npm version "$VERSION" &&
  npm run build:prod &&
  aws s3 sync dist/recipe s3://recipe-hosting
