// 游戏合集管理器 - 展示实力版
class GameManager {
    constructor() {
        this.currentGame = null;
        this.games = {
            snake: null,
            tetris: null,
            adventure: null
        };
        this.currentLanguage = 'zh'; // 默认中文
        this.translations = {
            zh: {
                // 主菜单
                gameCollection: 'E3CLIPSE3游戏',
                experiencePremium: '这只是一个用来练手的摸鱼作品罢了',
                featuredGames: '精选游戏',
                all: '全部',
                action: '动作',
                puzzle: '益智',
                searchGames: '搜索游戏...',
                player: '玩家',
                // 游戏卡片
                snakeClassic: '贪吃蛇经典',
                arcadeClassic: '街机 • 经典',
                snakeDesc: '经典贪吃蛇游戏，简单易上手的休闲娱乐',
                tetrisMaster: '俄罗斯方块大师',
                puzzleClassic: '益智 • 经典',
                tetrisDesc: '经典俄罗斯方块，考验你的反应和策略',
                knight: '骑士',
            actionAdventure: '动作 • 冒险',
            knightDesc: '横版动作冒险游戏，体验刺激的战斗与探索',
                highScore: '最高分: ',
                // 控制说明
                hotkeys: '快捷键',
                returnToMenu: '返回菜单',
                // 游戏内界面
                score: '分数: ',
                level: '等级: ',
                lines: '行数: ',
                lives: '生命: ',
                startGame: '开始游戏',
                startAdventure: '开始冒险',
                gameControls: '游戏控制',
                move: '移动',
                jump: '跳跃',
                lightAttack: '轻攻击',
                heavyAttack: '重攻击',
                skillAttack: '技能攻击',
                pauseContinue: '暂停/继续',
                pause: '暂停',
                up: '向上',
                down: '向下',
                left: '向左',
                right: '向右',
                restart: '重新开始'
            },
            en: {
                // 主菜单
                gameCollection: 'Game Collection',
                experiencePremium: 'Experience premium gaming in your browser',
                featuredGames: 'Featured Games',
                all: 'All',
                action: 'Action',
                puzzle: 'Puzzle',
                searchGames: 'Search games...',
                player: 'Player',
                // 游戏卡片
                snakeClassic: 'Snake Classic',
                arcadeClassic: 'Arcade • Classic',
                snakeDesc: 'Classic snake game, simple and easy casual entertainment',
                tetrisMaster: 'Tetris Master',
                puzzleClassic: 'Puzzle • Classic',
                tetrisDesc: 'Classic Tetris, test your reaction and strategy',
                knight: 'Knight',
                actionAdventure: 'Action • Adventure',
   knight: 'Knight',
            knightDesc: '2D platformer adventure game, experience exciting combat and exploration',
                highScore: 'High Score: ',
                // 控制说明
                hotkeys: 'Hotkeys',
                returnToMenu: 'Return to Menu',
                // 游戏内界面
                score: 'Score: ',
                level: 'Level: ',
                lines: 'Lines: ',
                lives: 'Lives: ',
                startGame: 'Start Game',
                startAdventure: 'Start Adventure',
                gameControls: 'Game Controls',
                move: 'Move',
                jump: 'Jump',
                lightAttack: 'Light Attack',
                heavyAttack: 'Heavy Attack',
                skillAttack: 'Skill Attack',
                pauseContinue: 'Pause/Continue',
                pause: 'Pause',
                up: 'Up',
                down: 'Down',
                left: 'Left',
                right: 'Right',
                restart: 'Restart'
            }
        };
        this.init();
    }

    init() {
        // 从本地存储加载语言设置
        const savedLang = localStorage.getItem('gameLanguage');
        if (savedLang) {
            this.currentLanguage = savedLang;
        }
        
        this.setupEventListeners();
        this.setupLanguageSwitcher();
        this.updateHighScores();
        this.showMainMenu();
        this.updateLanguage(); // 初始化时应用语言
        
        // 初始化语言切换按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === this.currentLanguage) {
                btn.classList.add('active');
            }
        });
    }

    setupEventListeners() {
        this.bindGameCardEvents();
        this.bindBackButtonEvents();
        this.bindKeyboardEvents();
    }
    
    setupLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });
    }
    
    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        // 更新按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
        
        // 保存语言设置到本地存储
        localStorage.setItem('gameLanguage', lang);
        
        // 应用语言更改
        this.updateLanguage();
        console.log(`语言切换到: ${lang}`);
    }
    
    updateLanguage() {
        const t = this.translations[this.currentLanguage];
        
        // 更新主菜单
        this.updateElement('.main-title', t.gameCollection);
        this.updateElement('.main-subtitle', t.experiencePremium);
        this.updateElement('.section-header h2', t.featuredGames);
        
        // 更新过滤器按钮
        this.updateElements('.filter-btn', [t.all, t.action, t.puzzle]);
        
        // 更新游戏卡片
        this.updateGameCard('[data-game="snake"]', {
            title: t.snakeClassic,
            genre: t.arcadeClassic,
            description: t.snakeDesc
        });
        
        this.updateGameCard('[data-game="tetris"]', {
            title: t.tetrisMaster,
            genre: t.puzzleClassic,
            description: t.tetrisDesc
        });
        
        this.updateGameCard('[data-game="adventure"]', {
            title: t.knight,
            genre: t.actionAdventure,
            description: t.knightDesc
        });
        
        // 更新搜索框
        this.updatePlaceholder('#searchInput', t.searchGames);
        
        // 更新用户名
        this.updateElement('.user-name', t.player);
        
        // 更新游戏内界面
        this.updateGameUI(t);
    }
    
    updateElement(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        }
    }
    
    updateElements(selector, texts) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            if (texts[index]) {
                element.textContent = texts[index];
            }
        });
    }
    
    updateGameCard(selector, content) {
        const card = document.querySelector(selector);
        if (card) {
            const title = card.querySelector('h3');
            const genre = card.querySelector('.game-genre');
            const description = card.querySelector('.game-description');
            
            if (title) title.textContent = content.title;
            if (genre) genre.textContent = content.genre;
            if (description) description.textContent = content.description;
        }
    }
    
    updatePlaceholder(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.placeholder = text;
        }
    }
    
    updateGameUI(t) {
        // 更新贪吃蛇游戏界面
        this.updateElement('#snakeGame h1', `🐍 ${t.snakeClassic}`);
        this.updateElement('#backToMenuSnake', `← ${t.returnToMenu}`);
        this.updateElement('#snakeGame .score span:first-child', t.score.slice(0, -2));
        this.updateElement('#snakeGame .high-score span:first-child', t.highScore.slice(0, -2));
        this.updateElement('#snakeStartButton', t.startGame);
        
        // 更新俄罗斯方块游戏界面
        this.updateElement('#tetrisGame h1', `🧩 ${t.tetrisMaster}`);
        this.updateElement('#backToMenuTetris', `← ${t.returnToMenu}`);
        this.updateElement('#tetrisStartButton', t.startGame);
        
        // 更新骑士游戏界面
          this.updateElement('#adventureGame h1', `⚔️ ${t.knight}`);
        this.updateElement('#backToMenuAdventure', `← ${t.returnToMenu}`);
        this.updateElement('#adventureStartButton', t.startAdventure);
        
        // 更新控制说明
        this.updateElement('#snakeGame .control-instructions h3', t.gameControls);
        this.updateElement('#tetrisGame .control-instructions h3', t.gameControls);
        this.updateElement('#adventureGame .control-instructions h3', t.gameControls);
    }
    
    bindGameCardEvents() {
        // 移除旧的事件监听器
        document.querySelectorAll('.poker-card').forEach(card => {
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });
        
        // 添加新的事件监听器
        document.querySelectorAll('.poker-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const gameType = card.dataset.game;
                console.log('点击游戏卡片:', gameType);
                this.startGame(gameType);
            });
        });
    }
    
    // 初始化量子骑士游戏
    initAdventureGame() {
        console.log('初始化量子骑士游戏...');
        
        // 确保画布元素存在
        const canvas = document.getElementById('adventureCanvas');
        if (!canvas) {
            console.error('找不到量子骑士游戏画布元素');
            return;
        }
        
        // 初始化游戏实例
        if (typeof Knight === 'function') {
            this.games.adventure = new Knight();
            console.log('骑士游戏初始化完成');
        } else {
            console.error('找不到Knight类，请确保knight.js已加载');
        }
    }
    
    bindBackButtonEvents() {
        // 返回菜单按钮
        const snakeBackBtn = document.getElementById('backToMenuSnake');
        const tetrisBackBtn = document.getElementById('backToMenuTetris');
        const adventureBackBtn = document.getElementById('backToMenuAdventure');
        
        if (snakeBackBtn) snakeBackBtn.addEventListener('click', () => this.backToMenu());
        if (tetrisBackBtn) tetrisBackBtn.addEventListener('click', () => this.backToMenu());
        if (adventureBackBtn) adventureBackBtn.addEventListener('click', () => this.backToMenu());
    }
    
    bindKeyboardEvents() {
        // 全局键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.backToMenu();
            } else if (e.key === '1') {
                this.startGame('snake');
            } else if (e.key === '2') {
                this.startGame('tetris');
            } else if (e.key === '3') {
                this.startGame('adventure');
            }
        });
    }
    
    // 重新绑定事件（用于DOM更新后）
    rebindEvents() {
        console.log('重新绑定游戏事件...');
        this.bindGameCardEvents();
    }

    updateHighScores() {
        // 由于现在使用轮播卡片，不再需要更新主菜单中的高分显示
        // 游戏内部的高分显示将在游戏启动时更新
        console.log('更新高分显示');
    }

    startGame(gameType) {
        this.hideMainMenu();
        
        if (gameType === 'snake') {
            this.showSnakeGame();
            if (!this.games.snake) {
                this.games.snake = new SnakeGame();
            } else {
                this.games.snake.init();
            }
        } else if (gameType === 'tetris') {
            this.showTetrisGame();
            if (!this.games.tetris) {
                this.games.tetris = new TetrisGame();
            } else {
                this.games.tetris.init();
            }
        } else if (gameType === 'adventure') {
            this.showAdventureGame();
            console.log('尝试启动量子骑士游戏...');
            
            // 初始化量子骑士游戏
            if (!this.games.adventure) {
                this.initAdventureGame();
            }
            
            // 设置开始按钮事件
            const startButton = document.getElementById('adventureStartButton');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    const overlay = document.getElementById('adventureOverlay');
                    if (overlay) {
                        overlay.style.display = 'none';
                    }
                    if (this.games.adventure) {
                        this.games.adventure.start();
                    }
                });
            }
        }
        
        this.currentGame = gameType;
    }

    backToMenu() {
        if (this.currentGame === 'snake' && this.games.snake) {
            this.games.snake.cleanup();
        } else if (this.currentGame === 'tetris' && this.games.tetris) {
            this.games.tetris.cleanup();
        } else if (this.currentGame === 'adventure') {
            // 清理量子骑士游戏
            if (typeof knight !== 'undefined' && knight) {
                knight.gameState = 'paused';
                knight = null;
            }
        }
        
        this.hideAllGames();
        this.showMainMenu();
        this.updateHighScores();
        this.currentGame = null;
    }

    showMainMenu() {
        document.getElementById('mainMenu').style.display = 'flex';
    }

    hideMainMenu() {
        document.getElementById('mainMenu').style.display = 'none';
    }

    showSnakeGame() {
        document.getElementById('snakeGame').style.display = 'block';
    }

    showTetrisGame() {
        document.getElementById('tetrisGame').style.display = 'block';
    }
    
    showAdventureGame() {
        const adventureGame = document.getElementById('adventureGame');
        if (adventureGame) {
            adventureGame.style.display = 'block';
        }
    }

    hideAllGames() {
        document.getElementById('snakeGame').style.display = 'none';
        document.getElementById('tetrisGame').style.display = 'none';
        
        const adventureGame = document.getElementById('adventureGame');
        if (adventureGame) {
            adventureGame.style.display = 'none';
        }
    }
}

// 贪吃蛇游戏 - 重构版本
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('snakeScore');
        this.highScoreElement = document.getElementById('snakeHighScoreDisplay');
        this.gameOverlay = document.getElementById('snakeOverlay');
        this.gameMessage = document.getElementById('snakeMessage');
        this.gameSubMessage = document.getElementById('snakeSubMessage');
        this.startButton = document.getElementById('snakeStartButton');

        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.init();
    }

    init() {
        this.gameState = 'menu';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameSpeed = 150;
        this.gameLoop = null;
        
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        
        this.food = { x: 15, y: 15 };
        this.foodColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        this.currentFoodColor = this.foodColors[0];
        this.particles = [];
        
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
        
        if (this.gameState === 'gameOver' && e.key === 'r') {
            this.resetGame();
            return;
        }
        
        if (this.gameState === 'playing') {
            if (e.key === ' ') {
                this.togglePause();
                return;
            }
            if (e.key === 'r') {
                this.resetGame();
                return;
            }
            this.handleDirectionChange(e.key);
        }
        
        if (this.gameState === 'paused' && e.key === ' ') {
            this.togglePause();
        }
    }

    handleDirectionChange(key) {
        const directions = {
            'ArrowUp': { x: 0, y: -1 }, 'ArrowDown': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 }, 'ArrowRight': { x: 1, y: 0 },
            'w': { x: 0, y: -1 }, 's': { x: 0, y: 1 }, 'a': { x: -1, y: 0 }, 'd': { x: 1, y: 0 },
            'W': { x: 0, y: -1 }, 'S': { x: 0, y: 1 }, 'A': { x: -1, y: 0 }, 'D': { x: 1, y: 0 }
        };

        const newDirection = directions[key];
        if (newDirection && (this.direction.x !== -newDirection.x || this.direction.y !== -newDirection.y)) {
            this.nextDirection = newDirection;
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.hideOverlay();
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameLoop);
            this.showOverlay('游戏暂停', '按空格键继续游戏');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
    }

    update() {
        this.direction = { ...this.nextDirection };
        this.moveSnake();
        
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }
        
        if (this.checkFoodCollision()) {
            this.eatFood();
        }
        
        this.updateParticles();
        this.drawGame();
    }

    moveSnake() {
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        this.snake.unshift(head);
        this.snake.pop();
    }

    checkCollision() {
        const head = this.snake[0];
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        return false;
    }

    checkFoodCollision() {
        const head = this.snake[0];
        return head.x === this.food.x && head.y === this.food.y;
    }

    eatFood() {
        this.snake.push({ ...this.snake[this.snake.length - 1] });
        this.score += 10;
        this.updateScore();
        this.createParticles(this.food.x, this.food.y);
        
        if (this.score % 50 === 0 && this.gameSpeed > 80) {
            this.gameSpeed -= 5;
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
        this.generateFood();
    }

    generateFood() {
        let validPosition = false;
        let newFood;
        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            validPosition = !this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
        }
        this.food = newFood;
        this.currentFoodColor = this.foodColors[Math.floor(Math.random() * this.foodColors.length)];
    }

    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30, maxLife: 30, color: this.currentFoodColor
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life--;
            return particle.life > 0;
        });
    }

    drawGame() {
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawFood();
        this.drawSnake();
        this.drawParticles();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.tileCount; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.tileCount; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                const gradient = this.ctx.createRadialGradient(
                    x + this.gridSize / 2, y + this.gridSize / 2, 0,
                    x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2
                );
                gradient.addColorStop(0, '#66BB6A');
                gradient.addColorStop(1, '#4CAF50');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                this.ctx.fillStyle = '#333';
                const eyeSize = 3;
                if (this.direction.x === 1) {
                    this.ctx.fillRect(x + this.gridSize - 8, y + 6, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - 8, y + this.gridSize - 9, eyeSize, eyeSize);
                } else if (this.direction.x === -1) {
                    this.ctx.fillRect(x + 5, y + 6, eyeSize, eyeSize);
                    this.ctx.fillRect(x + 5, y + this.gridSize - 9, eyeSize, eyeSize);
                } else if (this.direction.y === -1) {
                    this.ctx.fillRect(x + 6, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - 9, y + 5, eyeSize, eyeSize);
                } else {
                    this.ctx.fillRect(x + 6, y + this.gridSize - 8, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - 9, y + this.gridSize - 8, eyeSize, eyeSize);
                }
            } else {
                const alpha = 1 - (index * 0.05);
                this.ctx.fillStyle = `rgba(76, 175, 80, ${Math.max(alpha, 0.3)})`;
                this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
                this.ctx.fillStyle = `rgba(102, 187, 106, ${Math.max(alpha * 0.5, 0.1)})`;
                this.ctx.fillRect(x + 5, y + 5, this.gridSize - 10, this.gridSize - 10);
            }
        });
    }

    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 0.3 + 0.7;
        
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize / 2, y + this.gridSize / 2, 0,
            x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize
        );
        gradient.addColorStop(0, this.currentFoodColor + '80');
        gradient.addColorStop(1, this.currentFoodColor + '00');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 5, y - 5, this.gridSize + 10, this.gridSize + 10);
        
        this.ctx.fillStyle = this.currentFoodColor;
        const size = (this.gridSize - 6) * pulse;
        const offset = (this.gridSize - size) / 2;
        this.ctx.fillRect(x + offset, y + offset, size, size);
        
        this.ctx.fillStyle = '#ffffff40';
        this.ctx.fillRect(x + offset + 2, y + offset + 2, size / 3, size / 3);
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
    }

    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
            this.showOverlay('新纪录！', `恭喜你达到了 ${this.score} 分！\n按 R 键重新开始游戏`);
        } else {
            this.showOverlay('游戏结束', `你的分数: ${this.score}\n按 R 键重新开始游戏`);
        }
    }

    resetGame() {
        clearInterval(this.gameLoop);
        this.init();
    }

    showMenu() {
        this.showOverlay('🐍 贪吃蛇游戏', '按空格键或点击按钮开始游戏');
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
    }

    updateHighScore() {
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
    }
}

// 页面加载完成后启动游戏管理器
document.addEventListener('DOMContentLoaded', () => {
    const gameManager = new GameManager();
    
    // 鼠标坐标跟随效果
    const mouseCoords = document.getElementById('mouseCoords');
    if (mouseCoords) {
        document.addEventListener('mousemove', (e) => {
            const x = Math.round(e.clientX);
            const y = Math.round(e.clientY);
            mouseCoords.textContent = `${x}, ${y}`;
        });
    }
    
    // 重新绑定游戏卡片事件（确保DOM更新后正确绑定）
    setTimeout(() => {
        gameManager.rebindEvents();
    }, 100);
});