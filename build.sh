#!/usr/bin/env bash
set -o errexit

die() { set +v; echo "$*" 1>&2 ; exit 1; }

IMAGE_NAME=$1
[[ ! -z "$IMAGE_NAME" ]] || die "One argument, an image name, is required."

NODE_V=$(cat .nvmrc | perl -pne 's/v//')
PYTHON_MINOR_V=$(cat .python-version | perl -pne 's/\.\d+$//')
echo "Building $IMAGE_NAME with Node $NODE_V and Python $PYTHON_MINOR_V..."

# Docker BuildKit supports parallelizing multi-stage builds.
# https://medium.com/@tonistiigi/advanced-multi-stage-build-patterns-6f741b852fae
# https://docs.docker.com/develop/develop-images/build_enhancements/#to-enable-buildkit-builds
DOCKER_BUILDKIT=1 docker build \
  --tag $IMAGE_NAME \
  --build-arg NODE_V=$NODE_V \
  --build-arg PYTHON_MINOR_V=$PYTHON_MINOR_V \
  context