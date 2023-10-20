ARG NODE_V
ARG PYTHON_MINOR_V

FROM node:${NODE_V}-alpine as builder

# Run corepack to get `pnpm`
RUN corepack enable

WORKDIR /work
RUN apk add --no-cache git

# COPY only what is needed so layers can be cached.
COPY package.json .
COPY pnpm-lock.yaml . 
COPY .npmrc .

RUN pnpm ci

COPY tsconfig.json tsconfig.json
COPY .swcrc .swcrc
COPY build-utils build-utils
COPY app app
COPY ingest-validation-tools ingest-validation-tools
# portal-visualization is python-only, and not needed for the npm build.

ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm run build

FROM tiangolo/uwsgi-nginx-flask:python${PYTHON_MINOR_V}

COPY requirements.txt /app
# Legacy resolver is used to avoid issues with a non-pinned subdependency which causes build failures in CI
# https://github.com/hubmapconsortium/portal-ui/actions/runs/6087458665/job/16516023950
RUN pip install -r /app/requirements.txt --use-deprecated=legacy-resolver

# NGINX should serve static content directly.
# https://github.com/tiangolo/uwsgi-nginx-flask-docker#custom-static-path
ENV STATIC_PATH /app/app/static

# Additional NGINX config that can't be handled with envvars.
# Be sure not to clobber nginx.conf from base image!
# Docs:   https://github.com/tiangolo/uwsgi-nginx-flask-docker#customizing-nginx-additional-configurations
# Source: https://github.com/tiangolo/uwsgi-nginx-docker/blob/c1e6eb2/docker-images/entrypoint.sh#L37
COPY portal.nginx.conf /etc/nginx/conf.d/

COPY --from=builder /work/app/static/public ${STATIC_PATH}/public
COPY . /app
