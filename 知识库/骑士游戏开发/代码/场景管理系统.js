/**
 * 骑士游戏 - 场景管理系统示例
 * Knight Game - Scene Management System Example
 */

class SceneManager {
    constructor(game) {
        this.game = game;
        this.scenes = new Map();
        this.currentScene = null;
        this.previousScene = null;
        this.transition = null;
        this.globalData = new Map();
        this.sceneHistory = [];
        this.maxHistory = 10;
        this.sceneStack = [];
        this.isLoading = false;
        this.loadingProgress = 0;
        this.loadingScene = null;
        this.onSceneChange = null;
        this.onSceneLoad = null;
        this.onSceneUnload = null;
        this.onSceneTransitionStart = null;
        this.onSceneTransitionEnd = null;
        
        // 初始化场景管理器
        this.init();
    }
    
    /**
     * 初始化场景管理器
     */
    init() {
        // 创建加载场景
        this.createLoadingScene();
        
        // 创建全局数据
        this.initGlobalData();
    }
    
    /**
     * 初始化全局数据
     */
    initGlobalData() {
        // 玩家全局数据
        this.globalData.set('player', {
            level: 1,
            experience: 0,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            gold: 0,
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            skills: [],
            flags: new Map(),
            variables: new Map()
        });
        
        // 游戏全局数据
        this.globalData.set('game', {
            difficulty: 'normal',
            playTime: 0,
            saveCount: 0,
            achievements: [],
            settings: {
                soundVolume: 0.8,
                musicVolume: 0.6,
                brightness: 1.0,
                language: 'zh-CN'
            }
        });
        
        // 世界全局数据
        this.globalData.set('world', {
            time: 0,
            weather: 'sunny',
            visitedAreas: new Set(),
            unlockedAreas: new Set(),
            npcStates: new Map(),
            itemStates: new Map()
        });
    }
    
    /**
     * 创建加载场景
     */
    createLoadingScene() {
        const loadingScene = new Scene('loading', this);
        loadingScene.onLoad = () => {
            console.log('加载场景已加载');
        };
        
        loadingScene.onUpdate = (deltaTime) => {
            // 更新加载进度
            if (this.isLoading) {
                // 这里可以更新加载UI
            }
        };
        
        loadingScene.onRender = (ctx) => {
            // 渲染加载UI
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('加载中...', this.game.canvas.width / 2, this.game.canvas.height / 2 - 20);
            
            // 绘制进度条
            const progressBarWidth = 300;
            const progressBarHeight = 20;
            const progressBarX = (this.game.canvas.width - progressBarWidth) / 2;
            const progressBarY = this.game.canvas.height / 2 + 20;
            
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
            
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(progressBarX, progressBarY, progressBarWidth * this.loadingProgress, progressBarHeight);
        };
        
        this.addScene(loadingScene);
        this.loadingScene = loadingScene;
    }
    
    /**
     * 添加场景
     * @param {Scene} scene - 场景对象
     */
    addScene(scene) {
        this.scenes.set(scene.id, scene);
    }
    
    /**
     * 移除场景
     * @param {string} sceneId - 场景ID
     */
    removeScene(sceneId) {
        if (this.scenes.has(sceneId)) {
            const scene = this.scenes.get(sceneId);
            
            // 如果是当前场景，先卸载
            if (this.currentScene === scene) {
                this.unloadScene(scene);
            }
            
            // 从场景集合中移除
            this.scenes.delete(sceneId);
        }
    }
    
    /**
     * 获取场景
     * @param {string} sceneId - 场景ID
     * @returns {Scene} - 场景对象
     */
    getScene(sceneId) {
        return this.scenes.get(sceneId);
    }
    
    /**
     * 切换场景
     * @param {string} sceneId - 场景ID
     * @param {Object} data - 传递给场景的数据
     * @param {Object} options - 切换选项
     * @returns {Promise} - 切换完成的Promise
     */
    switchTo(sceneId, data = {}, options = {}) {
        return new Promise((resolve, reject) => {
            // 检查场景是否存在
            if (!this.scenes.has(sceneId)) {
                reject(new Error(`场景不存在: ${sceneId}`));
                return;
            }
            
            const scene = this.scenes.get(sceneId);
            
            // 如果已经在该场景，不做任何操作
            if (this.currentScene === scene) {
                resolve();
                return;
            }
            
            // 设置默认选项
            const defaultOptions = {
                transition: null,
                preserveCurrentScene: false,
                addToHistory: true,
                addToStack: false,
                loadingScreen: true
            };
            
            const mergedOptions = { ...defaultOptions, ...options };
            
            // 保存当前场景到历史记录
            if (this.currentScene && mergedOptions.addToHistory) {
                this.addToHistory(this.currentScene.id);
            }
            
            // 如果需要保留当前场景，添加到场景栈
            if (this.currentScene && mergedOptions.preserveCurrentScene) {
                this.sceneStack.push(this.currentScene);
            }
            
            // 如果需要添加到栈中
            if (mergedOptions.addToStack) {
                this.sceneStack.push(scene);
            }
            
            // 如果需要过渡效果
            if (mergedOptions.transition) {
                this.startTransition(mergedOptions.transition)
                    .then(() => {
                        // 过渡完成后切换场景
                        this.performSceneSwitch(scene, data, mergedOptions)
                            .then(() => {
                                // 切换完成后结束过渡
                                this.endTransition(mergedOptions.transition)
                                    .then(() => {
                                        resolve();
                                    });
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                // 直接切换场景
                this.performSceneSwitch(scene, data, mergedOptions)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
    
    /**
     * 执行场景切换
     * @param {Scene} scene - 目标场景
     * @param {Object} data - 传递给场景的数据
     * @param {Object} options - 切换选项
     * @returns {Promise} - 切换完成的Promise
     */
    performSceneSwitch(scene, data, options) {
        return new Promise((resolve, reject) => {
            // 如果需要加载屏幕
            if (options.loadingScreen && this.loadingScene) {
                // 显示加载屏幕
                this.isLoading = true;
                this.loadingProgress = 0;
                
                // 切换到加载场景
                this.internalSwitchTo(this.loadingScene, {})
                    .then(() => {
                        // 加载目标场景
                        this.loadScene(scene, data)
                            .then(() => {
                                // 加载完成后切换到目标场景
                                this.internalSwitchTo(scene, data)
                                    .then(() => {
                                        this.isLoading = false;
                                        resolve();
                                    })
                                    .catch(reject);
                            })
                            .catch(reject);
                    })
                    .catch(reject);
            } else {
                // 直接加载并切换场景
                this.loadScene(scene, data)
                    .then(() => {
                        this.internalSwitchTo(scene, data)
                            .then(() => resolve())
                            .catch(reject);
                    })
                    .catch(reject);
            }
        });
    }
    
    /**
     * 内部场景切换
     * @param {Scene} scene - 目标场景
     * @param {Object} data - 传递给场景的数据
     * @returns {Promise} - 切换完成的Promise
     */
    internalSwitchTo(scene, data) {
        return new Promise((resolve, reject) => {
            // 保存前一个场景
            this.previousScene = this.currentScene;
            
            // 如果有当前场景，先卸载
            if (this.currentScene) {
                this.unloadScene(this.currentScene)
                    .then(() => {
                        // 加载新场景
                        this.currentScene = scene;
                        
                        // 触发场景加载事件
                        if (this.onSceneChange) {
                            this.onSceneChange(this.previousScene, this.currentScene, data);
                        }
                        
                        // 初始化场景
                        this.currentScene.init(data);
                        
                        resolve();
                    })
                    .catch(reject);
            } else {
                // 没有当前场景，直接加载
                this.currentScene = scene;
                
                // 触发场景加载事件
                if (this.onSceneChange) {
                    this.onSceneChange(this.previousScene, this.currentScene, data);
                }
                
                // 初始化场景
                this.currentScene.init(data);
                
                resolve();
            }
        });
    }
    
    /**
     * 加载场景
     * @param {Scene} scene - 场景对象
     * @param {Object} data - 传递给场景的数据
     * @returns {Promise} - 加载完成的Promise
     */
    loadScene(scene, data) {
        return new Promise((resolve, reject) => {
            // 如果场景已经加载过，直接返回
            if (scene.loaded) {
                resolve();
                return;
            }
            
            // 触发场景加载开始事件
            if (this.onSceneLoad) {
                this.onSceneLoad(scene, data);
            }
            
            // 加载场景资源
            scene.load(data)
                .then(() => {
                    scene.loaded = true;
                    resolve();
                })
                .catch(reject);
        });
    }
    
    /**
     * 卸载场景
     * @param {Scene} scene - 场景对象
     * @returns {Promise} - 卸载完成的Promise
     */
    unloadScene(scene) {
        return new Promise((resolve, reject) => {
            // 触发场景卸载事件
            if (this.onSceneUnload) {
                this.onSceneUnload(scene);
            }
            
            // 卸载场景
            scene.unload()
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }
    
    /**
     * 返回到上一个场景
     * @param {Object} data - 传递给场景的数据
     * @returns {Promise} - 切换完成的Promise
     */
    goBack(data = {}) {
        if (this.sceneHistory.length > 0) {
            const previousSceneId = this.sceneHistory.pop();
            return this.switchTo(previousSceneId, data, { addToHistory: false });
        }
        
        return Promise.reject(new Error('没有历史场景可以返回'));
    }
    
    /**
     * 返回到场景栈中的上一个场景
     * @param {Object} data - 传递给场景的数据
     * @returns {Promise} - 切换完成的Promise
     */
    popScene(data = {}) {
        if (this.sceneStack.length > 0) {
            const previousScene = this.sceneStack.pop();
            return this.switchTo(previousScene.id, data, { addToHistory: false });
        }
        
        return Promise.reject(new Error('场景栈为空'));
    }
    
    /**
     * 添加到历史记录
     * @param {string} sceneId - 场景ID
     */
    addToHistory(sceneId) {
        // 如果已经在历史记录中，先移除
        const index = this.sceneHistory.indexOf(sceneId);
        if (index !== -1) {
            this.sceneHistory.splice(index, 1);
        }
        
        // 添加到历史记录
        this.sceneHistory.push(sceneId);
        
        // 如果超过最大历史记录数，移除最旧的
        if (this.sceneHistory.length > this.maxHistory) {
            this.sceneHistory.shift();
        }
    }
    
    /**
     * 开始过渡效果
     * @param {Object} transition - 过渡效果配置
     * @returns {Promise} - 过渡完成的Promise
     */
    startTransition(transition) {
        return new Promise((resolve, reject) => {
            // 创建过渡效果
            this.transition = {
                type: transition.type || 'fade',
                duration: transition.duration || 1000,
                startTime: Date.now(),
                progress: 0,
                onComplete: resolve
            };
            
            // 触发过渡开始事件
            if (this.onSceneTransitionStart) {
                this.onSceneTransitionStart(this.transition);
            }
        });
    }
    
    /**
     * 结束过渡效果
     * @param {Object} transition - 过渡效果配置
     * @returns {Promise} - 过渡完成的Promise
     */
    endTransition(transition) {
        return new Promise((resolve, reject) => {
            if (this.transition) {
                // 触发过渡结束事件
                if (this.onSceneTransitionEnd) {
                    this.onSceneTransitionEnd(this.transition);
                }
                
                // 清除过渡效果
                this.transition = null;
            }
            
            resolve();
        });
    }
    
    /**
     * 更新场景管理器
     * @param {number} deltaTime - 增量时间
     */
    update(deltaTime) {
        // 更新过渡效果
        if (this.transition) {
            const elapsed = Date.now() - this.transition.startTime;
            this.transition.progress = Math.min(elapsed / this.transition.duration, 1);
            
            if (this.transition.progress >= 1) {
                this.transition.onComplete();
            }
        }
        
        // 更新当前场景
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
        
        // 更新全局数据
        this.updateGlobalData(deltaTime);
    }
    
    /**
     * 更新全局数据
     * @param {number} deltaTime - 增量时间
     */
    updateGlobalData(deltaTime) {
        // 更新游戏时间
        const gameData = this.globalData.get('game');
        if (gameData) {
            gameData.playTime += deltaTime;
        }
        
        // 更新世界时间
        const worldData = this.globalData.get('world');
        if (worldData) {
            worldData.time += deltaTime;
        }
    }
    
    /**
     * 渲染场景管理器
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        // 渲染当前场景
        if (this.currentScene) {
            this.currentScene.render(ctx);
        }
        
        // 渲染过渡效果
        if (this.transition) {
            this.renderTransition(ctx);
        }
    }
    
    /**
     * 渲染过渡效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    renderTransition(ctx) {
        if (!this.transition) return;
        
        const { type, progress } = this.transition;
        
        switch (type) {
            case 'fade':
                this.renderFadeTransition(ctx, progress);
                break;
            case 'slide':
                this.renderSlideTransition(ctx, progress);
                break;
            case 'circle':
                this.renderCircleTransition(ctx, progress);
                break;
            case 'pixelate':
                this.renderPixelateTransition(ctx, progress);
                break;
        }
    }
    
    /**
     * 渲染淡入淡出过渡
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} progress - 进度（0-1）
     */
    renderFadeTransition(ctx, progress) {
        ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    }
    
    /**
     * 渲染滑动过渡
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} progress - 进度（0-1）
     */
    renderSlideTransition(ctx, progress) {
        const slideX = this.game.canvas.width * progress;
        
        // 保存当前画布状态
        ctx.save();
        
        // 绘制当前场景
        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(this.game.canvas, 0, 0);
        
        // 绘制新场景
        ctx.globalAlpha = progress;
        ctx.drawImage(this.game.canvas, slideX, 0);
        
        // 恢复画布状态
        ctx.restore();
    }
    
    /**
     * 渲染圆形过渡
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} progress - 进度（0-1）
     */
    renderCircleTransition(ctx, progress) {
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
        const radius = maxRadius * (1 - progress);
        
        // 保存当前画布状态
        ctx.save();
        
        // 绘制黑色背景
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // 设置裁剪区域
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        // 绘制新场景
        ctx.drawImage(this.game.canvas, 0, 0);
        
        // 恢复画布状态
        ctx.restore();
    }
    
    /**
     * 渲染像素化过渡
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} progress - 进度（0-1）
     */
    renderPixelateTransition(ctx, progress) {
        const pixelSize = Math.floor(50 * progress);
        
        // 保存当前画布状态
        ctx.save();
        
        // 禁用图像平滑
        ctx.imageSmoothingEnabled = false;
        
        // 缩小画布
        const scaledWidth = Math.ceil(this.game.canvas.width / pixelSize);
        const scaledHeight = Math.ceil(this.game.canvas.height / pixelSize);
        
        ctx.drawImage(
            this.game.canvas,
            0, 0, this.game.canvas.width, this.game.canvas.height,
            0, 0, scaledWidth, scaledHeight
        );
        
        // 放大画布
        ctx.drawImage(
            this.game.canvas,
            0, 0, scaledWidth, scaledHeight,
            0, 0, this.game.canvas.width, this.game.canvas.height
        );
        
        // 恢复画布状态
        ctx.restore();
    }
    
    /**
     * 设置场景变化回调
     * @param {Function} callback - 回调函数
     */
    setOnSceneChange(callback) {
        this.onSceneChange = callback;
    }
    
    /**
     * 设置场景加载回调
     * @param {Function} callback - 回调函数
     */
    setOnSceneLoad(callback) {
        this.onSceneLoad = callback;
    }
    
    /**
     * 设置场景卸载回调
     * @param {Function} callback - 回调函数
     */
    setOnSceneUnload(callback) {
        this.onSceneUnload = callback;
    }
    
    /**
     * 设置场景过渡开始回调
     * @param {Function} callback - 回调函数
     */
    setOnSceneTransitionStart(callback) {
        this.onSceneTransitionStart = callback;
    }
    
    /**
     * 设置场景过渡结束回调
     * @param {Function} callback - 回调函数
     */
    setOnSceneTransitionEnd(callback) {
        this.onSceneTransitionEnd = callback;
    }
    
    /**
     * 获取全局数据
     * @param {string} key - 数据键
     * @returns {*} - 数据值
     */
    getGlobalData(key) {
        return this.globalData.get(key);
    }
    
    /**
     * 设置全局数据
     * @param {string} key - 数据键
     * @param {*} value - 数据值
     */
    setGlobalData(key, value) {
        this.globalData.set(key, value);
    }
    
    /**
     * 获取当前场景
     * @returns {Scene} - 当前场景
     */
    getCurrentScene() {
        return this.currentScene;
    }
    
    /**
     * 获取前一个场景
     * @returns {Scene} - 前一个场景
     */
    getPreviousScene() {
        return this.previousScene;
    }
    
    /**
     * 获取场景历史
     * @returns {Array} - 场景历史
     */
    getSceneHistory() {
        return [...this.sceneHistory];
    }
    
    /**
     * 获取场景栈
     * @returns {Array} - 场景栈
     */
    getSceneStack() {
        return [...this.sceneStack];
    }
    
    /**
     * 清空场景历史
     */
    clearHistory() {
        this.sceneHistory = [];
    }
    
    /**
     * 清空场景栈
     */
    clearStack() {
        this.sceneStack = [];
    }
    
    /**
     * 设置加载进度
     * @param {number} progress - 进度（0-1）
     */
    setLoadingProgress(progress) {
        this.loadingProgress = Math.max(0, Math.min(1, progress));
    }
}

/**
 * 场景类
 */
class Scene {
    constructor(id, sceneManager) {
        this.id = id;
        this.sceneManager = sceneManager;
        this.game = sceneManager.game;
        this.loaded = false;
        this.entities = new Map();
        this.layers = [];
        this.cameras = [];
        this.lights = [];
        this.particles = [];
        this.ui = [];
        this.data = {};
        this.onLoad = null;
        this.onUnload = null;
        this.onInit = null;
        this.onUpdate = null;
        this.onRender = null;
        this.onPause = null;
        this.onResume = null;
        this.paused = false;
        this.visible = true;
        this.active = true;
    }
    
    /**
     * 初始化场景
     * @param {Object} data - 场景数据
     */
    init(data) {
        this.data = data || {};
        
        // 触发初始化事件
        if (this.onInit) {
            this.onInit(data);
        }
    }
    
    /**
     * 加载场景
     * @param {Object} data - 场景数据
     * @returns {Promise} - 加载完成的Promise
     */
    load(data) {
        return new Promise((resolve, reject) => {
            // 触发加载事件
            if (this.onLoad) {
                this.onLoad(data);
            }
            
            // 加载场景资源
            this.loadResources(data)
                .then(() => {
                    // 创建场景实体
                    this.createEntities(data);
                    
                    // 创建场景UI
                    this.createUI(data);
                    
                    resolve();
                })
                .catch(reject);
        });
    }
    
    /**
     * 加载场景资源
     * @param {Object} data - 场景数据
     * @returns {Promise} - 加载完成的Promise
     */
    loadResources(data) {
        return new Promise((resolve, reject) => {
            // 这里可以加载场景所需的资源
            // 例如：图片、音频、JSON数据等
            
            // 模拟资源加载
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }
    
    /**
     * 创建场景实体
     * @param {Object} data - 场景数据
     */
    createEntities(data) {
        // 这里可以创建场景中的实体
        // 例如：玩家、敌人、NPC、物品等
    }
    
    /**
     * 创建场景UI
     * @param {Object} data - 场景数据
     */
    createUI(data) {
        // 这里可以创建场景中的UI元素
        // 例如：按钮、文本、图像等
    }
    
    /**
     * 卸载场景
     * @returns {Promise} - 卸载完成的Promise
     */
    unload() {
        return new Promise((resolve, reject) => {
            // 触发卸载事件
            if (this.onUnload) {
                this.onUnload();
            }
            
            // 清理场景实体
            this.entities.clear();
            
            // 清理场景层
            this.layers = [];
            
            // 清理场景相机
            this.cameras = [];
            
            // 清理场景灯光
            this.lights = [];
            
            // 清理场景粒子
            this.particles = [];
            
            // 清理场景UI
            this.ui = [];
            
            // 清理场景数据
            this.data = {};
            
            resolve();
        });
    }
    
    /**
     * 更新场景
     * @param {number} deltaTime - 增量时间
     */
    update(deltaTime) {
        // 如果场景暂停，不更新
        if (this.paused) return;
        
        // 更新实体
        this.entities.forEach(entity => {
            if (entity.active) {
                entity.update(deltaTime);
            }
        });
        
        // 更新粒子
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.alive;
        });
        
        // 更新UI
        this.ui.forEach(element => {
            if (element.active) {
                element.update(deltaTime);
            }
        });
        
        // 触发更新事件
        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
    }
    
    /**
     * 渲染场景
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        // 如果场景不可见，不渲染
        if (!this.visible) return;
        
        // 保存当前画布状态
        ctx.save();
        
        // 应用相机变换
        if (this.cameras.length > 0) {
            const camera = this.cameras[0]; // 使用第一个相机
            camera.apply(ctx);
        }
        
        // 渲染层
        this.layers.forEach(layer => {
            if (layer.visible) {
                layer.render(ctx);
            }
        });
        
        // 渲染实体
        this.entities.forEach(entity => {
            if (entity.visible) {
                entity.render(ctx);
            }
        });
        
        // 渲染粒子
        this.particles.forEach(particle => {
            if (particle.visible) {
                particle.render(ctx);
            }
        });
        
        // 恢复画布状态
        ctx.restore();
        
        // 渲染UI（不受相机影响）
        this.ui.forEach(element => {
            if (element.visible) {
                element.render(ctx);
            }
        });
        
        // 触发渲染事件
        if (this.onRender) {
            this.onRender(ctx);
        }
    }
    
    /**
     * 暂停场景
     */
    pause() {
        this.paused = true;
        
        // 触发暂停事件
        if (this.onPause) {
            this.onPause();
        }
    }
    
    /**
     * 恢复场景
     */
    resume() {
        this.paused = false;
        
        // 触发恢复事件
        if (this.onResume) {
            this.onResume();
        }
    }
    
    /**
     * 添加实体
     * @param {Entity} entity - 实体对象
     */
    addEntity(entity) {
        this.entities.set(entity.id, entity);
    }
    
    /**
     * 移除实体
     * @param {string} entityId - 实体ID
     */
    removeEntity(entityId) {
        this.entities.delete(entityId);
    }
    
    /**
     * 获取实体
     * @param {string} entityId - 实体ID
     * @returns {Entity} - 实体对象
     */
    getEntity(entityId) {
        return this.entities.get(entityId);
    }
    
    /**
     * 添加层
     * @param {Layer} layer - 层对象
     */
    addLayer(layer) {
        this.layers.push(layer);
    }
    
    /**
     * 移除层
     * @param {number} index - 层索引
     */
    removeLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            this.layers.splice(index, 1);
        }
    }
    
    /**
     * 添加相机
     * @param {Camera} camera - 相机对象
     */
    addCamera(camera) {
        this.cameras.push(camera);
    }
    
    /**
     * 移除相机
     * @param {number} index - 相机索引
     */
    removeCamera(index) {
        if (index >= 0 && index < this.cameras.length) {
            this.cameras.splice(index, 1);
        }
    }
    
    /**
     * 添加灯光
     * @param {Light} light - 灯光对象
     */
    addLight(light) {
        this.lights.push(light);
    }
    
    /**
     * 移除灯光
     * @param {number} index - 灯光索引
     */
    removeLight(index) {
        if (index >= 0 && index < this.lights.length) {
            this.lights.splice(index, 1);
        }
    }
    
    /**
     * 添加粒子
     * @param {Particle} particle - 粒子对象
     */
    addParticle(particle) {
        this.particles.push(particle);
    }
    
    /**
     * 添加UI元素
     * @param {UIElement} element - UI元素对象
     */
    addUIElement(element) {
        this.ui.push(element);
    }
    
    /**
     * 移除UI元素
     * @param {number} index - UI元素索引
     */
    removeUIElement(index) {
        if (index >= 0 && index < this.ui.length) {
            this.ui.splice(index, 1);
        }
    }
}

// 使用示例
/*
// 创建场景管理器
const sceneManager = new SceneManager(game);

// 设置场景变化回调
sceneManager.setOnSceneChange((previousScene, currentScene, data) => {
    console.log(`场景从 ${previousScene ? previousScene.id : 'null'} 切换到 ${currentScene.id}`);
});

// 设置场景加载回调
sceneManager.setOnSceneLoad((scene, data) => {
    console.log(`场景 ${scene.id} 开始加载`);
});

// 设置场景卸载回调
sceneManager.setOnSceneUnload((scene) => {
    console.log(`场景 ${scene.id} 开始卸载`);
});

// 设置场景过渡开始回调
sceneManager.setOnSceneTransitionStart((transition) => {
    console.log(`场景过渡开始: ${transition.type}`);
});

// 设置场景过渡结束回调
sceneManager.setOnSceneTransitionEnd((transition) => {
    console.log(`场景过渡结束: ${transition.type}`);
});

// 创建主菜单场景
const mainMenuScene = new Scene('main-menu', sceneManager);
mainMenuScene.onLoad = (data) => {
    console.log('主菜单场景加载');
    
    // 加载主菜单资源
    // ...
};

mainMenuScene.onInit = (data) => {
    console.log('主菜单场景初始化');
    
    // 创建主菜单UI
    const startButton = new UIButton('开始游戏', 200, 200, 200, 50);
    startButton.onClick = () => {
        sceneManager.switchTo('game', { level: 1 }, { transition: { type: 'fade', duration: 1000 } });
    };
    
    const optionsButton = new UIButton('选项', 200, 270, 200, 50);
    optionsButton.onClick = () => {
        sceneManager.switchTo('options', {}, { transition: { type: 'slide', duration: 500 } });
    };
    
    const exitButton = new UIButton('退出', 200, 340, 200, 50);
    exitButton.onClick = () => {
        // 退出游戏
        game.exit();
    };
    
    mainMenuScene.addUIElement(startButton);
    mainMenuScene.addUIElement(optionsButton);
    mainMenuScene.addUIElement(exitButton);
};

mainMenuScene.onUpdate = (deltaTime) => {
    // 更新主菜单
};

mainMenuScene.onRender = (ctx) => {
    // 渲染主菜单背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // 渲染标题
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('骑士游戏', game.canvas.width / 2, 100);
};

// 创建游戏场景
const gameScene = new Scene('game', sceneManager);
gameScene.onLoad = (data) => {
    console.log('游戏场景加载');
    
    // 加载游戏资源
    // ...
};

gameScene.onInit = (data) => {
    console.log('游戏场景初始化');
    
    // 创建玩家
    const player = new Player('player', 100, 100);
    gameScene.addEntity(player);
    
    // 创建敌人
    const enemy = new Enemy('enemy', 300, 300);
    gameScene.addEntity(enemy);
    
    // 创建游戏UI
    const healthBar = new UIProgressBar(10, 10, 200, 20, player.health, player.maxHealth);
    gameScene.addUIElement(healthBar);
    
    const pauseButton = new UIButton('暂停', game.canvas.width - 110, 10, 100, 40);
    pauseButton.onClick = () => {
        sceneManager.switchTo('pause', {}, { preserveCurrentScene: true, transition: { type: 'fade', duration: 300 } });
    };
    gameScene.addUIElement(pauseButton);
};

gameScene.onUpdate = (deltaTime) => {
    // 更新游戏逻辑
};

gameScene.onRender = (ctx) => {
    // 渲染游戏背景
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
};

// 创建暂停场景
const pauseScene = new Scene('pause', sceneManager);
pauseScene.onInit = (data) => {
    console.log('暂停场景初始化');
    
    // 创建暂停菜单UI
    const resumeButton = new UIButton('继续游戏', 200, 200, 200, 50);
    resumeButton.onClick = () => {
        sceneManager.popScene();
    };
    
    const optionsButton = new UIButton('选项', 200, 270, 200, 50);
    optionsButton.onClick = () => {
        sceneManager.switchTo('options', {}, { addToStack: true, transition: { type: 'slide', duration: 500 } });
    };
    
    const mainMenuButton = new UIButton('主菜单', 200, 340, 200, 50);
    mainMenuButton.onClick = () => {
        sceneManager.switchTo('main-menu', {}, { transition: { type: 'fade', duration: 1000 } });
    };
    
    pauseScene.addUIElement(resumeButton);
    pauseScene.addUIElement(optionsButton);
    pauseScene.addUIElement(mainMenuButton);
};

pauseScene.onRender = (ctx) => {
    // 渲染半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // 渲染标题
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', game.canvas.width / 2, 100);
};

// 创建选项场景
const optionsScene = new Scene('options', sceneManager);
optionsScene.onInit = (data) => {
    console.log('选项场景初始化');
    
    // 创建选项UI
    const backButton = new UIButton('返回', 200, 400, 200, 50);
    backButton.onClick = () => {
        sceneManager.goBack();
    };
    
    optionsScene.addUIElement(backButton);
};

optionsScene.onRender = (ctx) => {
    // 渲染选项背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // 渲染标题
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选项', game.canvas.width / 2, 100);
};

// 添加场景到场景管理器
sceneManager.addScene(mainMenuScene);
sceneManager.addScene(gameScene);
sceneManager.addScene(pauseScene);
sceneManager.addScene(optionsScene);

// 切换到主菜单场景
sceneManager.switchTo('main-menu')
    .then(() => {
        console.log('主菜单场景加载完成');
    })
    .catch(error => {
        console.error('场景切换失败:', error);
    });

// 游戏循环
function gameLoop() {
    // 更新场景管理器
    sceneManager.update(deltaTime);
    
    // 渲染场景管理器
    sceneManager.render(ctx);
    
    requestAnimationFrame(gameLoop);
}

// 启动游戏循环
gameLoop();
*/