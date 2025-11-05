#!/usr/bin/env bash
# Quick script to run Storybook for packages/ui with verbose logging and helpful envs
set -euo pipefail
cd "$(dirname "$0")/.."
export STORYBOOK_DEBUG=1
export NODE_OPTIONS="--trace-warnings"
# Start Storybook in packages/ui and stream logs to storybook-debug.log
pnpm --filter @amrikyy/ui --silent storybook --no-open --skip-storybook-cache 2>&1 | tee storybook-debug.log

