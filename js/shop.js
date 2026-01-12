// shop.js - ショップ管理

// ショップ管理オブジェクト
var Shop = {
    shopBlocks: [], // ショップに表示する3つのブロック

    // 1枠目: モノミノ（1マス）もしくはドミノ（2マス）を生成
    generateSlot1Block: function() {
        const blocks = BlockShapes.filterBySize(1, 2);
        const randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 2枠目: トロミノ（3マス）もしくはテトリミノ（4マス）を生成
    generateSlot2Block: function() {
        const blocks = BlockShapes.filterBySize(3, 4);
        const randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 3枠目: テトリミノ（4マス）もしくはペントミノ（5マス）を生成
    generateSlot3Block: function() {
        const blocks = BlockShapes.filterBySize(4, 5);
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
            return BlockShapes.getSize(a.shape) - BlockShapes.getSize(b.shape);
        });

        // IDを再割り当て（ソート後）
        blocks.forEach((block, index) => {
            block.id = 'shop-block-' + index;
        });

        return blocks;
    },

    // ブロック要素を作成（BlockRendererを使用）
    createShopBlockElement: function(block) {
        const cellSize = BlockRenderer.getResponsiveCellSize(true);
        return BlockRenderer.createBlockElement({
            shape: block.shape,
            blockId: block.id,
            cellSize: cellSize,
            className: 'shop-block',
            cellClassName: 'shop-block-cell',
            onClick: () => this.selectBlock(block),
            onTouchEnd: (e) => {
                e.preventDefault();
                this.selectBlock(block);
            }
        });
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
