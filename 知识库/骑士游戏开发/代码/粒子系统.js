/**
 * 骑士游戏 - 粒子系统示例
 * Knight Game - Particle System Example
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.emitters = new Map();
        this.particleTypes = new Map();
        
        // 初始化默认粒子类型
        this.initDefaultParticleTypes();
    }
    
    /**
     * 初始化默认粒子类型
     */
    initDefaultParticleTypes() {
        // 能量粒子
        this.registerParticleType('energy', {
            color: '#00FFFF',
            size: { min: 2, max: 5 },
            speed: { min: 1, max: 3 },
            lifetime: { min: 500, max: 1000 },
            gravity: 0,
            friction: 0.98,
            fadeIn: true,
            fadeOut: true,
            shrink: true
        });
        
        // 火焰粒子
        this.registerParticleType('fire', {
            color: ['#FF4500', '#FF6347', '#FF7F50'],
            size: { min: 3, max: 8 },
            speed: { min: 0.5, max: 2 },
            lifetime: { min: 300, max: 800 },
            gravity: -0.05,
            friction: 0.95,
            fadeIn: true,
            fadeOut: true,
            shrink: true
        });
        
        // 冰霜粒子
        this.registerParticleType('ice', {
            color: ['#ADD8E6', '#87CEEB', '#B0E0E6'],
            size: { min: 2, max: 6 },
            speed: { min: 0.5, max: 2 },
            lifetime: { min: 400, max: 900 },
            gravity: 0.05,
            friction: 0.97,
            fadeIn: true,
            fadeOut: true,
            shrink: true
        });
        
        // 爆炸粒子
        this.registerParticleType('explosion', {
            color: ['#FF0000', '#FF4500', '#FFA500', '#FFFF00'],
            size: { min: 2, max: 10 },
            speed: { min: 2, max: 8 },
            lifetime: { min: 200, max: 600 },
            gravity: 0.1,
            friction: 0.9,
            fadeIn: false,
            fadeOut: true,
            shrink: true
        });
        
        // 治疗粒子
        this.registerParticleType('heal', {
            color: ['#00FF00', '#32CD32', '#7CFC00'],
            size: { min: 3, max: 7 },
            speed: { min: 0.5, max: 2 },
            lifetime: { min: 500, max: 1000 },
            gravity: -0.1,
            friction: 0.95,
            fadeIn: true,
            fadeOut: true,
            shrink: false
        });
        
        // 护盾粒子
        this.registerParticleType('shield', {
            color: ['#4169E1', '#1E90FF', '#00BFFF'],
            size: { min: 2, max: 4 },
            speed: { min: 0.2, max: 1 },
            lifetime: { min: 1000, max: 2000 },
            gravity: 0,
            friction: 0.98,
            fadeIn: true,
            fadeOut: true,
            shrink: false,
            circular: true
        });
        
        // 收集粒子
        this.registerParticleType('collect', {
            color: ['#FFD700', '#FFA500', '#FF8C00'],
            size: { min: 2, max: 5 },
            speed: { min: 1, max: 3 },
            lifetime: { min: 300, max: 600 },
            gravity: 0,
            friction: 0.95,
            fadeIn: true,
            fadeOut: true,
            shrink: true,
            target: 'player'
        });
    }
    
    /**
     * 注册粒子类型
     * @param {string} type - 粒子类型
     * @param {Object} config - 粒子配置
     */
    registerParticleType(type, config) {
        this.particleTypes.set(type, config);
    }
    
    /**
     * 创建粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} type - 粒子类型
     * @param {Object} options - 创建选项
     * @returns {Array} - 创建的粒子数组
     */
    createParticles(x, y, type, options = {}) {
        const particleType = this.particleTypes.get(type);
        if (!particleType) {
            console.warn(`Particle type not found: ${type}`);
            return [];
        }
        
        const count = options.count || 10;
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(x, y, type, particleType, options);
            particles.push(particle);
            this.particles.push(particle);
        }
        
        return particles;
    }
    
    /**
     * 创建单个粒子
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} type - 粒子类型
     * @param {Object} particleType - 粒子类型配置
     * @param {Object} options - 创建选项
     * @returns {Object} - 粒子对象
     */
    createParticle(x, y, type, particleType, options) {
        // 随机大小
        const sizeRange = particleType.size;
        const size = this.randomBetween(sizeRange.min, sizeRange.max);
        
        // 随机速度
        const speedRange = particleType.speed;
        const speed = this.randomBetween(speedRange.min, speedRange.max);
        
        // 随机角度
        const angle = options.angle !== undefined ? 
            options.angle + this.randomBetween(-0.2, 0.2) : 
            this.randomBetween(0, Math.PI * 2);
        
        // 计算速度分量
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;
        
        // 如果是圆形运动，调整速度
        if (particleType.circular) {
            const radius = options.radius || 30;
            const angleSpeed = options.angleSpeed || 0.05;
            vx = -Math.sin(angle) * radius * angleSpeed;
            vy = Math.cos(angle) * radius * angleSpeed;
        }
        
        // 随机生命周期
        const lifetimeRange = particleType.lifetime;
        const lifetime = this.randomBetween(lifetimeRange.min, lifetimeRange.max);
        
        // 随机颜色
        let color = particleType.color;
        if (Array.isArray(color)) {
            color = color[Math.floor(Math.random() * color.length)];
        }
        
        // 创建粒子对象
        const particle = {
            x,
            y,
            vx,
            vy,
            size,
            originalSize: size,
            color,
            lifetime,
            maxLifetime: lifetime,
            type,
            gravity: particleType.gravity || 0,
            friction: particleType.friction || 1,
            fadeIn: particleType.fadeIn || false,
            fadeOut: particleType.fadeOut || false,
            shrink: particleType.shrink || false,
            circular: particleType.circular || false,
            angle: 0,
            angleSpeed: options.angleSpeed || 0,
            radius: options.radius || 0,
            centerX: x,
            centerY: y,
            target: particleType.target || null,
            targetX: options.targetX || null,
            targetY: options.targetY || null,
            alpha: particleType.fadeIn ? 0 : 1
        };
        
        return particle;
    }
    
    /**
     * 创建粒子发射器
     * @param {string} id - 发射器ID
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} type - 粒子类型
     * @param {Object} options - 发射器选项
     * @returns {Object} - 粒子发射器
     */
    createEmitter(id, x, y, type, options = {}) {
        const emitter = {
            id,
            x,
            y,
            type,
            active: true,
            rate: options.rate || 10, // 每秒发射粒子数
            maxParticles: options.maxParticles || 100,
            angle: options.angle || 0,
            angleSpread: options.angleSpread || Math.PI / 4,
            speed: options.speed || 2,
            lifetime: options.lifetime || 1000,
            lastEmitTime: 0,
            emitInterval: 1000 / options.rate,
            particleCount: 0,
            options
        };
        
        this.emitters.set(id, emitter);
        return emitter;
    }
    
    /**
     * 更新粒子系统
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            this.updateParticle(particle, deltaTime);
            
            // 移除死亡的粒子
            if (particle.lifetime <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 更新发射器
        this.emitters.forEach(emitter => {
            if (!emitter.active) return;
            
            emitter.lastEmitTime += deltaTime;
            
            // 检查是否需要发射新粒子
            while (emitter.lastEmitTime >= emitter.emitInterval) {
                emitter.lastEmitTime -= emitter.emitInterval;
                
                // 检查粒子数量限制
                if (emitter.maxParticles <= 0 || emitter.particleCount < emitter.maxParticles) {
                    // 发射粒子
                    const angle = emitter.angle + this.randomBetween(
                        -emitter.angleSpread / 2, 
                        emitter.angleSpread / 2
                    );
                    
                    const options = {
                        ...emitter.options,
                        angle,
                        speed: emitter.speed,
                        lifetime: emitter.lifetime
                    };
                    
                    const particles = this.createParticles(
                        emitter.x, 
                        emitter.y, 
                        emitter.type, 
                        options
                    );
                    
                    emitter.particleCount += particles.length;
                }
            }
            
            // 更新发射器位置
            if (emitter.update) {
                emitter.update(deltaTime);
            }
        });
    }
    
    /**
     * 更新单个粒子
     * @param {Object} particle - 粒子对象
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    updateParticle(particle, deltaTime) {
        // 更新生命周期
        particle.lifetime -= deltaTime;
        
        // 更新透明度
        if (particle.fadeIn && particle.lifetime > particle.maxLifetime * 0.8) {
            particle.alpha = 1 - (particle.lifetime - particle.maxLifetime * 0.8) / (particle.maxLifetime * 0.2);
        } else if (particle.fadeOut && particle.lifetime < particle.maxLifetime * 0.2) {
            particle.alpha = particle.lifetime / (particle.maxLifetime * 0.2);
        } else {
            particle.alpha = 1;
        }
        
        // 更新大小
        if (particle.shrink) {
            particle.size = particle.originalSize * (particle.lifetime / particle.maxLifetime);
        }
        
        // 如果是圆形运动
        if (particle.circular) {
            particle.angle += particle.angleSpeed * deltaTime / 1000;
            particle.x = particle.centerX + Math.cos(particle.angle) * particle.radius;
            particle.y = particle.centerY + Math.sin(particle.angle) * particle.radius;
        } else {
            // 应用物理
            particle.vx *= particle.friction;
            particle.vy *= particle.friction;
            particle.vy += particle.gravity * deltaTime / 16;
            
            // 更新位置
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
        }
        
        // 如果有目标，向目标移动
        if (particle.target === 'player' && game.player) {
            const dx = game.player.x - particle.x;
            const dy = game.player.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                particle.vx += (dx / distance) * 0.2;
                particle.vy += (dy / distance) * 0.2;
            }
        } else if (particle.targetX !== null && particle.targetY !== null) {
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                particle.vx += (dx / distance) * 0.2;
                particle.vy += (dy / distance) * 0.2;
            }
        }
    }
    
    /**
     * 渲染粒子系统
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    render(ctx) {
        // 渲染所有粒子
        this.particles.forEach(particle => {
            this.renderParticle(ctx, particle);
        });
    }
    
    /**
     * 渲染单个粒子
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {Object} particle - 粒子对象
     */
    renderParticle(ctx, particle) {
        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = particle.alpha;
        
        // 设置颜色
        ctx.fillStyle = particle.color;
        
        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 清除所有粒子
     */
    clear() {
        this.particles = [];
    }
    
    /**
     * 移除发射器
     * @param {string} id - 发射器ID
     */
    removeEmitter(id) {
        this.emitters.delete(id);
    }
    
    /**
     * 激活发射器
     * @param {string} id - 发射器ID
     */
    activateEmitter(id) {
        const emitter = this.emitters.get(id);
        if (emitter) {
            emitter.active = true;
        }
    }
    
    /**
     * 停用发射器
     * @param {string} id - 发射器ID
     */
    deactivateEmitter(id) {
        const emitter = this.emitters.get(id);
        if (emitter) {
            emitter.active = false;
        }
    }
    
    /**
     * 获取粒子数量
     * @returns {number} - 粒子数量
     */
    getParticleCount() {
        return this.particles.length;
    }
    
    /**
     * 获取发射器数量
     * @returns {number} - 发射器数量
     */
    getEmitterCount() {
        return this.emitters.size;
    }
    
    /**
     * 生成随机数（在指定范围内）
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} - 随机数
     */
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
}

// 使用示例
/*
const particleSystem = new ParticleSystem();

// 创建粒子发射器
const fireEmitter = particleSystem.createEmitter(
    'fire1',
    100,
    100,
    'fire',
    {
        rate: 20,
        maxParticles: 50,
        angle: -Math.PI / 2,
        angleSpread: Math.PI / 6,
        speed: 2
    }
);

// 更新发射器位置（跟随玩家）
fireEmitter.update = function(deltaTime) {
    this.x = player.x;
    this.y = player.y;
};

// 游戏循环中更新和渲染粒子系统
function gameLoop() {
    const deltaTime = 16; // 假设60FPS
    
    // 更新粒子系统
    particleSystem.update(deltaTime);
    
    // 渲染粒子系统
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particleSystem.render(ctx);
    
    // 其他游戏逻辑...
    
    requestAnimationFrame(gameLoop);
}

// 在特定事件中创建粒子
function onPlayerAttack() {
    // 在攻击位置创建爆炸粒子
    particleSystem.createParticles(
        player.x + (player.facingRight ? 30 : -30),
        player.y,
        'explosion',
        { count: 20 }
    );
}

function onPlayerHeal() {
    // 在玩家位置创建治疗粒子
    particleSystem.createParticles(
        player.x,
        player.y,
        'heal',
        { count: 30 }
    );
}

function onEnemyHit(enemy) {
    // 在敌人位置创建冲击粒子
    particleSystem.createParticles(
        enemy.x,
        enemy.y,
        'energy',
        { count: 15 }
    );
}

gameLoop();
*/