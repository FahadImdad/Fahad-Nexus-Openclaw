#!/bin/bash
# Setup Nexus on a new laptop
# Run this from inside the cloned repo folder

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Project dir: $PROJECT_DIR"

# 1. Install Python dependencies
echo ""
echo "Installing dependencies..."
uv sync
uv tool install . --force

# 2. Work out the Claude project key from the project path
# Claude uses the absolute path with slashes replaced by hyphens
PROJECT_KEY=$(echo "$PROJECT_DIR" | sed 's|/|-|g' | sed 's|^-||')
CLAUDE_MEMORY_DIR="$HOME/.claude/projects/$PROJECT_KEY/memory"

echo ""
echo "Claude project key: $PROJECT_KEY"
echo "Memory destination: $CLAUDE_MEMORY_DIR"

# 3. Copy memory files
mkdir -p "$CLAUDE_MEMORY_DIR"
cp "$PROJECT_DIR/memory/"* "$CLAUDE_MEMORY_DIR/"
echo "Memories copied: $(ls "$CLAUDE_MEMORY_DIR" | wc -l | tr -d ' ') files"

echo ""
echo "Done. Restart Claude Code and Nexus loader should work."
