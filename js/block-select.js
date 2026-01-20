// block-select.js - ブロックセット選択画面管理

// ブロック選択管理オブジェクト
var BlockSelect = {
    selectBlocks: [], // 選択肢として表示する3つのブロック

    // 1枠目: モノミノ（1マス）もしくはドミノ（2マス）を生成
    generateSlot1Block: function() {
        var blocks = BlockShapes.filterBySize(1, 2);
        var randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 2枠目: トロミノ（3マス）もしくはテトリミノ（4マス）を生成
    generateSlot2Block: function() {
        var blocks = BlockShapes.filterBySize(3, 4);
        var randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 3枠目: テトリミノ（4マス）もしくはペントミノ（5マス）を生成
    generateSlot3Block: function() {
        var blocks = BlockShapes.filterBySize(4, 5);
        var randomIndex = Math.floor(Math.random() * blocks.length);
        return blocks[randomIndex];
    },

    // 3つのブロックを生成してサイズ順にソート
    generateSelectBlocks: function() {
        var blocks = [];

        // 1枠目: モノミノもしくはドミノ（1-2マス）
        blocks.push({
            shape: this.generateSlot1Block(),
            id: 'block-select-0'
        });

        // 2枠目: トロミノもしくはテトリミノ（3-4マス）
        blocks.push({
            shape: this.generateSlot2Block(),
            id: 'block-select-1'
        });

        // 3枠目: テトリミノもしくはペントミノ（4-5マス）
        blocks.push({
            shape: this.generateSlot3Block(),
            id: 'block-select-2'
        });

        // サイズ順にソート（小さい順）
        blocks.sort(function(a, b) {
            return BlockShapes.getSize(a.shape) - BlockShapes.getSize(b.shape);
        });

        // IDを再割り当て（ソート後）
        blocks.forEach(function(block, index) {
            block.id = 'block-select-' + index;
        });

        return blocks;
    },

    // ブロック要素を作成（BlockRendererを使用）
    createBlockElement: function(block) {
        var self = this;
        var cellSize = BlockRenderer.getResponsiveCellSize(true);
        return BlockRenderer.createBlockElement({
            shape: block.shape,
            blockId: block.id,
            cellSize: cellSize,
            className: 'shop-block',
            cellClassName: 'shop-block-cell',
            onClick: function() {
                self.selectBlock(block);
            },
            onTouchEnd: function(e) {
                e.preventDefault();
                self.selectBlock(block);
            }
        });
    },

    // ブロック選択画面を表示
    show: function() {
        this.selectBlocks = this.generateSelectBlocks();

        var screen = document.getElementById('block-select-screen');
        var blocksContainer = document.getElementById('block-select-blocks');
        blocksContainer.innerHTML = '';

        // ブロックを表示
        var self = this;
        this.selectBlocks.forEach(function(block) {
            var blockElement = self.createBlockElement(block);
            blocksContainer.appendChild(blockElement);
        });

        screen.style.display = 'flex';
    },

    // ブロック選択画面を閉じる
    hide: function() {
        var screen = document.getElementById('block-select-screen');
        screen.style.display = 'none';
    },

    // ブロックを選択
    selectBlock: function(block) {
        // 選択されたブロックをデッキに追加
        BlockManager.addBlockToDeck(block.shape);

        // ラウンドクリア報酬を付与
        var reward = CONFIG.GOLD.ROUND_CLEAR_REWARD;
        GameUI.showGoldPopup(reward);
        GameUI.animateGoldIncrement(reward);

        // 選択画面を閉じてショップ画面を表示
        this.hide();
        Shop.show();
    },

    // イベントリスナーを初期化
    init: function() {
        // 現時点では特に初期化処理なし
    }
};
