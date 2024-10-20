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

let game;
let bfs, dfs, idfs;

async function newGame(level) {
    const images = await loadImages();
    game = new Game(level, images);

    bfs = new BFS(game);
    dfs = new DFS(game);
    idfs = new IDFS(game);
}


function solve(algorithm) {
    game.isSolving = true
    switch (algorithm) {
        case 'bfs':
            bfs.solve();
            break;
        case 'dfs':
            dfs.solve();
            break;
        case 'idfs':
            idfs.solve();
            break;
    }
    game.isSolving = false
}

newGame(1);