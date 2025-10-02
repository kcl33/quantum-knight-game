/**
 * 骑士游戏 - UI系统示例
 * Knight Game - UI System Example
 */

class UISystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.elements = new Map();
        this.panels = new Map();
        this.activePanel = null;
        this.fonts = new Map();
        this.colors = new Map();
        this.textures = new Map();
        this.animations = new Map();
        
        // 初始化默认样式
        this.initDefaultStyles();
        
        // 设置事件监听器
        this.setupEventListeners();
    }
    
    /**
     * 初始化默认样式
     */
    initDefaultStyles() {
        // 默认字体
        this.fonts.set('default', '16px Arial');
        this.fonts.set('title', '24px Arial');
        this.fonts.set('button', '18px Arial');
        this.fonts.set('small', '12px Arial');
        
        // 默认颜色
        this.colors.set('background', '#001F7A');
        this.colors.set('panel', 'rgba(0, 31, 122, 0.8)');
        this.colors.set('button', '#0040D1');
        this.colors.set('buttonHover', '#0050E1');
        this.colors.set('buttonActive', '#0030C1');
        this.colors.set('text', '#FFFFFF');
        this.colors.set('textSecondary', '#CCCCCC');
        this.colors.set('health', '#FF0000');
        this.colors.set('mana', '#0000FF');
        this.colors.set('experience', '#00FF00');
        this.colors.set('border', '#FFFFFF');
        this.colors.set('shadow', 'rgba(0, 0, 0, 0.5)');
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    /**
     * 加载纹理
     * @param {string} name - 纹理名称
     * @param {string} url - 纹理URL
     * @returns {Promise} - 加载完成的Promise
     */
    loadTexture(name, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.textures.set(name, img);
                resolve();
            };
            img.onerror = () => {
                reject(new Error(`Failed to load texture: ${url}`));
            };
            img.src = url;
        });
    }
    
    /**
     * 创建UI元素
     * @param {string} id - 元素ID
     * @param {string} type - 元素类型
     * @param {Object} options - 元素选项
     * @returns {Object} - UI元素
     */
    createElement(id, type, options = {}) {
        const element = {
            id,
            type,
            x: options.x || 0,
            y: options.y || 0,
            width: options.width || 100,
            height: options.height || 30,
            visible: options.visible !== undefined ? options.visible : true,
            enabled: options.enabled !== undefined ? options.enabled : true,
            alpha: options.alpha || 1,
            rotation: options.rotation || 0,
            scale: options.scale || 1,
            anchorX: options.anchorX || 0,
            anchorY: options.anchorY || 0,
            parent: options.parent || null,
            children: [],
            style: options.style || {},
            data: options.data || {},
            callbacks: {
                onClick: options.onClick || null,
                onMouseEnter: options.onMouseEnter || null,
                onMouseLeave: options.onMouseLeave || null,
                onMouseDown: options.onMouseDown || null,
                onMouseUp: options.onMouseUp || null
            },
            state: {
                hover: false,
                active: false,
                focused: false
            }
        };
        
        // 根据类型设置特定属性
        switch (type) {
            case 'label':
                element.text = options.text || '';
                element.font = options.font || 'default';
                element.color = options.color || 'text';
                element.align = options.align || 'left';
                element.wrap = options.wrap || false;
                break;
                
            case 'button':
                element.text = options.text || '';
                element.font = options.font || 'button';
                element.color = options.color || 'text';
                element.normalColor = options.normalColor || 'button';
                element.hoverColor = options.hoverColor || 'buttonHover';
                element.activeColor = options.activeColor || 'buttonActive';
                break;
                
            case 'image':
                element.texture = options.texture || null;
                element.sourceRect = options.sourceRect || null;
                break;
                
            case 'progressBar':
                element.value = options.value || 0;
                element.minValue = options.minValue || 0;
                element.maxValue = options.maxValue || 100;
                element.fillColor = options.fillColor || 'health';
                element.backgroundColor = options.backgroundColor || 'panel';
                element.showText = options.showText !== undefined ? options.showText : true;
                element.textFormat = options.textFormat || '{value}/{maxValue}';
                break;
                
            case 'panel':
                element.backgroundColor = options.backgroundColor || 'panel';
                element.borderColor = options.borderColor || 'border';
                element.borderWidth = options.borderWidth || 2;
                element.cornerRadius = options.cornerRadius || 5;
                element.scrollable = options.scrollable || false;
                element.scrollX = 0;
                element.scrollY = 0;
                break;
        }
        
        // 添加到元素映射
        this.elements.set(id, element);
        
        // 如果有父元素，添加到父元素的子元素列表
        if (element.parent) {
            const parent = this.elements.get(element.parent);
            if (parent) {
                parent.children.push(element);
            }
        }
        
        return element;
    }
    
    /**
     * 创建UI面板
     * @param {string} id - 面板ID
     * @param {Object} options - 面板选项
     * @returns {Object} - UI面板
     */
    createPanel(id, options = {}) {
        const panel = this.createElement(id, 'panel', options);
        this.panels.set(id, panel);
        return panel;
    }
    
    /**
     * 显示面板
     * @param {string} id - 面板ID
     */
    showPanel(id) {
        const panel = this.panels.get(id);
        if (panel) {
            this.activePanel = panel;
            panel.visible = true;
            
            // 触发显示事件
            if (panel.callbacks.onShow) {
                panel.callbacks.onShow();
            }
        }
    }
    
    /**
     * 隐藏面板
     * @param {string} id - 面板ID
     */
    hidePanel(id) {
        const panel = this.panels.get(id);
        if (panel) {
            panel.visible = false;
            
            // 如果隐藏的是当前活动面板，清空活动面板
            if (this.activePanel === panel) {
                this.activePanel = null;
            }
            
            // 触发隐藏事件
            if (panel.callbacks.onHide) {
                panel.callbacks.onHide();
            }
        }
    }
    
    /**
     * 切换面板显示状态
     * @param {string} id - 面板ID
     */
    togglePanel(id) {
        const panel = this.panels.get(id);
        if (panel) {
            if (panel.visible) {
                this.hidePanel(id);
            } else {
                this.showPanel(id);
            }
        }
    }
    
    /**
     * 获取元素
     * @param {string} id - 元素ID
     * @returns {Object} - UI元素
     */
    getElement(id) {
        return this.elements.get(id);
    }
    
    /**
     * 更新UI系统
     * @param {number} deltaTime - 时间增量（毫秒）
     */
    update(deltaTime) {
        // 更新动画
        this.animations.forEach((animation, id) => {
            animation.elapsed += deltaTime;
            
            // 计算进度（0-1）
            let progress = animation.elapsed / animation.duration;
            if (progress > 1) {
                progress = 1;
                
                // 动画完成
                if (animation.onComplete) {
                    animation.onComplete();
                }
                
                // 如果是循环动画，重置
                if (animation.loop) {
                    animation.elapsed = 0;
                } else {
                    // 移除动画
                    this.animations.delete(id);
                }
            }
            
            // 应用缓动函数
            const easedProgress = this.applyEasing(progress, animation.easing);
            
            // 更新元素属性
            const element = this.getElement(id);
            if (element) {
                if (animation.from.x !== undefined && animation.to.x !== undefined) {
                    element.x = animation.from.x + (animation.to.x - animation.from.x) * easedProgress;
                }
                
                if (animation.from.y !== undefined && animation.to.y !== undefined) {
                    element.y = animation.from.y + (animation.to.y - animation.from.y) * easedProgress;
                }
                
                if (animation.from.alpha !== undefined && animation.to.alpha !== undefined) {
                    element.alpha = animation.from.alpha + (animation.to.alpha - animation.from.alpha) * easedProgress;
                }
                
                if (animation.from.scale !== undefined && animation.to.scale !== undefined) {
                    element.scale = animation.from.scale + (animation.to.scale - animation.from.scale) * easedProgress;
                }
                
                if (animation.from.rotation !== undefined && animation.to.rotation !== undefined) {
                    element.rotation = animation.from.rotation + (animation.to.rotation - animation.from.rotation) * easedProgress;
                }
            }
        });
    }
    
    /**
     * 渲染UI系统
     */
    render() {
        // 保存当前状态
        this.ctx.save();
        
        // 渲染所有可见元素
        this.elements.forEach(element => {
            if (element.visible) {
                this.renderElement(element);
            }
        });
        
        // 恢复状态
        this.ctx.restore();
    }
    
    /**
     * 渲染UI元素
     * @param {Object} element - UI元素
     */
    renderElement(element) {
        // 保存当前状态
        this.ctx.save();
        
        // 计算实际位置（考虑锚点）
        const x = element.x - element.width * element.anchorX;
        const y = element.y - element.height * element.anchorY;
        
        // 应用变换
        this.ctx.translate(element.x, element.y);
        this.ctx.rotate(element.rotation);
        this.ctx.scale(element.scale, element.scale);
        this.ctx.translate(-element.x, -element.y);
        
        // 应用透明度
        this.ctx.globalAlpha = element.alpha;
        
        // 根据类型渲染
        switch (element.type) {
            case 'label':
                this.renderLabel(element, x, y);
                break;
                
            case 'button':
                this.renderButton(element, x, y);
                break;
                
            case 'image':
                this.renderImage(element, x, y);
                break;
                
            case 'progressBar':
                this.renderProgressBar(element, x, y);
                break;
                
            case 'panel':
                this.renderPanel(element, x, y);
                break;
        }
        
        // 渲染子元素
        element.children.forEach(child => {
            if (child.visible) {
                this.renderElement(child);
            }
        });
        
        // 恢复状态
        this.ctx.restore();
    }
    
    /**
     * 渲染标签
     * @param {Object} element - UI元素
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderLabel(element, x, y) {
        const font = this.fonts.get(element.font) || this.fonts.get('default');
        const color = this.colors.get(element.color) || this.colors.get('text');
        
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = element.align;
        this.ctx.textBaseline = 'top';
        
        if (element.wrap) {
            // 文本换行
            const words = element.text.split(' ');
            let line = '';
            let lineHeight = 20;
            let currentY = y;
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const metrics = this.ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > element.width && i > 0) {
                    this.ctx.fillText(line, x, currentY);
                    line = words[i] + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            
            this.ctx.fillText(line, x, currentY);
        } else {
            // 单行文本
            this.ctx.fillText(element.text, x, y);
        }
    }
    
    /**
     * 渲染按钮
     * @param {Object} element - UI元素
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderButton(element, x, y) {
        // 确定按钮颜色
        let color;
        if (element.state.active) {
            color = this.colors.get(element.activeColor);
        } else if (element.state.hover) {
            color = this.colors.get(element.hoverColor);
        } else {
            color = this.colors.get(element.normalColor);
        }
        
        // 绘制按钮背景
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, element.width, element.height);
        
        // 绘制按钮文本
        const font = this.fonts.get(element.font) || this.fonts.get('button');
        const textColor = this.colors.get(element.color) || this.colors.get('text');
        
        this.ctx.font = font;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(element.text, x + element.width / 2, y + element.height / 2);
    }
    
    /**
     * 渲染图像
     * @param {Object} element - UI元素
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderImage(element, x, y) {
        const texture = this.textures.get(element.texture);
        if (!texture) return;
        
        if (element.sourceRect) {
            // 绘制图像的一部分
            this.ctx.drawImage(
                texture,
                element.sourceRect.x,
                element.sourceRect.y,
                element.sourceRect.width,
                element.sourceRect.height,
                x,
                y,
                element.width,
                element.height
            );
        } else {
            // 绘制整个图像
            this.ctx.drawImage(texture, x, y, element.width, element.height);
        }
    }
    
    /**
     * 渲染进度条
     * @param {Object} element - UI元素
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderProgressBar(element, x, y) {
        // 计算进度
        const progress = (element.value - element.minValue) / (element.maxValue - element.minValue);
        const progressWidth = element.width * progress;
        
        // 绘制背景
        const backgroundColor = this.colors.get(element.backgroundColor);
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(x, y, element.width, element.height);
        
        // 绘制进度
        const fillColor = this.colors.get(element.fillColor);
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, progressWidth, element.height);
        
        // 绘制文本
        if (element.showText) {
            const font = this.fonts.get('small');
            const textColor = this.colors.get('text');
            
            this.ctx.font = font;
            this.ctx.fillStyle = textColor;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 格式化文本
            let text = element.textFormat;
            text = text.replace('{value}', Math.round(element.value));
            text = text.replace('{maxValue}', Math.round(element.maxValue));
            text = text.replace('{percent}', Math.round(progress * 100) + '%');
            
            this.ctx.fillText(text, x + element.width / 2, y + element.height / 2);
        }
    }
    
    /**
     * 渲染面板
     * @param {Object} element - UI元素
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    renderPanel(element, x, y) {
        const backgroundColor = this.colors.get(element.backgroundColor);
        const borderColor = this.colors.get(element.borderColor);
        
        // 绘制背景
        this.ctx.fillStyle = backgroundColor;
        
        if (element.cornerRadius > 0) {
            // 圆角矩形
            this.roundRect(x, y, element.width, element.height, element.cornerRadius);
            this.ctx.fill();
            
            // 绘制边框
            if (element.borderWidth > 0) {
                this.ctx.strokeStyle = borderColor;
                this.ctx.lineWidth = element.borderWidth;
                this.roundRect(x, y, element.width, element.height, element.cornerRadius);
                this.ctx.stroke();
            }
        } else {
            // 普通矩形
            this.ctx.fillRect(x, y, element.width, element.height);
            
            // 绘制边框
            if (element.borderWidth > 0) {
                this.ctx.strokeStyle = borderColor;
                this.ctx.lineWidth = element.borderWidth;
                this.ctx.strokeRect(x, y, element.width, element.height);
            }
        }
    }
    
    /**
     * 绘制圆角矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} radius - 圆角半径
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    /**
     * 处理点击事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 查找被点击的元素
        const clickedElement = this.findElementAt(x, y);
        
        if (clickedElement && clickedElement.enabled && clickedElement.callbacks.onClick) {
            clickedElement.callbacks.onClick(clickedElement);
        }
    }
    
    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查所有元素
        this.elements.forEach(element => {
            if (!element.enabled) return;
            
            const isHover = this.isPointInElement(x, y, element);
            
            // 如果悬停状态改变
            if (isHover !== element.state.hover) {
                element.state.hover = isHover;
                
                // 触发相应事件
                if (isHover && element.callbacks.onMouseEnter) {
                    element.callbacks.onMouseEnter(element);
                } else if (!isHover && element.callbacks.onMouseLeave) {
                    element.callbacks.onMouseLeave(element);
                }
            }
        });
    }
    
    /**
     * 处理鼠标按下事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 查找被按下的元素
        const pressedElement = this.findElementAt(x, y);
        
        if (pressedElement && pressedElement.enabled) {
            pressedElement.state.active = true;
            
            if (pressedElement.callbacks.onMouseDown) {
                pressedElement.callbacks.onMouseDown(pressedElement);
            }
        }
    }
    
    /**
     * 处理鼠标释放事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseUp(e) {
        // 检查所有元素
        this.elements.forEach(element => {
            if (element.state.active) {
                element.state.active = false;
                
                if (element.callbacks.onMouseUp) {
                    element.callbacks.onMouseUp(element);
                }
            }
        });
    }
    
    /**
     * 查找指定位置的元素
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Object} - 找到的元素
     */
    findElementAt(x, y) {
        // 从后往前遍历，以找到最上层的元素
        const elements = Array.from(this.elements.values()).reverse();
        
        for (const element of elements) {
            if (element.visible && this.isPointInElement(x, y, element)) {
                return element;
            }
        }
        
        return null;
    }
    
    /**
     * 检查点是否在元素内
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} element - UI元素
     * @returns {boolean} - 是否在元素内
     */
    isPointInElement(x, y, element) {
        // 计算实际位置（考虑锚点）
        const elementX = element.x - element.width * element.anchorX;
        const elementY = element.y - element.height * element.anchorY;
        
        return x >= elementX && x <= elementX + element.width &&
               y >= elementY && y <= elementY + element.height;
    }
    
    /**
     * 创建动画
     * @param {string} elementId - 元素ID
     * @param {Object} from - 起始值
     * @param {Object} to - 结束值
     * @param {number} duration - 持续时间（毫秒）
     * @param {string} easing - 缓动函数
     * @param {boolean} loop - 是否循环
     * @param {Function} onComplete - 完成回调
     */
    animate(elementId, from, to, duration, easing = 'linear', loop = false, onComplete = null) {
        this.animations.set(elementId, {
            from,
            to,
            duration,
            easing,
            loop,
            onComplete,
            elapsed: 0
        });
    }
    
    /**
     * 应用缓动函数
     * @param {number} progress - 进度（0-1）
     * @param {string} easing - 缓动函数类型
     * @returns {number} - 缓动后的进度
     */
    applyEasing(progress, easing) {
        switch (easing) {
            case 'linear':
                return progress;
                
            case 'easeIn':
                return progress * progress;
                
            case 'easeOut':
                return 1 - (1 - progress) * (1 - progress);
                
            case 'easeInOut':
                return progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - 2 * (1 - progress) * (1 - progress);
                
            case 'bounceIn':
                return 1 - this.applyEasing(1 - progress, 'bounceOut');
                
            case 'bounceOut':
                if (progress < 1 / 2.75) {
                    return 7.5625 * progress * progress;
                } else if (progress < 2 / 2.75) {
                    return progress - 1.5 / 2.75;
                } else if (progress < 2.5 / 2.75) {
                    return progress - 2.25 / 2.75;
                } else {
                    return progress - 2.625 / 2.75;
                }
                
            default:
                return progress;
        }
    }
    
    /**
     * 停止动画
     * @param {string} elementId - 元素ID
     */
    stopAnimation(elementId) {
        this.animations.delete(elementId);
    }
    
    /**
     * 设置元素位置
     * @param {string} id - 元素ID
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setElementPosition(id, x, y) {
        const element = this.elements.get(id);
        if (element) {
            element.x = x;
            element.y = y;
        }
    }
    
    /**
     * 设置元素大小
     * @param {string} id - 元素ID
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    setElementSize(id, width, height) {
        const element = this.elements.get(id);
        if (element) {
            element.width = width;
            element.height = height;
        }
    }
    
    /**
     * 设置元素可见性
     * @param {string} id - 元素ID
     * @param {boolean} visible - 是否可见
     */
    setElementVisible(id, visible) {
        const element = this.elements.get(id);
        if (element) {
            element.visible = visible;
        }
    }
    
    /**
     * 设置元素启用状态
     * @param {string} id - 元素ID
     * @param {boolean} enabled - 是否启用
     */
    setElementEnabled(id, enabled) {
        const element = this.elements.get(id);
        if (element) {
            element.enabled = enabled;
        }
    }
    
    /**
     * 设置元素文本
     * @param {string} id - 元素ID
     * @param {string} text - 文本
     */
    setElementText(id, text) {
        const element = this.elements.get(id);
        if (element && (element.type === 'label' || element.type === 'button')) {
            element.text = text;
        }
    }
    
    /**
     * 设置进度条值
     * @param {string} id - 元素ID
     * @param {number} value - 值
     */
    setProgressBarValue(id, value) {
        const element = this.elements.get(id);
        if (element && element.type === 'progressBar') {
            element.value = Math.max(element.minValue, Math.min(element.maxValue, value));
        }
    }
}

// 使用示例
/*
const uiSystem = new UISystem(canvas);

// 创建主菜单面板
const mainMenuPanel = uiSystem.createPanel('mainMenu', {
    x: canvas.width / 2 - 150,
    y: canvas.height / 2 - 150,
    width: 300,
    height: 300,
    cornerRadius: 10
});

// 创建标题
uiSystem.createElement('title', 'label', {
    parent: 'mainMenu',
    x: 150,
    y: 30,
    width: 300,
    height: 40,
    text: '骑士冒险',
    font: 'title',
    align: 'center'
});

// 创建开始按钮
const startButton = uiSystem.createElement('startButton', 'button', {
    parent: 'mainMenu',
    x: 75,
    y: 100,
    width: 150,
    height: 40,
    text: '开始游戏',
    onClick: () => {
        console.log('开始游戏');
        uiSystem.hidePanel('mainMenu');
        game.start();
    }
});

// 创建设置按钮
const settingsButton = uiSystem.createElement('settingsButton', 'button', {
    parent: 'mainMenu',
    x: 75,
    y: 160,
    width: 150,
    height: 40,
    text: '设置',
    onClick: () => {
        console.log('打开设置');
        uiSystem.showPanel('settingsPanel');
    }
});

// 创建退出按钮
const exitButton = uiSystem.createElement('exitButton', 'button', {
    parent: 'mainMenu',
    x: 75,
    y: 220,
    width: 150,
    height: 40,
    text: '退出游戏',
    onClick: () => {
        console.log('退出游戏');
        game.exit();
    }
});

// 创建游戏HUD
const healthBar = uiSystem.createElement('healthBar', 'progressBar', {
    x: 20,
    y: 20,
    width: 200,
    height: 20,
    fillColor: 'health',
    showText: true,
    textFormat: '{value}/{maxValue}'
});

const manaBar = uiSystem.createElement('manaBar', 'progressBar', {
    x: 20,
    y: 50,
    width: 200,
    height: 20,
    fillColor: 'mana',
    showText: true,
    textFormat: '{value}/{maxValue}'
});

const expBar = uiSystem.createElement('expBar', 'progressBar', {
    x: 20,
    y: 80,
    width: 200,
    height: 20,
    fillColor: 'experience',
    showText: true,
    textFormat: '{percent}'
});

// 显示主菜单
uiSystem.showPanel('mainMenu');

// 游戏循环中更新和渲染UI系统
function gameLoop() {
    const deltaTime = 16; // 假设60FPS
    
    // 更新UI系统
    uiSystem.update(deltaTime);
    
    // 渲染游戏
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染游戏世界...
    
    // 渲染UI系统
    uiSystem.render();
    
    requestAnimationFrame(gameLoop);
}

// 更新HUD
function updateHUD() {
    uiSystem.setProgressBarValue('healthBar', player.health);
    uiSystem.setProgressBarValue('manaBar', player.mana);
    uiSystem.setProgressBarValue('expBar', player.experience);
}

gameLoop();
*/