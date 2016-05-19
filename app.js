'use strict';

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    const clear = require('clear');
    clear();
    clear();
}

const myMock = require('./myMock.js'); // TODO: remove when not needed

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const Rx = require('rx');
const userDAL = require('./models/DAL/dbHelper.js');
const Lobby = require('./socketRoutes/lobby.js');
const Challange = require('./socketRoutes/challange.js');
const config = require('./config/config.js');
const validation = require('./models/jsonValidation.js');

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

const lobby = new Lobby(io);
const challange = new Challange(io);
const removeFristTowCaracters = (string) => string.substring(2, string.length);

io.sockets.on('connection', function (socket) {

    const roomStream = Rx.Observable.fromEvent(socket, 'room');
    const lobbyStream = Rx.Observable.fromEvent(socket, 'lobby');
    const disconnect = Rx.Observable.fromEvent(socket, 'disconnect');
    const prePlayData = Rx.Observable.fromEvent(socket, 'prePlayData');

    const joinLobbyStream = roomStream
        .filter(ev => validation.joinLobbyValidation(ev))
        .filter(ev => ev.room === 'lobby');

    const startChallangeStream = lobbyStream
        .filter(ev => ev.hasOwnProperty('challange') || ev.challange)
        .filter(ev => ev.joinNew);

    const joinChallangeStream = lobbyStream
        .filter(ev => ev.hasOwnProperty('challange') || ev.challange)
        .filter(ev => !ev.joinNew);

    const addCardStream = lobbyStream
        .filter(ev => typeof ev !== 'string')
        .filter(ev => validation.joinValidation(ev))
        .filter(ev => ev.add);

    const removeCardStream = lobbyStream
        .filter(ev => typeof ev !== 'string')
        .filter(ev => validation.joinValidation(ev))
        .filter(ev => !ev.add);

    const leaveLobby = lobbyStream
        .filter(ev => typeof ev !== 'string')
        .filter(ev => !ev.hasOwnProperty('leave') && ev.leave)
        .filter(ev => !ev.hasOwnProperty('fbId'));

    /*const prePlayDataAdd = prePlayData
        .filter(ev => ev.hasOwnProperty('add') && ev.add);

    const prePlayDataRemove = prePlayData
        .filter(ev => ev.hasOwnProperty('add') && !ev.add);*/

    const test = lobbyStream
        .filter(ev => validation.testValidation(ev));

    joinLobbyStream.subscribe((data) => {
        console.log('joinging lobby');
        socket.join(data.room);
        lobby.onLobbyJoin(data.fbId, removeFristTowCaracters(socket.id));
    }, (e) => {
        console.log('something went wrong: ', e);
    });

    addCardStream.subscribe((data) => {
        console.log('add card to lobby');
        lobby.onLobbyAddCard(data.card, removeFristTowCaracters(socket.id));
    }, (e) => {
        console.log('something went wrong: ', e);
    });

    removeCardStream.subscribe((data) => {
        console.log('remove card from lobby');
        lobby.onRemoveCard(data.card);
    }, (e) => {
        console.log('something went wrong: ', e);
    });

    leaveLobby.subscribe((data) => {
        console.log('leaving lobby');
        socket.leave('lobby');
        lobby.onLobbyLeave(removeFristTowCaracters(socket.id));
    }, (e) => {
        console.log('something went wrong: ', e);
    });

    startChallangeStream.subscribe((data) => {
        console.log('starting new game');
        challange.newGame(
            data.challangerCard._id,
            data.opponentCard._id,
            data.challangeUserFbId,
            socket
        ).then(roomId => {
            socket.leave('lobby');
            lobby.onLobbyLeave(removeFristTowCaracters(socket.id));
            socket.join(roomId);
            challange.sendGameInfo(roomId, socket, data.challangeUserFbId);
        })
        .catch(e => console.log('smothing went wrong', e));

    }, (e) => {
        console.log('something went wrong: ', e);
    });

    joinChallangeStream.subscribe((data) => {
        console.log('joining game');
        socket.leave('lobby');
        lobby.onLobbyLeave(removeFristTowCaracters(socket.id));
        socket.join(data.room);
        challange.sendGameInfo(data.room, socket);
    }, (e) => {
        console.log('something went wrong: ', e);
    });

    prePlayData.subscribe((data) => {
        const prop = Object.keys(socket.rooms)[1];
        challange.prePlayData(socket.rooms[prop].toString(), data, socket);
    }, (e) => {
        console.log('error');
    });

    test.subscribe((data) => {
        console.log('=======TEST======');
        console.log(data);
        console.log('=================');
    }, (e) => {
        console.log('something went wrong: ', e);
    });

    disconnect.subscribe((data) => {
        lobby.onLobbyLeave(removeFristTowCaracters(socket.id));
    }, (e) => {
        console.log('something went wrong: ', e);
    });
});
