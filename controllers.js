const {fetchTopics, fetchArticles, fetchArticleById, fetchArticleComments} = require('./models')

exports.getWelcomeMsg = (request, response, next) => {
    response.status(200).send({msg: "Welcome!"})
}

exports.getTopics = (request, response, next) => {
    fetchTopics().then((topics) => {
        response.status(200).send({topics: topics})
    }).catch(next)
    }

exports.getArticles = (request, response, next) => {
    fetchArticles().then((articles) => {
        response.status(200).send({articles: articles})
    }).catch(next)
}

exports.getArticlesById = (request, response, next) => {
    const {article_id} = request.params
    fetchArticleById(article_id).then((article) => {
        response.status(200).send({article})
    }).catch(next)
    }

exports.getArticleComments = (request, response, next) => {
    const {article_id} = request.params
    fetchArticleById(article_id)
        .then(() => { 
            return fetchArticleComments(article_id) 
        })
        .then((comments) => {
        response.status(200).send({comments: comments})
    }).catch(next)
}