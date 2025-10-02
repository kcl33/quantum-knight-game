// 量子骑士游戏启动和控制脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('[KnightGame] 量子骑士游戏启动脚本已加载');
    
    // 获取语言设置
    const savedLanguage = localStorage.getItem('gameLanguage') || 'en';
    console.log('[KnightGame] 当前语言设置：', savedLanguage);
    
    // 设置语言按钮状态
    const enButton = document.getElementById('enLang');
    const zhButton = document.getElementById('zhLang');
    
    if (enButton && zhButton) {
        if (savedLanguage === 'en') {
            enButton.classList.add('active');
            zhButton.classList.remove('active');
        } else {
            zhButton.classList.add('active');
            enButton.classList.remove('active');
        }
    }
    
    // 设置量子骑士游戏开始按钮事件
    const adventureStartButton = document.getElementById('adventureStartButton');
    if (adventureStartButton) {
        adventureStartButton.addEventListener('click', function() {
            console.log('[KnightGame] 点击了量子骑士游戏开始按钮');
            const overlay = document.getElementById('adventureOverlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
            
            // 启动量子骑士游戏
            if (typeof startKnight === 'function') {
                startKnight(true);
            } else {
                console.error('[KnightGame] 找不到startKnight函数');
            }
        });
    }
    
    // 修复语言切换按钮
    if (enButton) {
        enButton.addEventListener('click', function() {
            console.log('[KnightGame] 切换到英文');
            localStorage.setItem('gameLanguage', 'en');
            enButton.classList.add('active');
            zhButton.classList.remove('active');
            
            // 如果GameManager实例存在，调用其switchLanguage方法
            if (window.gameManager && typeof window.gameManager.switchLanguage === 'function') {
                window.gameManager.switchLanguage('en');
            }
        });
    }
    
    if (zhButton) {
        zhButton.addEventListener('click', function() {
            console.log('[KnightGame] 切换到中文');
            localStorage.setItem('gameLanguage', 'zh');
            zhButton.classList.add('active');
            enButton.classList.remove('active');
            
            // 如果GameManager实例存在，调用其switchLanguage方法
            if (window.gameManager && typeof window.gameManager.switchLanguage === 'function') {
                window.gameManager.switchLanguage('zh');
            }
        });
    }
});

// 修复量子骑士游戏功能
window.fixKnight = function() {
    // 获取量子骑士游戏容器
    const adventureContainer = document.getElementById('adventureGame');
    if (!adventureContainer) return;
    
    // 获取量子骑士游戏画布
    const canvas = document.getElementById('adventureCanvas');
    if (!canvas) return;
    
    // 确保画布尺寸正确
    canvas.width = 800;
    canvas.height = 600;
    
    // 如果已经有游戏实例，先清除
    if (window.knight) {
        window.knight = null;
    }
    
    // 创建新的游戏实例
    if (typeof Knight === 'function') {
        window.knight = new Knight();
        console.log('[KnightGame] 量子骑士游戏实例已创建');
    } else {
        console.error('[KnightGame] 找不到Knight类');
    }
};

// 在页面加载完成后修复量子骑士游戏
window.addEventListener('load', function() {
    console.log('[KnightGame] 页面完全加载，修复量子骑士游戏');
    window.fixKnight();
});