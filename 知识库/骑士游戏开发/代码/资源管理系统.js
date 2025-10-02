/**
 * 骑士游戏 - 资源管理系统示例
 * Knight Game - Resource Management System Example
 */

class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.loadingQueue = [];
        this.loadedResources = 0;
        this.totalResources = 0;
        this.loadingProgress = 0;
        this.isLoading = false;
        this.onLoadComplete = null;
        this.onLoadProgress = null;
        this.onError = null;
        this.cache = new Map();
        this.maxCacheSize = 100; // 最大缓存数量
        this.loaders = new Map();
        this.preloadedResources = new Set();
        
        // 初始化加载器
        this.initLoaders();
    }
    
    /**
     * 初始化加载器
     */
    initLoaders() {
        // 图片加载器
        this.loaders.set('image', {
            load: (url) => this.loadImage(url),
            validate: (resource) => resource.complete && resource.naturalWidth !== 0
        });
        
        // 音频加载器
        this.loaders.set('audio', {
            load: (url) => this.loadAudio(url),
            validate: (resource) => resource.readyState === 4 // HAVE_ENOUGH_DATA
        });
        
        // JSON加载器
        this.loaders.set('json', {
            load: (url) => this.loadJSON(url),
            validate: (resource) => typeof resource === 'object' && resource !== null
        });
        
        // 文本加载器
        this.loaders.set('text', {
            load: (url) => this.loadText(url),
            validate: (resource) => typeof resource === 'string'
        });
        
        // 二进制加载器
        this.loaders.set('binary', {
            load: (url) => this.loadBinary(url),
            validate: (resource) => resource instanceof ArrayBuffer
        });
        
        // 着色器加载器
        this.loaders.set('shader', {
            load: (url) => this.loadShader(url),
            validate: (resource) => typeof resource === 'string'
        });
        
        // 精灵图加载器
        this.loaders.set('spritesheet', {
            load: (url) => this.loadSpritesheet(url),
            validate: (resource) => resource.image && resource.image.complete && resource.frames
        });
        
        // 字体加载器
        this.loaders.set('font', {
            load: (url) => this.loadFont(url),
            validate: (resource) => resource.loaded
        });
        
        // 视频加载器
        this.loaders.set('video', {
            load: (url) => this.loadVideo(url),
            validate: (resource) => resource.readyState >= 3 // HAVE_FUTURE_DATA
        });
    }
    
    /**
     * 加载图片
     * @param {string} url - 图片URL
     * @returns {Promise<HTMLImageElement>} - 图片元素
     */
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`加载图片失败: ${url}`));
            
            img.src = url;
        });
    }
    
    /**
     * 加载音频
     * @param {string} url - 音频URL
     * @returns {Promise<HTMLAudioElement>} - 音频元素
     */
    loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`加载音频失败: ${url}`));
            
            audio.src = url;
            audio.load();
        });
    }
    
    /**
     * 加载JSON
     * @param {string} url - JSON URL
     * @returns {Promise<Object>} - JSON对象
     */
    loadJSON(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`加载JSON失败: ${url}`);
                }
                return response.json();
            });
    }
    
    /**
     * 加载文本
     * @param {string} url - 文本URL
     * @returns {Promise<string>} - 文本内容
     */
    loadText(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`加载文本失败: ${url}`);
                }
                return response.text();
            });
    }
    
    /**
     * 加载二进制数据
     * @param {string} url - 二进制URL
     * @returns {Promise<ArrayBuffer>} - 二进制数据
     */
    loadBinary(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`加载二进制数据失败: ${url}`);
                }
                return response.arrayBuffer();
            });
    }
    
    /**
     * 加载着色器
     * @param {string} url - 着色器URL
     * @returns {Promise<string>} - 着色器代码
     */
    loadShader(url) {
        return this.loadText(url);
    }
    
    /**
     * 加载精灵图
     * @param {string} url - 精灵图URL
     * @returns {Promise<Object>} - 精灵图对象
     */
    loadSpritesheet(url) {
        return Promise.all([
            this.loadImage(url.image),
            this.loadJSON(url.data)
        ]).then(([image, data]) => {
            return {
                image,
                frames: data.frames,
                meta: data.meta
            };
        });
    }
    
    /**
     * 加载字体
     * @param {string} url - 字体URL
     * @returns {Promise<Object>} - 字体对象
     */
    loadFont(url) {
        return new Promise((resolve, reject) => {
            const fontFace = new FontFace(url.name, `url(${url.url})`);
            
            fontFace.load()
                .then(() => {
                    document.fonts.add(fontFace);
                    resolve({ name: url.name, loaded: true });
                })
                .catch(() => reject(new Error(`加载字体失败: ${url.url}`)));
        });
    }
    
    /**
     * 加载视频
     * @param {string} url - 视频URL
     * @returns {Promise<HTMLVideoElement>} - 视频元素
     */
    loadVideo(url) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.preload = 'auto';
            video.muted = true; // 自动播放需要静音
            
            video.oncanplaythrough = () => resolve(video);
            video.onerror = () => reject(new Error(`加载视频失败: ${url}`));
            
            video.src = url;
            video.load();
        });
    }
    
    /**
     * 加载资源
     * @param {string} id - 资源ID
     * @param {string} url - 资源URL
     * @param {string} type - 资源类型
     * @returns {Promise} - 加载Promise
     */
    load(id, url, type) {
        // 检查是否已加载
        if (this.resources.has(id)) {
            return Promise.resolve(this.resources.get(id));
        }
        
        // 检查缓存
        if (this.cache.has(url)) {
            const resource = this.cache.get(url);
            this.resources.set(id, resource);
            return Promise.resolve(resource);
        }
        
        // 添加到加载队列
        return new Promise((resolve, reject) => {
            this.loadingQueue.push({
                id,
                url,
                type,
                resolve,
                reject
            });
            
            // 如果没有正在加载，开始加载
            if (!this.isLoading) {
                this.processQueue();
            }
        });
    }
    
    /**
     * 批量加载资源
     * @param {Array} resources - 资源数组
     * @returns {Promise} - 加载Promise
     */
    loadAll(resources) {
        this.totalResources = resources.length;
        this.loadedResources = 0;
        this.loadingProgress = 0;
        
        const promises = resources.map(resource => {
            return this.load(resource.id, resource.url, resource.type)
                .then(() => {
                    this.loadedResources++;
                    this.loadingProgress = this.loadedResources / this.totalResources;
                    
                    if (this.onLoadProgress) {
                        this.onLoadProgress(this.loadingProgress, this.loadedResources, this.totalResources);
                    }
                })
                .catch(error => {
                    if (this.onError) {
                        this.onError(error, resource);
                    }
                    console.error(`加载资源失败: ${resource.id}`, error);
                });
        });
        
        return Promise.all(promises)
            .then(() => {
                if (this.onLoadComplete) {
                    this.onLoadComplete();
                }
            });
    }
    
    /**
     * 预加载资源
     * @param {Array} resources - 资源数组
     * @returns {Promise} - 加载Promise
     */
    preload(resources) {
        // 标记为预加载资源
        resources.forEach(resource => {
            this.preloadedResources.add(resource.id);
        });
        
        return this.loadAll(resources);
    }
    
    /**
     * 处理加载队列
     */
    processQueue() {
        if (this.loadingQueue.length === 0) {
            this.isLoading = false;
            return;
        }
        
        this.isLoading = true;
        
        // 获取下一个资源
        const resource = this.loadingQueue.shift();
        const loader = this.loaders.get(resource.type);
        
        if (!loader) {
            resource.reject(new Error(`不支持的资源类型: ${resource.type}`));
            this.processQueue();
            return;
        }
        
        // 加载资源
        loader.load(resource.url)
            .then(data => {
                // 验证资源
                if (!loader.validate(data)) {
                    throw new Error(`资源验证失败: ${resource.url}`);
                }
                
                // 缓存资源
                this.cacheResource(resource.url, data);
                
                // 存储资源
                this.resources.set(resource.id, data);
                
                // 解析Promise
                resource.resolve(data);
            })
            .catch(error => {
                resource.reject(error);
            })
            .finally(() => {
                // 处理下一个资源
                this.processQueue();
            });
    }
    
    /**
     * 缓存资源
     * @param {string} url - 资源URL
     * @param {*} data - 资源数据
     */
    cacheResource(url, data) {
        // 如果缓存已满，清除最旧的资源
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        // 添加到缓存
        this.cache.set(url, data);
    }
    
    /**
     * 获取资源
     * @param {string} id - 资源ID
     * @returns {*} - 资源数据
     */
    get(id) {
        return this.resources.get(id);
    }
    
    /**
     * 检查资源是否已加载
     * @param {string} id - 资源ID
     * @returns {boolean} - 是否已加载
     */
    isLoaded(id) {
        return this.resources.has(id);
    }
    
    /**
     * 卸载资源
     * @param {string} id - 资源ID
     */
    unload(id) {
        if (this.resources.has(id)) {
            this.resources.delete(id);
        }
    }
    
    /**
     * 卸载所有资源
     */
    unloadAll() {
        this.resources.clear();
        this.cache.clear();
        this.loadingQueue = [];
        this.loadedResources = 0;
        this.totalResources = 0;
        this.loadingProgress = 0;
        this.isLoading = false;
    }
    
    /**
     * 设置加载完成回调
     * @param {Function} callback - 回调函数
     */
    setOnLoadComplete(callback) {
        this.onLoadComplete = callback;
    }
    
    /**
     * 设置加载进度回调
     * @param {Function} callback - 回调函数
     */
    setOnLoadProgress(callback) {
        this.onLoadProgress = callback;
    }
    
    /**
     * 设置错误回调
     * @param {Function} callback - 回调函数
     */
    setOnError(callback) {
        this.onError = callback;
    }
    
    /**
     * 获取加载进度
     * @returns {number} - 加载进度（0-1）
     */
    getProgress() {
        return this.loadingProgress;
    }
    
    /**
     * 获取已加载资源数量
     * @returns {number} - 已加载资源数量
     */
    getLoadedCount() {
        return this.loadedResources;
    }
    
    /**
     * 获取总资源数量
     * @returns {number} - 总资源数量
     */
    getTotalCount() {
        return this.totalResources;
    }
    
    /**
     * 检查是否正在加载
     * @returns {boolean} - 是否正在加载
     */
    isLoadingResources() {
        return this.isLoading;
    }
    
    /**
     * 获取所有资源ID
     * @returns {Array} - 资源ID数组
     */
    getResourceIds() {
        return Array.from(this.resources.keys());
    }
    
    /**
     * 获取资源类型
     * @param {string} id - 资源ID
     * @returns {string} - 资源类型
     */
    getResourceType(id) {
        // 这里可以根据资源数据推断类型
        const resource = this.resources.get(id);
        if (!resource) return null;
        
        if (resource instanceof HTMLImageElement) return 'image';
        if (resource instanceof HTMLAudioElement) return 'audio';
        if (resource instanceof HTMLVideoElement) return 'video';
        if (typeof resource === 'string') return 'text';
        if (resource instanceof ArrayBuffer) return 'binary';
        if (resource.frames && resource.image) return 'spritesheet';
        
        return 'unknown';
    }
    
    /**
     * 获取资源大小
     * @param {string} id - 资源ID
     * @returns {number} - 资源大小（字节）
     */
    getResourceSize(id) {
        // 这里可以返回资源的大致大小
        // 实际实现可能需要更复杂的逻辑
        return 0;
    }
    
    /**
     * 获取资源统计信息
     * @returns {Object} - 资源统计信息
     */
    getStats() {
        const stats = {
            total: this.resources.size,
            byType: {},
            totalSize: 0,
            cacheSize: this.cache.size,
            maxCacheSize: this.maxCacheSize,
            loadingQueue: this.loadingQueue.length,
            isLoading: this.isLoading
        };
        
        // 按类型统计
        this.resources.forEach((resource, id) => {
            const type = this.getResourceType(id);
            if (!stats.byType[type]) {
                stats.byType[type] = {
                    count: 0,
                    size: 0
                };
            }
            
            stats.byType[type].count++;
            stats.byType[type].size += this.getResourceSize(id);
            stats.totalSize += this.getResourceSize(id);
        });
        
        return stats;
    }
    
    /**
     * 创建资源包
     * @param {Array} resourceIds - 资源ID数组
     * @param {string} name - 资源包名称
     * @returns {Object} - 资源包对象
     */
    createBundle(resourceIds, name) {
        const bundle = {
            name,
            resources: {},
            createdAt: Date.now()
        };
        
        resourceIds.forEach(id => {
            if (this.resources.has(id)) {
                bundle.resources[id] = {
                    type: this.getResourceType(id),
                    size: this.getResourceSize(id)
                };
            }
        });
        
        return bundle;
    }
    
    /**
     * 加载资源包
     * @param {Object} bundle - 资源包对象
     * @param {Object} resourceMap - 资源映射
     * @returns {Promise} - 加载Promise
     */
    loadBundle(bundle, resourceMap) {
        const resources = [];
        
        Object.keys(bundle.resources).forEach(id => {
            const resourceInfo = bundle.resources[id];
            if (resourceMap[id]) {
                resources.push({
                    id,
                    url: resourceMap[id],
                    type: resourceInfo.type
                });
            }
        });
        
        return this.loadAll(resources);
    }
    
    /**
     * 卸载资源包
     * @param {Object} bundle - 资源包对象
     */
    unloadBundle(bundle) {
        Object.keys(bundle.resources).forEach(id => {
            this.unload(id);
        });
    }
}

// 使用示例
/*
const resourceManager = new ResourceManager();

// 设置回调
resourceManager.setOnLoadProgress((progress, loaded, total) => {
    console.log(`加载进度: ${Math.round(progress * 100)}% (${loaded}/${total})`);
    
    // 更新加载UI
    updateLoadingUI(progress);
});

resourceManager.setOnLoadComplete(() => {
    console.log('所有资源加载完成');
    
    // 隐藏加载UI，显示游戏
    hideLoadingUI();
    showGame();
});

resourceManager.setOnError((error, resource) => {
    console.error(`加载资源失败: ${resource.id}`, error);
    
    // 显示错误信息
    showError(`加载资源失败: ${resource.id}`);
});

// 定义资源
const resources = [
    // 图片资源
    { id: 'player-sprite', url: 'assets/images/player.png', type: 'image' },
    { id: 'enemy-sprite', url: 'assets/images/enemy.png', type: 'image' },
    { id: 'background', url: 'assets/images/background.jpg', type: 'image' },
    { id: 'tileset', url: 'assets/images/tileset.png', type: 'image' },
    
    // 精灵图资源
    { 
        id: 'player-animations', 
        url: { 
            image: 'assets/images/player-spritesheet.png', 
            data: 'assets/data/player-animations.json' 
        }, 
        type: 'spritesheet' 
    },
    
    // 音频资源
    { id: 'bgm', url: 'assets/audio/bgm.mp3', type: 'audio' },
    { id: 'attack-sound', url: 'assets/audio/attack.wav', type: 'audio' },
    { id: 'hit-sound', url: 'assets/audio/hit.wav', type: 'audio' },
    { id: 'pickup-sound', url: 'assets/audio/pickup.wav', type: 'audio' },
    
    // 视频资源
    { id: 'intro-video', url: 'assets/video/intro.mp4', type: 'video' },
    
    // JSON数据
    { id: 'level-data', url: 'assets/data/level.json', type: 'json' },
    { id: 'enemy-data', url: 'assets/data/enemies.json', type: 'json' },
    { id: 'item-data', url: 'assets/data/items.json', type: 'json' },
    { id: 'dialog-data', url: 'assets/data/dialogs.json', type: 'json' },
    
    // 着色器
    { id: 'vertex-shader', url: 'assets/shaders/vertex.glsl', type: 'shader' },
    { id: 'fragment-shader', url: 'assets/shaders/fragment.glsl', type: 'shader' },
    
    // 字体
    { id: 'main-font', url: { name: 'MainFont', url: 'assets/fonts/main.ttf' }, type: 'font' },
    { id: 'ui-font', url: { name: 'UIFont', url: 'assets/fonts/ui.ttf' }, type: 'font' }
];

// 预加载资源
const preloadedResources = [
    { id: 'loading-bg', url: 'assets/images/loading-bg.jpg', type: 'image' },
    { id: 'loading-font', url: { name: 'LoadingFont', url: 'assets/fonts/loading.ttf' }, type: 'font' }
];

// 首先预加载加载界面所需的资源
resourceManager.preload(preloadedResources)
    .then(() => {
        // 显示加载界面
        showLoadingUI();
        
        // 加载所有游戏资源
        return resourceManager.loadAll(resources);
    })
    .then(() => {
        // 获取资源
        const playerSprite = resourceManager.get('player-sprite');
        const playerAnimations = resourceManager.get('player-animations');
        const bgm = resourceManager.get('bgm');
        const levelData = resourceManager.get('level-data');
        
        // 使用资源初始化游戏
        initGame(playerSprite, playerAnimations, bgm, levelData);
    })
    .catch(error => {
        console.error('资源加载失败:', error);
        showError('游戏资源加载失败，请刷新页面重试');
    });

// 创建资源包
const gameBundle = resourceManager.createBundle(
    ['player-sprite', 'enemy-sprite', 'player-animations', 'attack-sound', 'hit-sound'],
    'game-bundle'
);

// 保存资源包到本地存储
localStorage.setItem('game-bundle', JSON.stringify(gameBundle));

// 从本地存储加载资源包
const savedBundle = JSON.parse(localStorage.getItem('game-bundle'));
if (savedBundle) {
    const resourceMap = {
        'player-sprite': 'assets/images/player.png',
        'enemy-sprite': 'assets/images/enemy.png',
        'player-animations': { 
            image: 'assets/images/player-spritesheet.png', 
            data: 'assets/data/player-animations.json' 
        },
        'attack-sound': 'assets/audio/attack.wav',
        'hit-sound': 'assets/audio/hit.wav'
    };
    
    resourceManager.loadBundle(savedBundle, resourceMap)
        .then(() => {
            console.log('资源包加载完成');
        })
        .catch(error => {
            console.error('资源包加载失败:', error);
        });
}

// 获取资源统计信息
const stats = resourceManager.getStats();
console.log('资源统计:', stats);

// 在游戏循环中使用资源
function gameLoop() {
    // 获取资源
    const playerSprite = resourceManager.get('player-sprite');
    const bgm = resourceManager.get('bgm');
    
    // 使用资源
    ctx.drawImage(playerSprite, player.x, player.y);
    
    // 检查资源是否已加载
    if (resourceManager.isLoaded('attack-sound')) {
        // 播放攻击音效
        const attackSound = resourceManager.get('attack-sound');
        attackSound.currentTime = 0;
        attackSound.play();
    }
    
    requestAnimationFrame(gameLoop);
}

// 游戏结束时清理资源
function cleanup() {
    // 卸载不需要的资源
    resourceManager.unload('intro-video');
    resourceManager.unload('level-data');
    
    // 或者卸载所有资源
    // resourceManager.unloadAll();
}
*/