// JIEJOE produce
// b站主页：https://space.bilibili.com/3546390319860710
const poker = {
    games: [
        {
            id: 'snake',
            name: '贪吃蛇',
            icon: '🐍',
            description: '经典的贪吃蛇游戏，控制蛇吃到食物并避免撞到墙壁或自己的身体',
            color: '#002FA7' // 克莱因蓝
        },
        {
            id: 'tetris',
            name: '俄罗斯方块',
            icon: '🧩',
            description: '经典的俄罗斯方块游戏，排列方块消除行数获得高分',
            color: '#FFFFFF' // 白色
        },
        {
            id: 'knight',
            name: '量子骑士',
            icon: '⚔️',
            description: '冒险游戏，控制量子骑士战斗并探索世界',
            color: '#002FA7' // 克莱因蓝
        },
        {
            id: 'select',
            name: '选择游戏',
            icon: '🎮',
            description: '点击顶部卡片切换游戏',
            color: '#FFFFFF', // 白色
            isSelectCard: true // 标记为选择游戏卡片
        }
    ],
    game_index: 0,
    poker_eles: {},
    transform_datas: [
        "rotate(-10deg)",
        "rotate(-6deg) translate(35%, -12%)",
        "rotate(-2deg) translate(65%, -19%)",
        "rotate(2deg) translate(95%, -26%)",
        "rotate(6deg) translate(125%, -23%)",
    ],
    init() {
        this.poker_eles = [...document.getElementsByClassName("poker")];
        this.poker_eles.forEach((obj, index) => {
            obj.nums = index;
            // 为每个扑克牌添加游戏内容
            this.updatePokerContent(obj, index);
            
            // 添加点击事件，但排除"选择游戏"卡片
            if (index < this.poker_eles.length - 1) {
                obj.addEventListener('click', () => {
                    // 获取当前卡片实际显示的游戏索引
                    const gameIndex = (this.game_index + index) % this.games.length;
                    this.navigateToGame(this.games[gameIndex].id);
                });
            }
            
            // 初始化时只显示最后一张卡片（选择游戏卡片）
            if (index !== 3) {
                obj.style.display = 'none';
            }
        });

        this.game_index = this.poker_eles.length;
    },
    
    updatePokerContent(pokerElement, index) {
        const gameIndex = (this.game_index + index) % this.games.length;
        const game = this.games[gameIndex];
        
        // 根据是否为选择游戏卡片应用不同的样式
        if (game.isSelectCard) {
            // 选择游戏卡片样式 - 白色背景，克莱因蓝文字
            pokerElement.innerHTML = `
                <div class="game-card select-card" style="background: ${game.color}; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-radius: 1.5rem; border: 2px solid #002FA7;">
                    <div class="game-icon" style="font-size: 5rem; margin-bottom: 1rem; color: #002FA7;">${game.icon}</div>
                    <div class="game-title" style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; color: #002FA7;">${game.name}</div>
                    <div class="game-description" style="font-size: 1rem; padding: 0 1rem; line-height: 1.4; color: #1A1A1A;">${game.description}</div>
                </div>
            `;
        } else {
            // 普通游戏卡片样式 - 克莱因蓝背景，白色文字
            const textColor = game.color === '#FFFFFF' ? '#002FA7' : '#FFFFFF'; // 如果背景是白色，文字用克莱因蓝
            pokerElement.innerHTML = `
                <div class="game-card regular-card" style="background: ${game.color}; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-radius: 1.5rem; border: 1px solid ${game.color === '#FFFFFF' ? '#002FA7' : 'transparent'};">
                    <div class="game-icon" style="font-size: 5rem; margin-bottom: 1rem; color: ${textColor};">${game.icon}</div>
                    <div class="game-title" style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; color: ${textColor};">${game.name}</div>
                    <div class="game-description" style="font-size: 1rem; padding: 0 1rem; line-height: 1.4; color: ${textColor};">${game.description}</div>
                </div>
            `;
        }
    },
    
    navigateToGame(gameId) {
        switch(gameId) {
            case 'snake':
                window.gameManager.startGame('snake');
                break;
            case 'tetris':
                window.gameManager.startGame('tetris');
                break;
            case 'knight':
                window.gameManager.startGame('adventure');
                break;
            default:
                console.log('未知游戏:', gameId);
        }
    },
    
    move() {
        // 如果之前隐藏了其他卡片，现在显示它们
        this.poker_eles.forEach((ele, index) => {
            if (ele.style.display === 'none') {
                ele.style.display = '';
            }
        });
        
        this.poker_eles.map((ele) => {
            let nums = ele.nums;
            if (nums + 1 >= this.poker_eles.length) {
                nums = 0;
                ele.style.transition = "";
                this.updatePokerContent(ele, nums);
                this.game_index++;
                if (this.game_index >= this.games.length)
                    this.game_index = 0;
            } else {
                nums += 1;
                ele.style.transition = "transform 0.3s ease";
            }
            ele.style.zIndex = nums;
            ele.style.transform = this.transform_datas[nums];
            ele.nums = nums;
        });
    },
};

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    poker.init();
});