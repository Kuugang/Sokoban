class BFS {
    constructor(game) {
        this.game = game;
    }
    solve() {
        console.log("Solving...")
        let queue = [];
        let visited = new Set();

        let initialState = new State(
            { row: this.game.player.row, col: this.game.player.col },
            this.game.stage.map.map(row => row.slice()),
            0
        );

        queue.push(initialState);
        visited.add(initialState.getStateHash());

        while (queue.length > 0) {
            let currentState = queue.shift();
            if (this.game.stateIsWin(currentState)) {
                alert(`Solved in ${currentState.moves} moves!`);
                console.log(currentState)

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
                        if(state !== null){
                            this.game.movePlayer(state);
                        }
                        index++;
                    } else {
                        clearInterval(intervalId);
                    }
                }, 50);

                return;
            }

            let possibleDirections = this.game.getPossibleDirections(currentState);
            
            possibleDirections.forEach(direction => {
                let newState = this.game.player.move(currentState, direction);
                if (newState != null && !visited.has(newState.getStateHash())) {
                    queue.push(newState);
                    visited.add(newState.getStateHash());
                }
            });
        }
        alert("No solution found.");
    }
}
