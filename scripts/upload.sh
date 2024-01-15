#!/usr/bin/env bash

die() {
  echo >&2 "$@"
  exit 1
}

prepare() {
  VERSION="$1"

  if [ "$VERSION" = "" ]; then
    die "Prepare requires arg: major minor patch"
  fi
  shift

  npm version "$VERSION" &&
    npm run build:prod &&
    cd terraform &&
    terraform plan -var "local_testing=false" -out tf.plan
}

apply() {
  cd terraform && terraform apply tf.plan
}

PRG_DIR=$(dirname "$0")
cd "${PRG_DIR}/.." || die "Unable to locate project dir"

CMD="$1"
shift

case "$CMD" in
prepare)
  prepare "$@"
  ;;

apply)
  apply "$@"
  ;;

*)
  die "Unknown command: $CMD"
  ;;
esac
