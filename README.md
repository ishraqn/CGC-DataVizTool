<div align="center">
    <h1> CGC Data Visualization Tool </h1>
    <img src="main_screen.gif" width="" height="">
</div>

## 
The CGC-DataVizTool is a web-based program that simplifies and improves the display of agricultural data for the **Canadian Grain Commission** 🍁

## Features 📊
- Works to convert complicated agricultural data sets into intuitive, interactive, and informative visual representations with custom filters courtesy of CGC.
- Remains an open source project, allowing for easy customization and expansion.
- Focus on agricultural geographic data analysis.

## Installation and Usage 🛠️

### Manual Install 🖥️

- Clone the repository: 

```git clone git@github.com:ishraqn/CGC-DataVizTool.git``` 

or 

Download the zip file under the `Code` tab.

- Install [Node.js](https://nodejs.org/en/download) <img src = "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" alt="Node.js Icon" height ="15" width="50">

- Configure the environment variables <img src = "https://raw.githubusercontent.com/motdotla/dotenv/master/dotenv.svg" alt=".env icon" height = "15" width ="50">

```bash
- Copy the .env.template file and rename it to .env
- Fill the required fields as per the instructions within the .env file
```

- Install the required packages (from the root directory) <img src = "https://upload.wikimedia.org/wikipedia/commons/d/db/Npm-logo.svg" alt="npm Icon" height = "15" width = "50">

```npm run init```

- Build the product (from the root directory) 

```npm run build```

- Start the server (from the root directory) 

```npm run start```

### Automatic Install 🤖

#### Linux 🐧 and macOS 🍎

Download the `init.sh` file from the repository and run the following command:

```bash
chmod +x init.sh
./init.sh
```

 The script will `ask` and wait for input for:

- PORTS
- Server Session Time
- Start the server automatically (y/n)

The script will automatically install the required packages, build the product, and start the server.

Close the terminal to stop the server for both options.