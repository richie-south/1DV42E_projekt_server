'use strict';
const myMock = require('./myMock.js'); // TODO: remove when not needed

const userDAL = require('./models/DAL/dbHelper.js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3334;
userDAL();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/user.js'));

app.use(function(req, res, next) {
  res.status(404).send('404');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('500');
});

app.all('/', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});
