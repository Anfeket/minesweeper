import init, { Minefield } from './minesweeper/pkg/minesweeper.js';

async function main() {
    await init();
    let minefield = Minefield.new(whm()[0], whm()[1], whm()[2]);
    renderMinefield(minefield);
    let minefieldGenerated = true;
    let gameStarted = false;
    let timerId

    async function playSound(sound) {
        const audio = new Audio(sound);
        try {
            audio.load();
            audio.play();
        } catch (err) {
            console.log(err);
        }
    }
    
    function whm() {
        let width = document.getElementById("width").value;
        let height = document.getElementById("height").value;
        let mines = document.getElementById("mines").value;
        return [width, height, mines];
    }

    function reveal(x, y) {
        let changed = minefield.reveal(x, y);
        score();
        for (let i = 0; i < changed.length; i++) {
            if (changed[i] == false) {
                continue;
            }
            const [x, y] = minefield.index_to_xy(i);
            if (minefield.mine_at(x, y) == true) {
                lose();
            }
            const cellDiv = document.getElementById("cell-" + x + "-" + y);
            cellDiv.innerText = minefield.minemap_at(x, y);
            cellDiv.classList.add("revealed");
        }
    }

    function revealMinefield() {
        stopTimer();
        for (let col = 0; col < minefield.width(); col++) {
            for (let row = 0; row < minefield.height(); row++) {
                const cellDiv = document.getElementById("cell-" + col + "-" + row);
                if (minefield.flag_at(col, row)) {
                    if (!minefield.mine_at(col, row)) {
                        cellDiv.classList.add("failed");
                    } else {
                        cellDiv.classList.add("flag");
                    }
                    continue;
                }
                if (!minefield.visible_at(col, row) && !minefield.mine_at(col, row)) {
                    cellDiv.innerText = minefield.minemap_at(col, row);
                }
                if (minefield.mine_at(col, row)) {
                    cellDiv.classList.add("mine");
                } else {
                    cellDiv.classList.add("revealed");
                }
            }
        }

    }

    function renderMinefield() {
        const gameBoard = document.getElementById("minefield");
        gameBoard.innerHTML = "";
        for (let row = 0; row < minefield.height(); row++) {
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("row");
    
            for (let col = 0; col < minefield.width(); col++) {
                const cellDiv = document.createElement("div");
                cellDiv.classList.add("cell");
                cellDiv.id = "cell-" + col + "-" + row;
                rowDiv.appendChild(cellDiv);
            }
    
            gameBoard.appendChild(rowDiv);
        }
        function calcCellSize(minefield) {
            const gameBoard = document.getElementById("inner-content");
            let cellsize = gameBoard.offsetHeight / minefield.height();
            return cellsize;
        }
        document.documentElement.style.setProperty('--cell-size', calcCellSize(minefield) + "px");
    }

    function score() {
        if (minefield.turns() == 1) {
            clearScore();
            return;
        }
        function calcMaxLogs() {
            let maxLogs = document.getElementById("scorelog").offsetHeight / 20;
            return maxLogs;
        }
        let scoreDiv = document.getElementById("scoremeter");
        let score = minefield.engine.get_scores();
        scoreDiv.innerText = minefield.engine.score();
        let logDiv = document.getElementById("scorelog");
        let log = document.createElement("div");
        log.classList.add("scorelog-item");
        let logText = minefield.turns() - 1 + ": " + score[1] + " * " + score[2] + " - " + score[3] + " = " + score[0];
        log.innerText = logText;
        logDiv.prepend(log);
    }

    function clearScore() {
        let scoreDiv = document.getElementById("scoremeter");
        scoreDiv.innerText = "0";
        let logDiv = document.getElementById("scorelog");
        logDiv.innerHTML = "";
    }
    
    function startTimer() {
        gameStarted = true;
        let timer = 0;
        timerId = setInterval(function() {
            if (gameStarted) {
                timer += 0.1;
                document.getElementById("timer").innerText = timer.toFixed(1);
            }
        }, 100);
    }
    
    function stopTimer() {
        gameStarted = false;
        clearInterval(timerId);
    }
    
    function lose() {
        revealMinefield(minefield);
        stopTimer();
        minefieldGenerated = false;
        if (minefield.turns() == 0) {
            playSound("sounds/losestart.mp3");
        } else {
            playSound("sounds/lose.mp3");
        }
        return minefieldGenerated;
    }

    function gameLoop(x,y) {
        if (minefield.turns() == 0) {
            minefield = Minefield.new(whm()[0], whm()[1], whm()[2]);
            minefield.gen_loop(x, y);
            minefieldGenerated = true;
            renderMinefield(minefield);
            startTimer();
        }
        if (minefield.mine_at(x, y) == true) {
            lose();
            return;
        }
        reveal(x, y);
        if (minefield.is_finished()) {
            stopTimer();
            revealMinefield(minefield);
            alert("You won!");
            return;
        }
    }

    document.getElementById("minefield").addEventListener("click", function(event) {
        if (!minefieldGenerated) {
            return;
        }
        if (event.target.classList.contains("cell")) {
            if (event.target.classList.contains("flag")) {
                return;
            }
            let x = event.target.id.split("-")[1];
            let y = event.target.id.split("-")[2];
            gameLoop(x, y);
        }
    });

    document.getElementById("minefield").addEventListener("contextmenu", function(event) {
        if (!minefieldGenerated) {
            return;
        }
        event.preventDefault();
        if (event.target.classList.contains("cell")) {
            if (event.target.classList.contains("revealed")) {
                return;
            }
            let x = event.target.id.split("-")[1];
            let y = event.target.id.split("-")[2];
            minefield.flag(x, y);
            if (minefield.flag_at(x, y) == true) {
                event.target.classList.add("flag");
            }
            else {
                event.target.classList.remove("flag");
            }
        }
    });

    document.getElementById("reveal-minefield").addEventListener("click", function() {
        if (!minefieldGenerated) {
            return;
        }
        revealMinefield();
    });

    document.getElementById("restart").addEventListener("click", function() {
        stopTimer();
        minefield = Minefield.new(whm()[0], whm()[1], whm()[2]);
        renderMinefield(minefield);
        minefieldGenerated = true;
    });
}
main();

