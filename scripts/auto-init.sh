#!/bin/bash

# This script will auto initialize the CGC-DataVizTool init script

SCRIPT_NAME="init.sh"
GIT_REPO_RELEASE_URL="https://github.com/ishraqn/CGC-DataVizTool/releases"

# Check script exists
if [ ! -f "$SCRIPT_NAME" ]; then
    echo "Error: $SCRIPT_NAME does not exist in the current directory. Download the release again:"
    echo "$GIT_REPO_RELEASE_URL"
    exit 1
fi

# Make the script executable
if [ ! -x "$SCRIPT_NAME" ]; then
    echo "Setting executable permissions on $SCRIPT_NAME."
    chmod +x "$SCRIPT_NAME"
fi

# Execute
./"$SCRIPT_NAME"
