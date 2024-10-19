class DFS {
    stack = [];
    visited = new Set();
    initial = false;

    constructor(game) {
        this.game = game;
    }

    solve() {
        console.log("Solving...")
        let stack = [];
        let visited = new Set(); 
        let initialState = new State(
            { row: this.game.player.row, col: this.game.player.col },
            this.game.findBoxesAndGoals(JSON.parse(JSON.stringify(this.game.stage.map))).boxes,
            0
        );

        stack.unshift(initialState);
        visited.add(initialState.getStateHash());

        while (stack.length > 0) {
            let currentState = stack.shift();
            if (this.game.stateIsWin(currentState)) {
                alert(`Solved in ${currentState.moves} moves!`);

                let moves = [];
                while (currentState.parent != null) {
                    moves.push(currentState.direction);
                    currentState = currentState.parent;
                }
                moves.reverse();
                document.getElementById("path").innerText = `Moves: ${moves.length} \n Path: ${moves.toString()}`
                let index = 0;
                let state = initialState;
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
                return;
            }

            this.game.directions.forEach(direction => {
                let newState = this.game.player.move(currentState, direction);
                if (newState != null && !visited.has(newState.getStateHash())) {
                    stack.unshift(newState);
                    visited.add(newState.getStateHash());
                }
            });
        }
        alert("No solution found.");
    }
}
