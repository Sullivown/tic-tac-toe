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

    const getPlayers = () => {
        return [player1, player2];
    }

    const getCurrentPlayer = () => currentPlayer;

    // Handle current player (turns)
    const switchPlayer = () => {
        if (currentPlayer == player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }

        displayController.displayMessage(`${currentPlayer.getInfo().name}'s Turn`);

        // If the current player is an AI, make a move
        if (currentPlayer.getInfo().type !== 'human') {
            console.log('SWITCHING TO AI MOVE')
            const aiMove = ai.getMove(currentPlayer.getInfo().type)
            makeMove(aiMove);
        }
    }

    const makeMove = (square) => {
        const board = gameBoard.getBoard();
        currentPlayer.makeMove(square);
        displayController.renderBoard();
        // Check for winner or tie
 
        if (checkBoard(board)) {
            if (checkBoard(board) == 'tie') {
                displayController.displayMessage(`It's a tie!`);
            } else {
                displayController.displayMessage(`${currentPlayer.getInfo().name} wins!`);
            }
            displayController.disableBoard();
            displayController.renderGameEnd();
        } else {
            switchPlayer();
        }
    }
    
    // Check for a winner
    const checkBoard = (board) => {
        let convertedBoard = [];
        let filledSquares = 0;

        for (let i = 0; i < board.length; i++) {
            if (board[i] == 'x') {
                convertedBoard.push(1);
                filledSquares += 1;
            } else if (board[i] == 'o') {
                convertedBoard.push(-1);
                filledSquares +=1;
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
        if (filledSquares == board.length) {
            return 'tie'
        }

        // If no winner and game is not over, return false
        return false;
    }

    return {
        startGame,
        getPlayers,
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
        app.innerHTML = '';

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
                    <option value="easy">Easy AI</option>
                    <option value="hard">Hard AI</option>
                    <option value="unbeatable">Unbeatable AI</option>
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
        const squares = document.querySelectorAll('.square');
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
        let players = {};

        if (event.target.id == "restart") {
            players = {
                player1: {
                    name: game.getPlayers()[0].getInfo().name,
                    type: game.getPlayers()[0].getInfo().type,
                },
                player2: {
                    name: game.getPlayers()[1].getInfo().name,
                    type: game.getPlayers()[1].getInfo().type,
                }
            }
        } else {
            const player1Div = app.querySelector('#player-1');
            const player2Div = app.querySelector('#player-2');
            players = {
                player1: {
                    name: player1Div.querySelector('input[name="player-name"]').value || 'Player 1',
                    type: player1Div.querySelector('select').value,
                },
                player2: {
                    name: player2Div.querySelector('input[name="player-name"]').value || 'Player 2',
                    type: player2Div.querySelector('select').value,
                },
            }
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
    const renderGameEnd = () => {
        const endDiv = document.createElement('div');
        endDiv.innerHTML = `
            <button id="restart">Play Again?</button>
            <button id="reset">Change Settings</button>
        `
        app.appendChild(endDiv);

        const restartButton = app.querySelector('#restart');
        const resetButton = app.querySelector('#reset');

        restartButton.addEventListener('click', handleStartClick);
        resetButton.addEventListener('click', renderTitleScreen)
    }

    renderTitleScreen();

    return {
        renderTitleScreen,
        renderBoard,
        disableBoard,
        displayMessage,
        renderGameEnd,
    }

})();

// AI module
const ai = (() => {
    // Which moves are made will differ based on the difficulty setting of the AI
    const getMove = (difficulty) => {
        if (difficulty == 'easy') {
            console.log('This is an easy AI!');
            // Return random move
            const randomNum = Math.floor(Math.random() * getAvailableMoves(gameBoard.getBoard()).length);
            return getAvailableMoves(gameBoard.getBoard())[randomNum];

        } else if (difficulty == 'hard') {
            console.log('This is a hard AI!');

        } else {
            console.log('This is an impossible AI!');
            return miniMax(gameBoard.getBoard(), game.getCurrentPlayer().getInfo().symbol);

        }
    }

    // Get available moves
    const getAvailableMoves = (board) => board.reduce((arr, space, currentIndex) => {
        if (space === null) {
            arr.push(currentIndex)
        }
        return arr;
    },[]);

    //The result function takes a board and an action as input, and should return a new board state, without modifying the original board.
    const result = (board, player, move) => {
        if (board[move] != null) {
            throw 'Action is not valid on given board!';
        }

        let boardCopy = [...board];
        boardCopy[move] = player;

        return boardCopy;
    }

    //The terminal function should accept a board as input, and return a boolean value indicating whether the game is over.
    /* If the game is over, either because someone has won the game or because all cells have been filled without anyone winning, the function should return True.
        Otherwise, the function should return False if the game is still in progress. */
    const terminal = (board) => {
 
        const terminalCheck = game.checkBoard(board);
        if (terminalCheck != false) {
            return true;
        } else {
            return false;
        }
    }

    //The utility function should accept a terminal board as input and output the utility of the board.
    const utility = (board) => {
        const utilityCheck = game.checkBoard(board);
        if (utilityCheck == 'x') {
            return 1;
        } else if (utilityCheck == 'o') {
            return -1;
        } else {
            return 0;
        }
    }

    //The minimax function takes a board and player as input, and returns an optimal move for the player to move on that board.

    const miniMax = (board, player) => {
        const maxValue = (board, player) => {

            let optimalAction = null;

            // If board is terminal return  
            if (terminal(board)) {
                return [utility(board), optimalAction];
            } else {
                // initialize variable to -100
                let v = -100;
                const availableMoves = getAvailableMoves(board);
                // cycle through each possible action
                for (let i = 0; i < availableMoves.length; i++) {

                    //# run minValue for all actions and see the highest score
                    const otherPlayer = (player == 'x') ? 'o' : 'x';
                    let best = minValue(result(board, player, availableMoves[i]), otherPlayer)[0];
                    // # if the best is higher than v, set the optimal action to that action
                    if (best > v) {
                        v = best;
                        optimalAction = availableMoves[i];
                    }
                }

                // return v and the optimal action
                return [v, optimalAction];
            }

        }

        const minValue = (board, player) => {

            let optimalAction = null;

            // If board is terminal return
            if (terminal(board)) {
                return [utility(board), optimalAction];
            } else {
                // initialize variable to 100
                let v = 100;
                const availableMoves = getAvailableMoves(board);
                // cycle through each possible action
                for (let i = 0; i < availableMoves.length; i++) {
                    //# run minValue for all actions and see the highest score
                    const otherPlayer = (player == 'x') ? 'o' : 'x';
                
                    let best = maxValue(result(board, player, availableMoves[i]), otherPlayer)[0];
                    // # if the best is higher than v, set the optimal action to that action
                    if (best < v) {
                        v = best;
                        optimalAction = availableMoves[i];
                    }
                }

                // return v and the optimal action
                return [v, optimalAction];
            }

        }

        // determine player and return optimal action
        console.log(player)
        if (player == 'x') {
            return maxValue(board, player)[1];
        } else {
            return minValue(board, player)[1];
        }
    }

    return {
        getMove,
        getAvailableMoves,
    }
})();