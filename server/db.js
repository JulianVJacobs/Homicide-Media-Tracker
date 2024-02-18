//this is the database info file. it contains useful information such as the port number --set default at 5432
//the database name, password and user. it is important to ensure that your database details are identical to these, or if they
//are different, to change this file to match them. 

const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "postgres",//"postgres" is the default password, IF YOU ALREADY HAVE POSTGRESQL SET UP ON YOUR MACHINE, REPLACE WITH YOUR ACTUAL PASSWORD
  host: "localhost",
  port: 5432,
  database: "homicide_main",
  ssl: false, 
});

module.exports = pool;