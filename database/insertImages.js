const mysql = require('mysql');
const {getConnection} = require('./connect');
const fs = require('fs');

async function addImages(images) {
  const table = "Image";
  const query = "INSERT INTO Image (path, isNsfw) VALUES ?"
  const conn = await getConnection();

  conn.query(`TRUNCATE TABLE ${table}`, (err, rows) => {

    if (err) {
      console.error(err);
      return;
    }

    console.log(`Truncated ${table}`);
  });

  console.log(images);

  conn.query("INSERT INTO Image (path, isNsfw) VALUES ?", [images], (err, rows) => {
    
    if (err) {
      console.error(err);
      return;
    }
    
    console.log(`Affected ${rows.affectedRows}`);
  });
  
  conn.release();
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

// console.log(folders);
let catToImg = [];
let images = new Set();

for (let i = 0; i < folders.length; i++) {
  const catPath = `${path}/${folders[i]}`;

  let files = fs.readdirSync(catPath).filter(f => {
    return !fs.statSync(`${catPath}/${f}`).isDirectory();
  });

  // console.log(files);

  for (let j = 0; j < files.length; j++) {
    images.add([files[j], false]);
  }

  for (let j = 0; j < files.length; j++) {
    const pair = [`${folders[i]}`, `${files[j]}`];
    catToImg.push(pair);
  }
}

for (let i = 0; i < folders.length; i++) {
  const catPath = `${path}/${folders[i]}/nsfw`;

  let files = fs.readdirSync(catPath).filter(f => {
    return !fs.statSync(`${catPath}/${f}`).isDirectory();
  });

  // console.log(files);

  for (let j = 0; j < files.length; j++) {
    images.add([files[j], true]);
  }

  for (let j = 0; j < files.length; j++) {
    const pair = [`${folders[i]}`, `${files[j]}`];
    catToImg.push(pair);
  }
}

let imagesDB = [];

for (const i of images) {
  imagesDB.push(i);
}

// console.log(imagesDB);


// console.log(images.size);
// console.log(catToImg.length);

addImages(imagesDB);
// addImgToCat(catToImg);