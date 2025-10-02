// JIEJOE produce
// b站主页：https://space.bilibili.com/3546390319860710
const poker = {
    games: [
        {
            id: 'snake',
            name: '贪吃蛇',
            icon: '🐍',
            description: '经典的贪吃蛇游戏，控制蛇吃到食物并避免撞到墙壁或自己的身体',
            color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        },
        {
            id: 'tetris',
            name: '俄罗斯方块',
            icon: '🧩',
            description: '经典的俄罗斯方块游戏，排列方块消除行数获得高分',
            color: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)'
        },
        {
            id: 'knight',
            name: '量子骑士',
            icon: '⚔️',
            description: '冒险游戏，控制量子骑士战斗并探索世界',
            color: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)'
        },
        {
            id: 'select',
            name: '选择游戏',
            icon: '🎮',
            description: '点击顶部卡片切换游戏',
            color: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'
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
            if (index !== 4) {
                obj.style.display = 'none';
            }
        });

        this.game_index = this.poker_eles.length;
    },
    
    updatePokerContent(pokerElement, index) {
        const gameIndex = (this.game_index + index) % this.games.length;
        const game = this.games[gameIndex];
        
        pokerElement.innerHTML = `
            <div class="game-card" style="background: ${game.color}; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; border-radius: 1.5rem;">
                <div class="game-icon" style="font-size: 5rem; margin-bottom: 1rem;">${game.icon}</div>
                <div class="game-title" style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">${game.name}</div>
                <div class="game-description" style="font-size: 1rem; padding: 0 1rem; line-height: 1.4;">${game.description}</div>
            </div>
        `;
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