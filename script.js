// ######### Variables

const main = document.querySelector("main");
const form = document.querySelector("#form-election");
const playerOneElection = document.getElementsByName("player-one");
const playerTwoElection = document.getElementsByName("player-two");
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

let playerOne = PlayerFactory("Player one");
let playerTwo = PlayerFactory("Player two");
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

// Check if a game is over
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

// ######### Objects

function PlayerFactory(name) {
    let choice = "";
    const setChoice = (x) => {
        choice = x;
    }
    const getChoice = () => choice;
    const getName = () => name;
    const play = (cell) => playTurn(choice, cell); 
    return {setChoice, getChoice, getName, play}
}

function GameFactory() {
    let turn = 0;
    const getTurn = () => turn;
    const updateTurn = () => turn++;
    const resetTurns = () => turn = 0;
    return {getTurn, updateTurn, resetTurns}
}

// ######### Events

form.addEventListener("submit", function(event) {
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
    // Check if both elections are different
    if (playerOne.getChoice() === playerTwo.getChoice()) {
        alert("Select different options for both players.");
        return;
    } else {
        form.classList.add("hidden");
    }
});

// Display a play
gridCells.forEach((cell) => {

    cell.addEventListener ("click", () => {
        if (game.getTurn() % 2 === 0) playerOne.play(cell);
        else playerTwo.play(cell);
    })
})

// Reset the game when press reset button
main.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-reset")) {
        gridCells.forEach((cell) => {
            cell.textContent = "";
        });
        game.resetTurns();
        const resultContainer = document.querySelector(".result-container");
        main.removeChild(resultContainer);
        form.classList.remove("hidden");
    }
});