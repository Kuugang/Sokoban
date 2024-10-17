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
        this.level = level;
        this.images = images;
        this.canvasWidth = gridSize * level.map[0].length;
        this.canvasHeight = gridSize * level.map.length;
        this.player = new Player(level.player.row, level.player.col, images.player, this);
        canvas.setAttribute('width', this.canvasWidth);
        canvas.setAttribute('height', this.canvasHeight);
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }
    handleKeyDown(event) {
        const moves = {
            'ArrowUp': [-1, 0],
            'ArrowDown': [1, 0],
            'ArrowLeft': [0, -1],
            'ArrowRight': [0, 1]
        };
        if (moves[event.key]) {
            this.player.move(...moves[event.key]);
            this.drawBoard();
        }
    }

    drawBoard() {
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (let row = 0; row < this.level.map.length; row++) {
            for (let col = 0; col < this.level.map[row].length; col++) {
                const cell = this.level.map[row][col];
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
        this.player.draw();
        if (this.isWin()) {
            alert('You win!')
        }
    }

    isWin() {
        let isWin = true;
        for (let row = 0; row < this.level.map.length; row++) {
            for (let col = 0; col < this.level.map[row].length; col++) {
                if (this.level.map[row][col] === 3) {
                    isWin = false;
                    break;
                }
            }
        }
        return isWin;
    }

    stateIsWin(state) {
        let isWin = true;
        for (let row = 0; row < state.map.length; row++) {
            for (let col = 0; col < state.map[row].length; col++) {
                if (state.map[row][col] === 3) {
                    isWin = false;
                    break;
                }
            }
        }
        return isWin;
    }
}

class Player {
    constructor(row, col, image, game) {
        this.row = row;
        this.col = col;
        this.image = image;
        this.game = game
    }

    move(rowDelta, colDelta) {
        const cell = this.game.level.map[this.row + rowDelta][this.col + colDelta];
        switch (cell) {
            case 0:
                this.image = this.game.images.player;
                this.updatePosition(rowDelta, colDelta);
                break;
            case 2:
            case 4:
                const nextCell = this.game.level.map[this.row + rowDelta * 2][this.col + colDelta * 2];
                if (nextCell === 0 || nextCell === 3) {
                    this.updatePosition(rowDelta, colDelta);

                    if (cell == 4) {
                        this.game.level.map[this.row][this.col] = 3;

                        this.image = this.game.images.playerOnGoal;
                    } else {
                        this.game.level.map[this.row][this.col] = 0;

                        this.image = this.game.images.player;
                    }

                    this.game.level.map[this.row + rowDelta * 1][this.col + colDelta * 1] = 2;

                    if (nextCell === 3) {
                        this.game.level.map[this.row + rowDelta * 1][this.col + colDelta * 1] = 4;
                    }
                }
                break;
            case 3:
                this.image = this.game.images.playerOnGoal;
                this.updatePosition(rowDelta, colDelta);
                break;
        }
    }

    updatePosition(rowDelta, colDelta) {
        this.row += rowDelta;
        this.col += colDelta;
    }

    draw() {
        context.drawImage(this.image, this.col * gridSize, this.row * gridSize, gridSize, gridSize);
    }
}

let game;

async function newGame(level){
    const images = await loadImages();
    game = new Game(JSON.parse(JSON.stringify(levels[level])), images);
    game.drawBoard();
    document.getElementById('level').innerText = `Level ${level}`;
}

function solveBFS(){
    let bfs = new BFS(game);

    setTimeout(() => {
        bfs.solveBFS();
    }, 0);
}

function solveDFS(){
    let bfs = new DFS(game);

    setTimeout(() => {
        bfs.solveDFS();
    }, 0);
}

newGame(1);