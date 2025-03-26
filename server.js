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

cloudinary.config({
  cloud_name: 'dplg9mqfq',
  api_key: 275718229495967,
  api_secret:"Nl0nkUNzws6ZzgiuaYd2delDlPQ",
  secure: true
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const path = require('path');
app.use(express.json());
app.use(express.static(__dirname + "/public/"));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const port = 8000;
const upload = multer();

const { initialize, getPublishedArticles, getCategories,addArticle,getArticleById,getArticlesByCategory,getArticlesByMinDate } = require('./content-service.js');


app.get('/', (req, res) => {
  res.redirect("/about");
});

app.get('/about', (req, res) => {
  res.render('about.ejs')
});

app.get('/articles',(req,res) => {
  initialize()
    .then(() => {
      return getPublishedArticles()
    })
    .then((articles) =>{
      const {category, minDate } = req.query   

      let filteredArticles = articles

      if(category) {
        filteredArticles = filteredArticles.filter(article => article.category.toLowerCase() === category.toLowerCase())   //searches articles that match provided category
      }

      if(minDate){
        filteredArticles = filteredArticles.filter(article =>article.publishedDate >= minDate) //searches articles that were added later than provided date
      }


      if(filteredArticles.length > 0){
        res.render('articles.ejs',{articles:filteredArticles})
      }else{
        res.render('articles.ejs',{message : "No data"})
      }
    }).catch((err) => {
      console.log(err)
      res.status(500).json({message : err})
    })
});


app.get('/categories',(req,res) => {
  initialize()
    .then(() => {
      return getCategories()
    })
    .then((categories) =>{
      res.render('categories.ejs',{categories : categories})
     }).catch((err) => {
      console.log(err)
      res.status(500).json({message : err})
    })
});

app.get('/articles/add', (req, res) => {
  initialize()
  .then(() => {
    return getCategories()
  })
  .then(categories => {
      res.render('addArticle.ejs',{categories:categories})
  })
  .catch(err => {
    res.render('addArticle.ejs',{message:err});
  })
  })


app.post('/articles/add', upload.single("featureImage"), (req, res) => {
  req.body = {...req.body} //convert from null prototype to normal object
  if (req.file) {  //checks if  file exists
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(   //upload stream to Cloudinary
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
          }
        );
          streamifier.createReadStream(req.file.buffer).pipe(stream);  //converts uploaded file into readable stream and pipes it into Cloudinary upload stream
        });
    };
    async function upload(req) {     
      let result = await streamUpload(req);  //waits for upload to finish then returns result 
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processArticle(uploaded.url);     //uploads the image to cloudinary if successful
      }).catch(err => res.status(500).json({ message: "Image upload failed", error: err }));
     } else {
    processArticle("");   //if no file was uploaded,file is set to an empty string
    }

    function processArticle(imageUrl) {
      req.body.featureImage = imageUrl;  // Attach the uploaded image URL (or empty string if no file)
  
      // Call addArticle function from  module to save the article
      addArticle(req.body)
        .then(() => {
          console.log(global.articles)
          res.redirect('/articles');  // Redirect to articles list after saving
        })
        .catch((err) => {
          res.status(500).json({ message: "Article creation failed", error: err });
        });
    }
});

app.get("/articles/:id",(req,res) => {
  initialize()
    .then(() => {
      return getPublishedArticles()
    })
    .then((articles) =>{
      const id = parseInt(req.params.id)

      const article = articles.find(article => article.id === id) //searches article by id

      if(!article || !article.published){
          return res.status(404).render('404.ejs')       
      }

      res.render('article.ejs',{article:article})

    }).catch((err) => {
      console.log(err)
      res.status(500).json({message : err})
    })
})
app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
  console.log(`http://localhost:${port}`)
});

