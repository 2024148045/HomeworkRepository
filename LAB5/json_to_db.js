const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const rawData = fs.readFileSync('./product.json');
const movies = JSON.parse(rawData);
const db = new sqlite3.Database('./data/product.db');

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS movies`);
  db.run(`
    CREATE TABLE movies (
      movie_id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_image TEXT,
      movie_title TEXT,
      movie_overview TEXT,
      movie_release_date TEXT,
      movie_rate REAL
    )
  `);

  const stmt = db.prepare(`
    INSERT INTO movies (movie_image, movie_title, movie_overview, movie_release_date, movie_rate)
    VALUES (?, ?, ?, ?, ?)
  `);

  movies.forEach(movie => {
    stmt.run(
      movie.poster,
      movie.title,
      movie.description,
      movie.release,
      movie.rating
    );
  });

  stmt.finalize();
  console.log("✅ product.db 생성 완료 (movies  테이블 포함)");
});

db.close();
