var socket;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);

    socket = io.connect();

    socket.on('mouse', (data) => {
        fill(0, 0, 255);
        noStroke();
        ellipse(data.x, data.y, 80, 80);
    });

    socket.on('clear', () => {
        background(0);
    });
}

function draw() {

}

function mouseDragged() {
    fill(0, 0, 255);
    noStroke();
    ellipse(mouseX, mouseY, 80, 80);

    sendMouse(mouseX, mouseY);
}

function sendMouse(xpos, ypos) {
    var data = {
        x: xpos,
        y: ypos
    };
    socket.emit('mouse', data);
}

function keyReleased() {
    if (key === 'd' || key === 'D') {
        background(0);
        socket.emit('clear');
    }
}