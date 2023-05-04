const { connection } = require('./connect');

function addCategories(categories) {
  console.log(categories);

  connection.query(`USE coconutimages`, (err, results) => {
    if (err) throw err;
  });

  connection.query(`TRUNCATE TABLE Category`, (err, results) => {
    if (err) throw err;
  });

  connection.query(`INSERT INTO Category (name) VALUES ?`, [categories], (err, results) => {
    if (err) throw err;
    console.log(`Added ${results.affectedRows} categories`);
  });
}

addCategories(
  [
    ['coconut'],
    ['maple'],
    ['azuki'],
    ['cinnamon'],
    ['vanilla'],
    ['chocola'],
    ['fraise'],
    ['other']
  ]
);