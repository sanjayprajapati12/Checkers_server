const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const gameLogic = require('./game-logic')

const io = new Server(server , {
    cors: {
      origin: "https://chekerss.netlify.app"
    }
});


io.on('connection', client => {
    console.log('a user is connected ');
    gameLogic.initializeGame(io, client)
})



server.listen(4000, () => {
    console.log('listening on *:4000');
});


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

