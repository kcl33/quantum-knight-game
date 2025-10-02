/**
 * 骑士游戏 - 动画系统示例
 * Knight Game - Animation System Example
 */

class AnimationSystem {
    constructor() {
        this.animations = new Map(); // 存储所有动画
        this.spritesheets = new Map(); // 存储所有精灵图
    }
    
    /**
     * 加载精灵图
     * @param {string} name - 精灵图名称
     * @param {string} url - 精灵图URL
     * @param {Object} options - 选项 {frameWidth, frameHeight, frameCount}
     * @returns {Promise} - 加载完成的Promise
     */
    loadSpritesheet(name, url, options) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.spritesheets.set(name, {
                    image: img,
                    frameWidth: options.frameWidth,
                    frameHeight: options.frameHeight,
                    frameCount: options.frameCount || Math.floor(img.width / options.frameWidth)
                });
                resolve();
            };
            img.onerror = () => {
                reject(new Error(`Failed to load spritesheet: ${url}`));
            };
            img.src = url;
        });
    }
    
    /**
     * 创建动画
     * @param {string} name - 动画名称
     * @param {string} spritesheetName - 精灵图名称
     * @param {Object} options - 动画选项 {frameStart, frameEnd, frameRate, loop}
     */
    createAnimation(name, spritesheetName, options) {
        const spritesheet = this.spritesheets.get(spritesheetName);
        if (!spritesheet) {
            throw new Error(`Spritesheet not found: ${spritesheetName}`);
        }
        
        this.animations.set(name, {
            spritesheetName,
            frameStart: options.frameStart || 0,
            frameEnd: options.frameEnd || spritesheet.frameCount - 1,
            frameRate: options.frameRate || 10,
            loop: options.loop !== undefined ? options.loop : true,
            currentFrame: options.frameStart || 0,
            lastFrameTime: 0,
            playing: false,
            onComplete: options.onComplete || null
        });
    }
    
    /**
     * 播放动画
     * @param {string} name - 动画名称
     * @param {boolean} reset - 是否重置动画
     */
    playAnimation(name, reset = false) {
        const animation = this.animations.get(name);
        if (!animation) {
            console.warn(`Animation not found: ${name}`);
            return;
        }
        
        if (reset) {
            animation.currentFrame = animation.frameStart;
        }
        
        animation.playing = true;
        animation.lastFrameTime = performance.now();
    }
    
    /**
     * 暂停动画
     * @param {string} name - 动画名称
     */
    pauseAnimation(name) {
        const animation = this.animations.get(name);
        if (!animation) return;
        
        animation.playing = false;
    }
    
    /**
     * 停止动画
     * @param {string} name - 动画名称
     */
    stopAnimation(name) {
        const animation = this.animations.get(name);
        if (!animation) return;
        
        animation.playing = false;
        animation.currentFrame = animation.frameStart;
    }
    
    /**
     * 更新动画
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        this.animations.forEach((animation, name) => {
            if (!animation.playing) return;
            
            // 计算帧间隔
            const frameInterval = 1000 / animation.frameRate;
            
            // 更新帧
            animation.lastFrameTime += deltaTime;
            
            while (animation.lastFrameTime >= frameInterval) {
                animation.lastFrameTime -= frameInterval;
                
                // 移动到下一帧
                animation.currentFrame++;
                
                // 检查是否到达动画末尾
                if (animation.currentFrame > animation.frameEnd) {
                    if (animation.loop) {
                        animation.currentFrame = animation.frameStart;
                    } else {
                        animation.currentFrame = animation.frameEnd;
                        animation.playing = false;
                        
                        // 调用完成回调
                        if (animation.onComplete) {
                            animation.onComplete();
                        }
                    }
                }
            }
        });
    }
    
    /**
     * 渲染动画
     * @param {string} name - 动画名称
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} options - 渲染选项 {scale, flipX, flipY, rotation, alpha}
     */
    renderAnimation(name, ctx, x, y, options = {}) {
        const animation = this.animations.get(name);
        if (!animation) {
            console.warn(`Animation not found: ${name}`);
            return;
        }
        
        const spritesheet = this.spritesheets.get(animation.spritesheetName);
        if (!spritesheet) {
            console.warn(`Spritesheet not found: ${animation.spritesheetName}`);
            return;
        }
        
        // 设置渲染选项
        const scale = options.scale || 1;
        const flipX = options.flipX || false;
        const flipY = options.flipY || false;
        const rotation = options.rotation || 0;
        const alpha = options.alpha || 1;
        
        // 计算帧位置
        const frameX = animation.currentFrame * spritesheet.frameWidth;
        
        // 设置透明度
        ctx.globalAlpha = alpha;
        
        // 保存当前状态
        ctx.save();
        
        // 移动到指定位置
        ctx.translate(x, y);
        
        // 应用旋转
        if (rotation !== 0) {
            ctx.rotate(rotation);
        }
        
        // 应用缩放和翻转
        ctx.scale(
            flipX ? -scale : scale,
            flipY ? -scale : scale
        );
        
        // 绘制精灵图
        ctx.drawImage(
            spritesheet.image,
            frameX, 0, // 源矩形位置
            spritesheet.frameWidth, spritesheet.frameHeight, // 源矩形大小
            flipX ? -spritesheet.frameWidth / 2 : 0, // 目标X位置（考虑翻转）
            flipY ? -spritesheet.frameHeight / 2 : 0, // 目标Y位置（考虑翻转）
            spritesheet.frameWidth, spritesheet.frameHeight // 目标矩形大小
        );
        
        // 恢复状态
        ctx.restore();
        
        // 重置透明度
        ctx.globalAlpha = 1;
    }
    
    /**
     * 创建精灵动画对象
     * @param {Object} options - 选项 {x, y, width, height, animations}
     * @returns {Object} - 精灵动画对象
     */
    createSprite(options) {
        const sprite = {
            x: options.x || 0,
            y: options.y || 0,
            width: options.width || 32,
            height: options.height || 32,
            currentAnimation: null,
            animations: {},
            animationSystem: this
        };
        
        // 添加动画
        if (options.animations) {
            for (const [name, animationName] of Object.entries(options.animations)) {
                sprite.animations[name] = animationName;
            }
        }
        
        // 添加方法
        sprite.playAnimation = function(name, reset = false) {
            if (this.animations[name]) {
                this.currentAnimation = this.animations[name];
                this.animationSystem.playAnimation(this.currentAnimation, reset);
            }
        };
        
        sprite.pauseAnimation = function() {
            if (this.currentAnimation) {
                this.animationSystem.pauseAnimation(this.currentAnimation);
            }
        };
        
        sprite.stopAnimation = function() {
            if (this.currentAnimation) {
                this.animationSystem.stopAnimation(this.currentAnimation);
            }
        };
        
        sprite.update = function(deltaTime) {
            this.animationSystem.update(deltaTime);
        };
        
        sprite.render = function(ctx, options = {}) {
            if (this.currentAnimation) {
                this.animationSystem.renderAnimation(
                    this.currentAnimation,
                    ctx,
                    this.x,
                    this.y,
                    options
                );
            }
        };
        
        return sprite;
    }
}

// 使用示例
/*
const animationSystem = new AnimationSystem();

// 加载精灵图
Promise.all([
    animationSystem.loadSpritesheet('player', 'assets/player.png', {
        frameWidth: 32,
        frameHeight: 48
    }),
    animationSystem.loadSpritesheet('enemy', 'assets/enemy.png', {
        frameWidth: 30,
        frameHeight: 30
    })
]).then(() => {
    // 创建动画
    animationSystem.createAnimation('playerIdle', 'player', {
        frameStart: 0,
        frameEnd: 3,
        frameRate: 5,
        loop: true
    });
    
    animationSystem.createAnimation('playerWalk', 'player', {
        frameStart: 4,
        frameEnd: 7,
        frameRate: 10,
        loop: true
    });
    
    animationSystem.createAnimation('playerAttack', 'player', {
        frameStart: 8,
        frameEnd: 11,
        frameRate: 15,
        loop: false,
        onComplete: () => {
            console.log('Attack animation complete');
            player.playAnimation('playerIdle');
        }
    });
    
    // 创建精灵
    const player = animationSystem.createSprite({
        x: 100,
        y: 100,
        width: 32,
        height: 48,
        animations: {
            idle: 'playerIdle',
            walk: 'playerWalk',
            attack: 'playerAttack'
        }
    });
    
    // 播放动画
    player.playAnimation('idle');
    
    // 游戏循环中更新和渲染
    function gameLoop() {
        // 更新动画
        player.update(16); // 假设60FPS，每帧约16ms
        
        // 渲染
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.render(ctx);
        
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
});
*/