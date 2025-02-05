const express = require('express');
const app = express();

const path = require('path');
app.use(express.json());
app.use(express.static('public'));

const port = 8000;

const { initialize, getPublishedArticles, getCategories } = require('./content-service.js');


app.get('/', (req, res) => {
  res.redirect("/about");
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/articles',(req,res) => {
  initialize()
    .then(() => {
      return getPublishedArticles()
    })
    .then((articles) =>{
      res.json(articles)
    }).catch((err) => {
      console.log(err)
      res.status(500).json({message : err})
    })

  // res.sendFile(path.join(__dirname, 'views', 'articles.html'));
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
    // res.sendFile(path.join(__dirname, 'views', 'categories.html'));
});

app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
  console.log(`http://localhost:${port}`)
});
