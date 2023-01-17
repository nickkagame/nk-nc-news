const db = require('./db/connection')

exports.fetchTopics = () => {
    return db.query(`SELECT * FROM topics;`).then((topics) => {
        // console.log(topics.rows)
        if(topics.rows.length === 0){ 
          return Promise.reject({status: 404, msg: 'topics not found'})
        }
        return topics.rows;
      })
};