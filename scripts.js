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
    let turnNumber = 0;

    // Start new game
    const startGame = (players) => {
        gameBoard.reset()
        const board = gameBoard.getBoard();
        createPlayers(players);
    }

    // Create players and set current player
    const createPlayers = (players) => {
        player1 = Player(players.player1.name, players.player1.type, 'x');
        player2 = Player(players.player2.name, players.player2.type, 'o');
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

    const makeMove = (square) => {
        currentPlayer.makeMove(square);
        turnNumber += 1;
        displayController.renderBoard();
        // Check for winner or tie
        if (checkBoard()) {
            if (checkBoard() == 'tie') {
                displayController.displayMessage(`It's a tie!`);
            } else {
                displayController.displayMessage(`${currentPlayer.getInfo().name} wins!`);
            }
            displayController.disableBoard();
        } else {
            switchPlayer();
            displayController.displayMessage(`${currentPlayer.getInfo().name}'s Turn`);
        }
    }
    
    // Check for a winner
    const checkBoard = () => {
        const board = gameBoard.getBoard();
        const convertedBoard = [];

        for (let i = 0; i < board.length; i++) {
            if (board[i] == 'x') {
                convertedBoard.push(1);
            } else if (board[i] == 'o') {
                convertedBoard.push(-1);
            } else {
                convertedBoard.push(null);
            }
        }
        
        // Check horizontal squares
        // 012, 345, 678
        for (let i = 0; i < 7; i += 3) {
            let rowTotal = 0;
            for (let j = 0; j < 3; j++) {
                rowTotal += convertedBoard[i + j];
            }
            if (rowTotal === 3) {
                return 'x';
            } else if (rowTotal === -3) {
                return 'o';
            }
        }
        // Check vertical squares
        // 036, 147, 258
        for (let i = 0; i < 3; i++) {
            let columnTotal = 0;
            for (let j = 0; j < 7; j += 3) {
                columnTotal += convertedBoard[i + j];
            }
            if (columnTotal === 3) {
                return 'x';
            } else if (columnTotal === -3) {
                return 'o';
            }
        }

        // Check diagonal squares
        // 048, 246
        let diagonal1 = 0;
        for (let i = 0; i < 9; i += 4) {
            diagonal1 += convertedBoard[i];
        }
        if (diagonal1 === 3) {
            return 'x';
        } else if (diagonal1 === -3) {
            return 'o';
        }

        let diagonal2 = 0;
        for (let i = 2; i < 7; i += 2) {
            diagonal2 += convertedBoard[i];
        }
        if (diagonal2 === 3) {
            return 'x';
        } else if (diagonal2 === -3) {
            return 'o';
        }

        // Check if the board is full and therefore nobody has won
        if (turnNumber === gameBoard.getBoard().length) {
            return 'tie'
        }

        // If no winner and game is not over, return false
        return false;
    }

    return {
        startGame,
        getCurrentPlayer,
        switchPlayer,
        checkBoard,
        makeMove,
    }
})()

// Display controller
const displayController = (() => {

    // Cache DOM
    const app = document.querySelector('#app');

    // Render title screen
    const renderTitleScreen = () => {
        let titleScreen = document.createElement('div');
        titleScreen.className = 'title-screen';
        titleScreen.innerHTML = `
        <div class="player-select">
            <div id="player-1" class="player-select-item">
                <div>Player 1</div>
                <input name="player-name" type="text" placeholder="Player 1"></input>
                <select>
                    <option value="human">Human</option>
                    <option value="ai-easy">Easy AI</option>
                </select>
            </div>
            <div id="player-2" class="player-select-item">
                <div>Player 2</div>
                <input name="player-name" type="text" placeholder="Player 2"></input>
                <select>
                    <option value="human">Human</option>
                    <option value="ai-easy">Easy AI</option>
                </select>
            </div>
        </div>
        <div>
            <button id="start-game">Start Game</button>
        </div>
            `

        app.appendChild(titleScreen);

        app.querySelector('#start-game').addEventListener('click', handleStartClick);
    }

    // Render current gameboard state
    const renderBoard = () => {
        const squares = app.querySelectorAll('.square');
        if (squares) {
            // Remove event listeners
            squares.forEach(square => {
                square.removeEventListener('click', handleSquareClick);
            })
        }

        // Clear any current display elements
        app.innerHTML = '';

        let messageDisplay = document.createElement('div');
        messageDisplay.className = 'messages';

        let boardDisplay = document.createElement('div');
        boardDisplay.className = 'board';

        app.appendChild(messageDisplay);
        app.appendChild(boardDisplay);

        const board = gameBoard.getBoard();

        // Reset board display
        boardDisplay.innerHTML = '';

        // Render squares
        for (let i = 0; i < 9; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.square = i;
            
            // Check board state to render
            if (board[i] != null) {
                square.textContent = board[i];
            }
            
            // Add to page
            boardDisplay.appendChild(square);

            // Add event listeners on available squares
            if (board[i] === null) {
                square.addEventListener('click', handleSquareClick);
            }

        }
        // Display current player's turn
        displayMessage(`${game.getCurrentPlayer().getInfo().name}'s Turn`);
    }

    // Render win screen

    const disableBoard = () => {
        const squares = boardDisplay.querySelectorAll('.square');
        // Remove event listeners
        squares.forEach(square => {
            square.removeEventListener('click', handleSquareClick);
        })
    }

    // Handle clicking on a square
    const handleSquareClick = (event) => {
        game.makeMove(event.target.dataset.square);
    }

    // Handle clicking start game
    const handleStartClick = (event) => {
        const player1Div = app.querySelector('#player-1');
        const player2Div = app.querySelector('#player-2');
        const players = {
            player1: {
                name: player1Div.querySelector('input[name="player-name"]').value,
                type: player1Div.querySelector('select').value,
            },
            player2: {
                name: player2Div.querySelector('input[name="player-name"]').value,
                type: player2Div.querySelector('select').value,
            },
        }
        game.startGame(players);
        renderBoard();
    }

    // Display message
    const displayMessage = (message) => {
        let messageDisplay = app.querySelector('.messages');
        messageDisplay.textContent = message;
    }

    // Display winner

    renderTitleScreen();

    return {
        renderTitleScreen,
        renderBoard,
        disableBoard,
        displayMessage,
    }

})();

