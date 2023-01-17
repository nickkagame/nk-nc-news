const {
  fetchTopics,
  fetchArticles,
  fetchArticleById,
  postComment,
} = require("./models");

exports.getWelcomeMsg = (request, response, next) => {
  response.status(200).send({ msg: "Welcome!" });
};

exports.getTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      response.status(200).send({ topics: topics });
    })
    .catch(next);
};

exports.getArticles = (request, response, next) => {
  fetchArticles()
    .then((articles) => {
      response.status(200).send({ articles: articles });
    })
    .catch(next);
};

exports.getArticlesById = (request, response, next) => {
  const { article_id } = request.params;
  // console.log(article_id)
  fetchArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
};

exports.sendComment = (request, response, next) => {
  const comment = request.body;
  const article_id = request.params.article_id;
  postComment(comment, article_id).then((comment) => {
    response.status(201).send({ commentAdded: comment });
  })
  .catch(next);
};
