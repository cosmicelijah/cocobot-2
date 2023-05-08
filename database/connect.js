const mysql = require('mysql2');
const { mysqlUser, mysqlPass, mysqlHost, mysqlDB } = require('../config.json');

const pool = mysql.createPool({
  host: mysqlHost,
  user: mysqlUser,
  password: mysqlPass,
  database: mysqlDB
})

async function getData(query) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        return callback(err);
      }

      conn.query(query, (err, rows) => {
        conn.release();

        if (err) {
          return reject(err);
        }

        const result = rows.map(row => Object.values(row));
        resolve(result);
      });
    });

  })
}

async function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) reject(err);
      resolve(conn);
    })
  });
}


module.exports = { getData, getConnection };