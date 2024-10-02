const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
require('dotenv').config(); // dotenv 모듈 불러오기
const OpenAI = require("openai"); 


const port = 3000;

// EJS 설정
app.set('view engine', 'ejs');

app.use(bodyParser.json()); // body-parser 미들웨어 사용
// 정적 파일 제공 설정
app.use(express.static('public'));

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // SSL 인증서 검증 비활성화
});

// OpenAI API 클라이언트 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env 파일에서 API 키 가져오기
});

// 기본 라우트
app.get('/', (req, res) => {
  res.render('index', { title: 'AI 출처 생성기', message: 'AI 출처 생성기' });
});

// API 엔드포인트
// API 엔드포인트
app.post('/api/citations', async (req, res) => {
  const { links, files, citationStyle } = req.body;

  // 받은 데이터 출력
  console.log('받은 링크:', links);
  console.log('받은 파일:', files);
  console.log('선택된 출처 표기 스타일:', citationStyle);

  try {
    // 링크에서 HTML을 추출하는 함수
    const fetchHtmlFromLink = async (link) => {
      try {
        const response = await axios.get(link, { httpsAgent }); // SSL 검증 비활성화된 에이전트를 사용
        return response.data; // HTML 데이터를 반환
      } catch (error) {
        console.error(`Failed to fetch HTML from ${link}:`, error);
        return null;
      }
    };

    // 각 링크에 대해 HTML을 가져옴
    const htmlContents = await Promise.all(links.map(fetchHtmlFromLink));

    // GPT API 요청
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // 사용하고자 하는 모델
      messages: [
        {
          role: 'system',
          content: `당신은 출처 표기 스타일을 생성하는 데 능숙한 AI입니다. 사용자가 제공한 HTML 내용을 분석하여 저자, 제목, 발행일 등의 정보를 추출한 후, 지정된 인용 스타일에 맞게 데이터를 생성하십시오.`,
        },
        {
          role: 'user',
          content: `HTML 데이터:\n${htmlContents.join('\n')}\n파일: ${files.join(', ')}\n출처 표기 스타일: ${citationStyle}`,
        },
      ],
    });

    // GPT의 응답 처리
    const gptResponse = response.choices[0].message.content;
    console.log('GPT 응답:', gptResponse);

    // 클라이언트에 응답
    res.json({ message: '데이터가 성공적으로 수신되었습니다.', gptResponse });
  } catch (error) {
    console.error('GPT API 호출 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
