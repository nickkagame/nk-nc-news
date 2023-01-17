const db = require('./db/connection')

exports.fetchTopics = () => {
    return db.query(`SELECT * FROM topics;`).then((topics) => {
        if(topics.rows.length === 0){ 
          return Promise.reject({status: 404, msg: 'topics not found'})
        }
        return topics.rows;
      })
};

exports.fetchArticles = () => {
  return db.query(`SELECT articles.*, COUNT(comments.article_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id ORDER BY articles.created_at DESC`)
  .then((articles)=> {
    return articles.rows
  })
}
};
