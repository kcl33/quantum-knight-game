/**
 * 骑士游戏 - 输入系统示例
 * Knight Game - Input System Example
 */

class InputSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = new Map();
        this.mouseButtons = new Map();
        this.touches = new Map();
        this.gamepads = new Map();
        this.accelerometer = { x: 0, y: 0, z: 0 };
        this.gyroscope = { x: 0, y: 0, z: 0 };
        this.mousePosition = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };
        this.mouseWheel = { x: 0, y: 0 };
        this.inputListeners = [];
        this.inputMappings = new Map();
        this.inputContexts = new Map();
        this.currentContext = 'default';
        this.isLocked = false;
        this.virtualJoysticks = new Map();
        this.virtualButtons = new Map();
        
        // 初始化输入系统
        this.init();
    }
    
    /**
     * 初始化输入系统
     */
    init() {
        // 设置默认输入映射
        this.setupDefaultMappings();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 设置游戏手柄监听
        this.setupGamepadListeners();
        
        // 设置设备方向监听
        this.setupDeviceOrientationListeners();
        
        // 设置触摸事件监听
        this.setupTouchListeners();
    }
    
    /**
     * 设置默认输入映射
     */
    setupDefaultMappings() {
        // 键盘映射
        this.addInputMapping('default', 'moveUp', ['KeyW', 'ArrowUp']);
        this.addInputMapping('default', 'moveDown', ['KeyS', 'ArrowDown']);
        this.addInputMapping('default', 'moveLeft', ['KeyA', 'ArrowLeft']);
        this.addInputMapping('default', 'moveRight', ['KeyD', 'ArrowRight']);
        this.addInputMapping('default', 'jump', ['Space']);
        this.addInputMapping('default', 'attack', ['KeyJ', 'Mouse0']);
        this.addInputMapping('default', 'specialAttack', ['KeyK', 'Mouse1']);
        this.addInputMapping('default', 'block', ['KeyL', 'ShiftLeft']);
        this.addInputMapping('default', 'useSkill', ['KeyU']);
        this.addInputMapping('default', 'interact', ['KeyE']);
        this.addInputMapping('default', 'inventory', ['KeyI']);
        this.addInputMapping('default', 'pause', ['Escape']);
        this.addInputMapping('default', 'menu', ['Tab']);
        
        // 游戏手柄映射
        this.addInputMapping('default', 'moveUp', ['Gamepad0-Button12']);
        this.addInputMapping('default', 'moveDown', ['Gamepad0-Button13']);
        this.addInputMapping('default', 'moveLeft', ['Gamepad0-Button14']);
        this.addInputMapping('default', 'moveRight', ['Gamepad0-Button15']);
        this.addInputMapping('default', 'jump', ['Gamepad0-Button0']);
        this.addInputMapping('default', 'attack', ['Gamepad0-Button2']);
        this.addInputMapping('default', 'specialAttack', ['Gamepad0-Button1']);
        this.addInputMapping('default', 'block', ['Gamepad0-Button5']);
        this.addInputMapping('default', 'useSkill', ['Gamepad0-Button3']);
        this.addInputMapping('default', 'interact', ['Gamepad0-Button4']);
        this.addInputMapping('default', 'inventory', ['Gamepad0-Button9']);
        this.addInputMapping('default', 'pause', ['Gamepad0-Button8', 'Gamepad0-Button7']);
        
        // 创建输入上下文
        this.addInputContext('default');
        this.addInputContext('menu');
        this.addInputContext('dialog');
        this.addInputContext('inventory');
        this.addInputContext('game');
        
        // 为不同上下文设置输入映射
        this.addInputMapping('menu', 'navigateUp', ['KeyW', 'ArrowUp', 'Gamepad0-Button12']);
        this.addInputMapping('menu', 'navigateDown', ['KeyS', 'ArrowDown', 'Gamepad0-Button13']);
        this.addInputMapping('menu', 'navigateLeft', ['KeyA', 'ArrowLeft', 'Gamepad0-Button14']);
        this.addInputMapping('menu', 'navigateRight', ['KeyD', 'ArrowRight', 'Gamepad0-Button15']);
        this.addInputMapping('menu', 'select', ['Enter', 'Space', 'Gamepad0-Button0']);
        this.addInputMapping('menu', 'back', ['Escape', 'Gamepad0-Button1']);
        
        this.addInputMapping('dialog', 'next', ['Enter', 'Space', 'Gamepad0-Button0']);
        this.addInputMapping('dialog', 'skip', ['Escape', 'Gamepad0-Button1']);
        
        this.addInputMapping('inventory', 'navigateUp', ['KeyW', 'ArrowUp', 'Gamepad0-Button12']);
        this.addInputMapping('inventory', 'navigateDown', ['KeyS', 'ArrowDown', 'Gamepad0-Button13']);
        this.addInputMapping('inventory', 'navigateLeft', ['KeyA', 'ArrowLeft', 'Gamepad0-Button14']);
        this.addInputMapping('inventory', 'navigateRight', ['KeyD', 'ArrowRight', 'Gamepad0-Button15']);
        this.addInputMapping('inventory', 'select', ['Enter', 'Space', 'Gamepad0-Button0']);
        this.addInputMapping('inventory', 'back', ['Escape', 'KeyI', 'Gamepad0-Button1']);
        this.addInputMapping('inventory', 'useItem', ['KeyE', 'Gamepad0-Button3']);
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 键盘事件
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // 指针锁定事件
        document.addEventListener('pointerlockchange', () => this.handlePointerLockChange());
        document.addEventListener('pointerlockerror', () => this.handlePointerLockError());
    }
    
    /**
     * 设置游戏手柄监听
     */
    setupGamepadListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log(`游戏手柄已连接: ${e.gamepad.id}`);
            this.gamepads.set(e.gamepad.index, e.gamepad);
            this.notifyListeners('gamepadConnected', { gamepad: e.gamepad });
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log(`游戏手柄已断开: ${e.gamepad.id}`);
            this.gamepads.delete(e.gamepad.index);
            this.notifyListeners('gamepadDisconnected', { gamepad: e.gamepad });
        });
    }
    
    /**
     * 设置设备方向监听
     */
    setupDeviceOrientationListeners() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                this.accelerometer = {
                    x: e.accelerationIncludingGravity.x || 0,
                    y: e.accelerationIncludingGravity.y || 0,
                    z: e.accelerationIncludingGravity.z || 0
                };
                
                this.gyroscope = {
                    x: e.beta || 0,
                    y: e.gamma || 0,
                    z: e.alpha || 0
                };
                
                this.notifyListeners('deviceOrientationChanged', {
                    accelerometer: this.accelerometer,
                    gyroscope: this.gyroscope
                });
            });
        }
    }
    
    /**
     * 设置触摸事件监听
     */
    setupTouchListeners() {
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchCancel(e));
    }
    
    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown(e) {
        // 防止默认行为
        if (this.isPreventDefaultKey(e.code)) {
            e.preventDefault();
        }
        
        // 更新按键状态
        this.keys.set(e.code, {
            pressed: true,
            timestamp: Date.now(),
            repeat: e.repeat
        });
        
        // 通知监听器
        this.notifyListeners('keyDown', {
            code: e.code,
            key: e.key,
            repeat: e.repeat
        });
        
        // 处理输入映射
        this.handleInputMapping(e.code, true);
    }
    
    /**
     * 处理键盘释放事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyUp(e) {
        // 防止默认行为
        if (this.isPreventDefaultKey(e.code)) {
            e.preventDefault();
        }
        
        // 更新按键状态
        this.keys.set(e.code, {
            pressed: false,
            timestamp: Date.now(),
            repeat: false
        });
        
        // 通知监听器
        this.notifyListeners('keyUp', {
            code: e.code,
            key: e.key
        });
        
        // 处理输入映射
        this.handleInputMapping(e.code, false);
    }
    
    /**
     * 处理鼠标按下事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseDown(e) {
        // 更新鼠标按钮状态
        this.mouseButtons.set(e.button, {
            pressed: true,
            timestamp: Date.now()
        });
        
        // 更新鼠标位置
        this.updateMousePosition(e);
        
        // 通知监听器
        this.notifyListeners('mouseDown', {
            button: e.button,
            x: this.mousePosition.x,
            y: this.mousePosition.y
        });
        
        // 处理输入映射
        this.handleInputMapping(`Mouse${e.button}`, true);
    }
    
    /**
     * 处理鼠标释放事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseUp(e) {
        // 更新鼠标按钮状态
        this.mouseButtons.set(e.button, {
            pressed: false,
            timestamp: Date.now()
        });
        
        // 更新鼠标位置
        this.updateMousePosition(e);
        
        // 通知监听器
        this.notifyListeners('mouseUp', {
            button: e.button,
            x: this.mousePosition.x,
            y: this.mousePosition.y
        });
        
        // 处理输入映射
        this.handleInputMapping(`Mouse${e.button}`, false);
    }
    
    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseMove(e) {
        // 保存上一个位置
        const prevX = this.mousePosition.x;
        const prevY = this.mousePosition.y;
        
        // 更新鼠标位置
        this.updateMousePosition(e);
        
        // 计算鼠标增量
        this.mouseDelta.x = this.mousePosition.x - prevX;
        this.mouseDelta.y = this.mousePosition.y - prevY;
        
        // 通知监听器
        this.notifyListeners('mouseMove', {
            x: this.mousePosition.x,
            y: this.mousePosition.y,
            deltaX: this.mouseDelta.x,
            deltaY: this.mouseDelta.y
        });
    }
    
    /**
     * 处理鼠标滚轮事件
     * @param {WheelEvent} e - 滚轮事件
     */
    handleMouseWheel(e) {
        // 更新鼠标滚轮状态
        this.mouseWheel.x = e.deltaX;
        this.mouseWheel.y = e.deltaY;
        
        // 通知监听器
        this.notifyListeners('mouseWheel', {
            x: this.mouseWheel.x,
            y: this.mouseWheel.y
        });
        
        // 处理输入映射
        if (this.mouseWheel.y > 0) {
            this.handleInputMapping('MouseWheelUp', true);
            this.handleInputMapping('MouseWheelUp', false);
        } else if (this.mouseWheel.y < 0) {
            this.handleInputMapping('MouseWheelDown', true);
            this.handleInputMapping('MouseWheelDown', false);
        }
    }
    
    /**
     * 处理触摸开始事件
     * @param {TouchEvent} e - 触摸事件
     */
    handleTouchStart(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.touches.set(touch.identifier, {
                x,
                y,
                startX: x,
                startY: y,
                timestamp: Date.now(),
                pressed: true
            });
            
            this.notifyListeners('touchStart', {
                id: touch.identifier,
                x,
                y
            });
            
            // 处理虚拟按钮
            this.handleVirtualButton(x, y, true);
        }
    }
    
    /**
     * 处理触摸移动事件
     * @param {TouchEvent} e - 触摸事件
     */
    handleTouchMove(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                touchData.x = x;
                touchData.y = y;
                touchData.deltaX = x - touchData.prevX || 0;
                touchData.deltaY = y - touchData.prevY || 0;
                touchData.prevX = x;
                touchData.prevY = y;
            }
            
            this.notifyListeners('touchMove', {
                id: touch.identifier,
                x,
                y
            });
            
            // 处理虚拟摇杆
            this.handleVirtualJoystick(touch.identifier, x, y);
        }
    }
    
    /**
     * 处理触摸结束事件
     * @param {TouchEvent} e - 触摸事件
     */
    handleTouchEnd(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchData = this.touches.get(touch.identifier);
            
            if (touchData) {
                const x = touchData.x;
                const y = touchData.y;
                
                this.touches.delete(touch.identifier);
                
                this.notifyListeners('touchEnd', {
                    id: touch.identifier,
                    x,
                    y
                });
                
                // 处理虚拟按钮
                this.handleVirtualButton(x, y, false);
                
                // 重置虚拟摇杆
                this.resetVirtualJoystick(touch.identifier);
            }
        }
    }
    
    /**
     * 处理触摸取消事件
     * @param {TouchEvent} e - 触摸事件
     */
    handleTouchCancel(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchData = this.touches.get(touch.identifier);
            
            if (touchData) {
                const x = touchData.x;
                const y = touchData.y;
                
                this.touches.delete(touch.identifier);
                
                this.notifyListeners('touchCancel', {
                    id: touch.identifier,
                    x,
                    y
                });
                
                // 重置虚拟摇杆
                this.resetVirtualJoystick(touch.identifier);
            }
        }
    }
    
    /**
     * 处理指针锁定变化
     */
    handlePointerLockChange() {
        this.isLocked = document.pointerLockElement === this.canvas;
        this.notifyListeners('pointerLockChanged', { locked: this.isLocked });
    }
    
    /**
     * 处理指针锁定错误
     */
    handlePointerLockError() {
        console.error('指针锁定失败');
        this.notifyListeners('pointerLockError', {});
    }
    
    /**
     * 更新鼠标位置
     * @param {MouseEvent} e - 鼠标事件
     */
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = e.clientX - rect.left;
        this.mousePosition.y = e.clientY - rect.top;
    }
    
    /**
     * 检查是否是阻止默认行为的按键
     * @param {string} code - 按键代码
     * @returns {boolean} - 是否阻止默认行为
     */
    isPreventDefaultKey(code) {
        const preventDefaultKeys = [
            'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Tab', 'Escape'
        ];
        return preventDefaultKeys.includes(code);
    }
    
    /**
     * 添加输入映射
     * @param {string} context - 输入上下文
     * @param {string} action - 动作名称
     * @param {Array} inputs - 输入数组
     */
    addInputMapping(context, action, inputs) {
        if (!this.inputMappings.has(context)) {
            this.inputMappings.set(context, new Map());
        }
        
        const contextMappings = this.inputMappings.get(context);
        contextMappings.set(action, inputs);
    }
    
    /**
     * 添加输入上下文
     * @param {string} context - 上下文名称
     */
    addInputContext(context) {
        if (!this.inputContexts.has(context)) {
            this.inputContexts.set(context, {
                active: false,
                mappings: new Map()
            });
        }
    }
    
    /**
     * 设置输入上下文
     * @param {string} context - 上下文名称
     */
    setInputContext(context) {
        if (this.inputContexts.has(context)) {
            // 禁用所有上下文
            this.inputContexts.forEach((ctx, name) => {
                ctx.active = false;
            });
            
            // 启用指定上下文
            this.inputContexts.get(context).active = true;
            this.currentContext = context;
            
            this.notifyListeners('inputContextChanged', { context });
        }
    }
    
    /**
     * 处理输入映射
     * @param {string} input - 输入
     * @param {boolean} pressed - 是否按下
     */
    handleInputMapping(input, pressed) {
        const contextMappings = this.inputMappings.get(this.currentContext);
        if (!contextMappings) return;
        
        contextMappings.forEach((inputs, action) => {
            if (inputs.includes(input)) {
                this.notifyListeners('action', {
                    action,
                    pressed,
                    input
                });
            }
        });
    }
    
    /**
     * 添加虚拟摇杆
     * @param {string} id - 摇杆ID
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} radius - 半径
     */
    addVirtualJoystick(id, x, y, radius) {
        this.virtualJoysticks.set(id, {
            x,
            y,
            radius,
            knobX: x,
            knobY: y,
            active: false,
            touchId: null,
            valueX: 0,
            valueY: 0
        });
    }
    
    /**
     * 处理虚拟摇杆
     * @param {number} touchId - 触摸ID
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    handleVirtualJoystick(touchId, x, y) {
        this.virtualJoysticks.forEach((joystick, id) => {
            if (!joystick.active) {
                // 检查触摸是否在摇杆范围内
                const dx = x - joystick.x;
                const dy = y - joystick.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= joystick.radius) {
                    joystick.active = true;
                    joystick.touchId = touchId;
                }
            } else if (joystick.touchId === touchId) {
                // 更新摇杆位置
                const dx = x - joystick.x;
                const dy = y - joystick.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= joystick.radius) {
                    joystick.knobX = x;
                    joystick.knobY = y;
                } else {
                    // 限制在半径范围内
                    const angle = Math.atan2(dy, dx);
                    joystick.knobX = joystick.x + Math.cos(angle) * joystick.radius;
                    joystick.knobY = joystick.y + Math.sin(angle) * joystick.radius;
                }
                
                // 计算值（-1到1）
                joystick.valueX = (joystick.knobX - joystick.x) / joystick.radius;
                joystick.valueY = (joystick.knobY - joystick.y) / joystick.radius;
                
                // 通知监听器
                this.notifyListeners('virtualJoystickMove', {
                    id,
                    valueX: joystick.valueX,
                    valueY: joystick.valueY
                });
                
                // 处理输入映射
                if (Math.abs(joystick.valueX) > 0.5) {
                    if (joystick.valueX > 0) {
                        this.handleInputMapping('VirtualJoystickRight', true);
                    } else {
                        this.handleInputMapping('VirtualJoystickLeft', true);
                    }
                } else {
                    this.handleInputMapping('VirtualJoystickRight', false);
                    this.handleInputMapping('VirtualJoystickLeft', false);
                }
                
                if (Math.abs(joystick.valueY) > 0.5) {
                    if (joystick.valueY > 0) {
                        this.handleInputMapping('VirtualJoystickDown', true);
                    } else {
                        this.handleInputMapping('VirtualJoystickUp', true);
                    }
                } else {
                    this.handleInputMapping('VirtualJoystickDown', false);
                    this.handleInputMapping('VirtualJoystickUp', false);
                }
            }
        });
    }
    
    /**
     * 重置虚拟摇杆
     * @param {number} touchId - 触摸ID
     */
    resetVirtualJoystick(touchId) {
        this.virtualJoysticks.forEach((joystick, id) => {
            if (joystick.touchId === touchId) {
                joystick.active = false;
                joystick.touchId = null;
                joystick.knobX = joystick.x;
                joystick.knobY = joystick.y;
                joystick.valueX = 0;
                joystick.valueY = 0;
                
                // 通知监听器
                this.notifyListeners('virtualJoystickReset', { id });
                
                // 处理输入映射
                this.handleInputMapping('VirtualJoystickRight', false);
                this.handleInputMapping('VirtualJoystickLeft', false);
                this.handleInputMapping('VirtualJoystickDown', false);
                this.handleInputMapping('VirtualJoystickUp', false);
            }
        });
    }
    
    /**
     * 添加虚拟按钮
     * @param {string} id - 按钮ID
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    addVirtualButton(id, x, y, width, height) {
        this.virtualButtons.set(id, {
            x,
            y,
            width,
            height,
            pressed: false
        });
    }
    
    /**
     * 处理虚拟按钮
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {boolean} pressed - 是否按下
     */
    handleVirtualButton(x, y, pressed) {
        this.virtualButtons.forEach((button, id) => {
            const isInside = x >= button.x && x <= button.x + button.width &&
                            y >= button.y && y <= button.y + button.height;
            
            if (isInside && button.pressed !== pressed) {
                button.pressed = pressed;
                
                // 通知监听器
                this.notifyListeners('virtualButton', {
                    id,
                    pressed
                });
                
                // 处理输入映射
                this.handleInputMapping(`VirtualButton${id}`, pressed);
            }
        });
    }
    
    /**
     * 添加输入监听器
     * @param {Function} listener - 监听器函数
     */
    addListener(listener) {
        this.inputListeners.push(listener);
    }
    
    /**
     * 移除输入监听器
     * @param {Function} listener - 监听器函数
     */
    removeListener(listener) {
        const index = this.inputListeners.indexOf(listener);
        if (index !== -1) {
            this.inputListeners.splice(index, 1);
        }
    }
    
    /**
     * 通知监听器
     * @param {string} event - 事件名称
     * @param {Object} data - 事件数据
     */
    notifyListeners(event, data) {
        this.inputListeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (e) {
                console.error('输入监听器错误:', e);
            }
        });
    }
    
    /**
     * 检查按键是否按下
     * @param {string} code - 按键代码
     * @returns {boolean} - 是否按下
     */
    isKeyPressed(code) {
        const key = this.keys.get(code);
        return key ? key.pressed : false;
    }
    
    /**
     * 检查按键是否刚刚按下
     * @param {string} code - 按键代码
     * @returns {boolean} - 是否刚刚按下
     */
    isKeyJustPressed(code) {
        const key = this.keys.get(code);
        return key && key.pressed && !key.repeat;
    }
    
    /**
     * 检查鼠标按钮是否按下
     * @param {number} button - 按钮索引
     * @returns {boolean} - 是否按下
     */
    isMouseButtonPressed(button) {
        const mouseButton = this.mouseButtons.get(button);
        return mouseButton ? mouseButton.pressed : false;
    }
    
    /**
     * 检查动作是否激活
     * @param {string} action - 动作名称
     * @returns {boolean} - 是否激活
     */
    isActionActive(action) {
        const contextMappings = this.inputMappings.get(this.currentContext);
        if (!contextMappings) return false;
        
        const inputs = contextMappings.get(action);
        if (!inputs) return false;
        
        for (const input of inputs) {
            if (input.startsWith('Key') || input.startsWith('Arrow')) {
                if (this.isKeyPressed(input)) return true;
            } else if (input.startsWith('Mouse')) {
                const button = parseInt(input.replace('Mouse', ''));
                if (this.isMouseButtonPressed(button)) return true;
            } else if (input.startsWith('Gamepad')) {
                // 检查游戏手柄按钮
                if (this.isGamepadButtonPressed(input)) return true;
            } else if (input.startsWith('VirtualJoystick') || input.startsWith('VirtualButton')) {
                // 检查虚拟控件
                if (this.isVirtualControlActive(input)) return true;
            }
        }
        
        return false;
    }
    
    /**
     * 检查游戏手柄按钮是否按下
     * @param {string} input - 输入
     * @returns {boolean} - 是否按下
     */
    isGamepadButtonPressed(input) {
        const match = input.match(/Gamepad(\d+)-Button(\d+)/);
        if (!match) return false;
        
        const gamepadIndex = parseInt(match[1]);
        const buttonIndex = parseInt(match[2]);
        
        const gamepad = this.gamepads.get(gamepadIndex);
        if (!gamepad || !gamepad.buttons || buttonIndex >= gamepad.buttons.length) {
            return false;
        }
        
        return gamepad.buttons[buttonIndex].pressed;
    }
    
    /**
     * 检查虚拟控件是否激活
     * @param {string} input - 输入
     * @returns {boolean} - 是否激活
     */
    isVirtualControlActive(input) {
        if (input.startsWith('VirtualJoystick')) {
            const direction = input.replace('VirtualJoystick', '');
            
            for (const joystick of this.virtualJoysticks.values()) {
                if (joystick.active) {
                    switch (direction) {
                        case 'Up':
                            return joystick.valueY < -0.5;
                        case 'Down':
                            return joystick.valueY > 0.5;
                        case 'Left':
                            return joystick.valueX < -0.5;
                        case 'Right':
                            return joystick.valueX > 0.5;
                    }
                }
            }
        } else if (input.startsWith('VirtualButton')) {
            const buttonId = input.replace('VirtualButton', '');
            const button = this.virtualButtons.get(buttonId);
            return button ? button.pressed : false;
        }
        
        return false;
    }
    
    /**
     * 获取动作值
     * @param {string} action - 动作名称
     * @returns {number} - 动作值
     */
    getActionValue(action) {
        // 对于模拟输入，返回-1到1之间的值
        // 对于数字输入，返回0或1
        
        const contextMappings = this.inputMappings.get(this.currentContext);
        if (!contextMappings) return 0;
        
        const inputs = contextMappings.get(action);
        if (!inputs) return 0;
        
        for (const input of inputs) {
            if (input.startsWith('VirtualJoystick')) {
                const direction = input.replace('VirtualJoystick', '');
                
                for (const joystick of this.virtualJoysticks.values()) {
                    if (joystick.active) {
                        switch (direction) {
                            case 'X':
                                return joystick.valueX;
                            case 'Y':
                                return joystick.valueY;
                        }
                    }
                }
            } else if (input.startsWith('Gamepad')) {
                const match = input.match(/Gamepad(\d+)-Axis(\d+)/);
                if (match) {
                    const gamepadIndex = parseInt(match[1]);
                    const axisIndex = parseInt(match[2]);
                    
                    const gamepad = this.gamepads.get(gamepadIndex);
                    if (gamepad && gamepad.axes && axisIndex < gamepad.axes.length) {
                        return gamepad.axes[axisIndex];
                    }
                }
            }
        }
        
        // 对于数字输入，返回0或1
        return this.isActionActive(action) ? 1 : 0;
    }
    
    /**
     * 请求指针锁定
     */
    requestPointerLock() {
        this.canvas.requestPointerLock();
    }
    
    /**
     * 退出指针锁定
     */
    exitPointerLock() {
        document.exitPointerLock();
    }
    
    /**
     * 更新输入系统
     */
    update() {
        // 更新游戏手柄状态
        this.gamepads.forEach((gamepad, index) => {
            const updatedGamepad = navigator.getGamepads()[index];
            if (updatedGamepad) {
                // 检查按钮状态变化
                for (let i = 0; i < updatedGamepad.buttons.length; i++) {
                    const button = updatedGamepad.buttons[i];
                    const previousButton = gamepad.buttons[i];
                    
                    if (previousButton && previousButton.pressed !== button.pressed) {
                        this.notifyListeners('gamepadButton', {
                            gamepadIndex: index,
                            buttonIndex: i,
                            pressed: button.pressed
                        });
                        
                        // 处理输入映射
                        this.handleInputMapping(`Gamepad${index}-Button${i}`, button.pressed);
                    }
                }
                
                // 检查轴状态变化
                for (let i = 0; i < updatedGamepad.axes.length; i++) {
                    const axis = updatedGamepad.axes[i];
                    const previousAxis = gamepad.axes[i];
                    
                    if (previousAxis !== undefined && Math.abs(previousAxis - axis) > 0.01) {
                        this.notifyListeners('gamepadAxis', {
                            gamepadIndex: index,
                            axisIndex: i,
                            value: axis
                        });
                    }
                }
                
                // 更新游戏手柄状态
                this.gamepads.set(index, updatedGamepad);
            }
        });
        
        // 重置鼠标增量
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        
        // 重置鼠标滚轮
        this.mouseWheel.x = 0;
        this.mouseWheel.y = 0;
    }
    
    /**
     * 渲染虚拟控件
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    renderVirtualControls(ctx) {
        // 渲染虚拟摇杆
        this.virtualJoysticks.forEach((joystick, id) => {
            // 绘制底座
            ctx.beginPath();
            ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制摇杆
            ctx.beginPath();
            ctx.arc(joystick.knobX, joystick.knobY, joystick.radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fill();
        });
        
        // 渲染虚拟按钮
        this.virtualButtons.forEach((button, id) => {
            ctx.beginPath();
            ctx.rect(button.x, button.y, button.width, button.height);
            ctx.fillStyle = button.pressed ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
}

// 使用示例
/*
const inputSystem = new InputSystem(canvas);

// 添加输入监听器
inputSystem.addListener((event, data) => {
    switch (event) {
        case 'action':
            console.log(`动作: ${data.action}, 按下: ${data.pressed}, 输入: ${data.input}`);
            
            // 处理游戏动作
            switch (data.action) {
                case 'moveUp':
                    player.moveUp = data.pressed;
                    break;
                case 'moveDown':
                    player.moveDown = data.pressed;
                    break;
                case 'moveLeft':
                    player.moveLeft = data.pressed;
                    break;
                case 'moveRight':
                    player.moveRight = data.pressed;
                    break;
                case 'jump':
                    if (data.pressed) player.jump();
                    break;
                case 'attack':
                    if (data.pressed) player.attack();
                    break;
                case 'specialAttack':
                    if (data.pressed) player.specialAttack();
                    break;
                case 'block':
                    player.block = data.pressed;
                    break;
                case 'useSkill':
                    if (data.pressed) player.useSkill();
                    break;
                case 'interact':
                    if (data.pressed) player.interact();
                    break;
                case 'inventory':
                    if (data.pressed) toggleInventory();
                    break;
                case 'pause':
                    if (data.pressed) togglePause();
                    break;
                case 'menu':
                    if (data.pressed) toggleMenu();
                    break;
            }
            break;
            
        case 'mouseMove':
            // 处理鼠标移动
            if (inputSystem.isLocked) {
                player.rotation.x += data.deltaX * 0.002;
                player.rotation.y += data.deltaY * 0.002;
            }
            break;
            
        case 'gamepadConnected':
            console.log(`游戏手柄已连接: ${data.gamepad.id}`);
            // 显示游戏手柄UI
            showGamepadUI();
            break;
            
        case 'gamepadDisconnected':
            console.log(`游戏手柄已断开: ${data.gamepad.id}`);
            // 隐藏游戏手柄UI
            hideGamepadUI();
            break;
    }
});

// 设置输入上下文
function setGameContext() {
    inputSystem.setInputContext('game');
}

function setMenuContext() {
    inputSystem.setInputContext('menu');
}

function setInventoryContext() {
    inputSystem.setInputContext('inventory');
}

function setDialogContext() {
    inputSystem.setInputContext('dialog');
}

// 添加虚拟控件（用于移动设备）
function setupVirtualControls() {
    // 添加虚拟摇杆
    inputSystem.addVirtualJoystick('left', 100, canvas.height - 100, 50);
    
    // 添加虚拟按钮
    inputSystem.addVirtualButton('A', canvas.width - 150, canvas.height - 100, 60, 60);
    inputSystem.addVirtualButton('B', canvas.width - 80, canvas.height - 170, 60, 60);
    
    // 添加虚拟按钮映射
    inputSystem.addInputMapping('default', 'attack', ['VirtualButtonA']);
    inputSystem.addInputMapping('default', 'specialAttack', ['VirtualButtonB']);
    inputSystem.addInputMapping('default', 'moveUp', ['VirtualJoystickUp']);
    inputSystem.addInputMapping('default', 'moveDown', ['VirtualJoystickDown']);
    inputSystem.addInputMapping('default', 'moveLeft', ['VirtualJoystickLeft']);
    inputSystem.addInputMapping('default', 'moveRight', ['VirtualJoystickRight']);
}

// 游戏循环
function gameLoop() {
    // 更新输入系统
    inputSystem.update();
    
    // 获取动作值（用于模拟输入）
    const moveX = inputSystem.getActionValue('moveRight') - inputSystem.getActionValue('moveLeft');
    const moveY = inputSystem.getActionValue('moveDown') - inputSystem.getActionValue('moveUp');
    
    // 应用移动
    player.velocity.x = moveX * player.speed;
    player.velocity.y = moveY * player.speed;
    
    // 渲染游戏
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 渲染游戏世界...
    
    // 渲染虚拟控件
    inputSystem.renderVirtualControls(ctx);
    
    requestAnimationFrame(gameLoop);
}

// 事件处理
canvas.addEventListener('click', () => {
    if (!inputSystem.isLocked) {
        inputSystem.requestPointerLock();
    }
});

// 初始化
setupVirtualControls();
setGameContext();
gameLoop();
*/