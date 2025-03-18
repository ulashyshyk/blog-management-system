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

cloudinary.config({
  cloud_name: 'Blog',
  api_key: 275718229495967,
  api_secret:"Nl0nkUNzws6ZzgiuaYd2delDlPQ",
  secure: true
  })

const path = require('path');
app.use(express.json());
app.use(express.static('public'));

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
        filteredArticles = filteredArticles.filter(article => article.category.toLowerCase() === category.toLowerCase())
      }

      if(minDate){
        filteredArticles = filteredArticles.filter(article =>article.publishedDate >= minDate)
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
      res.json(categories)
    }).catch((err) => {
      console.log(err)
      res.status(500).json({message : err})
    })
});

app.get('/articles/add', (req, res) => {
  res.render('addArticle.ejs')
  })

  app.post('/articles/add', upload.single("featureImage"), (req, res) => {
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

      upload(req).then((uploaded) => {
        processArticle(uploaded.url);     //uploads the image to cloudinary if successful
      }).catch(err => res.status(500).json({ message: "Image upload failed", error: err }));
      } else {
      processArticle("");   //if no file was uploaded,file is set to an empty string
      }
      function processArticle(imageUrl) {    
        req.body.featureImage = imageUrl;  //attachs image url to the article data
        // Add article to content-service
      contentService.addArticle((req.body)
      .then(() => res.redirect('/articles'))  //saves the article,if successful redirects the user ro /articles
      .catch(err => res.status(500).json({ message: "Article creation failed", error: err })));
      }
     });

     app.get("/articles/:id",(req,res) => {
      initialize()
        .then(() => {
          return getPublishedArticles()
        })
        .then((articles) =>{
          const id = parseInt(req.params.id)
    
          let filteredArticles = articles
    
          filteredArticles = filteredArticles.filter(article => article.id === id)
    
          if(filteredArticles.length > 0){
              res.json(filteredArticles)
          }else{
            res.status(404).json({message:"Article not found"})
          }
        }).catch((err) => {
          console.log(err)
          res.status(500).json({message : err})
        })
    })
app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
  console.log(`http://localhost:${port}`)
});

