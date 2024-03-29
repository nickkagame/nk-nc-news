const db = require("./db/connection");
const fs = require('fs/promises')

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((topics) => {
    if (!topics.rows.length) {
      return Promise.reject({ status: 404, msg: "topics not found" });
    }
    return topics.rows;
  });
};

exports.fetchArticles = (topic, sort, order) => {
  // const acceptedTopics = ['mitch', 'cats', 'paper', '', undefined];
  const acceptedSortBys = ['article_id', 'title', 'topic', 'author', 'body', 'created_at', 'comment_count', 'article_img_url', 'votes', '', undefined];
  const acceptedOrderBys = ['desc', 'asc', '', undefined];

if(!acceptedOrderBys.includes(order) || !acceptedSortBys.includes(sort)){
  return Promise.reject({status: 400, msg: 'bad query request'})
}

  let query = 
  `SELECT articles.*, COUNT(comments.article_id) AS comment_count
FROM articles
LEFT JOIN comments ON articles.article_id = comments.article_id
GROUP BY articles.article_id `
  
  if(sort && !order){
    query += ` ORDER BY ${sort} DESC`
  } 
  if(!sort && !order){
    query += ` ORDER BY articles.created_at DESC`
  }

  if(order && !sort){
    query += ` ORDER BY articles.created_at ${order}`
  } 
  if(order && sort){
   
    query += ` ORDER BY ${sort} ${order}` 
  }

  if(topic){
    queryStr = `SELECT articles.*, COUNT(comments.article_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE topic = $1
    GROUP BY articles.article_id ORDER BY articles.created_at DESC`

    return db
    .query(queryStr, [topic])
    .then((articles) => {
      return articles.rows;
    });
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
    WHERE articles.article_id = $1
    GROUP BY articles.article_id ORDER BY articles.created_at DESC`, [article_id])
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return article.rows[0];
    });
};



exports.fetchArticleComments = (article_id) => {
  const acceptedInput = new RegExp(/^\d+(?:\.\d{1,2})?$/
)
if(acceptedInput.test(article_id) === false) {
  return Promise.reject({status: 400, msg: 'bad article request'})
}
  const query = `SELECT * FROM comments  WHERE article_id = $1 ORDER BY comments.created_at DESC`
  return db.query(query, [article_id])
  .then((comments) => {
    if(!comments.rows.length){   
      return this.fetchArticleById(article_id)
    } else {
      return comments.rows
    }
  })
  .then((data) => {
    if(data.article_id){
      return []
    }
    return data
  })
}

exports.postComment = (comment, article_id) => {
  //error handler 1 - comment to short or object is in wrong format
  if (!comment.body || !comment.username || comment.body.length < 10 || Object.keys(comment).length > 2) {
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
    return db
      .query(
        `INSERT INTO comments (article_id, body, author) VALUES ($1, $2, $3) RETURNING *;`,
        [article_id, comment.body, comment.username]
      )
      .then((comment) => {
       return comment.rows[0];
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


  exports.eraseComment = (comment_id) => {
    const acceptedInput = new RegExp(/^\d+(?:\.\d{1,2})?$/);

  if (acceptedInput.test(comment_id) === false) {
    return Promise.reject({ status: 400, msg: "bad delete request" });
  }

    const query = `DELETE FROM comments WHERE comment_id = $1
    RETURNING *;`
    return db.query(query, [comment_id])
    .then((comments) => {
      if(comments.rowCount === 0){ 
        return Promise.reject({status: 404, msg: 'comment not found'})
      }
      return comments.rows[0]
    })
  }

  exports.fetchApi = () => { 
    return fs.readFile('./endpoints.json', 'utf-8').then((data)=> {
      return JSON.parse(data)
    })
  }
