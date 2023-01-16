const db = require('./db/connection')

exports.fetchTopics = () => {
    return db.query(`SELECT * FROM topics;`).then((topics) => {
        // console.log(topics.rows)
        return topics.rows;
      })
};