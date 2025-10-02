document.addEventListener('DOMContentLoaded', function() {
    // 获取所有扑克牌游戏卡片和背面卡片
    const pokerCards = document.querySelectorAll('.poker-carousel-card');
    
    // 查找背面卡片（选择游戏卡片）
    const backCard = document.querySelector('.poker-back-card');
    
    // 如果找到了背面卡片，确保它固定在右侧
    if (backCard) {
        // 固定背面卡片逻辑
        Object.assign(backCard.style, {
            transform: 'rotate(5deg) translateX(120px) !important',
            transition: 'none',
            position: 'fixed',
            zIndex: '999',
            right: '20px',
            top: '50%',
            transformOrigin: 'right center'
        });
        backCard.dataset.fixed = 'true';
        
        // 为背面卡片添加点击事件
        backCard.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // 添加变灰效果
            this.style.filter = 'grayscale(100%) brightness(0.5) !important';
            this.style.opacity = '0.7 !important';
            
            // 200毫秒后恢复颜色
            setTimeout(() => {
                this.style.filter = '';
                this.style.opacity = '';
            }, 200);
        });
        
        // 禁用背面卡片的拖拽
        backCard.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
        
        backCard.addEventListener('mouseenter', function(e) {
            e.stopPropagation();
        });
    }
    
    // 为其他卡片添加点击事件
    pokerCards.forEach(card => {
        // 排除固定卡片
        if (card.dataset.fixed === 'true') {
            card.style.pointerEvents = 'none';
            return;
        }
        
        // 处理点击事件
        card.addEventListener('click', function(e) {
            // 如果卡片不是最前面的，不处理特殊动画
            if (this.dataset.position !== '2' || document.querySelector('[data-fixed="true"]')) {
                e.preventDefault();
                return;
            }
            
            // 跳过默认的点击事件传播
            e.stopPropagation();
            
            // 获取游戏ID
            const position = parseInt(this.dataset.position);
            
            // 如果点击的是最前面的卡片，并且背面卡片存在，让其他卡片移动到背面卡片下方
            if (backCard) {
                // 存储当前卡片的位置和样式
                const originalTransform = this.style.transform;
                
                // 实现卡片换位：当前卡片移动到选择卡片的下方
                this.style.transform = 'rotate(5deg) translateX(120px) translateY(40px)';
                this.style.transition = 'transform 0.5s ease';
                this.style.zIndex = '2'; // 确保在背面卡片下方
                
                // 1秒后恢复原始位置
                setTimeout(() => {
                    this.style.transform = originalTransform;
                    this.style.zIndex = '';
                }, 1000);
            }
        });
        
        // 鼠标悬停效果
        card.addEventListener('mouseenter', function() {
            // 只对非背面卡片添加效果
            if (this.classList.contains('poker-back-card')) {
                return;
            }
            
            // 增加z-index使其在其他卡片上方
            this.style.zIndex = '10';
            
            // 根据位置添加不同的悬停效果
            const position = parseInt(this.dataset.position);
            if (position === 0) {
                this.style.transform = 'rotate(-18deg) translateX(-200px) translateY(-10px)';
            } else if (position === 1) {
                this.style.transform = 'rotate(-12deg) translateX(-100px) translateY(-10px)';
            } else if (position === 2) {
                this.style.transform = 'rotate(-6deg) translateX(-10px) translateY(-15px)';
            } else if (position === 3) {
                this.style.transform = 'rotate(6deg) translateX(100px) translateY(-10px)';
            } else if (position === 4) {
                this.style.transform = 'rotate(12deg) translateX(190px) translateY(-5px)';
            }
            
            // 添加过渡效果
            this.style.transition = 'transform 0.3s ease, z-index 0.3s ease';
        });
        
        // 鼠标离开恢复原始位置
        card.addEventListener('mouseleave', function() {
            // 只对非背面卡片添加效果
            if (this.classList.contains('poker-back-card')) {
                return;
            }
            
            // 恢复z-index
            this.style.zIndex = '';
            
            // 根据位置恢复原始位置
            const position = parseInt(this.dataset.position);
            if (position === 0) {
                this.style.transform = 'rotate(-15deg) translateX(-180px)';
            } else if (position === 1) {
                this.style.transform = 'rotate(-10deg) translateX(-90px)';
            } else if (position === 2) {
                this.style.transform = 'rotate(-5deg) translateX(0px)';
            } else if (position === 3) {
                this.style.transform = 'rotate(5deg) translateX(90px)';
            } else if (position === 4) {
                this.style.transform = 'rotate(10deg) translateX(180px)';
            } else if (position === 5) {
                this.style.transform = 'rotate(15deg) translateX(270px)';
            }
        });
        
        // 实现拖拽效果
        card.addEventListener('mousedown', function(e) {
            // 只对非背面卡片添加拖拽效果
            if (this.classList.contains('poker-back-card')) {
                return;
            }
            
            const startX = e.clientX;
            const startY = e.clientY;
            const initialTransform = this.style.transform;
            
            // 增加z-index确保在最上层
            this.style.zIndex = '100';
            
            function handleMouseMove(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                // 保存位置数据以便稍后恢复
                card.dataset.dragging = 'true';
                
                // 应用拖拽位移
                if (initialTransform) {
                    // 解析原始transform并添加拖拽位移
                    const originalTransform = initialTransform;
                    this.style.transform = originalTransform + ' translate(' + dx + 'px, ' + dy + 'px)';
                } else {
                    // 如果没有原始transform，仅应用拖拽位移
                    this.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                }
            }
            
            function handleMouseUp(e) {
                // 移除事件监听
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                
                // 恢复z-index
                this.style.zIndex = '';
                
                // 检查是否需要移动轮播（如果拖拽距离足够大）
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 如果拖拽距离超过阈值，触发轮播移动
                if (distance > 50 && window.pokerCarousel) {
                    if (dx > 0) {
                        window.pokerCarousel.moveRight();
                    } else {
                        window.pokerCarousel.moveLeft();
                    }
                }
                
                // 恢复原始位置（如果不是轮播移动）
                this.style.transform = initialTransform;
                
                // 清除拖拽状态
                delete card.dataset.dragging;
            }
            
            // 添加事件监听
            document.addEventListener('mousemove', handleMouseMove.bind(this));
            document.addEventListener('mouseup', handleMouseUp.bind(this));
        });
    });
    
    // 键盘快捷键支持
    document.addEventListener('keydown', function(e) {
        // 1键启动贪吃蛇游戏
        if (e.key === '1') {
            if (typeof window.pokerCarousel !== 'undefined') {
                window.pokerCarousel.startGame('snake');
            }
        }
        
        // 2键启动俄罗斯方块游戏
        if (e.key === '2') {
            if (typeof window.pokerCarousel !== 'undefined') {
                window.pokerCarousel.startGame('tetris');
            }
        }
        
        // 3键启动骑士游戏
        if (e.key === '3') {
            if (typeof window.pokerCarousel !== 'undefined') {
                window.pokerCarousel.startGame('adventure');
            }
        }
        
        // ESC键返回主菜单
        if (e.key === 'Escape') {
            document.getElementById('mainMenu').style.display = 'block';
            document.getElementById('snakeGame').style.display = 'none';
            document.getElementById('tetrisGame').style.display = 'none';
            document.getElementById('adventureGame').style.display = 'none';
        }
    });
});