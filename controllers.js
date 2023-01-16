const {fetchTopics, fetchArticles} = require('./models')

exports.getWelcomeMsg = (request, response, next) => {
    response.status(200).send({msg: "Welcome!"})
   // .catch(next)
}

exports.getTopics = (request, response, next) => {
    fetchTopics().then((topics) => {
        response.status(200).send({topics: topics})
    }).catch(next)
    }

exports.getArticles = (request, response, next) => {
    fetchArticles().then((articles) => {
        response.status(200).send({articles: articles})
    })
}