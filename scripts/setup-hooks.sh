#!/usr/bin/env bash
set -euo pipefail

echo "Setting up git hooks..."
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo "Done! Pre-commit hooks are now active."
echo "Hooks will check: ESLint, TypeScript types, Next.js build"
