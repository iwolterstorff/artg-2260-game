const PORT = process.env.PORT || 3000;

const FRAMERATE = 60;
const SHIP_SPEED = 5;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);


app.use(express.static(path.join(__dirname, "client")));

var users = [];

var sockets = {};

function gameLoop() {
    for (var i = 0; i < users.length; i++) {
        movePlayer(users[i]);

        sockets[users[i].id].emit('serverTellPlayerMove', {
            x: users[i].x,
            y: users[i].y,
            ang: users[i].lineAngle
        });

        sockets[users[i].id].emit('updateOtherPlayers', users.filter((thisUser) => {
            return thisUser !== users[i];
        }));
    }
}

function movePlayer(player) {
    if (player.dirKeys.left) {
        player.x -= SHIP_SPEED;
    }
    if (player.dirKeys.right) {
        player.x += SHIP_SPEED;
    }
    if (player.dirKeys.up) {
        player.y -= SHIP_SPEED;
    }
    if (player.dirKeys.down) {
        player.y += SHIP_SPEED;
    }


    // From lecture 04 !!!
    // player.x += player.vel.spd * Math.cos(player.vel.dir);
    // player.y += player.vel.spd * Math.sin(player.vel.dir);
    // console.log("X: " + player.x + " Y: " + player.y);
}

io.sockets.on('connection', (socket) => {
    console.log("Client connected: " + socket.id);

    sockets[socket.id] = socket;

    // Empty values for current player to start
    var currentPlayer = {
        id: socket.id,
        x: 0,
        y: 0,
        dirKeys: {
            left: false,
            right: false,
            up: false,
            down: false
        },
        lineAngle: 0,
        vel: new Velocity(0, 0)
    };

    users.push(currentPlayer);

    socket.on('movePlayer', (data) => {
        // Only update keys pressed if different than last values
        if (currentPlayer.dirKeys !== data.keys) {
            currentPlayer.dirKeys = data.keys;
        }
        if (currentPlayer.lineAngle !== data.angle) {
            currentPlayer.lineAngle = data.angle;
        }
    });

    socket.on('disconnect', () => {
        if (findIndex(users, currentPlayer.id) > -1)
            users.splice(findIndex(users, currentPlayer.id), 1);
        console.log("Client disconnected");
    });

    socket.on('mouse', (data) => {
        console.log("Received: 'mouse' " + data.x + " " + data.y);
        socket.broadcast.emit('mouse', data);
    });
    socket.on('clear', () => {
        socket.broadcast.emit('clear');
    });
});

setInterval(gameLoop, 1000 / FRAMERATE);

http.listen(PORT, () => {
    console.log(`Server started on ${ PORT }`);
});

// From https://github.com/huytd/agar.io-clone/blob/master/src/server/lib/util.js
function findIndex(arr, id) {
    var len = arr.length;

    while (len--) {
        if (arr[len].id === id) {
            return len;
        }
    }

    return -1;
}

class Velocity {
    // spd is units(pixels)/tick
    // dir is direction in radians
    constructor(spd, dir) {
        this.spd = spd;
        this.dir = dir;
    }
}