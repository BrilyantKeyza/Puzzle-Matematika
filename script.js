let score = 0;
let stage = 1;
let questionNumber = 1;
let targetNumber = 0;
let timeLeft = 20;
let timerInterval = null;

// Skor minimum untuk melanjutkan ke tahap berikutnya
const minScores = [0, 80, 80, 70, 60]; // Indeks 0 tidak digunakan, mulai dari tahap 1

// Variabel untuk bagian ekspresi
let operand1 = null;
let operatorSelected = null;
let operand2 = null;

// Tampilkan modal peraturan setelah menekan tombol "Mulai" pada start-screen
document.getElementById('begin-game').addEventListener('click', function() {
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('rules-modal').style.display = "flex";
});

// Setelah pemain membaca peraturan dan menekan "Saya Mengerti"
document.getElementById('start-game').addEventListener('click', function() {
    if (document.getElementById('rules-modal').style.display !== "none") {
        document.getElementById('rules-modal').style.display = "none";
        document.getElementById('game-container').style.display = "block";
        startGame();
    }
});

// Tombol "Kembali" di modal peraturan
document.getElementById('back-btn').addEventListener('click', function() {
    document.getElementById('rules-modal').style.display = "none";
    document.getElementById('start-screen').style.display = "block";
});

function startGame() {
    score = 0;
    stage = 1;
    questionNumber = 1;
    updateUI();
    generateNumbers();
}

function generateNumbers() {
    // Reset ekspresi
    operand1 = null;
    operatorSelected = null;
    operand2 = null;
    updateExpressionDisplay();

    let numbersContainer = document.getElementById('numbers-container');
    numbersContainer.innerHTML = "";
    document.getElementById('message').innerText = "";

    if (timerInterval) clearInterval(timerInterval);

    // Menentukan operator yang diperbolehkan dan waktu per soal berdasarkan level
    let allowedOperators, timeLimit;
    if (stage <= 2) {
        allowedOperators = ['+', '-'];
        timeLimit = 20;
    } else {
        allowedOperators = ['+', '-', '*', '/'];
        timeLimit = 15;
    }
    timeLeft = timeLimit;
    document.getElementById('timer').innerText = timeLeft;
    startTimer();

    let difficulty = stage * 5;
    // Buat 4 bilangan acak
    let numbers = [];
    for (let i = 0; i < 4; i++) {
        numbers.push(Math.floor(Math.random() * difficulty) + 1);
    }
    // Acak urutannya
    numbers.sort(() => Math.random() - 0.5);

    // Gunakan dua bilangan pertama untuk menghitung target
    let numA = numbers[0];
    let numB = numbers[1];
    let randomOperator = allowedOperators[Math.floor(Math.random() * allowedOperators.length)];
    targetNumber = eval(numA + randomOperator + numB);
    document.getElementById('target-number').innerText = targetNumber;

    // Tampilkan keempat bilangan sebagai tombol
    numbers.forEach(num => {
        let numElement = document.createElement('span');
        numElement.innerText = num;
        numElement.classList.add('number');
        numElement.addEventListener('click', () => addToExpression(num));
        numbersContainer.appendChild(numElement);
    });

    // Tampilkan operator yang diperbolehkan sebagai tombol
    allowedOperators.forEach(op => {
        let opElement = document.createElement('span');
        opElement.innerText = op;
        opElement.classList.add('operator');
        opElement.addEventListener('click', () => addToExpression(op));
        numbersContainer.appendChild(opElement);
    });
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('message').innerText = "Waktu habis!";
            showTimeUpModal(); // Panggil fungsi untuk menampilkan popup
        }
    }, 1000);
}

function showTimeUpModal() {
    // Tampilkan modal waktu habis
    const timeUpModal = document.getElementById('time-up-modal');
    timeUpModal.style.display = "flex";
}

function addToExpression(value) {
    if (typeof value === "number") {
        if (operand1 === null) {
            operand1 = value;
        } else if (operand1 !== null && operatorSelected !== null && operand2 === null) {
            operand2 = value;
        }
    } else {
        if (operand1 !== null && operatorSelected === null) {
            operatorSelected = value;
        }
    }
    updateExpressionDisplay();
}

function updateExpressionDisplay() {
    document.getElementById('box1').innerText = operand1 !== null ? operand1 : "";
    document.getElementById('box2').innerText = operatorSelected !== null ? operatorSelected : "";
    document.getElementById('box3').innerText = operand2 !== null ? operand2 : "";
    if (operand1 !== null && operatorSelected !== null && operand2 !== null) {
        document.getElementById('box4').innerText = "=";
        try {
            let result = eval(operand1 + operatorSelected + operand2);
            document.getElementById('box5').innerText = result;
        } catch (e) {
            document.getElementById('box5').innerText = "Error";
        }
    } else {
        document.getElementById('box4').innerText = "";
        document.getElementById('box5').innerText = "";
    }
}

document.getElementById('clear').addEventListener('click', function() {
    operand1 = null;
    operatorSelected = null;
    operand2 = null;
    updateExpressionDisplay();
    document.getElementById('message').innerText = "";
});

document.getElementById('submit').addEventListener('click', function() {
    if (timerInterval) clearInterval(timerInterval);
    if (operand1 === null || operatorSelected === null || operand2 === null) {
        document.getElementById('message').innerText = "Lengkapi ekspresi!";
        return;
    }
    try {
        let result = eval(operand1 + operatorSelected + operand2);
        if (result === targetNumber) {
            score += 10;
            document.getElementById('message').innerText = "Jawaban benar!";
        } else {
            document.getElementById('message').innerText = "Jawaban salah!";
        }
        nextQuestion();
    } catch (e) {
        document.getElementById('message').innerText = "Ekspresi tidak valid!";
    }
});

function nextQuestion() {
    if (timerInterval) clearInterval(timerInterval);
    if (questionNumber < 10) {
        questionNumber++;
        updateUI();
        generateNumbers();
    } else {
        // Soal ke-10 selesai, cek apakah tahap masih bisa dilanjutkan
        checkStageAdvance();
    }
}

function checkStageAdvance() {
    if (score >= minScores[stage]) {
        // Jika skor memenuhi syarat, tampilkan modal untuk melanjutkan
        showContinueModal();
    } else {
        // Jika tidak memenuhi syarat, beri tahu pemain dan ulangi tahap
        document.getElementById('required-score').innerText = minScores[stage]; // Set skor yang dibutuhkan
        document.getElementById('not-eligible-modal').style.display = "flex"; // Tampilkan modal
    }
}


// Modal Tidak Memenuhi Syarat
document.getElementById('retry-stage-btn').addEventListener('click', function() {
    console.log("Tombol 'Ulangi Tahap Ini' ditekan."); // Debugging
    document.getElementById('not-eligible-modal').style.display = "none"; // Tutup modal
    resetStage(); // Ulangi tahap yang sama
});

function resetStage() {
    score = 0; // Reset skor ke 0
    questionNumber = 1; // Reset nomor soal
    updateUI(); // Perbarui tampilan UI
    generateNumbers(); // Mulai ulang soal di tahap yang sama
}

function updateUI() {
    document.getElementById('stage').innerText = stage;
    document.getElementById('question-number').innerText = questionNumber;
    document.getElementById('score').innerText = score;
}

function endGame() {
    document.getElementById('game-container').style.display = "none";
    document.getElementById('result-modal').style.display = "flex";
    document.getElementById('final-score').innerText = score;
}

function showContinueModal() { 
    document.getElementById('continue-modal').style.display = "flex";
}

document.getElementById('continue-btn').addEventListener('click', function() { 
    document.getElementById('continue-modal').style.display = "none"; 
    stage++; // Naik ke tahap berikutnya
    questionNumber = 1; // Reset nomor soal
    updateUI(); 
    generateNumbers(); 
});

document.getElementById('stop-btn').addEventListener('click', function() { 
    document.getElementById('continue-modal').style.display = "none"; 
    endGame();
});

document.getElementById('restart-game').addEventListener('click', function() {
    document.getElementById('result-modal').style.display = "none";
    document.getElementById('game-container').style.display = "block";
    startGame();
});

// Modal Waktu Habis
document.getElementById('restart-btn').addEventListener('click', function() {
    document.getElementById('time-up-modal').style.display = "none"; // Tutup modal
    resetGame(); // Fungsi untuk mengatur ulang game
});

// Modal Tidak Memenuhi Syarat
document.getElementById('retry-stage-btn').addEventListener('click', function() {
    document.getElementById('not-eligible-modal').style.display = "none"; // Tutup modal
    resetStage(); // Ulangi tahap yang sama
});

function resetGame() {
    score = 0;
    stage = 1;
    questionNumber = 1;
    timeLeft = 20; // Atur ulang waktu
    updateUI();
    generateNumbers(); // Mulai ulang soal
}

// Modal Waktu Habis
function showTimeUpModal() {
    // Tampilkan modal waktu habis
    const timeUpModal = document.getElementById('time-up-modal');
    timeUpModal.style.display = "flex";
}

document.getElementById('retry-stage-btn').addEventListener('click', function() {
    console.log("Tombol 'Ulangi Tahap Ini' ditekan."); // Debugging
    document.getElementById('not-eligible-modal').style.display = "none"; // Tutup modal
    resetStage(); // Ulangi tahap yang sama
});