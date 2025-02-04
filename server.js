const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ulash Yshyk - 153349220');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
