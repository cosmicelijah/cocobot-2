const mysql = require('mysql');
const { mysqlUser, mysqlPass, mysqlHost } = require('../config.json');

const connection = mysql.createConnection({
  host: mysqlHost,
  user: mysqlUser,
  password: mysqlPass,
})

connection.connect(err => {
  if (err) throw err;
  console.log("Connected");
});

module.exports = {
  connection: connection,
}