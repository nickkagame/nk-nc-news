const express = require('express');
const app = express();
const {getWelcomeMsg, getTopics} = require("./controllers");

app.get('/api/', getWelcomeMsg);

app.get('/api/topics', getTopics)

module.exports = app