/**
 * 骑士游戏 - 核心游戏循环示例
 * Knight Game - Core Game Loop Example
 */

class GameLoopExample {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
        this.gameState = 'playing'; // playing, paused, gameOver, victory
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.animationFrameId = null;
        
        // 游戏对象
        this.player = null;
        this.enemies = [];
        this.platforms = [];
        
        // 初始化游戏
        this.init();
    }
    
    init() {
        // 设置事件监听器
        this.setupEventListeners();
        
        // 创建游戏对象
        this.createGameObjects();
        
        // 启动游戏循环
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件
        this.keydownHandler = (e) => {
            this.handleKeyDown(e.key);
        };
        
        this.keyupHandler = (e) => {
            this.handleKeyUp(e.key);
        };
        
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }
    
    createGameObjects() {
        // 创建玩家
        this.player = {
            x: 100,
            y: 400,
            width: 32,
            height: 48,
            vx: 0,
            vy: 0,
            speed: 5,
            health: 100,
            isAlive: true,
            color: '#FFD700'
        };
        
        // 创建平台
        this.platforms = [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 300, y: 450, width: 150, height: 20 },
            { x: 600, y: 350, width: 120, height: 20 }
        ];
        
        // 创建敌人
        this.enemies = [
            { x: 400, y: 500, width: 30, height: 30, health: 50, color: '#FF0000' },
            { x: 650, y: 300, width: 30, height: 30, health: 50, color: '#FF0000' }
        ];
    }
    
    handleKeyDown(key) {
        // 处理按键按下
        if (key === 'ArrowLeft') {
            this.player.vx = -this.player.speed;
        } else if (key === 'ArrowRight') {
            this.player.vx = this.player.speed;
        } else if (key === 'ArrowUp' && this.player.y >= 500) {
            this.player.vy = -15; // 跳跃
        }
    }
    
    handleKeyUp(key) {
        // 处理按键释放
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            this.player.vx = 0;
        }
    }
    
    gameLoop(currentTime = 0) {
        // 检查游戏是否已停止
        if (this.gameState === 'stopped') {
            return;
        }
        
        if (this.gameState === 'paused') {
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // 帧率控制
        if (currentTime - this.lastTime < this.frameInterval) {
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.frameCount++;
        
        // 更新游戏状态
        this.update(deltaTime);
        
        // 渲染游戏
        this.render();
        
        // 继续游戏循环
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // 更新玩家位置
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // 应用重力
        this.player.vy += 0.8;
        
        // 边界检查
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.canvas.width - this.player.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        
        // 地面检查
        if (this.player.y > 500) {
            this.player.y = 500;
            this.player.vy = 0;
        }
        
        // 平台碰撞检测
        this.checkPlatformCollisions();
        
        // 敌人碰撞检测
        this.checkEnemyCollisions();
    }
    
    checkPlatformCollisions() {
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                // 简单的碰撞响应
                if (this.player.vy > 0) { // 下落
                    this.player.y = platform.y - this.player.height;
                    this.player.vy = 0;
                }
            }
        });
    }
    
    checkEnemyCollisions() {
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy)) {
                // 简单的伤害处理
                this.player.health -= 1;
                if (this.player.health <= 0) {
                    this.player.isAlive = false;
                    this.gameState = 'gameOver';
                }
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#001F7A';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制平台
        this.ctx.fillStyle = '#0040D1';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // 绘制敌人
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
        
        // 绘制玩家
        if (this.player.isAlive) {
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
        
        // 绘制UI
        this.renderUI();
    }
    
    renderUI() {
        // 绘制生命值
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`生命值: ${this.player.health}`, 10, 30);
        
        // 绘制游戏状态
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        } else if (this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = 'left';
        }
    }
    
    cleanup() {
        console.log('清理游戏资源...');
        
        // 移除事件监听器
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        
        // 清理游戏对象
        this.player = null;
        this.enemies = [];
        this.platforms = [];
        
        // 清理动画帧
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // 重置游戏状态
        this.gameState = 'stopped';
        
        console.log('游戏资源清理完成');
    }
}

// 使用示例
// const game = new GameLoopExample('gameCanvas');
// 当需要清理游戏时
// game.cleanup();