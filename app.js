'use strict';
const myMock = require('./myMock.js'); // TODO: remove when not needed

const userDAL = require('./models/DAL/dbHelper.js');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('./config/config.js');
const Rx = require('rx');
const validation = require('./models/jsonValidation.js');

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    const clear = require('clear');
    clear();
    clear();
}

const app = express();
const port = 3334;
userDAL();

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

//app.use('/api', apiRoutes);
app.use('/', require('./routes/user.js'));
app.use('/', require('./routes/authenticate.js'));

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

const io = require('socket.io').listen(app.listen(port, function(){
    console.log('Listening on port ', port);
}), { log: false, origins: '*:*' });

const Lobby = require('./socketRoutes/lobby.js');
const lobby = new Lobby(io);

io.sockets.on('connection', function (socket) {

    const roomStream = Rx.Observable.fromEvent(socket, 'room');
    const lobbyStream = Rx.Observable.fromEvent(socket, 'lobby');

    const joinLobbyStream = roomStream
        .filter(ev => ev === 'lobby');

    const joinLobbyAddCardStream = lobbyStream
        .filter(ev => typeof ev !== 'string')
        .filter(ev => validation.joinValidation(ev))
        .filter(ev => ev.add);

    const removeLobbyCardStream = lobbyStream
        .filter(ev => typeof ev !== 'string')
        .filter(ev => validation.joinValidation(ev))
        .filter(ev => !ev.add);

    const leaveLobby = lobbyStream
        .filter(ev => typeof ev !== 'string')
        .filter(ev => !ev.hasOwnProperty('leave') && ev.leave)
        .filter(ev => !ev.hasOwnProperty('fbId'));

    joinLobbyStream.subscribe(function(data) {
        console.log('joinging lobby');
        console.log(data);
        socket.join(data);
        lobby.onLobbyJoin();
    });

    joinLobbyAddCardStream.subscribe(function(data) {
        console.log('add card to lobby');
        lobby.onLobbyAddCard(data.card);
    });

    removeLobbyCardStream.subscribe(function(data) {
        console.log('remove card from lobby');
        lobby.onRemoveCard(data.card);
    });

    leaveLobby.subscribe(function(data){
        console.log('leaving lobby');
        lobby.onLobbyLeave(data.fbId);
    });
});
