// 扑克牌轮播效果 - 基于原版项目的循环切换逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 扑克牌轮播对象
    const pokerCarousel = {
        // 游戏数据
        games: [
            {
                id: 'snake',
                title: '贪吃蛇经典',
                genre: '街机 • 经典',
                description: '经典贪吃蛇游戏，简单易上手的休闲娱乐',
                icon: '🐍',
                highScoreId: 'snakeHighScore'
            },
            {
                id: 'tetris',
                title: '俄罗斯方块大师',
                genre: '益智 • 经典',
                description: '经典俄罗斯方块，考验你的反应和策略',
                icon: '🧩',
                highScoreId: 'tetrisHighScore'
            },
            {
                id: 'adventure',
                title: '骑士',
                genre: '动作 • 冒险',
                description: '横版动作冒险游戏，体验刺激的战斗与探索',
                icon: '⚔️',
                highScoreId: 'adventureHighScore'
            },
            {
                id: 'puzzle',
                title: '解谜冒险',
                genre: '益智 • 冒险',
                description: '解谜冒险游戏，挑战你的智力与观察力',
                icon: '🧩',
                highScoreId: 'puzzleHighScore'
            },
            {
                id: 'racing',
                title: '极速赛车',
                genre: '竞速 • 街机',
                description: '极速赛车游戏，体验速度与激情',
                icon: '🏎️',
                highScoreId: 'racingHighScore'
            },
            {
                id: 'shooter',
                title: '太空射击',
                genre: '射击 • 街机',
                description: '太空射击游戏，消灭外星入侵者',
                icon: '🚀',
                highScoreId: 'shooterHighScore'
            }
        ],
        
        // 当前显示的游戏索引
        currentGameIndex: 0,
        
        // 扑克牌元素
        pokerElements: [],
        
        // 背面卡片元素
        backCardElement: null,
        
        // 变换数据
        transformData: [
            "rotate(-15deg) translateX(-180px)",
            "rotate(-10deg) translateX(-90px)",
            "rotate(-5deg) translateX(0px)",
            "rotate(5deg) translateX(90px)",
            "rotate(10deg) translateX(180px)",
            "rotate(15deg) translateX(270px)"
        ],
        
        // 初始化
        init() {
            // 获取扑克牌容器
            const container = document.querySelector('.poker-carousel-container');
            if (!container) return;
            
            // 创建扑克牌元素
            for (let i = 0; i < 6; i++) {
                const pokerCard = document.createElement('div');
                pokerCard.className = `poker-carousel-card poker-pos-${i}`;
                pokerCard.dataset.position = i;
                
                // 获取游戏数据
                const gameIndex = (this.currentGameIndex + i) % this.games.length;
                const game = this.games[gameIndex];
                
                // 设置扑克牌内容
                pokerCard.innerHTML = `
                    <div class="poker-corner top-left">${game.icon}</div>
                    <div class="poker-corner bottom-right">${game.icon}</div>
                    <div class="poker-pattern"></div>
                    <div class="poker-game-image">
                        <div class="poker-game-icon">${game.icon}</div>
                    </div>
                    <div class="poker-game-info">
                        <h3 class="poker-game-title">${game.title}</h3>
                        <p class="poker-game-genre">${game.genre}</p>
                        <p class="poker-game-description">${game.description}</p>
                        <div class="poker-game-stats">
                            最高分: <span id="${game.highScoreId}">0</span>
                        </div>
                    </div>
                `;
                
                // 添加点击事件
                pokerCard.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // 只有最前面的卡片可以点击启动游戏
                    if (i === 2) {
                        this.startGame(game.id);
                        
                        // 如果是骑士游戏，延迟自动点击开始按钮
                        if (game.id === 'adventure') {
                            setTimeout(() => {
                                const startButton = document.getElementById('adventureStartButton');
                                if (startButton) {
                                    startButton.click();
                                    console.log('自动点击骑士游戏开始按钮');
                                }
                            }, 5000); // 等待5000ms让玩家看到游戏覆盖层
                        }
                    } else {
                        // 其他卡片点击时移动轮播
                        this.move();
                    }
                });
                
                container.appendChild(pokerCard);
                this.pokerElements.push(pokerCard);
            }
            
            // 创建背面卡片（选择游戏）
            const backCard = document.createElement('div');
            backCard.className = 'poker-carousel-card poker-back-card poker-pos-5';
            backCard.dataset.position = 5;
            
            // 设置背面卡片内容
            backCard.innerHTML = `
                <div class="poker-corner top-left">🎮</div>
                <div class="poker-corner bottom-right">🎮</div>
                <div class="poker-pattern"></div>
                <div class="poker-game-image">
                    <div class="poker-game-icon">🎮</div>
                </div>
                <div class="poker-game-info">
                    <h3 class="poker-game-title">选择游戏</h3>
                    <p class="poker-game-genre">游戏选择</p>
                    <p class="poker-game-description">点击左侧卡片切换游戏</p>
                    <div class="poker-game-stats">
                        点击选择
                    </div>
                </div>
            `;
            
            // 添加点击事件
            backCard.addEventListener('click', (e) => {
                e.stopPropagation();
                // 点击背面卡片时移动轮播
                this.move();
            });
            
            container.appendChild(backCard);
            this.backCardElement = backCard;
            
            // 添加点击提示
            const hint = document.createElement('div');
            hint.className = 'poker-click-hint';
            hint.textContent = '点击左右卡片切换游戏，点击中间卡片开始游戏';
            container.appendChild(hint);
            
            // 添加键盘事件
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.moveLeft();
                } else if (e.key === 'ArrowRight') {
                    this.moveRight();
                } else if (e.key === 'Enter') {
                    // 启动当前最前面的游戏
                    const frontCardIndex = this.currentGameIndex;
                    this.startGame(this.games[frontCardIndex].id);
                }
            });
            
            // 自动轮播（可选）
            // this.startAutoRotate();
        },
        
        // 移动扑克牌（向左移动）
        move() {
            this.currentGameIndex = (this.currentGameIndex + 1) % this.games.length;
            this.updatePokerCards();
        },
        
        // 向左移动
        moveLeft() {
            this.move();
        },
        
        // 向右移动
        moveRight() {
            this.currentGameIndex = (this.currentGameIndex - 1 + this.games.length) % this.games.length;
            this.updatePokerCards();
        },
        
        // 更新扑克牌内容
        updatePokerCards() {
            this.pokerElements.forEach((ele, index) => {
                const position = parseInt(ele.dataset.position);
                let newPosition = (position + 1) % 6;
                
                // 如果是最前面的卡片，移到最后面并更新内容
                if (position === 2) {
                    ele.style.transition = "none";
                    ele.dataset.position = 5;
                    
                    // 更新游戏内容
                    const gameIndex = (this.currentGameIndex + 5) % this.games.length;
                    const game = this.games[gameIndex];
                    this.updatePokerCardContent(ele, game);
                    
                    // 强制重排
                    void ele.offsetWidth;
                } else {
                    ele.style.transition = "transform 0.3s ease, z-index 0.3s ease, opacity 0.3s ease";
                    ele.dataset.position = newPosition;
                }
                
                // 更新位置样式
                ele.className = `poker-carousel-card poker-pos-${newPosition}`;
            });
            
            // 更新背面卡片位置
            if (this.backCardElement) {
                const backPosition = parseInt(this.backCardElement.dataset.position);
                let newBackPosition = (backPosition + 1) % 6;
                
                // 如果背面卡片在最前面，移到最后面
                if (backPosition === 2) {
                    this.backCardElement.style.transition = "none";
                    this.backCardElement.dataset.position = 5;
                    
                    // 强制重排
                    void this.backCardElement.offsetWidth;
                } else {
                    this.backCardElement.style.transition = "transform 0.3s ease, z-index 0.3s ease, opacity 0.3s ease";
                    this.backCardElement.dataset.position = newBackPosition;
                }
                
                // 更新位置样式
                this.backCardElement.className = `poker-carousel-card poker-back-card poker-pos-${newBackPosition}`;
            }
        },
        
        // 更新扑克牌内容
        updatePokerCardContent(element, game) {
            element.querySelector('.poker-corner.top-left').textContent = game.icon;
            element.querySelector('.poker-corner.bottom-right').textContent = game.icon;
            element.querySelector('.poker-game-icon').textContent = game.icon;
            element.querySelector('.poker-game-title').textContent = game.title;
            element.querySelector('.poker-game-genre').textContent = game.genre;
            element.querySelector('.poker-game-description').textContent = game.description;
            element.querySelector('.poker-game-stats span').id = game.highScoreId;
        },
        
        // 启动游戏
        startGame(gameId) {
            // 根据游戏ID启动相应的游戏
            switch(gameId) {
                case 'snake':
                    document.getElementById('mainMenu').style.display = 'none';
                    document.getElementById('snakeGame').style.display = 'block';
                    if (typeof startSnakeGame === 'function') {
                        startSnakeGame();
                    }
                    break;
                case 'tetris':
                    document.getElementById('mainMenu').style.display = 'none';
                    document.getElementById('tetrisGame').style.display = 'block';
                    if (typeof startTetrisGame === 'function') {
                        startTetrisGame();
                    }
                    break;
                case 'adventure':
                    // 不在这里设置显示状态，让startKnight函数处理
                    if (typeof startKnight === 'function') {
                        startKnight();
                    }
                    break;
                case 'puzzle':
                    // 可以添加新的游戏
                    alert('解谜冒险游戏 即将上线，敬请期待！');
                    break;
                case 'racing':
                    // 可以添加新的游戏
                    alert('极速赛车游戏 即将上线，敬请期待！');
                    break;
                case 'shooter':
                    // 可以添加新的游戏
                    alert('太空射击游戏 即将上线，敬请期待！');
                    break;
            }
        },
        
        // 开始自动轮播
        startAutoRotate() {
            setInterval(() => {
                this.move();
            }, 5000); // 每5秒移动一次
        }
    };
    
    // 初始化扑克牌轮播
    pokerCarousel.init();
    
    // 暴露到全局，以便其他脚本可以调用
    window.pokerCarousel = pokerCarousel;
});