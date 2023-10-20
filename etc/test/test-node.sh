#!/usr/bin/env bash
set -o errexit

. etc/test/utils.sh

cd context

start lint
pnpm run lint
end lint

start npm-test
pnpm run test
end npm-test

