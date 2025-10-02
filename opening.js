// P3R风格加载界面系统 - 高性能版本
class LoadingScreen {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('openingAnimation');
        
        // 加载状态
        this.isActive = true;
        this.startTime = Date.now();
        this.minDuration = 3000; // 最小加载时间3秒
        this.particles = [];
        this.dataStreams = [];
        
        // 性能优化
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        // 初始化
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.createDataStreams();
        this.setupEventListeners();
        this.startLoadingSequence();
        this.animate();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.min(150, Math.floor(window.innerWidth / 10));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: Math.random() * -3 - 1,
                color: this.getRandomColor(),
                opacity: Math.random() * 0.8 + 0.2,
                life: Math.random() * 100 + 50
            });
        }
    }
    
    createDataStreams() {
        const streamCount = 5;
        
        for (let i = 0; i < streamCount; i++) {
            this.dataStreams.push({
                x: Math.random() * this.canvas.width,
                y: -50,
                width: Math.random() * 200 + 100,
                height: 2,
                speed: Math.random() * 3 + 2,
                color: '#00B4FF',
                opacity: Math.random() * 0.6 + 0.4
            });
        }
    }
    
    getRandomColor() {
        const colors = ['#002FA7', '#00B4FF', '#00FFFF', '#FFFFFF', '#FFD700'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    setupEventListeners() {
        // 空格键跳过加载
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isActive) {
                this.skipLoading();
            }
        });
        
        // 点击跳过
        this.container.addEventListener('click', () => {
            if (this.isActive) {
                this.skipLoading();
            }
        });
    }
    
    startLoadingSequence() {
        const statusText = document.getElementById('statusText');
        const progressText = document.getElementById('progressText');
        
        const messages = [
            '系统初始化中...',
            '游戏系统加载中...',
            '连接游戏服务器中...',
            '游戏数据准备中...',
            '准备就绪'
        ];
        
        let currentMessage = 0;
        let progress = 0;
        
        const updateSequence = () => {
            if (!this.isActive) return;
            
            // 更新进度
            progress = Math.min(100, progress + Math.random() * 15 + 5);
            progressText.textContent = Math.floor(progress) + '%';
            
            // 更新状态消息
            if (progress > currentMessage * 20 && currentMessage < messages.length - 1) {
                currentMessage++;
                statusText.textContent = messages[currentMessage];
                
                // 添加打字机效果
                statusText.style.animation = 'none';
                requestAnimationFrame(() => {
                    statusText.style.animation = 'value-update 0.5s ease-in-out';
                });
            }
            
            if (progress < 100) {
                setTimeout(updateSequence, 200 + Math.random() * 300);
            } else {
                // 确保至少显示最小加载时间
                const elapsedTime = Date.now() - this.startTime;
                const remainingTime = Math.max(0, this.minDuration - elapsedTime);
                
                setTimeout(() => this.completeLoading(), remainingTime);
            }
        };
        
        setTimeout(updateSequence, 500);
    }
    
    animate(currentTime = 0) {
        if (!this.isActive) return;
        
        // 性能控制
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            requestAnimationFrame((time) => this.animate(time));
            return;
        }
        this.lastFrameTime = currentTime;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制粒子
        this.updateParticles();
        this.drawParticles();
        
        // 更新和绘制数据流
        this.updateDataStreams();
        this.drawDataStreams();
        
        // 绘制连接线
        this.drawConnectionLines();
        
        requestAnimationFrame((time) => this.animate(time));
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life--;
            
            // 边界处理
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0) {
                particle.y = this.canvas.height;
            }
            
            // 重生粒子
            if (particle.life <= 0) {
                particle.x = Math.random() * this.canvas.width;
                particle.y = this.canvas.height + 50;
                particle.life = Math.random() * 100 + 50;
                particle.color = this.getRandomColor();
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    updateDataStreams() {
        this.dataStreams.forEach(stream => {
            stream.y += stream.speed;
            
            if (stream.y > this.canvas.height + 50) {
                stream.y = -50;
                stream.x = Math.random() * this.canvas.width;
            }
        });
    }
    
    drawDataStreams() {
        this.dataStreams.forEach(stream => {
            this.ctx.save();
            this.ctx.globalAlpha = stream.opacity;
            
            // 创建渐变
            const gradient = this.ctx.createLinearGradient(
                stream.x, stream.y, 
                stream.x + stream.width, stream.y
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, stream.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(stream.x, stream.y, stream.width, stream.height);
            
            this.ctx.restore();
        });
    }
    
    drawConnectionLines() {
        const time = Date.now() * 0.001;
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#00B4FF';
        this.ctx.lineWidth = 1;
        
        // 绘制动态连接线
        for (let i = 0; i < this.particles.length; i += 5) {
            const particle = this.particles[i];
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            const distance = Math.sqrt(
                (particle.x - centerX) ** 2 + (particle.y - centerY) ** 2
            );
            
            if (distance < 200) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(
                    centerX + Math.sin(time + i) * 50,
                    centerY + Math.cos(time + i) * 50
                );
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    skipLoading() {
        this.completeLoading();
    }
    
    completeLoading() {
        this.isActive = false;
        
        // 淡出动画
        this.container.classList.add('fade-out');
        
        setTimeout(() => {
            this.container.style.display = 'none';
            // 启动主菜单
            document.getElementById('mainMenu').style.display = 'flex';
            
            // 加载完成后只显示"选择游戏"卡片（索引为3的卡片）
            const pokerElements = document.querySelectorAll('.poker');
            pokerElements.forEach((poker, index) => {
                if (index === 3) {
                    poker.style.display = 'block';
                } else {
                    poker.style.display = 'none';
                }
            });
        }, 1000);
    }
}

// 页面加载完成后启动加载界面
document.addEventListener('DOMContentLoaded', () => {
    // 先显示加载界面
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('snakeGame').style.display = 'none';
    document.getElementById('tetrisGame').style.display = 'none';
    
    // 确保所有卡片在开场动画期间都不显示
    const pokerElements = document.querySelectorAll('.poker');
    pokerElements.forEach((poker) => {
        poker.style.display = 'none';
    });
    
    // 启动加载界面
    new LoadingScreen();
});