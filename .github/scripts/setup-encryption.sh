#!/bin/bash
# Setup script for agent context encryption
# Run this after cloning the repository to enable context encryption

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
HOOK_PATH="$REPO_ROOT/.git/hooks/pre-commit"
ENCRYPT_SCRIPT="$REPO_ROOT/.github/scripts/encrypt-contexts.sh"

echo "🔧 Setting up agent context encryption..."

# Check if git is configured
if ! git config user.email >/dev/null 2>&1; then
    echo "❌ Git user.email not configured."
    echo "Please run: git config user.email 'your-email@example.com'"
    exit 1
fi

if ! git config user.name >/dev/null 2>&1; then
    echo "❌ Git user.name not configured."
    echo "Please run: git config user.name 'Your Name'"
    exit 1
fi

# Install pre-commit hook
if [ -f "$HOOK_PATH" ]; then
    echo "⚠️  Pre-commit hook already exists. Creating backup..."
    mv "$HOOK_PATH" "$HOOK_PATH.backup.$(date +%s)"
fi

# Create the pre-commit hook that calls our encryption script
cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
# Auto-installed pre-commit hook for agent context encryption

REPO_ROOT=$(git rev-parse --show-toplevel)
ENCRYPT_SCRIPT="$REPO_ROOT/.github/scripts/encrypt-contexts.sh"

if [ -f "$ENCRYPT_SCRIPT" ]; then
    exec "$ENCRYPT_SCRIPT"
else
    echo "Error: Encryption script not found at $ENCRYPT_SCRIPT"
    exit 1
fi
EOF

chmod +x "$HOOK_PATH"

echo "✅ Pre-commit hook installed successfully"

# Create .gitignore entries for unencrypted contexts
GITIGNORE_PATH="$REPO_ROOT/.gitignore"
CONTEXT_IGNORE_RULES="
# Agent context files (only encrypted versions should be committed)
.github/contexts/*.md
.github/copilot-instructions.md
!.github/contexts/*.enc
!.github/copilot-instructions.md.enc
"

if ! grep -q "Agent context files" "$GITIGNORE_PATH" 2>/dev/null; then
    echo "📝 Adding context encryption rules to .gitignore..."
    echo "$CONTEXT_IGNORE_RULES" >> "$GITIGNORE_PATH"
    echo "✅ .gitignore updated"
else
    echo "ℹ️  .gitignore already contains context encryption rules"
fi

# Test encryption key derivation
echo "🔐 Testing encryption key derivation..."
KEY_TEST=$("$ENCRYPT_SCRIPT" 2>/dev/null | head -n 1 || echo "")
if [ -n "$KEY_TEST" ]; then
    echo "✅ Encryption key derivation working"
else
    echo "❌ Encryption key derivation failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📖 Usage:"
echo "  • Context files will be automatically encrypted on commit"
echo "  • To manually decrypt a file: .github/scripts/encrypt-contexts.sh decrypt <file.enc>"
echo "  • Only authorised contributors can decrypt contexts (tied to git credentials)"
echo ""
echo "⚠️  Important:"
echo "  • Keep your git credentials secure - they control access to contexts"
echo "  • Never commit unencrypted .md files in .github/contexts/"
echo "  • The encryption key is derived from your git user.email and repository URL"
