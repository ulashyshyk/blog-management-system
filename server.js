const express = require('express');
const app = express();

const port = 8000;

const path = require('path');
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
  // res.send(`
  //   <h1>Ulash Yshyk - 153349220</h1>
  //   <p><a href="/about">Go to About Page</a></p>
  // `);
  res.redirect("/about");
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
  console.log(`http://localhost:${port}`)
});
