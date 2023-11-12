var io
var gameSocket
var gamesInSession = []

const initializeGame = (sio, socket) => {

    io = sio 
    gameSocket = socket 

    // pushes this socket to an array which stores all the active sockets.
    gamesInSession.push(gameSocket)

    // Run code when the client disconnects from their socket session. 
    gameSocket.on("disconnect", onDisconnect)

    gameSocket.on("declareWinner" , declareWinner)

    gameSocket.on("moveByClient" ,moveByClient)

    // Sends new move to the other socket session in the same room. 
    gameSocket.on("new move", newMove)

    // User creates new game room after clicking 'submit' on the frontend
    gameSocket.on("createNewGame", createNewGame)

    // User joins gameRoom after going to a URL with '/game/:gameId' 
    gameSocket.on("playerJoinsGame", playerJoinsGame)

    gameSocket.on('request username', requestUserName)
    
    gameSocket.on('recieved userName', recievedUserName)
    
}

function moveByClient(data){
    console.log("move by client",data);
    let room = io.sockets.adapter.rooms
    console.log(room);
    // this.to(data.gameId).emit("move",data.move)
    io.sockets.in(data.gameId).emit('move', data.move);
}

function declareWinner(data){
    console.log("winner is " , data.win);
    io.sockets.in(data.gameId).emit('declareWinner' ,data.win)
}

function createNewGame(gameId) {
    console.log("createNewGame " , gameId);
    // rooms[gameId] = [];
    io.sockets.adapter.rooms.set(gameId , new Set())
    
        
    io.emit('createNewGame', {gameId: gameId, mySocketId: this.id});
    
    // Join the Room and wait for the other player
    // this.join(gameId)
}


function playerJoinsGame(idData) {
    console.log("playerJoinsGame" , idData)
    /**
     * Joins the given socket to a session with it's gameId
    */
   
   // A reference to the player's Socket.IO socket object
   var sock = this
   
    //    var room = rooms[idData.gameId]

    let room = io.sockets.adapter.rooms.get(idData.gameId)
    // console.log(len);
    
    
    if (room === undefined) {
        this.emit('error' , "This game session does not exist." );
        return
    }

    let len = Object.keys(room).length

    if(room.has(sock.id)===true){
        return;
    }
    
    // console.log(io.sockets.adapter.rooms);
    // console.log(typeof io.sockets.adapter.rooms);
    // console.log(room);
    // console.log(typeof room);
    // console.log(room.size);
    // console.log(len);

    len = room.size;
    if (len===0) {
        // attach the socket id to the data object.
        idData.mySocketId = sock.id;

        idData.playerType = 'r';
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);
    
        sock.emit('setPlayer' , 'r');
        sock.join(idData.gameId);
        
        console.log("red joined")
        
        room.add(sock.id)
        // rooms[idData.gameId].push(sock.id);    
    } 
    else if(len===1){
        idData.mySocketId = sock.id;
        
        idData.playerType = 'b';
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);
        
        // Join the room
        sock.emit('setPlayer' , 'b')
        sock.join(idData.gameId);
        
        room.add(sock.id);
        console.log(room);

        io.in(idData.gameId).emit("startgame" , room); 
        
        console.log("black joined")
        // rooms[idData.gameId].push(sock.id);   
        // console.log(io.sockets.adapter.rooms.get(idData.gameId));
    }else {
        // Otherwise, send an error message back to the player.
        this.emit('error' , "There are already 2 people playing in this room." );
    }
}



function newMove(move) {
    /**
     * First, we need to get the room ID in which to send this message. 
     * Next, we actually send this message to everyone except the sender
     * in this room. 
     */
    
    const gameId = move.gameId 
    
    io.to(gameId).emit('opponent move', move);
}

function onDisconnect() {
    var i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);
}


function requestUserName(gameId) {
    io.to(gameId).emit('give userName', this.id);
}

function recievedUserName(data) {
    data.socketId = this.id
    io.to(data.gameId).emit('get Opponent UserName', data);
}

exports.initializeGame = initializeGame