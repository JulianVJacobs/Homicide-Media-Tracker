# Homicide Media Tracker

Welcome to the Homicide Media Tracker! This application helps in tracking homicide data efficiently. Read more about this project:
- [Leveraging the potential of media data for the study of violent crime: Homicide Media Tracker Part 1](https://researchmethodscommunity.sagepub.com/blog/tools-and-technology/homicide-media-tracker-p1)
- [A new tool for collecting and analyzing homicide data: Homicide Media Tracker Part 2](https://researchmethodscommunity.sagepub.com/blog/tools-and-technology/homicide-media-tracker-p2)

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

## Questions
- in terms of the external server, will it be accessible by only one person or many people
- if it's accessible to many people, will they all have the ability to add/remove
    - if yes, there will need to be some server administration
- how well does the detect duplicates work?
- perhaps a way to have multiple people access is to have individuals manage personal databases and then publish their individual databases to a network
- can homicides exist without articles related to them (i.e. every homicide has at least one article)
    - i recommend this should possible because if you allow for the inclusion of homicide cases without supplementary articles, you could use that data to identify which cases are under-reported
- suspect identified and suspect name
    - how should suspects be named if they are unidentified
    - does it make more sense to only request a name when the suspect has been identified
    - should an alias name be an option
- sentence: what kind of information would be added here and should there be data validation to ensure the data entered makes sense
    - if we want to control the sentence entry more, which rules would make it globally applicable (what elements does a sentence always have)
- would it make sense to change "perpetrator details" to "suspect details" (semantics)
- how should case IDs generated
- the current set up right now is article/medium focused
    - it might make more sense to make it homicide focused with the articles/media as supplementary
- are the police database IDs that could be added to the homicide metadata (like case numbers)

## Features
- [x] package client as a desktop application
- [ ] allow for a local database (libsql/sqlite)
- [ ] connect to external server
    - [ ] deploy local database to external server
    - [ ] local database and external server database sync
    - [ ] server administration?
- [ ] use URL, author and article title to generate article id