#!/bin/bash
# Pre-commit hook for encrypting sensitive agent context files
# Location: .git/hooks/pre-commit

set -e

# Configuration
CONTEXT_DIR=".github/contexts"
ENCRYPTED_SUFFIX=".enc"
KEY_DERIVATION_SOURCE="git_credentials"

# Function to derive encryption key from git credentials
derive_encryption_key() {
    # Get git user email and remote URL as basis for key derivation
    local git_email=$(git config user.email)
    local git_remote=$(git config --get remote.origin.url 2>/dev/null || echo "local")
    local git_user=$(git config user.name)
    
    if [ -z "$git_email" ]; then
        echo "Error: Git user.email not configured. Required for encryption key derivation."
        exit 1
    fi
    
    # Create deterministic key from git credentials + repository context
    # Using PBKDF2-like approach with git credentials as salt
    local key_material="${git_email}:${git_user}:${git_remote}:$(basename $(pwd))"
    echo -n "$key_material" | sha256sum | cut -d' ' -f1
}

# Function to encrypt file using derived key
encrypt_file() {
    local file_path="$1"
    local key="$2"
    local encrypted_path="${file_path}${ENCRYPTED_SUFFIX}"
    
    # Use OpenSSL with AES-256-CBC and derived key
    openssl enc -aes-256-cbc -salt -in "$file_path" -out "$encrypted_path" -k "$key" -md sha256
    
    if [ $? -eq 0 ]; then
        echo "Encrypted: $file_path -> $encrypted_path"
        # Stage the encrypted file
        git add "$encrypted_path"
        # Remove unencrypted file from staging
        git reset HEAD "$file_path" 2>/dev/null || true
    else
        echo "Error: Failed to encrypt $file_path"
        exit 1
    fi
}

# Function to decrypt file using derived key
decrypt_file() {
    local encrypted_path="$1"
    local key="$2"
    local original_path="${encrypted_path%$ENCRYPTED_SUFFIX}"
    
    if [ ! -f "$encrypted_path" ]; then
        echo "Error: Encrypted file not found: $encrypted_path"
        return 1
    fi
    
    openssl enc -aes-256-cbc -d -in "$encrypted_path" -out "$original_path" -k "$key" -md sha256
    
    if [ $? -eq 0 ]; then
        echo "Decrypted: $encrypted_path -> $original_path"
        return 0
    else
        echo "Error: Failed to decrypt $encrypted_path (wrong credentials?)"
        return 1
    fi
}

# Main pre-commit logic
main() {
    echo "🔐 Encrypting agent context files before commit..."
    
    # Derive encryption key from git credentials
    local encryption_key=$(derive_encryption_key)
    
    # Find all context files staged for commit
    local files_to_encrypt=$(git diff --cached --name-only --diff-filter=A | grep -E "^\.github/(contexts|copilot-instructions)" | grep -v "\.enc$" || true)
    
    if [ -z "$files_to_encrypt" ]; then
        echo "ℹ️  No agent context files to encrypt"
        exit 0
    fi
    
    echo "📁 Found files to encrypt:"
    echo "$files_to_encrypt"
    
    # Encrypt each file
    while IFS= read -r file_path; do
        if [ -f "$file_path" ]; then
            encrypt_file "$file_path" "$encryption_key"
        fi
    done <<< "$files_to_encrypt"
    
    echo "✅ Agent context files encrypted successfully"
}

# Handle script arguments for manual decrypt
if [ "$1" = "decrypt" ]; then
    if [ "$2" ]; then
        decrypt_file "$2" "$(derive_encryption_key)"
    else
        echo "Usage: $0 decrypt <encrypted_file_path>"
        exit 1
    fi
else
    main
fi
