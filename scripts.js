// Board module
const gameBoard = (() => {
    let board = [];

    const getBoard = () => board;

    // Fill a square with a token from the specified player
    const fillSquare = (player, square) => {
        board[square] = player;
    }

    // Check if a square is available
    const checkSquareAvailable = (square) => {
        if (board[square] === null) {
            return true;
        } else {
            return false;
        }
    }

    // Reset the board
    const reset = () => {
        board = [];
        for (let i = 0; i < 9; i++) {
            board.push(null);
        }
    }

    // Initialize the game board
    reset();

    return {
        getBoard,
        fillSquare,
        checkSquareAvailable,
        reset,
    }
})();

// Player factory function
const Player = (name, symbol) => {

    const getName = () => name;

    const makeMove = (square) => {
        if (gameBoard.checkSquareAvailable(square)) {
            gameBoard.fillSquare(symbol, square);
        }
    }

    return {
        getName,
        makeMove,
    }
}

// Display controller
const displayController = (() => {

    // Cache DOM
    const app = document.querySelector('#app');
    const boardDisplay = app.querySelector('#board');
    const messageDisplay = app.querySelector('#messages');
    const controlsDisplay = app.querySelector('#controls');

    // Render current gameboard state
    const render = () => {
        const board = gameBoard.getBoard();

        boardDisplay.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            // Check board sate to render
            if (board[i] != null) {
                square.textContent = board[i];
            }
            
            // Render to page
            boardDisplay.appendChild(square);
        }
    }

    // Display winner

    return {
        render
    }

})();

// Game module
const game = (() => {
    // Start new game
    const startGame = () => {
        gameBoard.reset()
        const board = gameBoard.getBoard();
        displayController.render(board);
    }

    // Handle current player (turns)
    
    // Check for a winner

    startGame();

    return {
        startGame,
    }
})()

