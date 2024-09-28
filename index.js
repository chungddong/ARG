const express = require('express');
const app = express();
const port = 3000;

// EJS 설정
app.set('view engine', 'ejs');

// 정적 파일 제공 설정
app.use(express.static('public'));

// 기본 라우트
app.get('/', (req, res) => {
  res.render('index', { title: 'AI 출처 생성기', message: 'AI 출처 생성기' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
