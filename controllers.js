const {fetchTopics} = require('./models')

exports.getWelcomeMsg = (request, response, next) => {
    response.status(200).send({msg: "Welcome!"})
   // .catch(next)
}

exports.getTopics = (request, response, next) => {
    fetchTopics().then((topics) => {
        response.status(200).send({topics: topics})
    }).catch(next)
    }