// Make game board and fetch html board area
const gameBoard = new GameBoard();
const boardArea = document.getElementById("board");
const resetButton = document.getElementById("reset-button");

const nameButton = document.getElementById("name-button");
const nameDialog = document.getElementById("name-dialog");
const nameForm = document.getElementById("name-form");

const playerOneInput = document.getElementById("player-one-name");
const playerTwoInput = document.getElementById("player-two-name");

const cancelNameButton = document.getElementById("cancel-name-button");

resetButton.addEventListener("click", () => { gameBoard.reset(); });

// Open dialog
nameButton.addEventListener("click", () => {
    // Populate inputs with existing names
    playerOneInput.value = gameBoard.getPlayerOneName();
    playerTwoInput.value = gameBoard.getPlayerTwoName();

    nameDialog.showModal();
});

// Cancel changes
cancelNameButton.addEventListener("click", () => {
    nameDialog.close();
});

// Save changes
nameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const playerOneName = playerOneInput.value.trim();
    const playerTwoName = playerTwoInput.value.trim();

    // Prevent whitespace-only names
    if(!playerOneName || !playerTwoName) {
        if(!playerOneName) {
            playerOneInput.setCustomValidity("Please enter a name.");
            playerOneInput.reportValidity();
        } else {
            playerTwoInput.setCustomValidity("Please enter a name.");
            playerTwoInput.reportValidity();
        }
        return;
    }

    // Update GameBoard player names
    gameBoard.setPlayerOneName(playerOneName);
    gameBoard.setPlayerTwoName(playerTwoName);

    // Update displayed game information
    updateBoard();

    // Close dialog
    nameDialog.close();
});

// Clear custom validation when editing
playerOneInput.addEventListener("input", () => {
    playerOneInput.setCustomValidity("");
});

playerTwoInput.addEventListener("input", () => {
    playerTwoInput.setCustomValidity("");
});

function logToBoard(msg) {
    const log = document.getElementById("log");
    log.textContent = msg;
}

function updateBoard() {
    const board = gameBoard.getBoard();
    for(let i = 0; i < 9; i++) {
        const cell = boardArea.querySelector("#c"+i);
        cell.textContent = board.at(i);
        cell.style.color = "black";
    }
    
    if(gameBoard.getWinner() === 'X' || gameBoard.getWinner() === 'O') {
        gameBoard.getWinningCells().forEach((item) => {
            const wCell = boardArea.querySelector("#c"+item);
            console.log(wCell);
            wCell.style.color = "green";
        });
        
        logToBoard(gameBoard.getCurrentPlayerName()+" Won!");
    }else if(gameBoard.getWinner() === 'D') {   
        logToBoard("It's a draw...");
    } else {
        logToBoard(gameBoard.getCurrentPlayerName() + "'s turn.");
    }
}

function Player(name, mark) {
    this.mark = mark;
    this.name = name;
}

function GameBoard() {
    const board = new Array(9).fill(' ');
    let winningCells = [];
    let winner = ' ';

    // There are always exactly two players, so define an array with two player objects
    const players = [ 
        new Player("Player One", 'X'), 
        new Player("Player Two", 'O') 
    ];

    let currentPlayer = 0;
    let gameRunning = false;

    // Game controls
    this.startGame = function() {
        gameRunning = true;
    }
    
    this.stopGame = function() {
        gameRunning = false;
    }

    this.reset = function() {
        board.fill(' ');
        currentPlayer = 0;
        gameRunning = true;
        winner = ' ';
        winningCells = [];
        updateBoard();
        console.log("The game has been reset.");
        
        logToBoard(gameBoard.getCurrentPlayerName()+"'s turn.");
    }

    // Advance the current player
    function advancePlayer() {
        currentPlayer = (currentPlayer + 1) % 2;
    }

    // Check for a winner
    function checkForWinner() {
        // Check rows
        if(board[0] !== ' ' && board[0] === board[1] && board[1] === board[2]) {
            winningCells = [0, 1, 2];
            return board[0];
        }
        if(board[3] !== ' ' && board[3] === board[4] && board[4] === board[5]) {
            winningCells = [3, 4, 5];
            return board[3];
        }
        if(board[6] !== ' ' && board[6] === board[7] && board[7] === board[8]) {
            winningCells = [6, 7, 8];
            return board[6];
        }

        // Check cols
        if(board[0] !== ' ' && board[0] === board[3] && board[3] === board[6]) {
            winningCells = [0, 3, 6];
            return board[0];
        }
        if(board[1] !== ' ' && board[1] === board[4] && board[4] === board[7]) {
            winningCells = [1, 4, 7];
            return board[1];
        }
        if(board[2] !== ' ' && board[2] === board[5] && board[5] === board[8]) {
            winningCells = [2, 5, 8];
            return board[2];
        }

        // Check diags
        if(board[0] !== ' ' && board[0] === board[4] && board[4] === board[8]) {
            winningCells = [0, 4, 8];
            return board[0];
        }
        if(board[2] !== ' ' && board[2] === board[4] && board[4] === board[6]) {
            winningCells = [2, 4, 6];
            return board[2];
        }

        // Check for draw
        if(board.filter(cell => cell === ' ').length === 0) {
            return 'D';
        }

        // No winner
        return ' ';
    }

    /* Make a play with the current player's mark */
    this.makePlay = function(index) {
        if(!gameRunning) {
            console.log("Attempted to make a move while the game is not active");
            return;
        }

        console.log(
            "%s is attempting to make a play at [ %d ]", 
            players.at(currentPlayer).name, index
        );

        // Validate row
        if(!Number.isInteger(index) || index < 0 || index > 8) {
            console.log("ERROR: %d is an invalid index!", index);
            return;
        }

        // Check to see if this is a valid move
        if(board[index] !== ' ') {
            console.log("The board at [ %d ] is not empty!", index);
            return;
        }
        
        // Play move
        board[index] = players[currentPlayer].mark;

        console.log(
            "%s made a play at [ %d ]", 
            players[currentPlayer].name, index
        );

        // Check for a winner
        winner = checkForWinner();
        if(winner !== ' ') {
            // Winner is 'D'
            if(winner === 'D') {
                // Declare draw
                console.log("Draw!");
            }else {
                // Declare winner
                console.log("%s has won the game!", players.at(currentPlayer).name);
            }

            // Stop the game on win or draw
            gameRunning = false;
        }else {
            // No winner, advance the player
            advancePlayer();
            logToBoard(gameBoard.getCurrentPlayerName()+"'s turn.");
        }
        
        updateBoard();
    }

    /* Log current board state to console */
    this.logBoard = function() {
        console.log(
            "Current Board State:\n\n" +
            " " + board[0]+" | "+board[1]+" | "+ board[2] + "\n" +
            "---+---+---\n"+
            " " + board[3]+" | "+board[4]+" | "+ board[5] + "\n" +
            "---+---+---\n"+
            " " + board[6]+" | "+board[7]+" | "+ board[8] + "\n\n" +
            players.at(0).name + ": " + players.at(0).mark + "\n"+
            players.at(1).name + ": " + players.at(1).mark
        );
    }

    /* Get a copy of the board state */
    this.getBoard = function() {
        return [...board];
    }

    this.getWinningCells = function() {
        return [...winningCells];
    }

    this.getWinner = function() {
        return winner;
    }

    /* Player Names */
    this.setPlayerOneName = function(newName) { players.at(0).name = newName; }
    this.getPlayerOneName = function() { return players.at(0).name; }
    this.setPlayerTwoName = function(newName) { players.at(1).name = newName; }
    this.getPlayerTwoName = function() { return players.at(1).name; }
    this.getCurrentPlayerName = function() { return players.at(currentPlayer).name; }
}

gameBoard.startGame();
logToBoard(gameBoard.getCurrentPlayerName()+"'s turn.");

// Fill in board cells
for(let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.classList.add("cell");
    cell.id = "c" + i;
    cell.setAttribute("aria-label", "Cell " + (i + 1));

    cell.addEventListener('click', () => {
        gameBoard.makePlay(i);
    });

    boardArea.appendChild(cell);
}