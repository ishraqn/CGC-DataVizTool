#!/bin/bash

# Constants
REPOSITORY_URL="https://github.com/ishraqn/CGC-DataVizTool.git"
REPO_DIR_NAME="$(basename -s .git $REPOSITORY_URL)"
GITHUB_ZIP_LINK="https://github.com/ishraqn/CGC-DataVizTool/archive/refs/heads/main.zip"
ZIP_FILE_NAME="main.zip"  

# install Node.js using apt
install_node() {
    echo "Installing Node.js ..."
    sudo apt-get update
    sudo apt-get install -y nodejs npm || {
        echo "Failed to install Node.js. Exiting..."
        exit 1
    }
}

# handle user input with default values
ask_for_input() {
    read -p "Enter $1 (default: $2): " input
    echo "${input:-$2}"
}

# ask for confirmation to start the script
confirm_start() {
    echo "This script will perform the following actions:"
    echo "1. Clone a Git repository or download it as a ZIP if cloning fails."
    echo "2. Install Node.js if not already installed."
    echo "3. Run npm commands to initialize and build the project."
    echo "4. Set up server configuration via .env file based on provided inputs."
    echo "5. Start the application and keep it running until you choose to exit."
    read -p "Do you want to proceed? (y/n): " confirmation
    if [ "$confirmation" != "y" ]; then
        echo "Script aborted by the user."
        exit 0
    fi
}

# Main script execution starts here

# Ask for user confirmation to proceed
confirm_start

# 1: Clone the Git repository
echo "Attempting to clone the Git repository from $REPOSITORY_URL..."
{
    echo "Failed to clone the repository. Attempting to download the ZIP file..."
    curl -LO $GITHUB_ZIP_LINK && unzip $ZIP_FILE_NAME -d . || {
        echo "Failed to download and extract the repository ZIP file. Exiting..."
        exit 1
    }
    REPO_DIR_NAME="CGC-DataVizTool-main"  # Update repo directory name from ZIP file, if needed
}

# Change directory to the repository
cd $REPO_DIR_NAME || {
    echo "Failed to change directory to the repository. Exiting..."
    exit 1
}

# 2: Check if Node.js and npm are installed, otherwise install
command -v node >/dev/null 2>&1 || {
    echo "Node.js is not installed. Installing now..."
    install_node
}

# 3: Setup the project
echo "Setting up the project..."
npm run init && npm run build || {
    echo "Failed to setup the project. Exiting..."
    exit 1
}

# Copy the .env.template to .env and modify it
cp .env.template .env
PORT=$(ask_for_input "Port" 5000)
sed -i "s/^PORT='.*'$/PORT='$PORT'/" .env
FRONT_END_PORT=$(ask_for_input "Front end port" 3000)
sed -i "s/^FRONTEND_PORT='.*'$/FRONTEND_PORT='$FRONT_END_PORT'/" .env
MAX_SESSION=$(ask_for_input "Max session time (in minutes)" 60)
sed -i "s/^SESSION_MAX_AGE='.*'$/SESSION_MAX_AGE='$MAX_SESSION'/" .env

# 5: Start application
echo "Starting the application..."
npm run start || {
    echo "Failed to start the application. Exiting..."
    exit 1
}

# Prevent closing immediately
echo "Application is running. Press any key to close."
read -n 1 -s
