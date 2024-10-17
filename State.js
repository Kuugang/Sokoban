class State {
    constructor(playerPosition, map, moves, parent = null, direction = null) {
        this.playerPosition = playerPosition;
        this.map = map;
        this.moves = moves;
        this.parent = parent;
        this.direction = direction;
    }

    getStateHash() {
        return JSON.stringify({ position: this.playerPosition, map: this.map });
    }
}