const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

let player = { x: 140, y: 400, width: 20, height: 20, speed: 5 };
let ball = { x: player.x + 5, y: player.y - 10, radius: 5, speedY: 0, inMotion: false };
let rival = { x: 100, y: 100, width: 40, height: 20, speed: 2, direction: 1 };
let goal = { x: 90, y: 10, width: 140, height: 10 };
let goalkeeper = { x: 130, y: 20, width: 40, height: 10, speed: 2, direction: 1 };

function drawPlayer() {
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBall() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawRival() {
    ctx.fillStyle = "red";
    ctx.fillRect(rival.x, rival.y, rival.width, rival.height);
}

function drawGoal() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
}

function drawGoalkeeper() {
    ctx.fillStyle = "gray";
    ctx.fillRect(goalkeeper.x, goalkeeper.y, goalkeeper.width, goalkeeper.height);
}

function checkGoal() {
    if (ball.y - ball.radius <= goal.y + goal.height && ball.x >= goal.x && ball.x <= goal.x + goal.width) {
        if (ball.x >= goalkeeper.x && ball.x <= goalkeeper.x + goalkeeper.width) {
            alert("¡El portero atajó el tiro! Fallaste.");
        } else {
            alert("¡Gol!");
        }
        resetGame();
    }
}

function resetGame() {
    player.x = 140;
    player.y = 400;
    ball.x = player.x + 5;
    ball.y = player.y - 10;
    ball.inMotion = false;
    ball.speedY = 0;
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGoal();
    drawPlayer();
    drawBall();
    drawRival();
    drawGoalkeeper();

    // Movimiento del rival
    rival.x += rival.speed * rival.direction;
    if (rival.x <= 0 || rival.x + rival.width >= canvas.width) {
        rival.direction *= -1;
    }

    // Movimiento del portero
    goalkeeper.x += goalkeeper.speed * goalkeeper.direction;
    if (goalkeeper.x <= goal.x || goalkeeper.x + goalkeeper.width >= goal.x + goal.width) {
        goalkeeper.direction *= -1;
    }

    // Movimiento de la pelota
    if (ball.inMotion) {
        ball.y += ball.speedY;
        if (ball.y < 0) {
            ball.inMotion = false;
            resetGame();
        }
        checkGoal();
    } else {
        ball.x = player.x + 5;
        ball.y = player.y - 10;
    }

    requestAnimationFrame(update);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
    if (event.key === "ArrowRight" && player.x < canvas.width - player.width) player.x += player.speed;
    if (event.key === "ArrowUp" && player.y > 0) player.y -= player.speed;
    if (event.key === "ArrowDown" && player.y < canvas.height - player.height) player.y += player.speed;
    if (event.key === " " && !ball.inMotion) { // Disparo con espacio
        ball.inMotion = true;
        ball.speedY = -3;
    }
});

update();
