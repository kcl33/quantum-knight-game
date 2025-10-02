/**
 * 骑士游戏 - 音频系统示例
 * Knight Game - Audio System Example
 */

class AudioSystem {
    constructor() {
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.musicVolume = 0.5;
        this.soundVolume = 0.7;
        this.muted = false;
        this.musicMuted = false;
        this.soundMuted = false;
        this.audioContext = null;
        this.masterGainNode = null;
        this.musicGainNode = null;
        this.soundGainNode = null;
        this.analyser = null;
        this.dataArray = null;
        this.audioListeners = [];
        
        // 初始化音频上下文
        this.initAudioContext();
    }
    
    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主增益节点
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);
            this.masterGainNode.gain.value = 1.0;
            
            // 创建音乐增益节点
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.connect(this.masterGainNode);
            this.musicGainNode.gain.value = this.musicVolume;
            
            // 创建音效增益节点
            this.soundGainNode = this.audioContext.createGain();
            this.soundGainNode.connect(this.masterGainNode);
            this.soundGainNode.gain.value = this.soundVolume;
            
            // 创建分析器
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.connect(this.masterGainNode);
            
            // 创建数据数组
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            console.log('音频系统初始化成功');
        } catch (e) {
            console.error('音频系统初始化失败:', e);
        }
    }
    
    /**
     * 加载音效
     * @param {string} name - 音效名称
     * @param {string} url - 音效URL
     * @returns {Promise} - 加载完成的Promise
     */
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    return this.audioContext.decodeAudioData(arrayBuffer);
                })
                .then(audioBuffer => {
                    this.sounds.set(name, {
                        buffer: audioBuffer,
                        url: url
                    });
                    console.log(`音效 ${name} 加载成功`);
                    resolve();
                })
                .catch(error => {
                    console.error(`加载音效 ${name} 失败:`, error);
                    reject(error);
                });
        });
    }
    
    /**
     * 加载音乐
     * @param {string} name - 音乐名称
     * @param {string} url - 音乐URL
     * @returns {Promise} - 加载完成的Promise
     */
    loadMusic(name, url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    return this.audioContext.decodeAudioData(arrayBuffer);
                })
                .then(audioBuffer => {
                    this.music.set(name, {
                        buffer: audioBuffer,
                        url: url,
                        loop: true
                    });
                    console.log(`音乐 ${name} 加载成功`);
                    resolve();
                })
                .catch(error => {
                    console.error(`加载音乐 ${name} 失败:`, error);
                    reject(error);
                });
        });
    }
    
    /**
     * 播放音效
     * @param {string} name - 音效名称
     * @param {Object} options - 播放选项
     * @returns {AudioBufferSourceNode} - 音频源节点
     */
    playSound(name, options = {}) {
        if (this.muted || this.soundMuted) {
            return null;
        }
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.error(`音效 ${name} 不存在`);
            return null;
        }
        
        // 创建音频源
        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        
        // 创建增益节点（用于控制单个音效的音量）
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.volume || 1.0;
        
        // 连接节点
        source.connect(gainNode);
        gainNode.connect(this.soundGainNode);
        
        // 设置播放选项
        source.loop = options.loop || false;
        source.playbackRate.value = options.playbackRate || 1.0;
        
        // 播放
        source.start(0);
        
        // 通知监听器
        this.notifyListeners('soundPlayed', {
            name,
            options,
            source,
            gainNode
        });
        
        return source;
    }
    
    /**
     * 播放音乐
     * @param {string} name - 音乐名称
     * @param {Object} options - 播放选项
     * @returns {AudioBufferSourceNode} - 音频源节点
     */
    playMusic(name, options = {}) {
        if (this.muted || this.musicMuted) {
            return null;
        }
        
        const music = this.music.get(name);
        if (!music) {
            console.error(`音乐 ${name} 不存在`);
            return null;
        }
        
        // 停止当前音乐
        this.stopMusic();
        
        // 创建音频源
        const source = this.audioContext.createBufferSource();
        source.buffer = music.buffer;
        
        // 创建增益节点（用于控制单个音乐的音量）
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.volume || 1.0;
        
        // 连接节点
        source.connect(gainNode);
        gainNode.connect(this.musicGainNode);
        
        // 设置播放选项
        source.loop = options.loop !== undefined ? options.loop : music.loop;
        source.playbackRate.value = options.playbackRate || 1.0;
        
        // 设置音乐结束回调
        source.onended = () => {
            if (this.currentMusic === source) {
                this.currentMusic = null;
            }
            
            // 通知监听器
            this.notifyListeners('musicEnded', {
                name,
                options
            });
        };
        
        // 播放
        source.start(0);
        this.currentMusic = source;
        
        // 通知监听器
        this.notifyListeners('musicPlayed', {
            name,
            options,
            source,
            gainNode
        });
        
        return source;
    }
    
    /**
     * 停止音乐
     */
    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.stop();
                this.currentMusic = null;
            } catch (e) {
                console.error('停止音乐失败:', e);
            }
        }
    }
    
    /**
     * 暂停音乐
     */
    pauseMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.stop();
                // 注意：Web Audio API没有真正的暂停功能，这里只是停止
                // 实际应用中可能需要记录播放位置，然后重新播放
            } catch (e) {
                console.error('暂停音乐失败:', e);
            }
        }
    }
    
    /**
     * 恢复音乐
     * @param {string} name - 音乐名称
     * @param {number} offset - 播放偏移量
     */
    resumeMusic(name, offset = 0) {
        if (name) {
            this.playMusic(name, { offset });
        }
    }
    
    /**
     * 设置音乐音量
     * @param {number} volume - 音量（0-1）
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.musicVolume;
        }
        
        // 通知监听器
        this.notifyListeners('musicVolumeChanged', { volume: this.musicVolume });
    }
    
    /**
     * 设置音效音量
     * @param {number} volume - 音量（0-1）
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        if (this.soundGainNode) {
            this.soundGainNode.gain.value = this.soundVolume;
        }
        
        // 通知监听器
        this.notifyListeners('soundVolumeChanged', { volume: this.soundVolume });
    }
    
    /**
     * 设置主音量
     * @param {number} volume - 音量（0-1）
     */
    setMasterVolume(volume) {
        const masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = masterVolume;
        }
        
        // 通知监听器
        this.notifyListeners('masterVolumeChanged', { volume: masterVolume });
    }
    
    /**
     * 静音所有音频
     * @param {boolean} muted - 是否静音
     */
    setMuted(muted) {
        this.muted = muted;
        if (this.masterGainNode) {
            this.masterGainNode.gain.value = muted ? 0 : 1.0;
        }
        
        // 通知监听器
        this.notifyListeners('mutedChanged', { muted });
    }
    
    /**
     * 静音音乐
     * @param {boolean} muted - 是否静音
     */
    setMusicMuted(muted) {
        this.musicMuted = muted;
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = muted ? 0 : this.musicVolume;
        }
        
        // 通知监听器
        this.notifyListeners('musicMutedChanged', { muted });
    }
    
    /**
     * 静音音效
     * @param {boolean} muted - 是否静音
     */
    setSoundMuted(muted) {
        this.soundMuted = muted;
        if (this.soundGainNode) {
            this.soundGainNode.gain.value = muted ? 0 : this.soundVolume;
        }
        
        // 通知监听器
        this.notifyListeners('soundMutedChanged', { muted });
    }
    
    /**
     * 切换静音状态
     */
    toggleMute() {
        this.setMuted(!this.muted);
    }
    
    /**
     * 切换音乐静音状态
     */
    toggleMusicMute() {
        this.setMusicMuted(!this.musicMuted);
    }
    
    /**
     * 切换音效静音状态
     */
    toggleSoundMute() {
        this.setSoundMuted(!this.soundMuted);
    }
    
    /**
     * 添加音频监听器
     * @param {Function} listener - 监听器函数
     */
    addListener(listener) {
        this.audioListeners.push(listener);
    }
    
    /**
     * 移除音频监听器
     * @param {Function} listener - 监听器函数
     */
    removeListener(listener) {
        const index = this.audioListeners.indexOf(listener);
        if (index !== -1) {
            this.audioListeners.splice(index, 1);
        }
    }
    
    /**
     * 通知监听器
     * @param {string} event - 事件名称
     * @param {Object} data - 事件数据
     */
    notifyListeners(event, data) {
        this.audioListeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (e) {
                console.error('音频监听器错误:', e);
            }
        });
    }
    
    /**
     * 获取频率数据
     * @returns {Uint8Array} - 频率数据
     */
    getFrequencyData() {
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }
    
    /**
     * 获取时域数据
     * @returns {Uint8Array} - 时域数据
     */
    getTimeDomainData() {
        if (this.analyser) {
            this.analyser.getByteTimeDomainData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }
    
    /**
     * 创建3D音效
     * @param {string} name - 音效名称
     * @param {Object} position - 3D位置
     * @param {Object} options - 播放选项
     * @returns {AudioBufferSourceNode} - 音频源节点
     */
    play3DSound(name, position, options = {}) {
        if (this.muted || this.soundMuted) {
            return null;
        }
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.error(`音效 ${name} 不存在`);
            return null;
        }
        
        // 创建音频源
        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        
        // 创建3D位置节点
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        
        // 设置位置
        if (position) {
            panner.setPosition(position.x || 0, position.y || 0, position.z || 0);
        }
        
        // 创建增益节点
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.volume || 1.0;
        
        // 连接节点
        source.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(this.soundGainNode);
        
        // 设置播放选项
        source.loop = options.loop || false;
        source.playbackRate.value = options.playbackRate || 1.0;
        
        // 播放
        source.start(0);
        
        // 通知监听器
        this.notifyListeners('3DSoundPlayed', {
            name,
            position,
            options,
            source,
            gainNode,
            panner
        });
        
        return source;
    }
    
    /**
     * 更新3D音效监听器位置
     * @param {Object} position - 监听器位置
     * @param {Object} orientation - 监听器方向
     */
    updateListener(position, orientation) {
        if (this.audioContext && this.audioContext.listener) {
            // 设置位置
            if (position) {
                this.audioContext.listener.setPosition(
                    position.x || 0,
                    position.y || 0,
                    position.z || 0
                );
            }
            
            // 设置方向
            if (orientation) {
                this.audioContext.listener.setOrientation(
                    orientation.x || 0,
                    orientation.y || 0,
                    orientation.z || 1,
                    orientation.upX || 0,
                    orientation.upY || 1,
                    orientation.upZ || 0
                );
            }
        }
    }
    
    /**
     * 创建音频效果器
     * @param {string} type - 效果器类型
     * @param {Object} options - 效果器选项
     * @returns {AudioNode} - 效果器节点
     */
    createEffect(type, options = {}) {
        let effectNode;
        
        switch (type) {
            case 'reverb':
                effectNode = this.audioContext.createConvolver();
                // 这里需要加载脉冲响应文件
                break;
                
            case 'delay':
                effectNode = this.audioContext.createDelay();
                effectNode.delayTime.value = options.delayTime || 0.3;
                break;
                
            case 'filter':
                effectNode = this.audioContext.createBiquadFilter();
                effectNode.type = options.filterType || 'lowpass';
                effectNode.frequency.value = options.frequency || 1000;
                effectNode.Q.value = options.Q || 1;
                break;
                
            case 'distortion':
                effectNode = this.audioContext.createWaveShaper();
                // 创建失真曲线
                const amount = options.amount || 50;
                const samples = 44100;
                const curve = new Float32Array(samples);
                const deg = Math.PI / 180;
                
                for (let i = 0; i < samples; i++) {
                    const x = (i * 2) / samples - 1;
                    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
                }
                
                effectNode.curve = curve;
                effectNode.oversample = options.oversample || '4x';
                break;
                
            case 'compressor':
                effectNode = this.audioContext.createDynamicsCompressor();
                effectNode.threshold.value = options.threshold || -24;
                effectNode.knee.value = options.knee || 30;
                effectNode.ratio.value = options.ratio || 12;
                effectNode.attack.value = options.attack || 0.003;
                effectNode.release.value = options.release || 0.25;
                break;
                
            default:
                console.error(`未知效果器类型: ${type}`);
                return null;
        }
        
        return effectNode;
    }
    
    /**
     * 应用效果器到音效
     * @param {string} name - 音效名称
     * @param {AudioNode} effectNode - 效果器节点
     */
    applyEffectToSound(name, effectNode) {
        const sound = this.sounds.get(name);
        if (!sound) {
            console.error(`音效 ${name} 不存在`);
            return;
        }
        
        // 保存原始连接信息
        if (!sound.originalConnection) {
            sound.originalConnection = {
                destination: this.soundGainNode
            };
        }
        
        // 修改连接
        sound.destination = effectNode;
        effectNode.connect(this.soundGainNode);
    }
    
    /**
     * 移除音效的效果器
     * @param {string} name - 音效名称
     */
    removeEffectFromSound(name) {
        const sound = this.sounds.get(name);
        if (!sound || !sound.originalConnection) {
            return;
        }
        
        // 恢复原始连接
        sound.destination = sound.originalConnection.destination;
        delete sound.originalConnection;
    }
    
    /**
     * 播放序列音效
     * @param {Array} sequence - 音效序列
     * @param {number} interval - 间隔时间（毫秒）
     */
    playSoundSequence(sequence, interval = 200) {
        sequence.forEach((soundName, index) => {
            setTimeout(() => {
                this.playSound(soundName);
            }, index * interval);
        });
    }
    
    /**
     * 播放随机音效
     * @param {Array} sounds - 音效数组
     * @param {Object} options - 播放选项
     */
    playRandomSound(sounds, options = {}) {
        if (sounds.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * sounds.length);
        this.playSound(sounds[randomIndex], options);
    }
    
    /**
     * 淡入音乐
     * @param {string} name - 音乐名称
     * @param {number} duration - 淡入时间（秒）
     * @param {Object} options - 播放选项
     */
    fadeInMusic(name, duration = 1, options = {}) {
        // 设置初始音量为0
        const fadeOptions = { ...options, volume: 0 };
        const source = this.playMusic(name, fadeOptions);
        
        if (source && this.musicGainNode) {
            // 保存当前音量
            const originalVolume = this.musicVolume;
            
            // 设置目标音量
            const targetVolume = options.volume || 1;
            
            // 淡入
            const startTime = this.audioContext.currentTime;
            const endTime = startTime + duration;
            
            this.musicGainNode.gain.cancelScheduledValues(startTime);
            this.musicGainNode.gain.setValueAtTime(0, startTime);
            this.musicGainNode.gain.linearRampToValueAtTime(targetVolume, endTime);
        }
        
        return source;
    }
    
    /**
     * 淡出音乐
     * @param {number} duration - 淡出时间（秒）
     */
    fadeOutMusic(duration = 1) {
        if (this.currentMusic && this.musicGainNode) {
            const startTime = this.audioContext.currentTime;
            const endTime = startTime + duration;
            
            this.musicGainNode.gain.cancelScheduledValues(startTime);
            this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, startTime);
            this.musicGainNode.gain.linearRampToValueAtTime(0, endTime);
            
            // 在淡出完成后停止音乐
            setTimeout(() => {
                this.stopMusic();
            }, duration * 1000);
        }
    }
    
    /**
     * 交叉淡入淡出音乐
     * @param {string} name - 新音乐名称
     * @param {number} duration - 淡入淡出时间（秒）
     * @param {Object} options - 播放选项
     */
    crossFadeMusic(name, duration = 1, options = {}) {
        // 淡出当前音乐
        this.fadeOutMusic(duration);
        
        // 淡入新音乐
        setTimeout(() => {
            this.fadeInMusic(name, duration, options);
        }, duration * 500); // 在淡出过程中开始淡入
    }
}

// 使用示例
/*
const audioSystem = new AudioSystem();

// 添加音频监听器
audioSystem.addListener((event, data) => {
    switch (event) {
        case 'musicPlayed':
            console.log(`播放音乐: ${data.name}`);
            break;
        case 'soundPlayed':
            console.log(`播放音效: ${data.name}`);
            break;
        case 'musicVolumeChanged':
            console.log(`音乐音量更改: ${data.volume}`);
            break;
        case 'soundVolumeChanged':
            console.log(`音效音量更改: ${data.volume}`);
            break;
    }
});

// 加载音效
Promise.all([
    audioSystem.loadSound('swordSwing', 'assets/sounds/sword_swing.mp3'),
    audioSystem.loadSound('footstep', 'assets/sounds/footstep.mp3'),
    audioSystem.loadSound('hit', 'assets/sounds/hit.mp3'),
    audioSystem.loadSound('collect', 'assets/sounds/collect.mp3'),
    audioSystem.loadSound('levelUp', 'assets/sounds/level_up.mp3')
]).then(() => {
    console.log('所有音效加载完成');
}).catch(error => {
    console.error('加载音效失败:', error);
});

// 加载音乐
Promise.all([
    audioSystem.loadMusic('mainTheme', 'assets/music/main_theme.mp3'),
    audioSystem.loadMusic('battleTheme', 'assets/music/battle_theme.mp3'),
    audioSystem.loadMusic('victoryTheme', 'assets/music/victory_theme.mp3')
]).then(() => {
    console.log('所有音乐加载完成');
    
    // 播放主菜单音乐
    audioSystem.playMusic('mainTheme');
}).catch(error => {
    console.error('加载音乐失败:', error);
});

// 游戏事件处理
function onPlayerAttack() {
    audioSystem.playSound('swordSwing');
}

function onPlayerHit() {
    audioSystem.playSound('hit');
}

function onPlayerMove() {
    // 随机播放脚步声
    if (Math.random() < 0.3) {
        audioSystem.playSound('footstep');
    }
}

function onItemCollect() {
    audioSystem.playSound('collect');
}

function onPlayerLevelUp() {
    audioSystem.playSound('levelUp');
}

function onBattleStart() {
    audioSystem.crossFadeMusic('battleTheme', 2);
}

function onBattleEnd() {
    audioSystem.crossFadeMusic('mainTheme', 2);
}

function onVictory() {
    audioSystem.fadeOutMusic(1);
    setTimeout(() => {
        audioSystem.playMusic('victoryTheme');
    }, 1000);
}

// UI控制
document.getElementById('musicVolumeSlider').addEventListener('input', (e) => {
    audioSystem.setMusicVolume(e.target.value / 100);
});

document.getElementById('soundVolumeSlider').addEventListener('input', (e) => {
    audioSystem.setSoundVolume(e.target.value / 100);
});

document.getElementById('muteButton').addEventListener('click', () => {
    audioSystem.toggleMute();
});

document.getElementById('musicMuteButton').addEventListener('click', () => {
    audioSystem.toggleMusicMute();
});

document.getElementById('soundMuteButton').addEventListener('click', () => {
    audioSystem.toggleSoundMute();
});

// 3D音效示例
function onEnemySpawned(enemy) {
    // 播放3D音效
    audioSystem.play3DSound('enemySpawn', {
        x: enemy.x,
        y: enemy.y,
        z: 0
    });
}

function updateAudioListener(player) {
    // 更新音频监听器位置
    audioSystem.updateListener(
        { x: player.x, y: player.y, z: 0 },
        { x: player.directionX, y: player.directionY, z: 0 }
    );
}

// 游戏循环中更新音频系统
function gameLoop() {
    // 更新音频监听器位置
    if (game.player) {
        updateAudioListener(game.player);
    }
    
    // 获取频率数据用于可视化
    const frequencyData = audioSystem.getFrequencyData();
    if (frequencyData) {
        // 使用频率数据创建音频可视化效果
        renderAudioVisualization(frequencyData);
    }
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
*/