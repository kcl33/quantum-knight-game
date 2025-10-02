// 俄罗斯方块游戏类
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.scoreElement = document.getElementById('tetrisScore');
        this.levelElement = document.getElementById('tetrisLevel');
        this.linesElement = document.getElementById('tetrisLines');
        this.highScoreElement = document.getElementById('tetrisHighScoreDisplay');
        this.gameOverlay = document.getElementById('tetrisOverlay');
        this.gameMessage = document.getElementById('tetrisMessage');
        this.gameSubMessage = document.getElementById('tetrisSubMessage');
        this.startButton = document.getElementById('tetrisStartButton');

        this.blockSize = 30;
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.init();
    }

    init() {
        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.highScore = localStorage.getItem('tetrisHighScore') || 0;
        this.gameSpeed = 1000;
        this.gameLoop = null;
        
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceX = 0;
        this.pieceY = 0;
        
        this.pieces = [
            { shape: [[1, 1, 1, 1]], color: '#00FFFF' }, // I
            { shape: [[1, 1], [1, 1]], color: '#FFFF00' }, // O
            { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' }, // T
            { shape: [[0, 1, 1], [1, 1, 0]], color: '#00FF00' }, // S
            { shape: [[1, 1, 0], [0, 1, 1]], color: '#FF0000' }, // Z
            { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000FF' }, // J
            { shape: [[0, 0, 1], [1, 1, 1]], color: '#FFA500' }  // L
        ];
        
        this.updateHighScore();
        this.setupEventListeners();
        this.showMenu();
        this.drawGame();
    }

    setupEventListeners() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        
        this.keydownHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keydownHandler);
        this.startButton.addEventListener('click', () => this.startGame());
    }

    cleanup() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
    }

    handleKeyPress(e) {
        if (this.gameState === 'menu' && (e.key === ' ' || e.key === 'Enter')) {
            this.startGame();
            return;
        }
        
        if (this.gameState === 'playing') {
            switch (e.key) {
                case 'ArrowLeft': this.movePiece(-1, 0); break;
                case 'ArrowRight': this.movePiece(1, 0); break;
                case 'ArrowDown': this.movePiece(0, 1); break;
                case 'ArrowUp': this.rotatePiece(); break;
                case ' ': this.hardDrop(); break;
                case 'p': case 'P': this.togglePause(); break;
            }
        }
        
        if (this.gameState === 'paused' && (e.key === 'p' || e.key === 'P')) {
            this.togglePause();
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.hideOverlay();
        this.spawnPiece();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameLoop);
            this.showOverlay('游戏暂停', '按 P 键继续游戏');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.getRandomPiece();
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        this.pieceX = Math.floor(this.boardWidth / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.pieceY = 0;
        
        if (this.checkCollision(this.currentPiece.shape, this.pieceX, this.pieceY)) {
            this.gameOver();
        }
        
        this.drawNextPiece();
    }

    getRandomPiece() {
        return JSON.parse(JSON.stringify(this.pieces[Math.floor(Math.random() * this.pieces.length)]));
    }

    update() {
        if (!this.movePiece(0, 1)) {
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
        }
        this.drawGame();
    }

    movePiece(dx, dy) {
        const newX = this.pieceX + dx;
        const newY = this.pieceY + dy;
        
        if (!this.checkCollision(this.currentPiece.shape, newX, newY)) {
            this.pieceX = newX;
            this.pieceY = newY;
            this.drawGame();
            return true;
        }
        return false;
    }

    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        if (!this.checkCollision(rotated, this.pieceX, this.pieceY)) {
            this.currentPiece.shape = rotated;
            this.drawGame();
        }
    }

    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        return rotated;
    }

    hardDrop() {
        while (this.movePiece(0, 1)) {
            // 继续下降直到碰撞
        }
    }

    checkCollision(shape, x, y) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j]) {
                    const newX = x + j;
                    const newY = y + i;
                    
                    if (newX < 0 || newX >= this.boardWidth || 
                        newY >= this.boardHeight || 
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    placePiece() {
        for (let i = 0; i < this.currentPiece.shape.length; i++) {
            for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
                if (this.currentPiece.shape[i][j]) {
                    const x = this.pieceX + j;
                    const y = this.pieceY + i;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.gameSpeed = Math.max(100, 1000 - (this.level - 1) * 50);
            
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            
            this.updateScore();
        }
    }

    drawGame() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBoard();
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.pieceX, this.pieceY);
        }
        this.drawGrid();
    }

    drawBoard() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                    this.ctx.strokeStyle = '#333';
                    this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
                }
            }
        }
    }

    drawPiece(piece, offsetX, offsetY) {
        this.ctx.fillStyle = piece.color;
        for (let i = 0; i < piece.shape.length; i++) {
            for (let j = 0; j < piece.shape[i].length; j++) {
                if (piece.shape[i][j]) {
                    const x = (offsetX + j) * this.blockSize;
                    const y = (offsetY + i) * this.blockSize;
                    this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
                    this.ctx.strokeStyle = '#333';
                    this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
                }
            }
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.boardWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.boardHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const offsetX = Math.floor((this.nextCanvas.width / this.blockSize - this.nextPiece.shape[0].length) / 2);
            const offsetY = Math.floor((this.nextCanvas.height / this.blockSize - this.nextPiece.shape.length) / 2);
            
            this.nextCtx.fillStyle = this.nextPiece.color;
            for (let i = 0; i < this.nextPiece.shape.length; i++) {
                for (let j = 0; j < this.nextPiece.shape[i].length; j++) {
                    if (this.nextPiece.shape[i][j]) {
                        const x = (offsetX + j) * this.blockSize;
                        const y = (offsetY + i) * this.blockSize;
                        this.nextCtx.fillRect(x, y, this.blockSize, this.blockSize);
                        this.nextCtx.strokeStyle = '#333';
                        this.nextCtx.strokeRect(x, y, this.blockSize, this.blockSize);
                    }
                }
            }
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.highScore);
            this.updateHighScore();
            this.showOverlay('新纪录！', `恭喜你达到了 ${this.score} 分！\n按 ESC 返回菜单`);
        } else {
            this.showOverlay('游戏结束', `你的分数: ${this.score}\n按 ESC 返回菜单`);
        }
    }

    showMenu() {
        this.showOverlay('🧩 俄罗斯方块', '按空格键或点击按钮开始游戏');
    }

    showOverlay(title, message) {
        this.gameMessage.textContent = title;
        this.gameSubMessage.textContent = message;
        this.gameOverlay.classList.remove('hidden');
        
        if (this.gameState === 'menu') {
            this.startButton.style.display = 'block';
        } else {
            this.startButton.style.display = 'none';
        }
    }

    hideOverlay() {
        this.gameOverlay.classList.add('hidden');
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
    }

    updateHighScore() {
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
    }
}