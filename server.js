// Name: Ulash Yshyk
// Student Number: 153349220
// Email: uyshyk@myseneca.ca
// Create Date: 2025/01/29
// Last Modified Date: 2025/02/05
const express = require('express');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

cloudinary.config({
  cloud_name: 'dplg9mqfq',
  api_key: 275718229495967,
  api_secret:"Nl0nkUNzws6ZzgiuaYd2delDlPQ",
  secure: true
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const port = 8000;
const upload = multer();

const {getPublishedArticles, getCategories,addArticle,getArticles,getArticleById,getArticlesByCategory,getArticlesByMinDate } = require('./content-service.js');


app.get('/', (req, res) => {
  res.redirect("/about");
});

app.get('/about', (req, res) => {
  res.render('about.ejs')
});

app.get('/articles',(req,res) => {
  getPublishedArticles()
  .then((articles) => {
    getCategories()
      .then((categories) => {
        const { category, minDate } = req.query;

        let filteredArticles = articles;

        if (category) {
          filteredArticles = filteredArticles.filter(article => article.category_name.toLowerCase() === category.toLowerCase());
        }

        if (minDate) {
          const min = new Date(minDate)
          filteredArticles = filteredArticles.filter(article =>{
            const publishedDate = new Date(article.published_date);
            return publishedDate >= min;
          });
        }

        if (filteredArticles.length > 0) {
          res.render('articles.ejs', { articles: filteredArticles, categories: categories });
        } else {
          res.render('articles.ejs', { message: "No data", categories: categories });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: err });
      });
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({ message: err });
  });
});


app.get('/categories',(req,res) => {
  getCategories()
    .then((categories) => {
      res.render('categories.ejs', { categories: categories });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err });
    });
});

app.get('/articles/add', (req, res) => {
  getCategories()
    .then((categories) => {
      res.render('addArticle.ejs', { categories: categories });
    })
    .catch((err) => {
      res.render('addArticle.ejs', { message: err });
    });
})


  app.post('/articles/add', upload.single("featureImage"), async (req, res) => {
    req.body = { ...req.body };
    console.log('REQ BODY:',req.body,'FILE:',req.file)
    try {
      let imageUrl = null;
  
      if (req.file) {
        const uploaded = await uploadToCloudinary(req);
        imageUrl = uploaded.url;
      }
  
      req.body.featureImage = imageUrl;
      req.body.category_name = req.body.category;
      await addArticle(req.body);
  
      res.redirect('/articles');
    } catch (err) {
      res.status(500).json({ message: "Article creation failed", error: err });
    }
  });
  
  async function uploadToCloudinary(req) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result)}
        else {
          reject(error)};
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
}
  
app.get("/articles/:id",(req,res) => {
  const articleId = parseInt(req.params.id);

  getArticleById(articleId)
    .then((articles) => {
      const article = articles.find((article) => article.id === articleId);

      if (!article || !article.published) {
        return res.status(404).render('404.ejs');
      }

      res.render('article.ejs', { article: article });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err });
    });
})

app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
  console.log(`http://localhost:${port}`)
});

