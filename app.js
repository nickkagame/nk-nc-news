const express = require('express');
const app = express();
const {getWelcomeMsg, getTopics} = require("./controllers");

app.get('/api/', getWelcomeMsg);

app.get('/api/topics', getTopics);

app.use((err, request, response, next) => {
    // console.log(err)
    if (err.status){
        console.log(err, ",___")
        response.status(err.status).send({msg: err.msg})
    } else {
        next(err)
    }
})

app.use((err, request, response, next) => {
    if (err.code === '22PO2') {
        response.status(400).send({msg: "Bad Request"})
    } else {
        next(err)
    }
})

app.use((err, request, response, next) => {
    response.status(500).send({msg: "Internal Server Error"})
})
    

module.exports = app