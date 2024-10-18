class State {
    constructor(playerPosition, map, moves, parent = null, direction = null) {
        this.playerPosition = playerPosition;
        this.map = map;
        this.moves = moves;
        this.parent = parent;
        this.direction = direction;
    }

    getStateHash() {
        let hash = `${this.playerPosition.row}-${this.playerPosition.col}-`;
        hash += this.map.flat().join('');
        return hash;
    }
}
