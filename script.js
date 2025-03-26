// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDUFC-C7hAM5KX44AJ3LODSPGlX1ZEiTsQ",
    authDomain: "juegofutbolito-8e5b8.firebaseapp.com",
    projectId: "juegofutbolito-8e5b8",
    storageBucket: "juegofutbolito-8e5b8.appspot.com",
    messagingSenderId: "1054971179659",
    appId: "1:1054971179659:web:5aedf0109a067451fcda8e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos de la UI
const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const scoreTable = document.getElementById("scoreTable");
const restartBtn = document.getElementById("restartBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 500;

let ball = { x: 160, y: 450, radius: 10, speed: 5, dx: 0, dy: 0 };
let goalie = { x: 100, y: 50, width: 80, height: 15, dx: 2 };
let score = 0;
let timeLeft = 30;
let gameInterval;

// Iniciar sesión
loginBtn.addEventListener("click", async () => {
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
    }
});

// Registrarse
registerBtn.addEventListener("click", async () => {
    try {
        await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        alert("Registro exitoso, ahora inicia sesión");
    } catch (error) {
        alert("Error al registrarse: " + error.message);
    }
});

// Cerrar sesión
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});

// Monitorear estado de autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = "none";
        gameScreen.style.display = "block";
        listenForScores();
        startGame();
    } else {
        loginScreen.style.display = "block";
        gameScreen.style.display = "none";
        clearInterval(gameInterval);
    }
});

// Dibujar elementos en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(80, 10, 160, 10);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.fillRect(goalie.x, goalie.y, goalie.width, goalie.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Puntos: ${score}`, 10, 30);
    ctx.fillText(`Tiempo: ${timeLeft}s`, 200, 30);
}

// Actualizar juego
function update() {
    goalie.x += goalie.dx;
    if (goalie.x <= 0 || goalie.x + goalie.width >= canvas.width) {
        goalie.dx *= -1;
    }
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    if (ball.y - ball.radius <= 10 && ball.x >= 80 && ball.x <= 240) {
        score++;
        resetBall();
    }
    if (
        ball.x + ball.radius > goalie.x &&
        ball.x - ball.radius < goalie.x + goalie.width &&
        ball.y - ball.radius < goalie.y + goalie.height
    ) {
        endGame();
    }
}

canvas.addEventListener("touchstart", () => {
    ball.dy = -ball.speed;
});

canvas.addEventListener("click", () => {
    ball.dy = -ball.speed;
});



function resetBall() {
    ball.x = 160;
    ball.y = 450;
    ball.dx = 0;
    ball.dy = 0;
}

function startTimer() {
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function startGame() {
    timeLeft = 30;
    score = 0;
    resetBall();
    startTimer();
    restartBtn.style.display = "none";
    gameInterval = setInterval(() => {
        draw();
        update();
    }, 1000 / 60);
}

function endGame() {
    clearInterval(gameInterval);
    alert("¡Perdiste! Puntos: " + score);
    addDoc(collection(db, "puntuaciones"), { usuario: auth.currentUser.email, puntuacion: score });
    restartBtn.style.display = "block";
}

// Escuchar puntuaciones y ordenarlas de mayor a menor
function listenForScores() {
    const q = query(collection(db, "puntuaciones"), orderBy("puntuacion", "desc"));
    onSnapshot(q, (snapshot) => {
        scoreTable.innerHTML = "";
        snapshot.forEach((doc) => {
            const { usuario, puntuacion } = doc.data();
            scoreTable.innerHTML += `<tr><td>${usuario}</td><td>${puntuacion}</td></tr>`;
        });
    });
}

restartBtn.addEventListener("click", startGame);