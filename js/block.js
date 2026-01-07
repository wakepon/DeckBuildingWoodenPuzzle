// block.js - ブロックの種類、生成

// ブロック管理オブジェクト
var BlockManager = {
    // ブロックの定義（形状）
    blockShapes: [
        // 1x1
        [[1]],

        // 1x2, 2x1
        [[1, 1]],
        [[1], [1]],

        // 1x3, 3x1
        [[1, 1, 1]],
        [[1], [1], [1]],

        // 2x2
        [[1, 1], [1, 1]],

        // 2x3, 3x2
        [[1, 1, 1], [1, 1, 1]],
        [[1, 1], [1, 1], [1, 1]],

        // L字型（3パターン）
        [[1, 0], [1, 0], [1, 1]],
        [[1, 1], [1, 0], [1, 0]],
        [[1, 1, 1], [1, 0, 0]],

        // T字型
        [[1, 1, 1], [0, 1, 0]]
    ],

    currentBlocks: [],

    // ランダムなブロックを選択
    getRandomBlocks: function(count) {
        const blocks = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * this.blockShapes.length);
            blocks.push({
                id: Date.now() + i,
                shape: this.blockShapes[randomIndex],
                placed: false
            });
        }
        return blocks;
    },

    // ブロックの初期化
    init: function() {
        this.currentBlocks = this.getRandomBlocks(3);
        this.render();
        this.checkGameOver();
    },

    // ブロックのレンダリング
    render: function() {
        const container = document.getElementById('blocks-container');
        container.innerHTML = '';

        this.currentBlocks.forEach(block => {
            if (!block.placed) {
                const blockElement = this.createBlockElement(block);
                container.appendChild(blockElement);
            }
        });
    },

    // ブロック要素の作成
    createBlockElement: function(block) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block';
        blockDiv.dataset.blockId = block.id;

        const rows = block.shape.length;
        const cols = block.shape[0].length;
        blockDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        blockDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        block.shape.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'block-cell';
                if (!cell) {
                    cellDiv.style.visibility = 'hidden';
                }
                blockDiv.appendChild(cellDiv);
            });
        });

        // マウスイベント
        blockDiv.addEventListener('mousedown', (e) => InputHandler.startDrag(e, block));

        // タッチイベント
        blockDiv.addEventListener('touchstart', (e) => {
            e.preventDefault();
            InputHandler.startDrag(e.touches[0], block);
        });

        return blockDiv;
    },

    // ブロックが配置可能かチェック
    canPlaceAnyBlock: function() {
        for (const block of this.currentBlocks) {
            if (block.placed) continue;

            // ボード上のすべての位置を試す
            for (let row = 0; row < GameBoard.BOARD_SIZE; row++) {
                for (let col = 0; col < GameBoard.BOARD_SIZE; col++) {
                    if (GameBoard.canPlace(row, col, block.shape)) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    // ゲームオーバーチェック
    checkGameOver: function() {
        if (!this.canPlaceAnyBlock()) {
            GameUI.saveHighScore();
            GameUI.showGameOver();
        }
    },

    // ブロックを配置
    placeBlock: function(row, col, block) {
        const cellCount = GameBoard.place(row, col, block.shape);

        // 配置スコア（マス数 × 10点）
        GameUI.updateScore(cellCount * 10);

        block.placed = true;
        this.render();

        // 行・列のクリアチェック
        GameBoard.checkAndClearLines();

        // 3つすべて配置したら新しいブロックを生成
        const allPlaced = this.currentBlocks.every(b => b.placed);
        if (allPlaced) {
            setTimeout(() => {
                this.currentBlocks = this.getRandomBlocks(3);
                this.render();
                this.checkGameOver();
            }, 600); // クリアアニメーション後に生成
        } else {
            // まだ配置していないブロックがある場合もゲームオーバーチェック
            this.checkGameOver();
        }
    }
};
