/**
 * 骑士游戏 - 技能系统示例
 * Knight Game - Skill System Example
 */

class SkillSystem {
    constructor() {
        this.skills = new Map(); // 存储所有技能
        this.activeSkills = new Map(); // 存储激活的技能
        this.skillEffects = new Map(); // 存储技能效果
    }
    
    /**
     * 注册技能
     * @param {string} id - 技能ID
     * @param {Object} skill - 技能对象
     */
    registerSkill(id, skill) {
        // 设置默认值
        skill.cooldown = skill.cooldown || 0;
        skill.currentCooldown = 0;
        skill.manaCost = skill.manaCost || 0;
        skill.duration = skill.duration || 0;
        skill.active = false;
        skill.lastUsed = 0;
        
        this.skills.set(id, skill);
    }
    
    /**
     * 使用技能
     * @param {string} id - 技能ID
     * @param {Object} user - 技能使用者
     * @param {Object} target - 技能目标
     * @param {Object} options - 使用选项
     * @returns {boolean} - 是否成功使用技能
     */
    useSkill(id, user, target, options = {}) {
        const skill = this.skills.get(id);
        if (!skill) {
            console.warn(`Skill not found: ${id}`);
            return false;
        }
        
        // 检查冷却时间
        if (skill.currentCooldown > 0) {
            console.log(`Skill ${id} is on cooldown for ${skill.currentCooldown}ms`);
            return false;
        }
        
        // 检查法力值
        if (user.mana !== undefined && user.mana < skill.manaCost) {
            console.log(`Not enough mana to use skill ${id}`);
            return false;
        }
        
        // 检查使用条件
        if (skill.canUse && !skill.canUse(user, target, options)) {
            console.log(`Cannot use skill ${id} at this time`);
            return false;
        }
        
        // 消耗法力值
        if (user.mana !== undefined) {
            user.mana -= skill.manaCost;
        }
        
        // 设置冷却时间
        skill.currentCooldown = skill.cooldown;
        skill.lastUsed = Date.now();
        
        // 执行技能效果
        if (skill.onUse) {
            skill.onUse(user, target, options);
        }
        
        // 如果是持续技能，添加到激活技能列表
        if (skill.duration > 0) {
            skill.active = true;
            skill.startTime = Date.now();
            this.activeSkills.set(id, {
                skill,
                user,
                target,
                options
            });
            
            // 如果有开始效果，执行它
            if (skill.onStart) {
                skill.onStart(user, target, options);
            }
        }
        
        console.log(`Skill ${id} used successfully`);
        return true;
    }
    
    /**
     * 更新技能系统
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        // 更新技能冷却
        this.skills.forEach((skill, id) => {
            if (skill.currentCooldown > 0) {
                skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime);
            }
        });
        
        // 更新激活的技能
        this.activeSkills.forEach((activeSkill, id) => {
            const { skill, user, target, options } = activeSkill;
            const elapsed = Date.now() - skill.startTime;
            
            // 如果技能已过期，结束它
            if (elapsed >= skill.duration) {
                this.endSkill(id);
            } else {
                // 更新技能效果
                if (skill.onUpdate) {
                    skill.onUpdate(user, target, options, elapsed);
                }
            }
        });
        
        // 更新技能效果
        this.skillEffects.forEach((effect, id) => {
            effect.elapsed += deltaTime;
            
            // 如果效果已过期，移除它
            if (effect.elapsed >= effect.duration) {
                if (effect.onEnd) {
                    effect.onEnd(effect.target);
                }
                this.skillEffects.delete(id);
            } else {
                // 更新效果
                if (effect.onUpdate) {
                    effect.onUpdate(effect.target, effect.elapsed);
                }
            }
        });
    }
    
    /**
     * 结束技能
     * @param {string} id - 技能ID
     */
    endSkill(id) {
        const activeSkill = this.activeSkills.get(id);
        if (!activeSkill) return;
        
        const { skill, user, target, options } = activeSkill;
        
        // 执行结束效果
        if (skill.onEnd) {
            skill.onEnd(user, target, options);
        }
        
        // 标记技能为非激活状态
        skill.active = false;
        
        // 从激活技能列表中移除
        this.activeSkills.delete(id);
        
        console.log(`Skill ${id} ended`);
    }
    
    /**
     * 添加技能效果
     * @param {string} id - 效果ID
     * @param {Object} target - 效果目标
     * @param {Object} effect - 效果对象
     */
    addSkillEffect(id, target, effect) {
        // 设置默认值
        effect.duration = effect.duration || 0;
        effect.elapsed = 0;
        effect.target = target;
        
        this.skillEffects.set(id, effect);
        
        // 如果有开始效果，执行它
        if (effect.onStart) {
            effect.onStart(target);
        }
    }
    
    /**
     * 移除技能效果
     * @param {string} id - 效果ID
     */
    removeSkillEffect(id) {
        const effect = this.skillEffects.get(id);
        if (!effect) return;
        
        // 如果有结束效果，执行它
        if (effect.onEnd) {
            effect.onEnd(effect.target);
        }
        
        // 从效果列表中移除
        this.skillEffects.delete(id);
    }
    
    /**
     * 获取技能冷却时间
     * @param {string} id - 技能ID
     * @returns {number} - 剩余冷却时间（毫秒）
     */
    getSkillCooldown(id) {
        const skill = this.skills.get(id);
        return skill ? skill.currentCooldown : 0;
    }
    
    /**
     * 获取技能冷却百分比
     * @param {string} id - 技能ID
     * @returns {number} - 冷却百分比（0-1）
     */
    getSkillCooldownPercent(id) {
        const skill = this.skills.get(id);
        if (!skill || skill.cooldown === 0) return 0;
        return skill.currentCooldown / skill.cooldown;
    }
    
    /**
     * 重置所有技能冷却
     */
    resetAllCooldowns() {
        this.skills.forEach(skill => {
            skill.currentCooldown = 0;
        });
    }
    
    /**
     * 创建技能效果
     * @param {Object} options - 效果选项
     * @returns {Object} - 技能效果对象
     */
    createSkillEffect(options) {
        return {
            duration: options.duration || 0,
            onStart: options.onStart || null,
            onUpdate: options.onUpdate || null,
            onEnd: options.onEnd || null
        };
    }
}

// 预定义技能效果
const SkillEffects = {
    /**
     * 伤害效果
     * @param {number} damage - 伤害值
     * @param {string} damageType - 伤害类型
     * @returns {Object} - 伤害效果对象
     */
    damage: (damage, damageType = 'physical') => {
        return {
            duration: 0,
            onStart: (target) => {
                if (target.takeDamage) {
                    target.takeDamage(damage, damageType);
                }
            }
        };
    },
    
    /**
     * 治疗效果
     * @param {number} heal - 治疗值
     * @returns {Object} - 治疗效果对象
     */
    heal: (heal) => {
        return {
            duration: 0,
            onStart: (target) => {
                if (target.heal) {
                    target.heal(heal);
                }
            }
        };
    },
    
    /**
     * 减速效果
     * @param {number} percent - 减速百分比（0-1）
     * @param {number} duration - 持续时间（毫秒）
     * @returns {Object} - 减速效果对象
     */
    slow: (percent, duration) => {
        return {
            duration,
            onStart: (target) => {
                if (target.speedModifiers) {
                    target.speedModifiers.push({
                        id: 'slow',
                        value: -percent
                    });
                    target.updateSpeed();
                }
            },
            onEnd: (target) => {
                if (target.speedModifiers) {
                    target.speedModifiers = target.speedModifiers.filter(m => m.id !== 'slow');
                    target.updateSpeed();
                }
            }
        };
    },
    
    /**
     * 击退效果
     * @param {number} force - 击退力
     * @param {Object} direction - 击退方向 {x, y}
     * @returns {Object} - 击退效果对象
     */
    knockback: (force, direction) => {
        return {
            duration: 0,
            onStart: (target) => {
                if (target.applyKnockback) {
                    target.applyKnockback(force, direction);
                }
            }
        };
    },
    
    /**
     * 无敌效果
     * @param {number} duration - 持续时间（毫秒）
     * @returns {Object} - 无敌效果对象
     */
    invulnerable: (duration) => {
        return {
            duration,
            onStart: (target) => {
                target.invulnerable = true;
            },
            onEnd: (target) => {
                target.invulnerable = false;
            }
        };
    }
};

// 使用示例
/*
const skillSystem = new SkillSystem();

// 注册技能
skillSystem.registerSkill('能量弹', {
    name: '能量冲击',
    cooldown: 5000, // 5秒冷却
    manaCost: 20,
    duration: 0,
    onUse: (user, target, options) => {
        // 创建能量冲击波
        const blast = {
            x: user.x,
            y: user.y,
            width: 20,
            height: 20,
            vx: options.direction.x * 10,
            vy: options.direction.y * 10,
            damage: 30,
            owner: user
        };
        
        // 添加到游戏对象列表
        gameObjects.push(blast);
        
        // 添加粒子效果
        particleSystem.createParticles(blast.x, blast.y, 'energy', 20);
    }
});

skillSystem.registerSkill('护盾', {
    name: '护盾',
    cooldown: 10000, // 10秒冷却
    manaCost: 30,
    duration: 5000, // 持续5秒
    onUse: (user, target, options) => {
        console.log(`${user.name} 使用了护盾`);
    },
    onStart: (user, target, options) => {
        // 添加护盾效果
        user.shield = true;
        user.shieldHealth = 50;
        
        // 添加护盾视觉效果
        user.addEffect('shield');
    },
    onUpdate: (user, target, options, elapsed) => {
        // 更新护盾视觉效果
        user.updateEffect('shield', elapsed);
    },
    onEnd: (user, target, options) => {
        // 移除护盾效果
        user.shield = false;
        user.shieldHealth = 0;
        
        // 移除护盾视觉效果
        user.removeEffect('shield');
    }
});

// 使用技能
function onKeyDown(event) {
    if (event.key === '1') {
        // 使用能量冲击
        const direction = {
            x: player.facingRight ? 1 : -1,
            y: 0
        };
        skillSystem.useSkill('能量弹', player, null, { direction });
    } else if (event.key === '2') {
        // 使用护盾
        skillSystem.useSkill('护盾', player, null);
    }
}

// 游戏循环中更新技能系统
function gameLoop() {
    const deltaTime = 16; // 假设60FPS
    
    // 更新技能系统
    skillSystem.update(deltaTime);
    
    // 更新游戏逻辑...
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
*/