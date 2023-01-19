const db = require("./db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((topics) => {
    if (topics.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "topics not found" });
    }
    return topics.rows;
  });
};

exports.fetchArticles = (topic, sort, order) => {

  const acceptedTopics = ['mitch', 'cats', 'paper', '', undefined];
  const acceptedSortBys = ['article_id', 'title', 'topic', 'author', 'body', 'created_at', 'comment_count', 'article_img_url', 'votes', '', undefined];
  const acceptedOrderBys = ['desc', 'asc', '', undefined];
  console.log(acceptedTopics.includes(topic))

if(!acceptedTopics.includes(topic) || !acceptedOrderBys.includes(order) || !acceptedSortBys.includes(sort)){
  return Promise.reject({status: 400, msg: 'bad query request'})
}


  let query = 
  `SELECT articles.*, COUNT(comments.article_id) AS comment_count
FROM articles
LEFT JOIN comments ON articles.article_id = comments.article_id
GROUP BY articles.article_id `
  
  if(sort && !order){
    query += ` ORDER BY ${sort}`
  } 
  if(!sort && !order){
    query += ` ORDER BY articles.created_at DESC`
  }

  if(order && !sort){
    query += ` ORDER BY articles.created_at ${order}`
  } 
  if(order & sort){
    query += ` ORDER BY ${sort} ${order}` 
  }

  if(topic !== undefined && topic !== ''){
    query = `SELECT articles.*, COUNT(comments.article_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE topic = '${topic}'
    GROUP BY articles.article_id ORDER BY articles.created_at DESC`
    }
  return db
    .query(query)
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
    .query(`SELECT articles.*, COUNT(comments.article_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = ${article_id}
    GROUP BY articles.article_id ORDER BY articles.created_at DESC`)
    .then((article) => {
      if (article.rows.length < 1) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return article.rows.pop();
    });
};





exports.fetchArticleComments = (article_id) => {
  const acceptedInput = new RegExp(/^\d+(?:\.\d{1,2})?$/
)
if(acceptedInput.test(article_id) === false) {
  return Promise.reject({status: 400, msg: 'bad article request'})
}
  const query = `SELECT * FROM comments  WHERE article_id = $1`
  return db.query(query, [article_id])
  .then((comments) => {
    return comments.rows
  })
}

exports.postComment = (comment, article_id) => {
  //error handler 1 - comment to short or object is in wrong format
  if (comment.body.length < 10 || Object.keys(comment).length > 2) {
    return Promise.reject({
      status: 400,
      msg: "bad post request - comment format error",
    });
  }
  //error handler 2 - non-number article_id input
  const acceptedInput = new RegExp(/^\d+(?:\.\d{1,2})?$/);
  if (acceptedInput.test(article_id) === false) {
    return Promise.reject({ status: 400, msg: "bad post request" });
  }
  const query = `SELECT author FROM articles WHERE article_id = $1`;
  return db.query(query, [article_id]).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject({ status: 404, msg: "article not found" });
    }
    const author = result.rows[0].author;
    return db
      .query(
        `INSERT INTO comments (article_id, body, author) VALUES ($1, $2, $3) RETURNING *;`,
        [article_id, comment.body, comment.username]
      )
      .then((result) => {
        let comment = result.rows.pop();
        return comment;
      });
  });
};

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`)
  .then((users) => {
    return users.rows
  })
}

  exports.patchVotes = (votes, article_id) => {

    const acceptedInput = new RegExp(/[-]?\d+(\.)?(\d+)?/
)
  if(acceptedInput.test(article_id) === false) {
    return Promise.reject({status: 400, msg: 'bad article request'})
  }

  if(acceptedInput.test(votes) === false) {
    return Promise.reject({status: 400, msg: 'invalid votes input'})
  }
    const query = `UPDATE articles 
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`
    return db.query(query, [votes, article_id]).then((article) => {
      return article.rows[0]
    })
  }
