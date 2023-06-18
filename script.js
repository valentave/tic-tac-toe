// ######### Variables

const main = document.querySelector("main");
const form = document.querySelector("#form-election");
const playerOneElection = document.getElementsByName("player-one");
const playerTwoElection = document.getElementsByName("player-two");
const playerOneManage = document.getElementsByName("manage-one");
const playerTwoManage = document.getElementsByName("manage-two");
const gridCells = document.querySelectorAll(".grid-cell");
const gameBoard = Array.from(gridCells).reduce((acc, cell, index) => {
    const rowIndex = Math.floor(index / 3);
    const colIndex = index % 3;
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex][colIndex] = cell;
    return acc;
}, []);

let playerOne = PlayerFactory();
let playerTwo = PlayerFactory();
let game = GameFactory();

// ######### Functions

// Check if there is a winner
function isThereAWinner() {
    const winningCombos = [
        // Rows
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // Columns
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // Diagonals
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
    ];

    for (const combo of winningCombos) {
        const [row1, col1] = combo[0];
        const [row2, col2] = combo[1];
        const [row3, col3] = combo[2];
    
        if (
            gameBoard[row1][col1].textContent !== "" &&
            gameBoard[row1][col1].textContent === gameBoard[row2][col2].textContent &&
            gameBoard[row1][col1].textContent === gameBoard[row3][col3].textContent
        ) {
        // There is a winner
        return true;
        }
    }
    return false;
}

// Check if the game is over
function isGameOver() {
    let result = -1;
    if (game.getTurn() === 9) result = 0;
    if (isThereAWinner()) result = 1;
    return result
}

// Check that a cell is free and make the move
function isCellFree(cell) {
    return cell.textContent === "";
}

// Finish the game
function finishGame(winner){
    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result-container");
    switch (winner) {
        case "tie":
            resultContainer.innerHTML = `
                <p class="result">It's a tie!</p>
                <button class="btn-reset">Reset</button>
            `
            main.appendChild(resultContainer);
            break;
        default:
            resultContainer.innerHTML = `
                <p class="result">The winner is ${winner}!</p>
                <button class="btn-reset">Reset</button>
            `
            main.appendChild(resultContainer);
            break;
    }

}

// Play a turn
function playTurn(choice, cell) {
    if (isCellFree(cell)) {
        cell.textContent = choice;
        game.updateTurn();
        switch (isGameOver()) {
            case 0: // it's a tie
                finishGame("tie");
                break;
            case 1: // there is winner
                let winner = "";
                if (playerOne.getChoice() === choice) winner = "Player one";
                else winner = "Player two";
                finishGame(winner);
                break;
            case -1: // the game didn't end
                break;
        }
    }
}

// Función para que la CPU juegue su turno
function playCPUTurn(player) {
    const availableCells = Array.from(gridCells).filter(isCellFree);
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const randomCell = availableCells[randomIndex];
    player.play(randomCell);
}
  
// Función para verificar si es el turno de la CPU
function isCPUTurn() {
    if (playerOne.getName() === "CPU"){
        return game.getTurn() % 2 === 0 && !isGameOver()
    }
    if (playerTwo.getName() !== "CPU"){
        return game.getTurn() % 2 !== 0 && !isGameOver();
    }
    return false
}


// ######### Objects

function PlayerFactory() {
    let choice = "";
    let name = "";
    const setName = (userName) => name = userName;
    const setChoice = (option) => choice = option;
    const getChoice = () => choice;
    const getName = () => name;
    const play = (cell) => playTurn(choice, cell); 
    return {setName, setChoice, getChoice, getName, play}
}

function GameFactory() {
    let turn = 0;
    const getTurn = () => turn;
    const updateTurn = () => turn++;
    const resetTurns = () => turn = 0;
    return {getTurn, updateTurn, resetTurns}
}

// ######### Events

form.addEventListener("submit", function (event) {
    event.preventDefault();
    // Set election for player one
    for (let i = 0; i < playerOneElection.length; i++) {
        if (playerOneElection[i].checked) {
            playerOne.setChoice(playerOneElection[i].classList.value);
            break;
        }
    }
    // Set election for player two
    for (let i = 0; i < playerTwoElection.length; i++) {
        if (playerTwoElection[i].checked) {
            playerTwo.setChoice(playerTwoElection[i].classList.value);
            break;
        }
    }
    // Set player or CPU in player one
    for (let i = 0; i < playerOneManage.length; i++) {
        if (playerOneManage[i].checked) {
            playerOne.setName(playerOneManage[i].classList.value);
            break;
        }
    }
    // Set player or CPU in player two
    for (let i = 0; i < playerTwoManage.length; i++) {
        if (playerTwoManage[i].checked) {
            playerTwo.setName(playerTwoManage[i].classList.value);
            break;
        }
    }

    // Check if both elections are different
    if (playerOne.getChoice() === playerTwo.getChoice()) {
        alert("Select different options for both players.");
        return;
    } else if (playerOne.getName() === playerTwo.getName() &&
        playerOne.getName() === "CPU"){
        alert("Both players cannot be CPU.");
        return;
    } else {
        form.classList.add("hidden");
    }

    // If the first turn should be CPU's, play CPU's turn
    if (playerOne.getName() === "CPU" && playerTwo.getName() !== "CPU") {
        playCPUTurn(playerOne);
    } 
    // Start the game
    playGame();
  });


// Play the Tic Tac Toe game
function playGame() {
    // Display a play
    gridCells.forEach((cell) => {
      cell.addEventListener("click", () => {
        if (playerOne.getName() === "Player" && !isCPUTurn() && game.getTurn() % 2 === 0) {
            playerOne.play(cell);
            if (isGameOver() === -1 && playerTwo.getName() === "CPU") {
                playCPUTurn(playerTwo);
            }
        }
        if (playerTwo.getName() === "Player" && !isCPUTurn() && game.getTurn() % 2 !== 0) {
            playerTwo.play(cell);
            if (isGameOver() === -1 && playerOne.getName() === "CPU") {
                playCPUTurn(playerOne);
            }
        }
      });
    });
      // Reset the game when the reset button is pressed
      main.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-reset")) {
            location.reload();
        }
    });
}