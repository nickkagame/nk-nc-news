const express = require("express");
const app = express();
const apiRouter = require('./api-router');
const cors = require('cors');

const {
  getTopics,
  getArticles,
  getArticlesById,
  sendComment,
  getArticleComments,
  getUsers,
  updateVotes, 
  deleteComment,
  getApi
} = require("./controllers");


app.use(cors());

// app.use('/api', apiRouter)

app.use(express.json());

app.get('/api/healthcheck', (req, res) => {
  res.status(200).send({msg: 'everything is working fine!'})
})

app.get("/api/", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticlesById);

app.get("/api/articles/:article_id/comments", getArticleComments)

app.post("/api/articles/:article_id/comments", sendComment);

app.get('/api/users', getUsers)

app.patch('/api/articles/:article_id', updateVotes)

app.delete('/api/comments/:comment_id', deleteComment)

app.use((err, request, response, next) => {
  if (err.status) {
    response.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.code === "22PO2" || err.code === "42703") {
    response.status(400).send({ msg: "Bad Request" });
  } else 
  if(err.code === '23503'){
    response.status(404).send({msg: 'article not found'})
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
    console.log(err)
    response.status(500).send({msg: "Internal Server Error"})
})
    

module.exports = app;
