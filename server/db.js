//this is the database info file. it contains useful information such as the port number --set default at 5432
//the database name, password and user. it is important to ensure that your database details are identical to these, or if they
//are different, to change this file to match them. 

const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB,
  ssl: false, 
});

module.exports = pool;