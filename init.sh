#!/bin/bash

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

# install Node.js using apt
install_node() {
    OS=$(uname -s)
    echo "Installing Node.js on $OS ..."
    if [[ "$OS" =~ ^Darwin$ ]]; then
        # macOS
        which brew > /dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install node || {
            echo "Failed to install Node.js. Exiting..."
            exit 1
        }
    elif [[ "$OS" =~ ^Linux$ ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y nodejs npm || {
            echo "Failed to install Node.js. Exiting..."
            exit 1
        }
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
    read -p "Do you want to start the application now? (y/n): " start_confirm
    if [ "$start_confirm" == "y" ]; then
        echo "Starting the application..."
        npm run start || {
            echo "Failed to start the application. Exiting..."
            exit 1
        }
    else
        echo "Application setup is complete, but not started."
        exit 0
    fi
}

# ask for confirmation to start the script
confirm_start() {
    echo "This script will perform the following actions:"
    echo "1. Clone a Git repository or download it as a ZIP if cloning fails."
    if [[ "$OS" =~ ^Darwin$ ]]; then
        echo "2. Check if Node.js is installed, and install it using Homebrew if it's not installed."
    elif [[ "$OS" =~ ^Linux$ ]]; then
        echo "2. Check if Node.js is installed, and install it using apt if it's not installed."
    else
        echo "2. Install Node.js (installation method depends on your OS which is not macOS or Linux)."
    fi
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
git clone $REPOSITORY_URL || {
    echo "Failed to clone the repository. Attempting to download the ZIP file..."
    curl -LO $GITHUB_ZIP_LINK && unzip $ZIP_FILE_NAME -d . || {
        echo "Failed to download and extract the repository ZIP file. Exiting..."
        exit 1
    }
    REPO_DIR_NAME="$REPO_NAME-main"  # Update repo directory name from ZIP file, if needed
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
echo "Please Configure the Server Settings (Leave empty for default):"
SERVER_PORT=$(ask_for_input "Server Port" $SERVER_PORT)
FRONT_END_PORT=$(ask_for_input "Front End Port" $FRONT_END_PORT)
MAX_SESSION=$(ask_for_input "Max Session Time (in minutes)" $MAX_SESSION)

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
