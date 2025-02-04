const express = require('express');
const app = express();

const port = 8000;

const path = require('path');
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.redirect("/about");
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/articles',(req,res) => {
  res.sendFile(path.join(__dirname, 'views', 'articles.html'));

});

app.get('/categories',(req,res) => {
  res.sendFile(path.join(__dirname, 'views', 'categories.html'));
});

app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
  console.log(`http://localhost:${port}`)
});
