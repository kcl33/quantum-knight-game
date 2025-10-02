/**
 * 骑士 - 横版2D闯关游戏
 * Knight - 2D Platformer Adventure Game
 */

class Knight {
    constructor() {
        console.log('初始化骑士游戏...');
        
        this.canvas = document.getElementById('adventureCanvas');
        if (!this.canvas) {
            console.error('无法找到游戏画布元素 #adventureCanvas');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('无法获取2D渲染上下文');
            return;
        }
        
        this.canvas.width = 1000;
        this.canvas.height = 600;
        
        console.log('画布初始化成功，尺寸:', this.canvas.width, 'x', this.canvas.height);
        
        // 游戏状态
        this.gameState = 'playing'; // playing, paused, gameOver, victory
        this.level = 1;
        this.score = 0;
        this.lives = 3;
        this.debugMode = false; // 添加调试模式属性
        
        // 物理系统
        this.gravity = 0.8;
        this.friction = 0.85;
        this.jumpStrength = 15;
        
        // 键盘输入
        this.keys = {};
        this.lastJumpTime = 0;
        this.jumpCooldown = 300; // 防止连续跳跃
        
        // 游戏对象
        this.player = null;
        this.enemies = [];
        this.boss = null;
        this.projectiles = [];
        this.particles = [];
        this.collectibles = [];
        this.platforms = [];
        
        // 摄像机
        this.camera = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            target: null
        };
        
        // 动画帧
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.animationFrameId = null;
        
        this.init();
    }
    
    init() {
        try {
            console.log('初始化游戏系统...');
            
            this.setupEventListeners();
            console.log('事件监听器设置完成');
            
            this.createPlayer();
            console.log('玩家创建完成');
            
            this.createLevel();
            console.log('关卡创建完成');
            
            this.camera.target = this.player;
            console.log('摄像机设置完成');
            
            // 立即绘制几帧来测试画布显示
            this.render();
            this.render();
            this.render();
            console.log('初始渲染完成');
            
            // 设置初始游戏状态
            this.gameState = 'menu';
            
            this.gameLoop();
            console.log('游戏循环启动完成');
            
        } catch (error) {
            console.error('游戏初始化错误:', error);
            alert('游戏初始化失败，请刷新页面重试');
        }
    }
    
    setupEventListeners() {
        // 确保移除之前的事件监听器
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
        }
        
        // 创建绑定到当前实例的事件处理器
        this.keydownHandler = (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // 防止页面滚动
            if(['w', 'a', 's', 'd', ' ', 'j', 'k', 'l'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            
            // 暂停游戏
            if(e.key.toLowerCase() === 'p') {
                this.togglePause();
            }
            
            // 切换调试模式
            if(e.key.toLowerCase() === 'f1') {
                this.debugMode = !this.debugMode;
                console.log(`调试模式: ${this.debugMode ? '开启' : '关闭'}`);
            }
        };
        
        this.keyupHandler = (e) => {
            this.keys[e.key.toLowerCase()] = false;
        };
        
        // 添加事件监听器
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        
        // 添加开始按钮事件监听器
        const startButton = document.getElementById('adventureStartButton');
        if (startButton) {
            // 移除旧的事件监听器
            const newButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newButton, startButton);
            
            newButton.addEventListener('click', () => {
                console.log('点击开始按钮，启动游戏...');
                
                // 隐藏覆盖层
                const overlay = document.getElementById('adventureOverlay');
                if (overlay) {
                    overlay.style.display = 'none';
                    console.log('覆盖层已隐藏');
                }
                
                // 设置游戏状态为正在进行
                this.gameState = 'playing';
                console.log('游戏状态设置为: playing');
                
                // 确保游戏循环正在运行
                if (this.gameState === 'playing') {
                    console.log('游戏循环正在运行...');
                }
            });
            console.log('开始按钮事件监听器设置完成');
        } else {
            console.error('找不到开始按钮 #adventureStartButton');
        }
    }
    
    createPlayer() {
        this.player = {
            x: 100,
            y: 400,
            width: 32,
            height: 48,
            vx: 0,
            vy: 0,
            speed: 8,
            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            isGrounded: false,
            isAlive: true,
            facingRight: true,
            
            // 战斗系统
            attackPower: 25,
            isAttacking: false,
            attackCooldown: 0,
            comboCount: 0,
            comboTimer: 0,
            
            // 动画系统
            animations: {
                idle: { frames: 4, speed: 0.1, currentFrame: 0 },
                run: { frames: 6, speed: 0.15, currentFrame: 0 },
                jump: { frames: 3, speed: 0.1, currentFrame: 0 },
                attack: { frames: 4, speed: 0.2, currentFrame: 0 },
                skill: { frames: 5, speed: 0.15, currentFrame: 0 },
                hurt: { frames: 2, speed: 0.1, currentFrame: 0 }
            },
            currentAnimation: 'idle',
            animationTimer: 0,
            
            // 技能系统
            skills: {
                能量弹: {
                    energyCost: 30,
                    cooldown: 2000,
                    lastUsed: 0,
                    damage: 40
                },
                护盾: {
                    energyCost: 20,
                    duration: 3000,
                    cooldown: 5000,
                    lastUsed: 0,
                    active: false,
                    endTime: 0
                }
            }
        };
    }
    
    createLevel() {
        // 创建平台
        this.platforms = [
            { x: 0, y: 550, width: 1200, height: 50, type: 'ground' },
            { x: 300, y: 450, width: 150, height: 20, type: 'platform' },
            { x: 600, y: 350, width: 120, height: 20, type: 'platform' },
            { x: 850, y: 250, width: 150, height: 20, type: 'platform' },
            { x: 1100, y: 400, width: 200, height: 20, type: 'platform' },
            { x: 1400, y: 500, width: 300, height: 50, type: 'ground' }
        ];
        
        // 创建敌人
        this.createEnemies();
        
        // 创建收集品
        this.createCollectibles();
        
        // 创建Boss（在特定条件下）
        if (this.level >= 3) {
            this.createBoss();
        }
    }
    
    createEnemies() {
        const enemyTypes = ['slime', 'skeleton', 'orc'];
        const enemyPositions = [
            { x: 400, y: 400 },
            { x: 700, y: 300 },
            { x: 950, y: 200 },
            { x: 1200, y: 450 },
            { x: 1500, y: 450 }
        ];
        
        enemyPositions.forEach((pos, index) => {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            this.enemies.push(this.createEnemy(type, pos.x, pos.y));
        });
    }
    
    createEnemy(type, x, y) {
        const baseEnemy = {
            x, y,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            isAlive: true,
            facingRight: false,
            lastAttack: 0,
            attackRange: 80,
            detectionRange: 150,
            isGrounded: false,
            
            // 动画
            animations: {
                idle: { frames: 4, speed: 0.08, currentFrame: 0 },
                move: { frames: 4, speed: 0.12, currentFrame: 0 },
                attack: { frames: 3, speed: 0.15, currentFrame: 0 },
                death: { frames: 4, speed: 0.1, currentFrame: 0 }
            },
            currentAnimation: 'idle',
            animationTimer: 0
        };
        
        switch(type) {
            case 'slime':
                return {
                    ...baseEnemy,
                    type: 'slime',
                    health: 30,
                    maxHealth: 30,
                    speed: 1.5,
                    attackPower: 10,
                    attackCooldown: 1500,
                    bounceHeight: 8,
                    color: '#00FF88'
                };
                
            case 'skeleton':
                return {
                    ...baseEnemy,
                    type: 'skeleton',
                    health: 50,
                    maxHealth: 50,
                    speed: 2.5,
                    attackPower: 15,
                    attackCooldown: 1200,
                    color: '#CCCCCC'
                };
                
            case 'orc':
                return {
                    ...baseEnemy,
                    type: 'orc',
                    health: 80,
                    maxHealth: 80,
                    speed: 1.8,
                    attackPower: 20,
                    attackCooldown: 2000,
                    width: 40,
                    height: 50,
                    color: '#8B4513'
                };
                
            default:
                return baseEnemy;
        }
    }
    
    createBoss() {
        this.boss = {
            x: 1600,
            y: 400,
            width: 80,
            height: 100,
            vx: 0,
            vy: 0,
            health: 300,
            maxHealth: 300,
            speed: 3,
            attackPower: 35,
            isAlive: true,
            facingRight: false,
            isGrounded: false,
            
            // Boss特殊技能
            phase: 1,
            lastAttack: 0,
            attackPattern: 0,
            skillCooldowns: {
                charge: 0,
                fireball: 0,
                summon: 0
            },
            
            // 动画
            animations: {
                idle: { frames: 6, speed: 0.08, currentFrame: 0 },
                move: { frames: 8, speed: 0.12, currentFrame: 0 },
                attack: { frames: 6, speed: 0.15, currentFrame: 0 },
                skill: { frames: 8, speed: 0.1, currentFrame: 0 },
                death: { frames: 10, speed: 0.1, currentFrame: 0 }
            },
            currentAnimation: 'idle',
            animationTimer: 0,
            color: '#8B0000'
        };
    }
    
    createCollectibles() {
        const collectiblePositions = [
            { x: 350, y: 420, type: 'health' },
            { x: 650, y: 320, type: 'energy' },
            { x: 900, y: 220, type: 'coin' },
            { x: 1150, y: 370, type: 'coin' },
            { x: 1450, y: 470, type: 'powerup' }
        ];
        
        collectiblePositions.forEach(pos => {
            this.collectibles.push({
                x: pos.x,
                y: pos.y,
                width: 20,
                height: 20,
                type: pos.type,
                value: this.getCollectibleValue(pos.type),
                animationOffset: Math.random() * Math.PI * 2,
                collected: false
            });
        });
    }
    
    getCollectibleValue(type) {
        switch(type) {
            case 'health': return 25;
            case 'energy': return 30;
            case 'coin': return 100;
            case 'powerup': return 1;
            default: return 10;
        }
    }
    
    // 游戏主循环
    gameLoop(currentTime = 0) {
        // 检查游戏是否已停止
        if (this.gameState === 'stopped') {
            return;
        }
        
        if (this.gameState === 'paused') {
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        if (currentTime - this.lastTime < this.frameInterval) {
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.frameCount++;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateBoss(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateParticles(deltaTime);
        this.updateCollectibles(deltaTime);
        this.updateCamera();
        this.updateUI();
        
        // 检查游戏结束条件
        this.checkGameEnd();
    }
    
    updatePlayer(deltaTime) {
        if (!this.player || !this.player.isAlive) return;
        
        // 更新冷却时间
        if (this.player.attackCooldown > 0) {
            this.player.attackCooldown -= deltaTime;
        }
        
        if (this.player.comboTimer > 0) {
            this.player.comboTimer -= deltaTime;
            if (this.player.comboTimer <= 0) {
                this.player.comboCount = 0;
            }
        }
        
        // 更新技能状态
        this.updatePlayerSkills(deltaTime);
        
        // 处理输入
        this.handlePlayerInput();
        
        // 应用物理
        this.applyPhysics(this.player);
        
        // 碰撞检测
        this.checkPlayerCollisions();
        
        // 更新动画
        this.updateAnimation(this.player, deltaTime);
        
        // 能量自然恢复
        if (this.player.energy < this.player.maxEnergy) {
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 0.1);
        }
    }
    
    updatePlayerSkills(deltaTime) {
        // 更新护盾状态
        if (this.player.skills.shield.active) {
            if (Date.now() > this.player.skills.shield.endTime) {
                this.player.skills.shield.active = false;
            }
        }
    }
    
    handlePlayerInput() {
        if (!this.player || !this.player.isAlive) return;
        const player = this.player;
        
        // 水平移动
        if (this.keys['a'] || this.keys['arrowleft']) {
            player.vx = Math.max(player.vx - 1, -player.speed);
            player.facingRight = false;
            if (player.isGrounded && player.currentAnimation !== 'attack') {
                player.currentAnimation = 'run';
            }
        } else if (this.keys['d'] || this.keys['arrowright']) {
            player.vx = Math.min(player.vx + 1, player.speed);
            player.facingRight = true;
            if (player.isGrounded && player.currentAnimation !== 'attack') {
                player.currentAnimation = 'run';
            }
        } else {
            if (player.isGrounded && player.currentAnimation !== 'attack') {
                player.currentAnimation = 'idle';
            }
        }
        
        // 跳跃
        if ((this.keys['w'] || this.keys['arrowup'] || this.keys[' ']) && 
            player.isGrounded && 
            Date.now() - this.lastJumpTime > this.jumpCooldown) {
            player.vy = -this.jumpStrength;
            player.isGrounded = false;
            player.currentAnimation = 'jump';
            this.lastJumpTime = Date.now();
            this.createJumpParticles(player.x + player.width/2, player.y + player.height);
        }
        
        // 攻击
        if (this.keys['j'] && player.attackCooldown <= 0) {
            this.playerAttack();
        }
        
        // 技能 - 能量爆炸
        if (this.keys['k'] && this.canUseSkill('能量弹')) {
            this.useEnergyBlast();
        }
        
        // 技能 - 护盾
        if (this.keys['l'] && this.canUseSkill('护盾')) {
            this.useShield();
        }
    }
    
    playerAttack() {
        if (!this.player || !this.player.isAlive) return;
        const player = this.player;
        player.isAttacking = true;
        player.currentAnimation = 'attack';
        player.attackCooldown = 400;
        player.comboCount++;
        player.comboTimer = 1000;
        
        // 创建攻击范围
        const attackRange = {
            x: player.facingRight ? player.x + player.width : player.x - 40,
            y: player.y,
            width: 40,
            height: player.height
        };
        
        // 检查攻击到的敌人
        this.enemies.forEach(enemy => {
            if (enemy.isAlive && this.checkCollision(attackRange, enemy)) {
                this.damageEnemy(enemy, player.attackPower + (player.comboCount * 5));
                this.createHitParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            }
        });
        
        // 检查攻击Boss
        if (this.boss && this.boss.isAlive && this.checkCollision(attackRange, this.boss)) {
            this.damageBoss(this.boss, player.attackPower + (player.comboCount * 5));
            this.createHitParticles(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2);
        }
        
        // 创建攻击特效
        this.createAttackEffect(attackRange);
    }
    
    canUseSkill(skillName) {
        if (!this.player || !this.player.isAlive) return false;
        const skill = this.player.skills[skillName];
        const now = Date.now();
        return this.player.energy >= skill.energyCost && 
               now - skill.lastUsed >= skill.cooldown;
    }
    
    useEnergyBlast() {
        if (!this.player || !this.player.isAlive) return;
        const skill = this.player.skills.能量弹;
        this.player.energy -= skill.energyCost;
        skill.lastUsed = Date.now();
        this.player.currentAnimation = 'skill';
        
        // 创建能量弹
        const direction = this.player.facingRight ? 1 : -1;
        this.projectiles.push({
            x: this.player.x + (this.player.facingRight ? this.player.width : 0),
            y: this.player.y + this.player.height/2,
            width: 20,
            height: 8,
            vx: direction * 12,
            vy: 0,
            damage: skill.damage,
            type: '能量弹',
            owner: 'player',
            color: '#00B4FF',
            trail: []
        });
        
        this.createSkillParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
    }
    
    useShield() {
        if (!this.player || !this.player.isAlive) return;
        const skill = this.player.skills.护盾;
        this.player.energy -= skill.energyCost;
        skill.lastUsed = Date.now();
        skill.active = true;
        skill.endTime = Date.now() + skill.duration;
        
        this.createShieldParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
    }
    
    applyPhysics(entity) {
        if (!entity) return;
        // 重力
        if (!entity.isGrounded) {
            entity.vy += this.gravity;
        }
        
        // 应用速度
        entity.x += entity.vx;
        entity.y += entity.vy;
        
        // 摩擦力
        entity.vx *= this.friction;
        
        // 速度限制
        entity.vy = Math.max(-20, Math.min(20, entity.vy));
        
        // 边界检查
        if (entity.x < 0) entity.x = 0;
        if (entity.y > this.canvas.height) {
            if (entity === this.player) {
                this.playerDeath();
            } else {
                entity.isAlive = false;
            }
        }
    }
    
    checkPlayerCollisions() {
        if (!this.player || !this.player.isAlive) return;
        this.player.isGrounded = false;
        
        // 平台碰撞
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                this.resolveCollision(this.player, platform);
            }
        });
        
        // 敌人碰撞
        this.enemies.forEach(enemy => {
            if (enemy.isAlive && this.checkCollision(this.player, enemy)) {
                if (!this.player.skills.护盾.active) {
                    this.damagePlayer(enemy.attackPower);
                    this.knockback(this.player, enemy);
                }
            }
        });
        
        // Boss碰撞
        if (this.boss && this.boss.isAlive && this.checkCollision(this.player, this.boss)) {
            if (!this.player.skills.护盾.active) {
                this.damagePlayer(this.boss.attackPower);
                this.knockback(this.player, this.boss);
            }
        }
        
        // 收集品碰撞
        this.collectibles.forEach(collectible => {
            if (!collectible.collected && this.checkCollision(this.player, collectible)) {
                this.collectItem(collectible);
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        if (!rect1 || !rect2) return false;
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    resolveCollision(entity, platform) {
        if (!entity || !platform) return;
        const overlapX = Math.min(entity.x + entity.width - platform.x, platform.x + platform.width - entity.x);
        const overlapY = Math.min(entity.y + entity.height - platform.y, platform.y + platform.height - entity.y);
        
        if (overlapX < overlapY) {
            // 水平碰撞
            if (entity.x < platform.x) {
                entity.x = platform.x - entity.width;
            } else {
                entity.x = platform.x + platform.width;
            }
            entity.vx = 0;
        } else {
            // 垂直碰撞
            if (entity.y < platform.y) {
                entity.y = platform.y - entity.height;
                entity.vy = 0;
                entity.isGrounded = true;
            } else {
                entity.y = platform.y + platform.height;
                entity.vy = 0;
            }
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            // AI逻辑
            this.updateEnemyAI(enemy, deltaTime);
            
            // 物理
            this.applyPhysics(enemy);
            
            // 平台碰撞
            enemy.isGrounded = false;
            this.platforms.forEach(platform => {
                if (this.checkCollision(enemy, platform)) {
                    this.resolveCollision(enemy, platform);
                }
            });
            
            // 更新动画
            this.updateAnimation(enemy, deltaTime);
        });
        
        // 移除死亡的敌人
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
    }
    
    updateEnemyAI(enemy, deltaTime) {
        if (!this.player || !this.player.isAlive) return;
        const distanceToPlayer = Math.abs(enemy.x - this.player.x);
        const verticalDistance = Math.abs(enemy.y - this.player.y);
        
        // 检测玩家
        if (distanceToPlayer < enemy.detectionRange && verticalDistance < 100) {
            // 面向玩家
            enemy.facingRight = enemy.x < this.player.x;
            
            // 攻击范围内
            if (distanceToPlayer < enemy.attackRange && Date.now() - enemy.lastAttack > enemy.attackCooldown) {
                this.enemyAttack(enemy);
            } else if (distanceToPlayer > 50) {
                // 移动向玩家
                const direction = enemy.x < this.player.x ? 1 : -1;
                enemy.vx += direction * 0.5;
                enemy.vx = Math.max(-enemy.speed, Math.min(enemy.speed, enemy.vx));
                enemy.currentAnimation = 'move';
            }
        } else {
            // 巡逻行为
            if (enemy.type === 'slime') {
                // 史莱姆跳跃移动
                if (enemy.isGrounded && Math.random() < 0.01) {
                    enemy.vy = -enemy.bounceHeight;
                    enemy.vx = (Math.random() - 0.5) * enemy.speed;
                }
            } else {
                // 其他敌人随机移动
                if (Math.random() < 0.005) {
                    enemy.facingRight = !enemy.facingRight;
                }
                enemy.vx += (enemy.facingRight ? 1 : -1) * 0.2;
                enemy.vx = Math.max(-enemy.speed * 0.5, Math.min(enemy.speed * 0.5, enemy.vx));
            }
            
            if (Math.abs(enemy.vx) > 0.1) {
                enemy.currentAnimation = 'move';
            } else {
                enemy.currentAnimation = 'idle';
            }
        }
    }
    
    enemyAttack(enemy) {
        enemy.lastAttack = Date.now();
        enemy.currentAnimation = 'attack';
        
        // 创建攻击范围
        const attackRange = {
            x: enemy.facingRight ? enemy.x + enemy.width : enemy.x - 30,
            y: enemy.y,
            width: 30,
            height: enemy.height
        };
        
        // 检查攻击到玩家
        if (this.player && this.player.isAlive && this.checkCollision(attackRange, this.player) && !this.player.skills.shield.active) {
            this.damagePlayer(enemy.attackPower);
            this.knockback(this.player, enemy);
            this.createHitParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        }
    }
    
    updateBoss(deltaTime) {
        if (!this.boss || !this.boss.isAlive) return;
        
        // Boss AI
        this.updateBossAI(deltaTime);
        
        // 物理
        this.applyPhysics(this.boss);
        
        // 平台碰撞
        this.boss.isGrounded = false;
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.boss, platform)) {
                this.resolveCollision(this.boss, platform);
            }
        });
        
        // 更新动画
        this.updateAnimation(this.boss, deltaTime);
    }
    
    updateBossAI(deltaTime) {
        const boss = this.boss;
        if (!this.player || !this.player.isAlive) return;
        const distanceToPlayer = Math.abs(boss.x - this.player.x);
        
        // 更新技能冷却
        Object.keys(boss.skillCooldowns).forEach(skill => {
            if (boss.skillCooldowns[skill] > 0) {
                boss.skillCooldowns[skill] -= deltaTime;
            }
        });
        
        // 阶段转换
        if (boss.health < boss.maxHealth * 0.5 && boss.phase === 1) {
            boss.phase = 2;
            boss.speed *= 1.2;
            boss.attackPower *= 1.15;
        }
        
        // 面向玩家
        boss.facingRight = boss.x < this.player.x;
        
        // 攻击模式选择
        if (Date.now() - boss.lastAttack > 2000) {
            if (distanceToPlayer < 100) {
                this.bossAttack();
            } else if (distanceToPlayer > 200 && boss.skillCooldowns.charge <= 0) {
                this.bossCharge();
            } else if (boss.skillCooldowns.fireball <= 0) {
                this.bossFireball();
            } else {
                // 普通移动
                const direction = boss.x < this.player.x ? 1 : -1;
                boss.vx += direction * 0.8;
                boss.vx = Math.max(-boss.speed, Math.min(boss.speed, boss.vx));
                boss.currentAnimation = 'move';
            }
        }
    }
    
    bossAttack() {
        const boss = this.boss;
        boss.lastAttack = Date.now();
        boss.currentAnimation = 'attack';
        
        // 近战攻击
        const attackRange = {
            x: boss.facingRight ? boss.x + boss.width : boss.x - 60,
            y: boss.y,
            width: 60,
            height: boss.height
        };
        
        if (this.player && this.player.isAlive && this.checkCollision(attackRange, this.player) && !this.player.skills.shield.active) {
            this.damagePlayer(boss.attackPower);
            this.knockback(this.player, boss);
            this.createHitParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        }
    }
    
    bossCharge() {
        const boss = this.boss;
        boss.skillCooldowns.charge = 5000;
        boss.currentAnimation = 'skill';
        
        // 冲锋攻击
        const direction = boss.x < this.player.x ? 1 : -1;
        boss.vx = direction * boss.speed * 2;
        
        setTimeout(() => {
            boss.vx *= 0.1;
        }, 800);
    }
    
    bossFireball() {
        const boss = this.boss;
        boss.skillCooldowns.fireball = 3000;
        boss.currentAnimation = 'skill';
        
        // 创建火球
        const direction = boss.facingRight ? 1 : -1;
        this.projectiles.push({
            x: boss.x + boss.width/2,
            y: boss.y + boss.height/2,
            width: 25,
            height: 25,
            vx: direction * 8,
            vy: -2,
            damage: boss.attackPower * 1.5,
            type: 'fireball',
            owner: 'boss',
            color: '#FF4500',
            trail: []
        });
    }
    
    updateProjectiles(deltaTime) {
        this.projectiles.forEach(projectile => {
            // 移动
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            
            // 添加轨迹
            projectile.trail.push({x: projectile.x, y: projectile.y});
            if (projectile.trail.length > 8) {
                projectile.trail.shift();
            }
            
            // 重力（火球）
            if (projectile.type === 'fireball') {
                projectile.vy += 0.3;
            }
            
            // 碰撞检测
            if (projectile.owner === 'player') {
                // 玩家弹药击中敌人
                this.enemies.forEach(enemy => {
                    if (enemy.isAlive && this.checkCollision(projectile, enemy)) {
                        this.damageEnemy(enemy, projectile.damage);
                        this.createHitParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        projectile.active = false;
                    }
                });
                
                // 击中Boss
                if (this.boss && this.boss.isAlive && this.checkCollision(projectile, this.boss)) {
                    this.damageBoss(this.boss, projectile.damage);
                    this.createHitParticles(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2);
                    projectile.active = false;
                }
            } else {
                // 敌人弹药击中玩家
                if (this.player && this.player.isAlive && this.checkCollision(projectile, this.player) && !this.player.skills.shield.active) {
                    this.damagePlayer(projectile.damage);
                    this.createHitParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
                    projectile.active = false;
                }
            }
            
            // 平台碰撞
            this.platforms.forEach(platform => {
                if (this.checkCollision(projectile, platform)) {
                    projectile.active = false;
                    this.createHitParticles(projectile.x, projectile.y);
                }
            });
        });
        
        // 移除无效弹药
        this.projectiles = this.projectiles.filter(p => p.active !== false && 
            p.x > -50 && p.x < this.canvas.width + 50 && 
            p.y > -50 && p.y < this.canvas.height + 50);
    }
    
    damagePlayer(damage) {
        if (!this.player || !this.player.isAlive) return;
        this.player.health -= damage;
        this.player.currentAnimation = 'hurt';
        
        if (this.player.health <= 0) {
            this.playerDeath();
        }
        
        // 屏幕震动效果
        this.camera.shake = 10;
    }
    
    damageEnemy(enemy, damage) {
        if (!enemy) return;
        enemy.health -= damage;
        enemy.currentAnimation = 'hurt';
        
        if (enemy.health <= 0) {
            enemy.isAlive = false;
            enemy.currentAnimation = 'death';
            this.score += 50;
            
            // 掉落道具
            if (Math.random() < 0.3) {
                this.dropItem(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            }
        }
    }
    
    damageBoss(boss, damage) {
        if (!boss) return;
        boss.health -= damage;
        this.score += 10;
        
        if (boss.health <= 0) {
            boss.isAlive = false;
            boss.currentAnimation = 'death';
            this.score += 1000;
            this.gameState = 'victory';
        }
    }
    
    playerDeath() {
        if (!this.player) return;
        this.player.isAlive = false;
        this.lives--;
        
        if (this.lives > 0) {
            // 重生
            setTimeout(() => {
                this.respawnPlayer();
            }, 2000);
        } else {
            this.gameState = 'gameOver';
        }
    }
    
    respawnPlayer() {
        if (!this.player) return;
        this.player.x = 100;
        this.player.y = 400;
        this.player.health = this.player.maxHealth;
        this.player.energy = this.player.maxEnergy;
        this.player.isAlive = true;
        this.player.vx = 0;
        this.player.vy = 0;
    }
    
    collectItem(collectible) {
        if (!this.player || !this.player.isAlive) return;
        collectible.collected = true;
        
        switch(collectible.type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + collectible.value);
                break;
            case 'energy':
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + collectible.value);
                break;
            case 'coin':
                this.score += collectible.value;
                break;
            case 'powerup':
                this.player.attackPower += 5;
                break;
        }
        
        this.createCollectParticles(collectible.x, collectible.y);
    }
    
    dropItem(x, y) {
        if (x === undefined || y === undefined) return;
        const itemTypes = ['health', 'energy', 'coin'];
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        this.collectibles.push({
            x: x - 10,
            y: y - 10,
            width: 20,
            height: 20,
            type: type,
            value: this.getCollectibleValue(type),
            animationOffset: Math.random() * Math.PI * 2,
            collected: false
        });
    }
    
    knockback(target, source) {
        if (!target) return;
        const direction = target.x < source.x ? -1 : 1;
        target.vx += direction * 5;
        target.vy -= 3;
    }
    
    updateAnimation(entity, deltaTime) {
        if (!entity || !entity.animations || !entity.animations[entity.currentAnimation]) return;
        entity.animationTimer += deltaTime;
        const currentAnim = entity.animations[entity.currentAnimation];
        
        if (entity.animationTimer >= currentAnim.speed * 1000) {
            currentAnim.currentFrame = (currentAnim.currentFrame + 1) % currentAnim.frames;
            entity.animationTimer = 0;
        }
    }
    
    updateCollectibles(deltaTime) {
        this.collectibles.forEach(collectible => {
            if (!collectible.collected) {
                collectible.animationOffset += deltaTime * 0.005;
                collectible.y += Math.sin(collectible.animationOffset) * 0.5;
            }
        });
        
        // 移除已收集的物品
        this.collectibles = this.collectibles.filter(c => !c.collected);
    }
    
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            // 重力
            if (particle.hasGravity) {
                particle.vy += 0.2;
            }
            
            // 摩擦
            particle.vx *= 0.98;
            particle.vy *= 0.98;
        });
        
        // 移除死亡粒子
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    updateCamera() {
        if (this.camera.target && this.player && this.player.isAlive) {
            const targetX = this.camera.target.x - this.camera.width / 2;
            const targetY = this.camera.target.y - this.camera.height / 2;
            
            // 平滑跟随
            this.camera.x += (targetX - this.camera.x) * 0.1;
            this.camera.y += (targetY - this.camera.y) * 0.1;
            
            // 边界限制
            this.camera.x = Math.max(0, this.camera.x);
            this.camera.y = Math.max(-100, Math.min(0, this.camera.y));
        }
        
        // 屏幕震动
        if (this.camera.shake > 0) {
            this.camera.x += (Math.random() - 0.5) * this.camera.shake;
            this.camera.y += (Math.random() - 0.5) * this.camera.shake;
            this.camera.shake *= 0.9;
            if (this.camera.shake < 0.1) this.camera.shake = 0;
        }
    }
    
    updateUI() {
        // 更新UI元素
        const healthElement = document.getElementById('playerHealth');
        const energyElement = document.getElementById('playerEnergy');
        const scoreElement = document.querySelector('#adventureScore, .score-value');
        const levelElement = document.querySelector('#currentLevel, .level-value');
        const livesElement = document.querySelector('#playerLives, .lives-value');
        
        if (healthElement) {
            healthElement.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        }
        if (energyElement) {
            energyElement.style.width = `${(this.player.energy / this.player.maxEnergy) * 100}%`;
        }
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        if (levelElement) {
            levelElement.textContent = this.level;
        }
        if (livesElement) {
            livesElement.textContent = this.lives;
        }
        
        // 更新数值显示
        const healthText = document.getElementById('healthText');
        const energyText = document.getElementById('energyText');
        if (healthText) {
            healthText.textContent = `${Math.round(this.player.health)}/${this.player.maxHealth}`;
        }
        if (energyText) {
            energyText.textContent = `${Math.round(this.player.energy)}/${this.player.maxEnergy}`;
        }
    }
    
    checkGameEnd() {
        // 检查胜利条件
        if (this.enemies.length === 0 && (!this.boss || !this.boss.isAlive)) {
            if (this.gameState === 'playing') {
                this.gameState = 'victory';
            }
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    // 清理游戏资源
    cleanup() {
        console.log('清理游戏资源...');
        
        // 停止游戏循环
        this.gameState = 'stopped';
        
        // 移除事件监听器
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
            this.keyupHandler = null;
        }
        
        // 清空游戏对象
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.collectibles = [];
        this.player = null;
        this.boss = null;
        
        console.log('游戏资源清理完成');
    }
    
    // 渲染系统
    render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 保存状态
        this.ctx.save();
        
        // 应用摄像机变换
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // 渲染背景
        this.renderBackground();
        
        // 渲染平台
        this.renderPlatforms();
        
        // 渲染收集品
        this.renderCollectibles();
        
        // 渲染玩家
        this.renderPlayer();
        
        // 渲染敌人
        this.renderEnemies();
        
        // 渲染Boss
        this.renderBoss();
        
        // 渲染弹药
        this.renderProjectiles();
        
        // 渲染粒子
        this.renderParticles();
        
        // 恢复状态
        this.ctx.restore();
        
        // 渲染UI（不受摄像机影响）
        this.renderUI();
        
        // 渲染调试信息
        if (this.debugMode) {
            this.renderDebugInfo();
        }
    }
    
    renderDebugInfo() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`游戏状态: ${this.gameState}`, 10, 30);
        this.ctx.fillText(`帧率: ${Math.round(60)}`, 10, 50);
        this.ctx.fillText(`玩家: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`, 10, 70);
        this.ctx.fillText(`摄像机: (${Math.round(this.camera.x)}, ${Math.round(this.camera.y)})`, 10, 90);
        this.ctx.fillText(`敌人数量: ${this.enemies.length}`, 10, 110);
        
        // 在画布中心显示状态
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('量子骑士 - 游戏运行中', this.canvas.width/2, this.canvas.height/2 - 50);
        this.ctx.fillText(`状态: ${this.gameState}`, this.canvas.width/2, this.canvas.height/2);
        this.ctx.textAlign = 'left';
    }
    
    renderBackground() {
        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001F7A');
        gradient.addColorStop(0.5, '#002FA7');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
        
        // 星空效果
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 100; i++) {
            const x = (i * 123) % (this.canvas.width * 2) + this.camera.x * 0.1;
            const y = (i * 456) % this.canvas.height + this.camera.y * 0.1;
            const size = Math.sin(i + this.frameCount * 0.01) * 0.5 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }
    
    renderPlatforms() {
        this.ctx.fillStyle = '#0040D1';
        this.ctx.strokeStyle = '#00B4FF';
        this.ctx.lineWidth = 2;
        
        this.platforms.forEach(platform => {
            // 主体
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // 边框光效
            this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            
            // 顶部光线
            this.ctx.fillStyle = '#00B4FF';
            this.ctx.fillRect(platform.x, platform.y, platform.width, 2);
            this.ctx.fillStyle = '#0040D1';
        });
    }
    
    renderPlayer() {
        if (!this.player || !this.player.isAlive) return;
        
        const player = this.player;
        
        // 护盾效果
        if (player.skills.护盾.active) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#00B4FF';
            this.ctx.beginPath();
            this.ctx.arc(player.x + player.width/2, player.y + player.height/2, 35, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // 玩家主体
        this.ctx.fillStyle = player.currentAnimation === 'hurt' ? '#FF6B6B' : '#FFD700';
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // 玩家细节
        this.ctx.fillStyle = '#FFFFFF';
        // 眼睛
        const eyeX = player.facingRight ? player.x + 20 : player.x + 8;
        this.ctx.fillRect(eyeX, player.y + 10, 4, 4);
        
        // 武器
        this.ctx.fillStyle = '#C0C0C0';
        const weaponX = player.facingRight ? player.x + player.width : player.x - 8;
        this.ctx.fillRect(weaponX, player.y + 15, 8, 20);
        
        // 攻击效果
        if (player.isAttacking) {
            this.ctx.fillStyle = '#00B4FF';
            const attackX = player.facingRight ? player.x + player.width : player.x - 40;
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(attackX, player.y, 40, player.height);
            this.ctx.globalAlpha = 1;
        }
        
        // 生命值条
        if (player.health < player.maxHealth) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(player.x, player.y - 10, player.width, 4);
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(player.x, player.y - 10, (player.health / player.maxHealth) * player.width, 4);
        }
    }
    
    renderEnemies() {
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            // 敌人主体
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 眼睛
            this.ctx.fillStyle = '#FF0000';
            const eyeX = enemy.facingRight ? enemy.x + enemy.width - 8 : enemy.x + 4;
            this.ctx.fillRect(eyeX, enemy.y + 8, 3, 3);
            
            // 生命值条
            if (enemy.health < enemy.maxHealth) {
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 3);
                this.ctx.fillStyle = '#00FF00';
                this.ctx.fillRect(enemy.x, enemy.y - 8, (enemy.health / enemy.maxHealth) * enemy.width, 3);
            }
            
            // 特殊效果
            if (enemy.type === 'slime') {
                // 史莱姆果冻效果
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillStyle = enemy.color;
                this.ctx.fillRect(enemy.x - 2, enemy.y - 2, enemy.width + 4, enemy.height + 4);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderBoss() {
        if (!this.boss || !this.boss.isAlive) return;
        
        const boss = this.boss;
        
        // Boss主体
        this.ctx.fillStyle = boss.color;
        this.ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        // Boss装饰
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(boss.x + 10, boss.y + 10, boss.width - 20, 10); // 头冠
        
        // 眼睛
        this.ctx.fillStyle = '#FF4500';
        const eyeX = boss.facingRight ? boss.x + boss.width - 20 : boss.x + 10;
        this.ctx.fillRect(eyeX, boss.y + 25, 6, 6);
        this.ctx.fillRect(eyeX + (boss.facingRight ? -15 : 15), boss.y + 25, 6, 6);
        
        // 生命值条（更大）
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(boss.x, boss.y - 15, boss.width, 6);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(boss.x, boss.y - 15, (boss.health / boss.maxHealth) * boss.width, 6);
        
        // Boss光环
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = '#8B0000';
        this.ctx.beginPath();
        this.ctx.arc(boss.x + boss.width/2, boss.y + boss.height/2, 60, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    renderProjectiles() {
        this.projectiles.forEach(projectile => {
            // 轨迹
            if (projectile.trail.length > 1) {
                this.ctx.strokeStyle = projectile.color;
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
                for (let i = 1; i < projectile.trail.length; i++) {
                    this.ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
                }
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
            
            // 弹药主体
            this.ctx.fillStyle = projectile.color;
            
            if (projectile.type === 'fireball') {
                // 火球效果
                this.ctx.beginPath();
                this.ctx.arc(projectile.x + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 火焰外围
                this.ctx.fillStyle = '#FF6B00';
                this.ctx.globalAlpha = 0.7;
                this.ctx.beginPath();
                this.ctx.arc(projectile.x + projectile.width/2, projectile.y + projectile.height/2, projectile.width/2 + 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            } else {
                // 能量弹
                this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
                
                // 光效
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.globalAlpha = 0.8;
                this.ctx.fillRect(projectile.x + 2, projectile.y + 2, projectile.width - 4, projectile.height - 4);
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    renderCollectibles() {
        this.collectibles.forEach(collectible => {
            if (collectible.collected) return;
            
            let color = '#FFD700';
            switch(collectible.type) {
                case 'health': color = '#FF6B6B'; break;
                case 'energy': color = '#00B4FF'; break;
                case 'coin': color = '#FFD700'; break;
                case 'powerup': color = '#9B59B6'; break;
            }
            
            // 发光效果
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            // 主体
            this.ctx.fillStyle = color;
            this.ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
            
            // 内部高光
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillRect(collectible.x + 4, collectible.y + 4, collectible.width - 8, collectible.height - 8);
            this.ctx.globalAlpha = 1;
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
            
            this.ctx.restore();
        });
    }
    
    renderUI() {
        // 暂停提示
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText('按 P 继续游戏', this.canvas.width/2, this.canvas.height/2 + 60);
        }
        
        // 游戏结束
        if (this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(139, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束', this.canvas.width/2, this.canvas.height/2);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`最终得分: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 60);
            this.ctx.fillText('按 R 重新开始', this.canvas.width/2, this.canvas.height/2 + 100);
        }
        
        // 胜利
        if (this.gameState === 'victory') {
            this.ctx.fillStyle = 'rgba(0, 47, 167, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('胜利！', this.canvas.width/2, this.canvas.height/2);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`得分: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 60);
            this.ctx.fillText('按 R 重新开始', this.canvas.width/2, this.canvas.height/2 + 100);
        }
    }
    
    // 粒子效果
    createJumpParticles(x, y) {
        if (x === undefined || y === undefined) return;
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -2,
                size: Math.random() * 3 + 1,
                color: '#00B4FF',
                life: 500,
                maxLife: 500,
                alpha: 1,
                type: 'circle',
                hasGravity: true
            });
        }
    }
    
    createHitParticles(x, y) {
        if (x === undefined || y === undefined) return;
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: '#FF6B6B',
                life: 800,
                maxLife: 800,
                alpha: 1,
                type: 'square',
                hasGravity: false
            });
        }
    }
    
    createAttackEffect(attackRange) {
        if (!attackRange) return;
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: attackRange.x + Math.random() * attackRange.width,
                y: attackRange.y + Math.random() * attackRange.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: '#FFD700',
                life: 300,
                maxLife: 300,
                alpha: 1,
                type: 'circle',
                hasGravity: false
            });
        }
    }
    
    createSkillParticles(x, y) {
        if (x === undefined || y === undefined) return;
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(i * 0.314) * (Math.random() * 6 + 2),
                vy: Math.sin(i * 0.314) * (Math.random() * 6 + 2),
                size: Math.random() * 3 + 2,
                color: '#00B4FF',
                life: 1000,
                maxLife: 1000,
                alpha: 1,
                type: 'circle',
                hasGravity: false
            });
        }
    }
    
    createShieldParticles(x, y) {
        if (x === undefined || y === undefined) return;
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            this.particles.push({
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                size: Math.random() * 2 + 1,
                color: '#00B4FF',
                life: 1500,
                maxLife: 1500,
                alpha: 1,
                type: 'circle',
                hasGravity: false
            });
        }
    }
    
    createCollectParticles(x, y) {
        if (x === undefined || y === undefined) return;
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * -4 - 2,
                size: Math.random() * 2 + 1,
                color: '#FFD700',
                life: 800,
                maxLife: 800,
                alpha: 1,
                type: 'circle',
                hasGravity: true
            });
        }
    }
    
    cleanup() {
        console.log('Cleaning up knight game resources...');
        
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
        this.boss = null;
        this.projectiles = [];
        this.particles = [];
        this.collectibles = [];
        this.platforms = [];
        
        // 清理动画帧
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // 重置游戏状态
        this.gameState = 'paused';
        
        console.log('Knight game resources cleaned up');
    }
}

// 全局游戏实例
let knight = null;

// 添加全局测试函数
window.testKnight = function() {
    console.log('Testing knight function...');
    const canvas = document.getElementById('adventureCanvas');
    const gameContainer = document.getElementById('adventureGame');
    console.log('Canvas element:', canvas);
    console.log('Game container:', gameContainer);
    console.log('startKnight function:', typeof startKnight);
};

// 游戏启动函数
function startKnight() {
    console.log('Trying to start knight game...');
    
    const gameContainer = document.getElementById('adventureGame');
    if (!gameContainer) {
        console.error('Cannot find game container #adventureGame');
        return;
    }
    
    if (gameContainer.style.display === 'none') {
        console.log('Showing game container...');
        
        // 隐藏所有其他游戏
        document.querySelectorAll('.game-container').forEach(game => {
            if (game && game.style) {
                game.style.display = 'none';
            }
        });
        
        // 显示骑士游戏
        gameContainer.style.display = 'block';
        
        // 隐藏主菜单
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.style.display = 'none';
        }
        
        // 等待一帧再初始化游戏，确保 DOM 元素完全显示
        setTimeout(() => {
            try {
                // 清理旧的游戏实例
                if (knight) {
                    console.log('Cleaning up old game instance...');
                    if (typeof knight.cleanup === 'function') {
                        knight.cleanup();
                    }
                    knight = null;
                }
                
                // 创建新游戏实例
                console.log('Creating new game instance...');
                knight = new Knight();
                
                // 显示游戏覆盖层
                const overlay = document.getElementById('adventureOverlay');
                if (overlay) {
                    overlay.style.display = 'block';
                    console.log('Game overlay displayed');
                }
                
                if (knight) {
                    console.log('Knight game started successfully!');
                } else {
                    console.error('Game instance creation failed');
                }
            } catch (error) {
                console.error('Game initialization failed:', error);
            }
        }, 100);
        
    } else {
        console.log('Hiding game, returning to main menu...');
        
        // 隐藏游戏，返回主菜单
        gameContainer.style.display = 'none';
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.style.display = 'block';
        }
        
        if (knight) {
            if (typeof knight.cleanup === 'function') {
                knight.cleanup();
            }
            knight = null;
        }
    }
}

// 将函数挂载到全局作用域
window.startKnight = startKnight;
