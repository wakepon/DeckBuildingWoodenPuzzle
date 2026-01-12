// shop.js - ショップ管理

// ショップ管理オブジェクト
var Shop = {
    shopBlocks: [], // ショップに表示する3つのブロック

    // ブロックのサイズ（マス数）を計算
    getBlockSize: function(shape) {
        let size = 0;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    size++;
                }
            }
        }
        return size;
    },

    // 1枠目: モノミノ（1マス）もしくはドミノ（2マス）を生成
    generateSlot1Block: function() {
        const blocks = [];
        for (let i = 0; i < BlockManager.blockShapes.length; i++) {
            const shape = BlockManager.blockShapes[i];
            const size = this.getBlockSize(shape);
            if (size >= 1 && size <= 2) {
                blocks.push(shape);
            }
        }
        const randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 2枠目: トロミノ（3マス）もしくはテトリミノ（4マス）を生成
    generateSlot2Block: function() {
        const blocks = [];
        for (let i = 0; i < BlockManager.blockShapes.length; i++) {
            const shape = BlockManager.blockShapes[i];
            const size = this.getBlockSize(shape);
            if (size >= 3 && size <= 4) {
                blocks.push(shape);
            }
        }
        const randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 3枠目: テトリミノ（4マス）もしくはペントミノ（5マス）を生成
    generateSlot3Block: function() {
        const blocks = [];
        for (let i = 0; i < BlockManager.blockShapes.length; i++) {
            const shape = BlockManager.blockShapes[i];
            const size = this.getBlockSize(shape);
            if (size >= 4 && size <= 5) {
                blocks.push(shape);
            }
        }
        const randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 3つのブロックを生成してサイズ順にソート
    generateShopBlocks: function() {
        const blocks = [];

        // 1枠目: モノミノもしくはドミノ（1-2マス）
        blocks.push({
            shape: this.generateSlot1Block(),
            id: 'shop-block-0'
        });

        // 2枠目: トロミノもしくはテトリミノ（3-4マス）
        blocks.push({
            shape: this.generateSlot2Block(),
            id: 'shop-block-1'
        });

        // 3枠目: テトリミノもしくはペントミノ（4-5マス）
        blocks.push({
            shape: this.generateSlot3Block(),
            id: 'shop-block-2'
        });

        // サイズ順にソート（小さい順）
        blocks.sort((a, b) => {
            return this.getBlockSize(a.shape) - this.getBlockSize(b.shape);
        });

        // IDを再割り当て（ソート後）
        blocks.forEach((block, index) => {
            block.id = 'shop-block-' + index;
        });

        return blocks;
    },

    // ブロック要素を作成
    createShopBlockElement: function(block) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'shop-block';
        blockDiv.dataset.blockId = block.id;

        const rows = block.shape.length;
        const cols = block.shape[0].length;

        // 画面幅に応じてセルサイズを調整
        let cellSize = 35;
        if (window.innerWidth <= 380) {
            cellSize = 25;
        } else if (window.innerWidth <= 480) {
            cellSize = 28;
        }

        blockDiv.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        blockDiv.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'shop-block-cell';

                if (!block.shape[row][col]) {
                    cellDiv.style.visibility = 'hidden';
                }

                blockDiv.appendChild(cellDiv);
            }
        }

        // クリック/タップイベント
        blockDiv.addEventListener('click', () => this.selectBlock(block));
        blockDiv.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.selectBlock(block);
        });

        return blockDiv;
    },

    // ショップを表示
    show: function() {
        this.shopBlocks = this.generateShopBlocks();

        const shopScreen = document.getElementById('shop-screen');
        const shopBlocksContainer = document.getElementById('shop-blocks');
        shopBlocksContainer.innerHTML = '';

        // ブロックを表示
        this.shopBlocks.forEach(block => {
            const blockElement = this.createShopBlockElement(block);
            shopBlocksContainer.appendChild(blockElement);
        });

        shopScreen.style.display = 'flex';
    },

    // ショップを閉じる
    hide: function() {
        const shopScreen = document.getElementById('shop-screen');
        shopScreen.style.display = 'none';
    },

    // ブロックを選択
    selectBlock: function(block) {
        // 選択されたブロックをデッキに追加
        BlockManager.addBlockToDeck(block.shape);

        // ショップを閉じる
        this.hide();

        // 次のラウンド開始
        BlockManager.startNextRound();
    }
};
