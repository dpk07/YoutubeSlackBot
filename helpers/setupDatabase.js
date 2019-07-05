//require postgress node module
const pg = require("pg");
const dotenv = require("dotenv");
var conString = process.env.DATABASE_URL;

var db = new pg.Client(conString);
db.connect();

//setup dotenv
dotenv.config();
// const db = new pg.Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT
// });

module.exports = db;
