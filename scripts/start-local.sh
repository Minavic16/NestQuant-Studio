#!/usr/bin/env bash
# Starts the production server locally.
#
# Uses `next start`, which serves the normal build output (including the CSS and
# JS in `_next/static`) and reads `.env.local` itself, so no environment
# wrangling is needed here.
#
# The container build is different: it sets STANDALONE=1 to emit the
# self-contained server directory, and the Dockerfile copies `_next/static`
# into it (see ARCHITECTURE.md §17).
#
# `HOSTNAME=::` makes Node listen on the IPv6 wildcard, which on a dual-stack
# host also accepts IPv4 connections. This matters because `admin.localhost`
# resolves to `::1` before `127.0.0.1` on many systems — binding IPv4 only
# would make the dashboard unreachable even though the shop works.
set -eo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "Missing .env.local — copy .env.example and fill it in." >&2
  exit 1
fi

if [ ! -d .next/BUILD_ID ] && [ ! -f .next/BUILD_ID ]; then
  echo "No build found. Run: npm run build" >&2
  exit 1
fi

export HOSTNAME="${HOSTNAME:-::}"

exec npx next start
