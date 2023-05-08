const mysql = require('mysql2');
const {getConnection} = require('./connect');
const fs = require('fs');

async function addCategories(categories) {
  const conn = await getConnection();
  
  conn.query(`TRUNCATE TABLE category`, (err, results) => {
    if (err) throw err;
  });

  conn.query(`INSERT INTO category (name) VALUES ?`, [categories], (err, results) => {
    if (err) throw err;
    console.log(`Added ${results.affectedRows} categories`);
  });

  conn.release();
}

async function addImages(images) {
  const table = "image";
  const conn = await getConnection();

  conn.query(`TRUNCATE TABLE ${table}`, (err, rows) => {

    if (err) {
      console.error(err);
      return;
    }

    console.log(`Truncated ${table}`);
  });

  console.log(images);

  try {
    conn.query("INSERT INTO image (path, isNsfw) VALUES ? ON DUPLICATE KEY UPDATE path=path", [images], (err, rows) => {
      
      if (err) throw err;
      
      console.log(`Added ${rows.affectedRows} images`);
    });  
  } catch (error) {
    console.log(error);
  }

  conn.release();
}

async function addImgToCat(data) {
  const conn = await getConnection();

  conn.query(`TRUNCATE TABLE HasCategory`, (err, results) => {
    if (err) throw err;
  });

  conn.query(`INSERT INTO HasCategory (catName, imageName) VALUES ?`, [data], (err, results) => {
    if (err) throw err;
    console.log(`Added ${results.affectedRows} categories to images`);
  });
}

const path = "../../Pictures/dbImagesReal/"

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
// console.log(catToImg);


// console.log(images.size);
// console.log(catToImg.length);

// addCategories(
//   [
//     ['coconut'],
//     ['maple'],
//     ['azuki'],
//     ['cinnamon'],
//     ['vanilla'],
//     ['chocola'],
//     ['fraise'],
//     ['other']
//   ]
// );

addImages(imagesDB);
addImgToCat(catToImg);