/**
 * 骑士游戏 - 碰撞检测系统示例
 * Knight Game - Collision Detection System Example
 */

class CollisionSystem {
    constructor() {
        this.collisionPairs = new Map(); // 存储碰撞对
        this.collisionCallbacks = new Map(); // 存储碰撞回调函数
    }
    
    /**
     * 检查两个矩形是否碰撞
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @returns {boolean} - 是否碰撞
     */
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * 检查两个圆形是否碰撞
     * @param {Object} circle1 - 第一个圆形 {x, y, radius}
     * @param {Object} circle2 - 第二个圆形 {x, y, radius}
     * @returns {boolean} - 是否碰撞
     */
    checkCircleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }
    
    /**
     * 检查矩形和圆形是否碰撞
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @param {Object} circle - 圆形 {x, y, radius}
     * @returns {boolean} - 是否碰撞
     */
    checkRectCircleCollision(rect, circle) {
        // 找到矩形上距离圆心最近的点
        let closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        let closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        // 计算该点到圆心的距离
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果距离小于圆的半径，则碰撞
        return distance < circle.radius;
    }
    
    /**
     * 获取两个矩形碰撞的深度和方向
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @returns {Object} - 碰撞信息 {depth, direction}
     */
    getRectCollisionInfo(rect1, rect2) {
        // 计算两个矩形在x和y轴上的重叠量
        const overlapX = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x);
        const overlapY = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y);
        
        // 确定碰撞方向
        let direction;
        if (overlapX < overlapY) {
            // 水平碰撞
            direction = rect1.x < rect2.x ? 'right' : 'left';
        } else {
            // 垂直碰撞
            direction = rect1.y < rect2.y ? 'bottom' : 'top';
        }
        
        // 返回碰撞深度和方向
        return {
            depth: Math.min(overlapX, overlapY),
            direction: direction
        };
    }
    
    /**
     * 解决矩形碰撞
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @param {Object} collisionInfo - 碰撞信息 {depth, direction}
     */
    resolveRectCollision(rect1, rect2, collisionInfo) {
        switch (collisionInfo.direction) {
            case 'right':
                rect1.x -= collisionInfo.depth;
                break;
            case 'left':
                rect1.x += collisionInfo.depth;
                break;
            case 'bottom':
                rect1.y -= collisionInfo.depth;
                break;
            case 'top':
                rect1.y += collisionInfo.depth;
                break;
        }
    }
    
    /**
     * 注册碰撞回调函数
     * @param {string} type1 - 第一个对象类型
     * @param {string} type2 - 第二个对象类型
     * @param {Function} callback - 碰撞回调函数
     */
    registerCollisionCallback(type1, type2, callback) {
        const key = `${type1}_${type2}`;
        this.collisionCallbacks.set(key, callback);
    }
    
    /**
     * 检测并处理所有碰撞
     * @param {Array} objects - 游戏对象数组
     */
    detectAndResolveCollisions(objects) {
        // 清空之前的碰撞对
        this.collisionPairs.clear();
        
        // 检测所有可能的碰撞
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const obj1 = objects[i];
                const obj2 = objects[j];
                
                // 跳过不活动的对象
                if (!obj1.active || !obj2.active) continue;
                
                // 根据对象形状选择碰撞检测方法
                let isColliding = false;
                
                if (obj1.shape === 'rect' && obj2.shape === 'rect') {
                    isColliding = this.checkRectCollision(obj1, obj2);
                } else if (obj1.shape === 'circle' && obj2.shape === 'circle') {
                    isColliding = this.checkCircleCollision(obj1, obj2);
                } else if (obj1.shape === 'rect' && obj2.shape === 'circle') {
                    isColliding = this.checkRectCircleCollision(obj1, obj2);
                } else if (obj1.shape === 'circle' && obj2.shape === 'rect') {
                    isColliding = this.checkRectCircleCollision(obj2, obj1);
                }
                
                // 如果发生碰撞，记录碰撞对并处理
                if (isColliding) {
                    const key = `${obj1.type}_${obj2.type}`;
                    const reverseKey = `${obj2.type}_${obj1.type}`;
                    
                    // 记录碰撞对
                    this.collisionPairs.set(key, { obj1, obj2 });
                    
                    // 调用碰撞回调函数
                    if (this.collisionCallbacks.has(key)) {
                        this.collisionCallbacks.get(key)(obj1, obj2);
                    } else if (this.collisionCallbacks.has(reverseKey)) {
                        this.collisionCallbacks.get(reverseKey)(obj2, obj1);
                    }
                    
                    // 如果需要解决碰撞
                    if (obj1.resolveCollision || obj2.resolveCollision) {
                        if (obj1.shape === 'rect' && obj2.shape === 'rect') {
                            const collisionInfo = this.getRectCollisionInfo(obj1, obj2);
                            
                            if (obj1.resolveCollision) {
                                this.resolveRectCollision(obj1, obj2, collisionInfo);
                            }
                            
                            if (obj2.resolveCollision) {
                                // 反向碰撞信息
                                const reverseCollisionInfo = {
                                    depth: collisionInfo.depth,
                                    direction: this.getOppositeDirection(collisionInfo.direction)
                                };
                                this.resolveRectCollision(obj2, obj1, reverseCollisionInfo);
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * 获取相反方向
     * @param {string} direction - 原始方向
     * @returns {string} - 相反方向
     */
    getOppositeDirection(direction) {
        switch (direction) {
            case 'left': return 'right';
            case 'right': return 'left';
            case 'top': return 'bottom';
            case 'bottom': return 'top';
            default: return direction;
        }
    }
    
    /**
     * 射线检测
     * @param {Object} ray - 射线 {x, y, dx, dy}
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @returns {Object|null} - 碰撞信息 {distance, point, normal} 或 null
     */
    rayRectCollision(ray, rect) {
        // 射线起点
        const startX = ray.x;
        const startY = ray.y;
        
        // 射线方向
        const dirX = ray.dx;
        const dirY = ray.dy;
        
        // 矩形边界
        const left = rect.x;
        const right = rect.x + rect.width;
        const top = rect.y;
        const bottom = rect.y + rect.height;
        
        // 计算射线与矩形四条边的交点
        const tMin = 0;
        let tMax = Infinity;
        
        // X轴方向
        if (Math.abs(dirX) < 1e-6) {
            // 射线平行于Y轴
            if (startX < left || startX > right) {
                return null; // 射线在矩形外
            }
        } else {
            const t1 = (left - startX) / dirX;
            const t2 = (right - startX) / dirX;
            
            const tMinX = Math.min(t1, t2);
            const tMaxX = Math.max(t1, t2);
            
            if (tMaxX < tMin) return null;
            
            tMin = Math.max(tMin, tMinX);
            tMax = Math.min(tMax, tMaxX);
            
            if (tMin > tMax) return null;
        }
        
        // Y轴方向
        if (Math.abs(dirY) < 1e-6) {
            // 射线平行于X轴
            if (startY < top || startY > bottom) {
                return null; // 射线在矩形外
            }
        } else {
            const t1 = (top - startY) / dirY;
            const t2 = (bottom - startY) / dirY;
            
            const tMinY = Math.min(t1, t2);
            const tMaxY = Math.max(t1, t2);
            
            if (tMaxY < tMin) return null;
            
            tMin = Math.max(tMin, tMinY);
            tMax = Math.min(tMax, tMaxY);
            
            if (tMin > tMax) return null;
        }
        
        // 计算碰撞点
        const hitX = startX + tMin * dirX;
        const hitY = startY + tMin * dirY;
        
        // 计算法线
        let normalX = 0;
        let normalY = 0;
        
        if (Math.abs(hitX - left) < 1e-6) normalX = -1;
        else if (Math.abs(hitX - right) < 1e-6) normalX = 1;
        else if (Math.abs(hitY - top) < 1e-6) normalY = -1;
        else if (Math.abs(hitY - bottom) < 1e-6) normalY = 1;
        
        return {
            distance: tMin,
            point: { x: hitX, y: hitY },
            normal: { x: normalX, y: normalY }
        };
    }
}

// 使用示例
/*
const collisionSystem = new CollisionSystem();

// 注册碰撞回调
collisionSystem.registerCollisionCallback('player', 'enemy', (player, enemy) => {
    console.log('玩家与敌人碰撞');
    player.health -= 10;
});

// 创建游戏对象
const player = {
    type: 'player',
    shape: 'rect',
    x: 100,
    y: 100,
    width: 32,
    height: 48,
    active: true,
    resolveCollision: true,
    health: 100
};

const enemy = {
    type: 'enemy',
    shape: 'rect',
    x: 150,
    y: 100,
    width: 30,
    height: 30,
    active: true,
    resolveCollision: true
};

// 检测并处理碰撞
collisionSystem.detectAndResolveCollisions([player, enemy]);
*/