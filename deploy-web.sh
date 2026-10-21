#!/usr/bin/env bash
# Publishes the web version to Cloudflare Pages: https://nous-9vy.pages.dev
set -euo pipefail
cd "$(dirname "$0")"
rm -rf publish
dotnet publish MathVoyager.csproj -c Release -o publish
# Pinned: newer wrangler releases route `pages` commands through Workers.
npx --yes wrangler@4.59.0 pages deploy publish/wwwroot --project-name=nous --branch main --commit-dirty=true
