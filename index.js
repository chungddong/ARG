const express = require('express');
const app = express();
const port = 3000;

// EJS 설정
app.set('view engine', 'ejs');

// 기본 라우트
app.get('/', (req, res) => {
  res.render('index', { title: 'Express 앱', message: 'Hello, Express with EJS!' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
