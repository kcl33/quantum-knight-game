/**
 * 骑士游戏 - 游戏状态管理系统示例
 * Knight Game - Game State Management System Example
 */

class GameStateManager {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
        this.globalState = {
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                soundVolume: 0.7,
                musicVolume: 0.5,
                difficulty: 'normal', // easy, normal, hard
                language: 'zh-CN'
            },
            playerData: {
                level: 1,
                experience: 0,
                experienceToNextLevel: 100,
                health: 100,
                maxHealth: 100,
                mana: 50,
                maxMana: 50,
                coins: 0,
                inventory: [],
                equipment: {
                    weapon: null,
                    armor: null,
                    accessory: null
                },
                skills: [],
                unlockedLevels: [1],
                currentLevel: 1,
                highScores: []
            },
            gameProgress: {
                currentLevel: 1,
                unlockedLevels: [1],
                completedLevels: [],
                bossDefeated: [],
                itemsCollected: [],
                secretsFound: [],
                playTime: 0,
                deaths: 0,
                enemiesDefeated: 0
            }
        };
        this.stateHistory = [];
        this.maxHistoryLength = 10;
        this.observers = [];
        this.transitionCallbacks = {
            onEnter: new Map(),
            onExit: new Map(),
            onUpdate: new Map()
        };
        
        // 初始化状态
        this.initStates();
    }
    
    /**
     * 初始化游戏状态
     */
    initStates() {
        // 主菜单状态
        this.addState('mainMenu', {
            init: () => {
                console.log('进入主菜单');
                // 加载主菜单资源
                // 显示主菜单UI
            },
            update: (deltaTime) => {
                // 更新主菜单动画
            },
            render: (ctx) => {
                // 渲染主菜单
            },
            exit: () => {
                console.log('离开主菜单');
                // 清理主菜单资源
            }
        });
        
        // 游戏状态
        this.addState('playing', {
            init: () => {
                console.log('开始游戏');
                // 初始化游戏世界
                // 创建玩家
                // 加载关卡
            },
            update: (deltaTime) => {
                // 更新游戏逻辑
                // 更新玩家
                // 更新敌人
                // 更新物理系统
            },
            render: (ctx) => {
                // 渲染游戏世界
                // 渲染玩家
                // 渲染敌人
                // 渲染UI
            },
            exit: () => {
                console.log('暂停游戏');
                // 保存游戏状态
            }
        });
        
        // 暂停状态
        this.addState('paused', {
            init: () => {
                console.log('游戏暂停');
                // 显示暂停菜单
            },
            update: (deltaTime) => {
                // 更新暂停菜单
            },
            render: (ctx) => {
                // 渲染暂停菜单
            },
            exit: () => {
                console.log('继续游戏');
                // 隐藏暂停菜单
            }
        });
        
        // 游戏结束状态
        this.addState('gameOver', {
            init: () => {
                console.log('游戏结束');
                // 显示游戏结束画面
                // 更新最高分
            },
            update: (deltaTime) => {
                // 更新游戏结束画面
            },
            render: (ctx) => {
                // 渲染游戏结束画面
            },
            exit: () => {
                console.log('离开游戏结束画面');
                // 清理游戏结束资源
            }
        });
        
        // 设置状态
        this.addState('settings', {
            init: () => {
                console.log('进入设置');
                // 加载设置界面
            },
            update: (deltaTime) => {
                // 更新设置界面
            },
            render: (ctx) => {
                // 渲染设置界面
            },
            exit: () => {
                console.log('离开设置');
                // 保存设置
                // 清理设置界面
            }
        });
        
        // 关卡选择状态
        this.addState('levelSelect', {
            init: () => {
                console.log('进入关卡选择');
                // 加载关卡选择界面
            },
            update: (deltaTime) => {
                // 更新关卡选择界面
            },
            render: (ctx) => {
                // 渲染关卡选择界面
            },
            exit: () => {
                console.log('离开关卡选择');
                // 清理关卡选择界面
            }
        });
        
        // 加载状态
        this.addState('loading', {
            init: (data) => {
                console.log('加载中...');
                // 显示加载画面
                // 开始加载资源
                this.loadResources(data);
            },
            update: (deltaTime) => {
                // 更新加载进度
            },
            render: (ctx) => {
                // 渲染加载画面
            },
            exit: () => {
                console.log('加载完成');
                // 隐藏加载画面
            }
        });
        
        // 胜利状态
        this.addState('victory', {
            init: () => {
                console.log('胜利！');
                // 显示胜利画面
                // 计算得分
                // 保存进度
            },
            update: (deltaTime) => {
                // 更新胜利画面
            },
            render: (ctx) => {
                // 渲染胜利画面
            },
            exit: () => {
                console.log('离开胜利画面');
                // 清理胜利画面
            }
        });
        
        // 初始状态为主菜单
        this.changeState('mainMenu');
    }
    
    /**
     * 添加游戏状态
     * @param {string} name - 状态名称
     * @param {Object} state - 状态对象
     */
    addState(name, state) {
        this.states.set(name, {
            name,
            init: state.init || (() => {}),
            update: state.update || (() => {}),
            render: state.render || (() => {}),
            exit: state.exit || (() => {}),
            data: {}
        });
    }
    
    /**
     * 切换游戏状态
     * @param {string} stateName - 状态名称
     * @param {Object} data - 传递给新状态的数据
     */
    changeState(stateName, data = {}) {
        if (!this.states.has(stateName)) {
            console.error(`状态 ${stateName} 不存在`);
            return;
        }
        
        const newState = this.states.get(stateName);
        
        // 如果当前状态存在，执行退出回调
        if (this.currentState) {
            const exitCallback = this.transitionCallbacks.onExit.get(this.currentState.name);
            if (exitCallback) {
                exitCallback(this.currentState);
            }
            
            // 执行状态退出方法
            this.currentState.exit();
            
            // 保存历史状态
            this.stateHistory.push({
                name: this.currentState.name,
                data: this.currentState.data
            });
            
            // 限制历史长度
            if (this.stateHistory.length > this.maxHistoryLength) {
                this.stateHistory.shift();
            }
        }
        
        // 保存前一个状态
        this.previousState = this.currentState;
        
        // 设置新状态
        this.currentState = newState;
        this.currentState.data = data;
        
        // 执行进入回调
        const enterCallback = this.transitionCallbacks.onEnter.get(stateName);
        if (enterCallback) {
            enterCallback(this.currentState);
        }
        
        // 执行状态初始化方法
        this.currentState.init(data);
        
        // 通知观察者
        this.notifyObservers('stateChanged', {
            previousState: this.previousState ? this.previousState.name : null,
            currentState: stateName,
            data
        });
    }
    
    /**
     * 更新当前状态
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        if (this.currentState) {
            // 执行更新回调
            const updateCallback = this.transitionCallbacks.onUpdate.get(this.currentState.name);
            if (updateCallback) {
                updateCallback(this.currentState, deltaTime);
            }
            
            // 执行状态更新方法
            this.currentState.update(deltaTime);
        }
    }
    
    /**
     * 渲染当前状态
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    render(ctx) {
        if (this.currentState) {
            this.currentState.render(ctx);
        }
    }
    
    /**
     * 回到上一个状态
     */
    revertToPreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState.name, this.previousState.data);
        }
    }
    
    /**
     * 添加状态转换回调
     * @param {string} stateName - 状态名称
     * @param {string} callbackType - 回调类型（onEnter, onExit, onUpdate）
     * @param {Function} callback - 回调函数
     */
    addTransitionCallback(stateName, callbackType, callback) {
        if (!this.transitionCallbacks[callbackType]) {
            console.error(`回调类型 ${callbackType} 不存在`);
            return;
        }
        
        if (!this.states.has(stateName)) {
            console.error(`状态 ${stateName} 不存在`);
            return;
        }
        
        this.transitionCallbacks[callbackType].set(stateName, callback);
    }
    
    /**
     * 移除状态转换回调
     * @param {string} stateName - 状态名称
     * @param {string} callbackType - 回调类型（onEnter, onExit, onUpdate）
     */
    removeTransitionCallback(stateName, callbackType) {
        if (!this.transitionCallbacks[callbackType]) {
            console.error(`回调类型 ${callbackType} 不存在`);
            return;
        }
        
        this.transitionCallbacks[callbackType].delete(stateName);
    }
    
    /**
     * 添加观察者
     * @param {Function} observer - 观察者函数
     */
    addObserver(observer) {
        this.observers.push(observer);
    }
    
    /**
     * 移除观察者
     * @param {Function} observer - 观察者函数
     */
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    
    /**
     * 通知观察者
     * @param {string} event - 事件名称
     * @param {Object} data - 事件数据
     */
    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            observer(event, data);
        });
    }
    
    /**
     * 保存游戏状态
     * @param {string} slot - 存档槽位
     */
    saveGame(slot = 'default') {
        const saveData = {
            globalState: this.globalState,
            currentState: this.currentState ? this.currentState.name : null,
            stateData: this.currentState ? this.currentState.data : {},
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(`knightGameSave_${slot}`, JSON.stringify(saveData));
            console.log(`游戏已保存到槽位 ${slot}`);
            return true;
        } catch (e) {
            console.error('保存游戏失败:', e);
            return false;
        }
    }
    
    /**
     * 加载游戏状态
     * @param {string} slot - 存档槽位
     */
    loadGame(slot = 'default') {
        try {
            const saveDataJson = localStorage.getItem(`knightGameSave_${slot}`);
            if (!saveDataJson) {
                console.error(`找不到槽位 ${slot} 的存档`);
                return false;
            }
            
            const saveData = JSON.parse(saveDataJson);
            
            // 恢复全局状态
            this.globalState = saveData.globalState;
            
            // 恢复当前状态
            if (saveData.currentState) {
                this.changeState(saveData.currentState, saveData.stateData);
            }
            
            console.log(`已从槽位 ${slot} 加载游戏`);
            return true;
        } catch (e) {
            console.error('加载游戏失败:', e);
            return false;
        }
    }
    
    /**
     * 删除存档
     * @param {string} slot - 存档槽位
     */
    deleteSave(slot = 'default') {
        try {
            localStorage.removeItem(`knightGameSave_${slot}`);
            console.log(`已删除槽位 ${slot} 的存档`);
            return true;
        } catch (e) {
            console.error('删除存档失败:', e);
            return false;
        }
    }
    
    /**
     * 获取所有存档信息
     * @returns {Array} - 存档信息数组
     */
    getSaveSlots() {
        const slots = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('knightGameSave_')) {
                const slot = key.replace('knightGameSave_', '');
                try {
                    const saveDataJson = localStorage.getItem(key);
                    const saveData = JSON.parse(saveDataJson);
                    
                    slots.push({
                        slot,
                        timestamp: saveData.timestamp,
                        level: saveData.globalState.playerData.level,
                        currentLevel: saveData.globalState.gameProgress.currentLevel,
                        playTime: saveData.globalState.gameProgress.playTime
                    });
                } catch (e) {
                    console.error(`解析存档 ${slot} 失败:`, e);
                }
            }
        }
        
        return slots.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * 重置游戏
     */
    resetGame() {
        // 重置全局状态
        this.globalState = {
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                soundVolume: 0.7,
                musicVolume: 0.5,
                difficulty: 'normal',
                language: 'zh-CN'
            },
            playerData: {
                level: 1,
                experience: 0,
                experienceToNextLevel: 100,
                health: 100,
                maxHealth: 100,
                mana: 50,
                maxMana: 50,
                coins: 0,
                inventory: [],
                equipment: {
                    weapon: null,
                    armor: null,
                    accessory: null
                },
                skills: [],
                unlockedLevels: [1],
                currentLevel: 1,
                highScores: []
            },
            gameProgress: {
                currentLevel: 1,
                unlockedLevels: [1],
                completedLevels: [],
                bossDefeated: [],
                itemsCollected: [],
                secretsFound: [],
                playTime: 0,
                deaths: 0,
                enemiesDefeated: 0
            }
        };
        
        // 清空状态历史
        this.stateHistory = [];
        
        // 切换到主菜单
        this.changeState('mainMenu');
        
        console.log('游戏已重置');
    }
    
    /**
     * 更新玩家数据
     * @param {Object} data - 玩家数据
     */
    updatePlayerData(data) {
        Object.assign(this.globalState.playerData, data);
    }
    
    /**
     * 更新游戏进度
     * @param {Object} data - 游戏进度数据
     */
    updateGameProgress(data) {
        Object.assign(this.globalState.gameProgress, data);
    }
    
    /**
     * 更新设置
     * @param {Object} data - 设置数据
     */
    updateSettings(data) {
        Object.assign(this.globalState.settings, data);
    }
    
    /**
     * 获取当前状态名称
     * @returns {string} - 当前状态名称
     */
    getCurrentStateName() {
        return this.currentState ? this.currentState.name : null;
    }
    
    /**
     * 获取前一个状态名称
     * @returns {string} - 前一个状态名称
     */
    getPreviousStateName() {
        return this.previousState ? this.previousState.name : null;
    }
    
    /**
     * 检查是否处于特定状态
     * @param {string} stateName - 状态名称
     * @returns {boolean} - 是否处于该状态
     */
    isInState(stateName) {
        return this.currentState && this.currentState.name === stateName;
    }
    
    /**
     * 模拟加载资源
     * @param {Object} data - 加载数据
     */
    loadResources(data) {
        // 模拟加载过程
        const loadingSteps = [
            { name: '加载纹理', duration: 500 },
            { name: '加载音效', duration: 300 },
            { name: '加载关卡', duration: 700 },
            { name: '初始化游戏对象', duration: 400 }
        ];
        
        let currentStep = 0;
        const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
        let elapsed = 0;
        
        const loadingInterval = setInterval(() => {
            elapsed += 100;
            
            // 计算当前步骤
            let stepDuration = 0;
            for (let i = 0; i < loadingSteps.length; i++) {
                stepDuration += loadingSteps[i].duration;
                if (elapsed <= stepDuration) {
                    currentStep = i;
                    break;
                }
                currentStep = i;
            }
            
            // 计算进度
            const progress = Math.min(elapsed / totalDuration, 1);
            
            // 通知观察者加载进度
            this.notifyObservers('loadingProgress', {
                step: loadingSteps[currentStep].name,
                progress: progress
            });
            
            // 加载完成
            if (progress >= 1) {
                clearInterval(loadingInterval);
                
                // 根据加载数据切换到相应状态
                if (data.targetState) {
                    this.changeState(data.targetState, data.targetData);
                } else {
                    this.changeState('playing');
                }
            }
        }, 100);
    }
}

// 使用示例
/*
const gameStateManager = new GameStateManager();

// 添加状态转换回调
gameStateManager.addTransitionCallback('playing', 'onEnter', (state) => {
    console.log('进入游戏状态，初始化游戏世界');
    // 初始化游戏世界
});

gameStateManager.addTransitionCallback('playing', 'onExit', (state) => {
    console.log('离开游戏状态，保存游戏数据');
    // 保存游戏数据
});

// 添加观察者
gameStateManager.addObserver((event, data) => {
    switch (event) {
        case 'stateChanged':
            console.log(`状态从 ${data.previousState} 切换到 ${data.currentState}`);
            break;
        case 'loadingProgress':
            console.log(`加载进度: ${data.step} - ${Math.round(data.progress * 100)}%`);
            break;
    }
});

// 游戏循环
function gameLoop() {
    const deltaTime = 16; // 假设60FPS
    
    // 更新游戏状态
    gameStateManager.update(deltaTime);
    
    // 渲染游戏
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameStateManager.render(ctx);
    
    requestAnimationFrame(gameLoop);
}

// 事件处理
document.getElementById('startButton').addEventListener('click', () => {
    gameStateManager.changeState('loading', {
        targetState: 'playing',
        targetData: { level: 1 }
    });
});

document.getElementById('pauseButton').addEventListener('click', () => {
    if (gameStateManager.isInState('playing')) {
        gameStateManager.changeState('paused');
    } else if (gameStateManager.isInState('paused')) {
        gameStateManager.changeState('playing');
    }
});

document.getElementById('settingsButton').addEventListener('click', () => {
    gameStateManager.changeState('settings');
});

document.getElementById('saveButton').addEventListener('click', () => {
    gameStateManager.saveGame('slot1');
});

document.getElementById('loadButton').addEventListener('click', () => {
    gameStateManager.loadGame('slot1');
});

// 游戏逻辑中更新玩家数据
function onPlayerLevelUp() {
    gameStateManager.updatePlayerData({
        level: gameStateManager.globalState.playerData.level + 1,
        experience: 0,
        experienceToNextLevel: gameStateManager.globalState.playerData.experienceToNextLevel * 1.5,
        maxHealth: gameStateManager.globalState.playerData.maxHealth + 10,
        health: gameStateManager.globalState.playerData.maxHealth + 10,
        maxMana: gameStateManager.globalState.playerData.maxMana + 5,
        mana: gameStateManager.globalState.playerData.maxMana + 5
    });
}

// 游戏逻辑中更新游戏进度
function onLevelComplete(levelId) {
    const completedLevels = [...gameStateManager.globalState.gameProgress.completedLevels];
    if (!completedLevels.includes(levelId)) {
        completedLevels.push(levelId);
        
        gameStateManager.updateGameProgress({
            completedLevels,
            currentLevel: levelId + 1
        });
    }
}

gameLoop();
*/