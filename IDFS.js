class IDFS {
    constructor(game) {
        this.game = game;
    }

    solve() {
        console.log("Solving...");

        let depth = 0;
        let initialState = new State(
            { row: this.game.player.row, col: this.game.player.col },
            this.game.state.map.map(row => row.slice()),
            0
        );

        while (true) {
            let visited = new Set();
            if (this.depthLimitedSearch(initialState, depth, visited)) {
                break;
            }
            depth++;
        }
    }

    depthLimitedSearch(state, depth, visited) {
        if (this.game.stateIsWin(state)) {
            alert(`Solved in ${state.moves} moves!`);
            console.log(state);

            let moves = [];
            while (state.parent != null) {
                moves.push(state.direction);
                state = state.parent;
            }

            moves.reverse();
            document.getElementById("path").innerText = `Moves: ${moves.length} \n Path: ${moves.toString()}`;

            let index = 0;
            const intervalId = setInterval(() => {
                if (index < moves.length) {
                    state = this.game.player.move(state, moves[index]);
                    if (state !== null) {
                        this.game.movePlayer(state);
                    }
                    index++;
                } else {
                    clearInterval(intervalId);
                }
            }, 50);

            return true;
        }

        if (depth === 0) {
            return false;
        }

        visited.add(state.getStateHash());
        let possibleDirections = this.game.getPossibleDirections(state);

        for (let direction of possibleDirections) {
            let newState = this.game.player.move(state, direction);
            if (newState != null && !visited.has(newState.getStateHash())) {
                if (this.depthLimitedSearch(newState, depth - 1, visited)) {
                    return true;
                }
            }
        }
        return false;
    }
}

