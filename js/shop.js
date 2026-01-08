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

    // 小さいブロック（1-2マス）を生成
    generateSmallBlock: function() {
        // CONFIG.DECK_BLOCK_SHAPESから1-2マスのブロックを選択
        const smallBlocks = [];
        for (let i = 0; i < CONFIG.DECK_BLOCK_SHAPES.length; i++) {
            const shape = CONFIG.DECK_BLOCK_SHAPES[i];
            const size = this.getBlockSize(shape);
            if (size <= 2) {
                smallBlocks.push(shape);
            }
        }
        const randomIndex = Math.floor(Math.random() * smallBlocks.length);
        return smallBlocks[randomIndex];
    },

    // テトリミノ以上のブロック（4マス以上）を生成
    generateLargeBlock: function() {
        // BlockManager.blockShapesから4マス以上のブロックを選択
        const largeBlocks = [];
        for (let i = 0; i < BlockManager.blockShapes.length; i++) {
            const shape = BlockManager.blockShapes[i];
            const size = this.getBlockSize(shape);
            if (size >= 4) {
                largeBlocks.push(shape);
            }
        }
        const randomIndex = Math.floor(Math.random() * largeBlocks.length);
        return largeBlocks[randomIndex];
    },

    // ランダムなブロックを生成
    generateRandomBlock: function() {
        const allBlocks = BlockManager.blockShapes;
        const randomIndex = Math.floor(Math.random() * allBlocks.length);
        return allBlocks[randomIndex];
    },

    // 3つのブロックを生成してサイズ順にソート
    generateShopBlocks: function() {
        const blocks = [];

        // 1つ目: 小さいブロック（1-2マス）
        blocks.push({
            shape: this.generateSmallBlock(),
            id: 'shop-block-0'
        });

        // 2つ目: テトリミノ以上のブロック（4マス以上）
        blocks.push({
            shape: this.generateLargeBlock(),
            id: 'shop-block-1'
        });

        // 3つ目: ランダム
        blocks.push({
            shape: this.generateRandomBlock(),
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

        blockDiv.style.gridTemplateColumns = `repeat(${cols}, 35px)`;
        blockDiv.style.gridTemplateRows = `repeat(${rows}, 35px)`;

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
