class BFS {
    constructor(game) {
        this.game = game;
    }
    solveBFS() {
        console.log("Solving...")
        let queue = [];
        let visited = new Set();

        let initialState = new State(
            { row: this.game.player.row, col: this.game.player.col },
            this.game.level.map.map(row => row.slice()),
            0
        );

        queue.push(initialState);
        visited.add(initialState.getStateHash());

        while (queue.length > 0) {
            let currentState = queue.shift();

            console.log(currentState)

            if (this.game.stateIsWin(currentState)) {
                alert(`Solved in ${currentState.moves} moves!`);
                console.log(currentState)

                let moves = [];
                while (currentState.parent != null) {
                    moves.push(currentState.direction);
                    currentState = currentState.parent;
                }

                moves.reverse();
                // moves.forEach(move => {
                //     console.log(move)
                // })

                let index = 0;
                const intervalId = setInterval(() => {
                    if (index < moves.length) {
                        this.game.player.move(this.getRowColMove(moves[index]).row, this.getRowColMove(moves[index]).col);
                        this.game.drawBoard();
                        index++;
                    } else {
                        clearInterval(intervalId);
                    }
                }, 50);

                return;
            }

            let possibleDirections = this.getPossibleDirections();
            for (let i = 0; i < possibleDirections.length; i++) {
                let direction = possibleDirections[i];

                let newState = this.makeMove(currentState, { rowDelta: direction.row, colDelta: direction.col }, this.getDirectionState(direction));

                if (newState != null && !visited.has(newState.getStateHash())) {
                    // queue.push(new State(newState.playerPosition, newState.map, currentState.moves + 1, currentState, direction));
                    queue.push(newState);
                    visited.add(newState.getStateHash());
                }
            }
        }
        alert("No solution found.");
    }

    getPossibleDirections() {
        return [
            { row: 0, col: -1 },
            { row: 0, col: 1 },
            { row: -1, col: 0 },
            { row: 1, col: 0 }
        ];
    }

    getDirectionState({ row, col }) {
        if (row === 0 && col === -1) {
            return "left"
        } else if (row === 0 && col === 1) {
            return "right"
        } else if (row === -1 && col === 0) {
            return "up"
        } else if (row === 1 && col === 0) {
            return "down"
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

    makeMove(state, { rowDelta, colDelta }, direction) {
        const playerRow = state.playerPosition.row;
        const playerCol = state.playerPosition.col;

        const cell = state.map[playerRow + rowDelta][playerCol + colDelta];

        const newPos = { 
            row: playerRow + rowDelta, 
            col: playerCol + colDelta 
        };

        const map = state.map.map(row => row.slice());

        switch (cell) {
            case 0: // Floor
            case 3: // Goal
                return new State(newPos, map, state.moves + 1, state, direction);
            case 2: // Box
            case 4: // Box on goal
                const nextRow = newPos.row + rowDelta;
                const nextCol = newPos.col + colDelta;
                const nextCell = map[nextRow][nextCol];

                if (nextCell === 0 || nextCell === 3) { // Valid move for box

                    if (cell === 4) {
                        map[newPos.row][newPos.col] = 3;
                    } else {
                        map[newPos.row][newPos.col] = 0;
                    }
                    map[nextRow][nextCol] = (nextCell === 3) ? 4 : 2; 
                    return new State(newPos, map, state.moves + 1, state, direction);
                }
            default:
                return null;
        }
    }
}

