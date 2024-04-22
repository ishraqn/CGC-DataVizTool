#!/bin/bash

# This script contains the initialization steps for the CGC-DataVizTool

# Constants
REPOSITORY_URL="https://github.com/ishraqn/CGC-DataVizTool.git"
REPO_DIR_NAME="$(basename -s .git $REPOSITORY_URL)"
REPO_NAME="CGC-DataVizTool"
GITHUB_ZIP_LINK="https://github.com/ishraqn/CGC-DataVizTool/archive/refs/heads/main.zip"
ZIP_FILE_NAME="main.zip" 
SERVER_PORT=5000
FRONT_END_PORT=3000
MAX_SESSION=60
OS=$(uname -s) 
SHELL_NAME=$(basename "$SHELL")

# install Node.js using apt
install_node() {
    OS=$(uname -s)
    echo "Installing nvm and Node.js on $OS ..."

    if [[ "$OS" =~ ^Darwin$ || "$OS" =~ ^Linux$ ]]; then
        if ! curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash; then
            echo "Failed to install NVM. Exiting..."
            exit 1
        fi

        if [[ "$SHELL_NAME" == "bash" ]]; then
            SOURCE_FILE="$HOME/.bashrc"
        elif [[ "$SHELL_NAME" == "zsh" ]]; then
            SOURCE_FILE="$HOME/.zshrc"
        elif [[ "$SHELL_NAME" == "ksh" ]]; then
            SOURCE_FILE="$HOME/.profile"
        else
            echo "Shell not supported for auto-sourcing. Please manually source your shell's configuration file."
            exit 1
        fi

        source $SOURCE_FILE || {
            echo "Failed to source $SOURCE_FILE. Exiting..."
            exit 1
        }

        if ! nvm install node; then
            echo "Failed to install Node.js. Exiting..."
            exit 1
        fi

        echo "Node.js $(node -v) and npm $(npm -v) installed successfully."
    else
        echo "Unsupported operating system: $OS"
        exit 1
    fi
}


# handle user input with default values
ask_for_input() {
    read -p "Enter $1 (default: $2): " input
    echo "${input:-$2}"
}

# Function to prompt user to start the application
start_application() {
    printf "\n"
    read -p "Do you want to start the application now? (y/n): " start_confirm
    if [ "$start_confirm" == "y" ]; then
        echo "Starting the application..."
        npm run start || {
            echo "Failed to start the application. Exiting..."
            exit 1
        }
    else
        printf "\nApplication setup is complete, but not started."
        exit 0
    fi
}

# ask for confirmation to start the script
confirm_start() {
    printf  "This script will perform the following actions:\n"
    echo "1. Clone the Git repo or download as ZIP if cloning fails."
    echo "2. Install NodeJS using nvm if not installed."
    echo "3. Run npm commands to initialize and build the platform."
    echo "4. Configure the server based on user input."
    echo "5. Start the application. Close the terminal to stop application."
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
git clone $REPOSITORY_URL || {
    REPO_DIR_NAME="$REPO_NAME-main" 
    echo "Failed to clone the repository. Attempting to download and unzip $REPO_DIR_NAME file..."
    if ! curl -LO $GITHUB_ZIP_LINK || ! unzip -o $ZIP_FILE_NAME -d .; then
        echo "Failed to download and extract the repository ZIP file. Checking for existing directory..."
        if [ -d "$REPO_DIR_NAME" ]; then
            echo "$REPO_DIR_NAME exists and will be used."
        else
            echo "No existing directory found. Exiting..."
            exit 1
        fi
    fi
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
printf "\nPlease Configure the Server Settings (Leave empty for default):\n"
SERVER_PORT=$(ask_for_input "Server Port" $SERVER_PORT)
FRONT_END_PORT=$(ask_for_input "Front End Port" $FRONT_END_PORT)
MAX_SESSION=$(ask_for_input "Max Data Retention (in minutes)" $MAX_SESSION)

# Update the .env file using sed based on the OS
if [[ "$(uname -s)" =~ ^Darwin$ ]]; then
    sed -i '' "s/^PORT='.*'$/PORT='$SERVER_PORT'/" .env
    sed -i '' "s/^FRONTEND_PORT='.*'$/FRONTEND_PORT='$FRONT_END_PORT'/" .env
    sed -i '' "s/^SESSION_MAX_AGE='.*'$/SESSION_MAX_AGE='$MAX_SESSION'/" .env
else
    sed -i "s/^PORT='.*'$/PORT='$SERVER_PORT'/" .env
    sed -i "s/^FRONTEND_PORT='.*'$/FRONTEND_PORT='$FRONT_END_PORT'/" .env
    sed -i "s/^SESSION_MAX_AGE='.*'$/SESSION_MAX_AGE='$MAX_SESSION'/" .env
fi

# 5: Start application
start_application
