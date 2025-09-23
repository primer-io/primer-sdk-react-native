#!/bin/bash
WORKING_DIR=$(dirname "$0")

# Use nvm to ensure node is available
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

node ${WORKING_DIR}/update-ios-version.js