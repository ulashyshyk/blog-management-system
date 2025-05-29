require('dotenv').config();
const { Pool } = require("pg");
const env = require
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl:{
    rejectUnauthorized:false
  }
});
module.exports.pool = pool;
module.exports.getArticles = () => {
  return pool.query('SELECT * FROM "Articles"')
    .then(res => res.rows)
    .catch(err => Promise.reject("No results returned"));
};

module.exports.getPublishedArticles = () => {
  return pool.query('SELECT * FROM "Articles" WHERE published = true')
  .then(res =>{return res.rows} )
    .catch(err => Promise.reject("No results returned"));
};

module.exports.getCategories = () => {
  return pool.query('SELECT * FROM "Categories"')
    .then(res => {
        return res.rows})
    .catch(err => Promise.reject("No results returned"));
};

module.exports.addArticle = (articleData) => {
  const { title, content, author, featureImage, category_name } = articleData;
  console.log(articleData)
  const published = true;
  const published_date = new Date().toISOString().split('T')[0];

  return pool.query(
    `INSERT INTO "Articles"
    (title, content, author, published, published_date, "featureImage", category_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [title, content, author, published, published_date, featureImage || null, category_name]
  )
    .then(res => res.rows)
    .catch(err => Promise.reject("Unable to add article"));
};

module.exports.getArticlesByCategory = (category_id) => {
  return pool.query('SELECT * FROM articles WHERE category_id = $1', [category_id])
    .then(res => res.rows)
    .catch(err => Promise.reject("No results returned"));
};

module.exports.getArticlesByMinDate = (minDateStr) => {
  return pool.query('SELECT * FROM articles WHERE published_date >= $1', [minDateStr])
    .then(res => res.rows)
    .catch(err => Promise.reject("No results returned"));
};

module.exports.getArticleById = (id) => {
  return pool.query('SELECT * FROM "Articles" WHERE id = $1', [id])
    .then(res => {
      if (res.rows.length > 0) return res.rows;
      else return Promise.reject("Article doesn't exist");
    })
    .catch(err => Promise.reject("No result returned"));
};
