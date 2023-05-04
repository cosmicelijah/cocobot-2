const { connection } = require('./connect');
const fs = require('fs');

function addImages(images) {
  connection.query(`USE coconutimages`, (err, results) => {
    if (err) throw err;
  });

  connection.query(`TRUNCATE TABLE Image`, (err, results) => {
    if (err) throw err;
  });

  connection.query(`INSERT INTO Image (path) VALUES ?`, [images], (err, results) => {
    if (err) throw err;
    console.log(`Added ${results.affectedRows} categories`);
  });
}

function addImgToCat(data) {
  connection.query(`USE coconutimages`, (err, results) => {
    if (err) throw err;
  });

  connection.query(`TRUNCATE TABLE HasCategory`, (err, results) => {
    if (err) throw err;
  });

  connection.query(`INSERT INTO HasCategory (catName, imageName) VALUES ?`, [data], (err, results) => {
    if (err) throw err;
    console.log(`Added ${results.affectedRows} images`);
  });
}

const path = "../../Pictures/dbImages/"

let folders = fs.readdirSync(path).filter(f => {
  return fs.statSync(`${path}/${f}`).isDirectory();
});

console.log(folders);
let catToImg = [];
let images = new Set();

for (let i = 0; i < folders.length; i++) {
  const catPath = `${path}/${folders[i]}`;

  let files = fs.readdirSync(catPath);

  for (let j = 0; j < files.length; j++) {
    images.add(files[j]);
  }

  for (let j = 0; j < files.length; j++) {
    const pair = [`${folders[i]}`, `${files[j]}`];
    catToImg.push(pair);
  }
}

let imagesDB = [];

for (const i of images) {
  imagesDB.push([i]);
}

// console.log(imagesDB);


// console.log(images.size);
// console.log(catToImg.length);

addImages(imagesDB);
addImgToCat(catToImg);