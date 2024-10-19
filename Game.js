class Game {
    constructor(level, images) {
        this.images = images
        this.checkDeadlock = document.getElementById("checkbox-deadlock").checked
        this.initLevel(level);
        this.initEventListeners()
        this.directions = ['up', 'down', 'left', 'right']
    }

    toggleCheckDeadlock(){
        this.checkDeadlock = !this.checkDeadlock
        console.log(this.checkDeadlock)
    }

    initLevel(level) {
        this.level = level
        this.stage = levels[level]
        this.map = JSON.parse(JSON.stringify(this.stage.map));

        this.state = new State(
            { row: this.stage.player.row, col: this.stage.player.col },
            this.findBoxesAndGoals(this.map).boxes,
            0
        )
        this.removeBoxesFromMap(this.map)
        this.player = new Player(this);
        this.initCanvas(level);
    }

    initCanvas(level) {
        this.canvasWidth = gridSize * this.map[0].length;
        this.canvasHeight = gridSize * this.map.length;
        canvas.setAttribute('width', this.canvasWidth);
        canvas.setAttribute('height', this.canvasHeight);
        document.getElementById('level').innerText = `Level ${level}`;
        this.drawBoard()
    }

    initEventListeners() {
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    handleKeyDown(event) {
        const moves = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        if (moves[event.key]) {
            if(this.checkDeadlock && this.isDeadlock(this.map, this.state.boxes)){
                alert('Deadlock!')
                return
            }
            let newState = this.player.move(this.state, moves[event.key]);
            if (newState) {
                this.movePlayer(newState);
            }
        }
        if (event.key === 'u') this.undo()
        if (event.key === ' ') {
            this.initLevel(this.level)
        }
    }

    movePlayer(newState) {
        this.state = newState
        this.player.updatePosition(newState.playerPosition)
        this.drawBoard();
    }

    undo() {
        if (this.state.parent) {
            this.state = this.state.parent;
            this.player.row = this.state.playerPosition.row
            this.player.col = this.state.playerPosition.col
            this.drawBoard()
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

    drawBoard() {
        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);


        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                const cell = this.map[row][col];
                switch (cell) {
                    case 0:
                        context.drawImage(this.images.floor, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                    case 1:
                        context.drawImage(this.images.wall, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                    // case 2:
                    //     context.drawImage(this.images.box, col * gridSize, row * gridSize, gridSize, gridSize);
                    //     break;
                    case 3:
                        context.drawImage(this.images.goal, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                    case 4:
                        context.drawImage(this.images.boxOnGoal, col * gridSize, row * gridSize, gridSize, gridSize);
                        break;
                }
            }
        }

        for (let i = 0; i < this.state.boxes.length; i++) {
            let box = this.state.boxes[i]
            let image = this.map[box.row][box.col] == 3 ? this.images.boxOnGoal : this.images.box
            context.drawImage(image, box.col * gridSize, box.row * gridSize, gridSize, gridSize)
        }

        this.player.image = this.map[this.state.playerPosition.row][this.state.playerPosition.col] == 3 ? this.images.playerOnGoal : this.images.player
        this.player.draw();
        if (this.stateIsWin(this.state)) {
            alert('You win!')
        }
    }

    stateIsWin(state) {
        let { goals } = this.findBoxesAndGoals(this.map)
        let boxes = state.boxes
        for (let i = 0; i < boxes.length; i++) {
            for (let j = 0; j < goals.length; j++) {
                if (boxes[i].row == goals[j].row && boxes[i].col == goals[j].col) {
                    goals.splice(j, 1)
                    break
                }
            }
        }
        if (goals.length > 0) return false
        return true
    }

    findBoxesAndGoals(map) {
        let boxes = []
        let goals = []
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                if (map[row][col] === 2 || map[row][col] === 4) {
                    boxes.push({ row, col })
                }
                if (map[row][col] === 3 || map[row][col] === 4) {
                    goals.push({ row, col })
                }
            }
        }
        return { boxes, goals }
    }

    removeBoxesFromMap(map) {
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                if (map[row][col] === 4) map[row][col] = 3
                if (map[row][col] === 2) map[row][col] = 0
            }
        }
        return map
    }

    putBoxesOnMap(map, boxes) {
        map = this.removeBoxesFromMap(map)
        for (let i = 0; i < boxes.length; i++) {
            let box = boxes[i];
            map[box.row][box.col] = map[box.row][box.col] === 3 ? 4 : 2;
        }
        return map;
    }

    isDeadlock(map, boxes) {
        for (let box of boxes) {
            if (
                (map[box.row - 1][box.col] === 1 && map[box.row][box.col - 1] === 1 && map[box.row][box.col] !== 4) || // TOP LEFT
                (map[box.row + 1][box.col] === 1 && map[box.row][box.col + 1] === 1 && map[box.row][box.col] !== 4) || // BOTTOM RIGHT
                (map[box.row - 1][box.col] === 1 && map[box.row][box.col + 1] === 1 && map[box.row][box.col] !== 4) || // TOP RIGHT
                (map[box.row + 1][box.col] === 1 && map[box.row][box.col - 1] === 1 && map[box.row][box.col] !== 4) // BOTTOM LEFT
            ) {
                return true;
            }
        }

        for(let box of boxes){
            let right = true
            let left = true
            let up = true
            let down = true

            // RIGHT
            if(box.col + 1 < map[0].length){
                for(let i = 0; i < map.length; i++){
                    if(map[i][box.col + 1] === 0 || map[i][box.col + 1] === 3){
                        right = false;
                        break;
                    }
                }
            }
            //LEFT
            if(box.col - 1 >= 0){
                for(let i = 0; i < map.length; i++){
                    if(map[i][box.col - 1] === 0 || map[i][box.col - 1] === 3){
                        left = false;
                        break;
                    }
                }
            }
            
            //UP
            if(box.row - 1 >= 0){
                for(let i = 0; i < map[0].length; i++){
                    if(map[box.row - 1][i] === 0 || map[box.row - 1][i] === 3){
                        up = false;
                        break;
                    }
                }
            }

            //DOWN
            if(box.row + 1 < map.length){
                for(let i = 0; i < map[0].length; i++){
                    if(map[box.row + 1][i] === 0 || map[box.row + 1][i] === 3){
                        down = false;
                        break;
                    }
                }
            }

            let result = right ^ left ^ up ^ down
            if(result) return true
        }
    }
}