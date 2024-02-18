# Homicide Media Tracker

Welcome to the Homicide Media Tracker! This application helps in tracking homicide data efficiently.

## Setup Instructions

### Server Setup
1. Navigate to the server directory and follow the instructions in the README file to download and initialize the server.

### Client Setup
1. Navigate to the "Homicide Tracker New" directory in your terminal.
2. Install the required dependencies by running the following command:
    ```
    npm install
    ```

## Running the Application
1. To start the server and the client app, run the following command in the terminal:
    ```
    npm start
    ```
   This command will start both the server and the client app. The application should open automatically in your default browser. If not, you can access it by visiting [http://localhost:3000](http://localhost:3000) in your browser.

## Important Notes
1. **Browser Compatibility:** Please note that Safari on macOS might have compatibility issues. It is recommended to use Chrome for the best experience.

2. **Default Password:** The default password to delete the database is `1234`.

3. **Functionality Notice:** As of the writing of this document, the edit function is not yet operational.

4. **Data Capture:** On the manual Homicide capture page, ensure you submit article data, victim, and perpetrator data before submitting the form for the data to capture.

## Prerequisites
Before running the application, ensure you have the following installed:
- PostgreSQL: Download and install PostgreSQL from the web.
- Node.js: Download and install Node.js from the web.
- Nodemon: Install Nodemon using npm:
    ```
    npm install  nodemon
    ```
- Concurrently: Install Concurrently using npm:
    ```
    npm install  concurrently
    ```
- React-Scripts: Install React-Scripts using npm:
    ```
    npm install  react-scripts
    ```
- Bootstrap, Axios, XLSX, React-Router-DOM, React-DOM, React-Select, React-Toastify: Install these dependencies using npm:
    ```
    npm install bootstrap axios xlsx react-router-dom react-dom react-select react-toastify
    ```


##TROUBLESHOOTING
-database errors: 
-Make sure to copy code from newdatabase.sql section by section to ensure no errors, 
-if database errors are found, delete database and start again with code: DROP DATABASE homicide_main WITH (FORCE)