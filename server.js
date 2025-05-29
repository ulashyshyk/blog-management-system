const express = require('express');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier')
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override')
const db = require('./content-service.js')
const pool = db.pool;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
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
app.put('/articles/:id', upload.single("featureImage"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, content, category, existingImage } = req.body;

    if (req.file) {
      // If new image uploaded
      const imageUrl = (await uploadToCloudinary(req)).url;
      await pool.query(`
        UPDATE "Articles"
        SET 
          title = $1,
          content = $2,
          author = $3,
          category_name = $4,
          "featureImage" = $5
        WHERE id = $6
      `, [title, content, author, category, imageUrl, id]);
    } else {
      // If no new image uploaded
      await pool.query(`
        UPDATE "Articles"
        SET 
          title = $1,
          content = $2,
          author = $3,
          category_name = $4
        WHERE id = $5
      `, [title, content, author, category, id]);
    }

    res.redirect('/articles');
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).send("Article update failed");
  }
});
app.get('/articles/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getArticleById(id);
    console.log(result[0])
    if (result.length === 0) {
      return res.status(404).send('Article not found');
    }

    const article = result[0];
    res.render('edit', { article });
  } catch (err) {
    res.status(500).send("Error fetching article details");
  }
});
app.delete('/articles/:id', async (req, res) => {
  try {
    const {id} = req.params;
    await pool.query('DELETE FROM "Articles" WHERE id = $1', [id]);
    res.redirect('/articles');
  } catch (err) {
    res.status(500).send("Failed to delete article");
  }
});
app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
  console.log(`http://localhost:${port}`)
});

