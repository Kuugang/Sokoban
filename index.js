const canvas = document.getElementById('gridCanvas');
const context = canvas.getContext('2d');

const gridSize = 50;

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    });
}

async function loadImages() {
    const images = {
        floor: await loadImage("images/floor.png"),
        wall: await loadImage("images/wall.png"),
        box: await loadImage("images/box.png"),
        goal: await loadImage("images/goal.png"),
        player: await loadImage("images/keeper.png"),
        playerOnGoal: await loadImage("images/keeper_on_goal.png"),
        boxOnGoal: await loadImage("images/box_on_goal.png"),
    };
    return images;
}

class Game {
    constructor(level, images) {
        this.images = images
        this.initLevel(level);
        this.initEventListeners()
    }

    initLevel(level){
        this.level = level
        this.stage = levels[level]
        this.map = this.stage.map

        this.state = new State(
            { row: this.stage.player.row, col: this.stage.player.col },
            this.map.map(row => row.slice()),
            0
        )
        this.player = new Player(this);
        this.initCanvas(level);
    }

    initCanvas(level){
        this.canvasWidth = gridSize * this.map[0].length;
        this.canvasHeight = gridSize * this.map.length;
        canvas.setAttribute('width', this.canvasWidth);
        canvas.setAttribute('height', this.canvasHeight);
        document.getElementById('level').innerText = `Level ${level}`;
        this.drawBoard()
    }

    initEventListeners() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    handleKeyDown(event) {
        const moves = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right' 
        };

        if (moves[event.key]) {
            let newState = this.player.move(this.state, moves[event.key]);
            if(newState){
                this.movePlayer(newState);
            }
        }
        if(event.key === 'u')this.undo()
        if(event.key === ' '){
            this.initLevel(this.level)
        }
    }

    movePlayer(newState){
        this.state = newState
        this.player.updatePosition(newState.playerPosition)
        this.drawBoard();
    }

    undo(){
        if(this.state.parent){
            this.state = this.state.parent;
            this.player.row = this.state.playerPosition.row
            this.player.col = this.state.playerPosition.col
            this.drawBoard()
        }
    }
    
    getRowColMove(direction) {
        switch (direction) {
            case "left":
                return { row: 0, col: -1 };
            case "right":
                return { row: 0, col: 1 };
            case "up":
                return { row: -1, col: 0 };
            case "down":
                return { row: 1, col: 0 };
        }
    }

    validateMoves(direction, state){
        let possible_cells = [0, 2, 3, 4];

        let move = this.getRowColMove(direction);

        let cell = state.map[state.playerPosition.row + move.row][state.playerPosition.col + move.col];
        if(!possible_cells.includes(cell))return false

        switch (cell) {
            case 0:
            case 3:
                return true;
            case 2:
            case 4:
                const nextRow = state.playerPosition.row + move.row * 2;
                const nextCol = state.playerPosition.col + move.col * 2;
                const nextCell = state.map[nextRow][nextCol];
                if (nextCell === 0 || nextCell === 3) { // Valid move for box
                    return true
                }
            default:
                return false;
        }
    }

    getPossibleDirections(state) {
        let moves = ['up', 'down', 'left', 'right']

        for (let i = moves.length - 1; i >= 0; i--) {
            if (!this.validateMoves(moves[i], state)) {
                moves.splice(i, 1);
            }
        }
        return moves;
    }
        
    drawBoard() {
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (let row = 0; row < this.state.map.length; row++) {
            for (let col = 0; col < this.state.map[row].length; col++) {
                const cell = this.state.map[row][col];
                switch (cell) {
                    case 0:
                        context.drawImage(this.images.floor, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                    case 1:
                        context.drawImage(this.images.wall, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                    case 2:
                        context.drawImage(this.images.box, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                    case 3:
                        context.drawImage(this.images.goal, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                    case 4:
                        context.drawImage(this.images.boxOnGoal, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                }
            }
        }
        this.player.image = this.state.map[this.state.playerPosition.row][this.state.playerPosition.col] == 3 ? this.images.playerOnGoal : this.images.player
        this.player.draw();
        if (this.stateIsWin(this.state)) {
            alert('You win!')
        }
    }

    stateIsWin(state) {
        for (let row = 0; row < state.map.length; row++) {
            for (let col = 0; col < state.map[row].length; col++) {
                if (state.map[row][col] === 3) {
                    return false
                }
            }
        }
        return true;
    }
}

class Player {
    constructor(game) {
        this.row = game.state.playerPosition.row;
        this.col = game.state.playerPosition.col;
        this.image = game.images.player;
        this.game = game
    }

    move(state, direction) {
        let rowColMove = this.game.getRowColMove(direction);
        const playerRow = state.playerPosition.row;
        const playerCol = state.playerPosition.col;

        const cell = state.map[playerRow + rowColMove.row][playerCol + rowColMove.col];

        const newPos = { 
            row: playerRow + rowColMove.row, 
            col: playerCol + rowColMove.col 
        };

        switch (cell) {
            case 0: // FLOOR
            case 3: // GOAL
                return new State(newPos, state.map, state.moves + 1, state, direction);
            case 2: // BOX
            case 4: // BOX ON TOP OF GOAL
                const nextRow = newPos.row + rowColMove.row;
                const nextCol = newPos.col + rowColMove.col;
                const nextCell = state.map[nextRow][nextCol];

                if (nextCell === 0 || nextCell === 3) { // VALID MOVE FOR BOX
                    let map = state.map.map(row => row.slice());
                    if (cell === 4) {
                        map[newPos.row][newPos.col] = 3;
                    } else {
                        map[newPos.row][newPos.col] = 0;
                    }
                    map[nextRow][nextCol] = (nextCell === 3) ? 4 : 2; 
                    return new State(newPos, map, state.moves + 1, state, direction);
                }
                break;
            default:
                return null;
        }
    }

    updatePosition(position) {
        this.row = position.row;
        this.col = position.col;
    }

    draw() {
        context.drawImage(this.image, this.col * gridSize, this.row * gridSize, gridSize, gridSize);
    }
}

let game;
let bfs, dfs, idfs;

async function newGame(level){
    const images = await loadImages();
    game = new Game(level, images);
    
    bfs = new BFS(game);
    dfs = new DFS(game);
    idfs = new IDFS(game);
}

function solveBFS(){
    setTimeout(() => {
        bfs.solve();
    }, 0);
}

function solveDFS(){
    setTimeout(() => {
        dfs.solve();
    }, 0);
}

function solveIDFS(){
    setTimeout(() => {
        idfs.solve();
    }, 0);
}

newGame(1);
