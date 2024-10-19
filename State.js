class State {
    constructor(playerPosition, boxes, moves, parent = null, direction = null) {
        this.playerPosition = playerPosition;
        this.boxes = boxes;
        this.moves = moves;
        this.parent = parent;
        this.direction = direction;
    }

    getStateHash() {
        let hash = `${this.playerPosition.row}-${this.playerPosition.col}-`;

        const sortedBoxes = this.boxes
            .map(box => `${box.row}-${box.col}`)
            .sort();

        hash += sortedBoxes.join('-');
        return hash;
    }
}