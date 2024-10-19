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

        let map = JSON.parse(JSON.stringify(this.game.map));
        map = this.game.putBoxesOnMap(map, state.boxes);


        if (this.game.checkDeadlock && this.game.isDeadlock(map, state.boxes)) {
            return null;
        }

        const cell = map[playerRow + rowColMove.row][playerCol + rowColMove.col];

        const newPos = {
            row: playerRow + rowColMove.row,
            col: playerCol + rowColMove.col
        };

        switch (cell) {
            case 0: // FLOOR
            case 3: // GOAL
                return new State(newPos, state.boxes, state.moves + 1, state, direction);
            case 2: // BOX
            case 4: // BOX ON TOP OF GOAL
                const nextRow = newPos.row + rowColMove.row;
                const nextCol = newPos.col + rowColMove.col;
                const nextCell = map[nextRow][nextCol];

                if (nextCell === 0 || nextCell === 3) { // VALID MOVE FOR BOX
                    if (cell === 4) {
                        map[newPos.row][newPos.col] = 3;
                    } else {
                        map[newPos.row][newPos.col] = 0;
                    }
                    map[nextRow][nextCol] = (nextCell === 3) ? 4 : 2;
                    let { boxes } = this.game.findBoxesAndGoals(map)
                    return new State(newPos, boxes, state.moves + 1, state, direction);
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