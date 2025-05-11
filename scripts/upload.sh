#!/usr/bin/env bash

die() {
  echo >&2 "$@"
  exit 1
}

tf() {
  cd terraform && tofu "$@"
}

tfPlan() {
  local APP_VERSION

  APP_VERSION=$(jq -r .version < package.json)

  tf plan -var "application_version=${APP_VERSION}" -var "local_testing=false" -out tf.plan
}

npmVersion() {
  local VERSION="$1"

  if [ "$VERSION" = "" ]; then
    die "Prepare requires arg: major minor patch"
  fi
  shift

  npm version "$VERSION" &&
    npm run build:prod || die "npm run build:prod"
}

buildBackend() {
  cd recipe-backend || die "cd recipe-backend"
  npm run build || die "npm run build"
}

prepare() {
  npmVersion "$@"

  tfPlan || die "tofu plan"
}

PRG_DIR=$(dirname "$0")
cd "${PRG_DIR}/.." || die "Unable to locate project dir"

CMD="$1"
shift

case "$CMD" in
major)
  npmVersion major
  ;;

minor)
  npmVersion minor
  ;;

patch)
  npmVersion patch
  ;;

prepare)
  prepare "$@"
  ;;

backend)
  buildBackend "$@"
  ;;

init)
  tf init -reconfigure -upgrade || die "tf init"
  ;;

plan)
  tfPlan
  ;;

apply)
  tf apply tf.plan
  ;;

fmt)
  tf fmt
  ;;

*)
  die "Unknown command: $CMD"
  ;;
esac
