const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <h1>Ulash Yshyk - 153349220</h1>
    <p><a href="/about">Go to About Page</a></p>
  `);
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
