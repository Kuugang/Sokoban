class Player {
    constructor(game) {
        this.row = game.state.playerPosition.row;
        this.col = game.state.playerPosition.col;
        this.image = game.images.player;
        this.game = game
    }

    move(state, direction) {
        let map = JSON.parse(JSON.stringify(this.game.map));
        map = this.game.putBoxesOnMap(map, state.boxes);

        if (this.game.checkDeadlock && this.game.isDeadlock(map, state.boxes)) {
            if(this.game.isSolving == false)alert("Deadlock!")
            return null;
        }

        let rowColMove = this.game.getRowColMove(direction);
        // up = -1, 0
        // down = 1, 0
        // left = 0, -1 
        // right = 0, 1

        const playerRow = state.playerPosition.row;
        const playerCol = state.playerPosition.col;

        const positionDelta = {
            row: playerRow + rowColMove.row,
            col: playerCol + rowColMove.col
        };

        const cell = map[positionDelta.row][positionDelta.col];

        // 0 = FLOOR 
        // 1 = WALL
        // 2 = BOX
        // 3 = GOAL
        // 4 = BOX ON TOP OF GOAL
        switch (cell) {
            case 0: // FLOOR
            case 3: // GOAL
                return new State(positionDelta, state.boxes, state.moves + 1, state, direction);
            case 2: // BOX
            case 4: // BOX ON TOP OF GOAL
                const nextRow = positionDelta.row + rowColMove.row;
                const nextCol = positionDelta.col + rowColMove.col;
                const nextCell = map[nextRow][nextCol];

                if (nextCell === 0 || nextCell === 3) { // VALID MOVE FOR BOX
                    map[nextRow][nextCol] = (nextCell === 3) ? 4 : 2;
                    map[positionDelta.row][positionDelta.col] = (cell === 4) ? 3 : 0;
                    let { boxes } = this.game.findBoxesAndGoals(map)
                    return new State(positionDelta, boxes, state.moves + 1, state, direction);
                }
                return null
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