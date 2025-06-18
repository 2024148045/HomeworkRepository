const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const dbPath = './data/product.db';
const commentPath = './data/comment.json';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ DB 연결 실패:", err.message);
  } else {
    console.log("✅ SQLite DB 연결 성공");
  }
});

app.get('/', (req, res) => {
  const keyword = req.query.keyword || '';
  const sort = req.query.sort || 'ratingDesc';

  let sql = `SELECT * FROM movies WHERE movie_title LIKE ?`;
  switch (sort) {
    case 'ratingAsc':
      sql += ` ORDER BY movie_rate ASC`;
      break;
    case 'releaseDesc':
      sql += ` ORDER BY movie_release_date DESC`;
      break;
    case 'releaseAsc':
      sql += ` ORDER BY movie_release_date ASC`;
      break;
    default:
      sql += ` ORDER BY movie_rate DESC`;
  }

  console.log("👉 실행할 쿼리:", sql);
  console.log("👉 키워드:", keyword);

  db.all(sql, [`%${keyword}%`], (err, rows) => {
    if (err) {
      console.error("❌ 쿼리 실패:", err.message);  // 여기 반드시 찍힐 거예요
      return res.status(500).send("DB Error");
    }
    console.log("✅ 결과 개수:", rows.length);
    res.render('index', { movies: rows, keyword, sort });
  });
});

app.get('/movies/:id', (req, res) => {
  const id = req.params.id;

  const sql = `SELECT * FROM movies WHERE movie_id = ?`;
  db.get(sql, [id], (err, movie) => {
    if (err) {
      console.error("❌ 영화 상세 조회 실패:", err.message);
      return res.status(500).send("DB Error");
    }

    if (!movie) {
      return res.status(404).send("해당 영화를 찾을 수 없습니다.");
    }

    // 댓글 JSON 파일 읽기
    let comments = {};
    try {
      comments = JSON.parse(fs.readFileSync('./data/comment.json', 'utf8'));
    } catch (e) {
      comments = {};
    }

    const movieComments = comments[id] || [];

    res.render('movie_detail', {
      movie,
      comments: movieComments
    });
  });
});

app.post('/movies/:id/comment', (req, res) => {
  const id = req.params.id;
  const { user, text } = req.body;

  let comments = {};
  try {
    comments = JSON.parse(fs.readFileSync('./data/comment.json', 'utf8'));
  } catch (e) {
    comments = {};
  }

  if (!comments[id]) {
    comments[id] = [];
  }

  comments[id].push({ user, text });

  fs.writeFileSync('./data/comment.json', JSON.stringify(comments, null, 2));
  res.redirect(`/movies/${id}`);
});


// 기타 라우팅은 동일하게 유지
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));

app.listen(3000, () => {
  console.log('🚀 서버 실행 중: http://localhost:3000');
});
