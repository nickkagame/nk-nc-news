const db = require("./db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((topics) => {
    if (topics.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "topics not found" });
    }
    return topics.rows;
  });
};

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id ORDER BY articles.created_at DESC`
    )
    .then((articles) => {
      return articles.rows;
    });
};

exports.fetchArticleById = (article_id) => {
  const acceptedInput = new RegExp(/^\d+(?:\.\d{1,2})?$/);
  if (acceptedInput.test(article_id) === false) {
    return Promise.reject({ status: 400, msg: "bad article request" });
  }
  return db
    .query(`SELECT * FROM articles WHERE article_id = ${article_id}`)
    .then((article) => {
      if (article.rows.length < 1) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return article.rows.pop();
    });
};

exports.postComment = (comment, article_id) => {
   const acceptedInput = new RegExp(/^\d+(?:\.\d{1,2})?$/);
  if (acceptedInput.test(article_id) === false) {
    return Promise.reject({ status: 400, msg: "bad post request" });
  }
  const query = `SELECT author FROM articles WHERE article_id = $1`
  return db.query(query, [article_id])
    .then((result) => {
      if(result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "article not found" })
      }
    const author = result.rows[0].author;
    return db
    .query(`INSERT INTO comments (article_id, body, author) VALUES ($1, $2, $3) RETURNING *;`,
      [article_id, 
      comment.body, 
      author]
      ).then((result) => {
        let comment = result.rows.pop()
        return comment
      })
    })
};
