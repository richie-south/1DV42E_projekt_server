'use strict';
const myMock = require('./myMock.js'); // TODO: remove when not needed

const userDAL = require('./models/DAL/dbHelper.js');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const jwt    = require('jsonwebtoken');
const config = require('./config/config.js');


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

const lobby = require('./socketRoutes/lobby.js');

io.sockets.on('connection', function (socket) {

    socket.on('room', function(data) {
        switch (data.room) {
            case 'lobby':
                    lobby.onLobbyJoin(data);
                    socket.join(data.room);
                break;
            default:
                return;
        }
    });

    //socket.on('main', require('./socketRoutes/main.js'));

    //socket.on('lobby', );
});

/*const sendLobbyMessage = () => {
    io.sockets.in('lobby').emit();
};*/
