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
const Player = (name, type, symbol) => {
    const getInfo = () => { return {name, type, symbol} };

    const makeMove = (square) => {
        if (gameBoard.checkSquareAvailable(square)) {
            gameBoard.fillSquare(symbol, square);
            return true;
        } else {
            console.error('Square is already filled!');
            return false;
        }
    }

    return {
        getInfo,
        makeMove,
    }
}

// Game module
const game = (() => {
    let player1 = null;
    let player2 = null;
    let currentPlayer = null;

    // Start new game
    const startGame = () => {
        gameBoard.reset()
        const board = gameBoard.getBoard();
    }

    // Create players and set current player
    const createPlayers = () => {
        player1 = Player('Bob', 'human', 'x');
        player2 = Player('Tim', 'human', 'o');
        currentPlayer = player1;
    }

    const getCurrentPlayer = () => currentPlayer;


    // Handle current player (turns)
    const switchPlayer = () => {
        if (currentPlayer == player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
    }
    
    // Check for a winner

    startGame();
    createPlayers();

    return {
        startGame,
        getCurrentPlayer,
        switchPlayer,
    }
})()

// Display controller
const displayController = (() => {

    // Cache DOM
    const app = document.querySelector('#app');
    const boardDisplay = app.querySelector('#board');
    const messageDisplay = app.querySelector('#messages');
    const controlsDisplay = app.querySelector('#controls');
    const squares = boardDisplay.querySelectorAll('.square');

    // Render current gameboard state
    const render = () => {
        const board = gameBoard.getBoard();

        boardDisplay.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.id = `square-${i}`;
            
            // Check board state to render
            if (board[i] != null) {
                square.textContent = board[i];
            }
            
            // Render to page
            boardDisplay.appendChild(square);

            // Add event listeners on available squares
            if (board[i] === null) {
                square.addEventListener('click', () => game.getCurrentPlayer().makeMove(i));
                square.addEventListener('click', render);
                square.addEventListener('click', game.switchPlayer);
            }

        }
    }

    // Display winner

    render();

    return {
        render
    }

})();



