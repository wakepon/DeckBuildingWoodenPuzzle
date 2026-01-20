// deck-view.js - デッキ一覧表示

// デッキ一覧表示オブジェクト
var DeckView = {
    // デッキ一覧画面を表示
    show: function() {
        var deckScreen = document.getElementById('deck-view-screen');
        var deckBlocksContainer = document.getElementById('deck-blocks');
        var usedBlocksContainer = document.getElementById('used-blocks');

        // コンテナをクリア
        deckBlocksContainer.innerHTML = '';
        usedBlocksContainer.innerHTML = '';

        // 山札のブロックを表示（サイズ順にソート）
        var deckBlocks = DeckManager.state.deck.slice();
        deckBlocks.sort(function(a, b) {
            return BlockShapes.getSize(a) - BlockShapes.getSize(b);
        });

        deckBlocks.forEach(function(shape, index) {
            var blockElement = DeckView.createBlockElement(shape, 'deck-block-' + index);
            deckBlocksContainer.appendChild(blockElement);
        });

        // 使用中のブロックを計算（initialDeckにあるがdeckにないもの）
        var usedBlocks = this.getUsedBlocks();
        usedBlocks.sort(function(a, b) {
            return BlockShapes.getSize(a) - BlockShapes.getSize(b);
        });

        usedBlocks.forEach(function(shape, index) {
            var blockElement = DeckView.createBlockElement(shape, 'used-block-' + index);
            blockElement.classList.add('used');
            usedBlocksContainer.appendChild(blockElement);
        });

        // 使用中セクションの表示/非表示
        var usedSection = document.getElementById('used-blocks-section');
        if (usedSection) {
            usedSection.style.display = usedBlocks.length > 0 ? 'block' : 'none';
        }

        deckScreen.style.display = 'flex';
    },

    // デッキ一覧画面を閉じる
    hide: function() {
        var deckScreen = document.getElementById('deck-view-screen');
        deckScreen.style.display = 'none';
    },

    // 使用中のブロックを取得（initialDeckにあるがdeckにないもの）
    getUsedBlocks: function() {
        var initialDeck = DeckManager.state.initialDeck;
        var deck = DeckManager.state.deck;
        var usedBlocks = [];

        // initialDeckの各ブロックについて、deckに何個あるかカウント
        var deckCounts = {};
        deck.forEach(function(shape) {
            var key = JSON.stringify(shape);
            deckCounts[key] = (deckCounts[key] || 0) + 1;
        });

        // initialDeckから、deckにないブロックを抽出
        var initialCounts = {};
        initialDeck.forEach(function(shape) {
            var key = JSON.stringify(shape);
            initialCounts[key] = (initialCounts[key] || 0) + 1;
        });

        // 差分を計算
        for (var key in initialCounts) {
            var initialCount = initialCounts[key];
            var deckCount = deckCounts[key] || 0;
            var usedCount = initialCount - deckCount;

            if (usedCount > 0) {
                var shape = JSON.parse(key);
                for (var i = 0; i < usedCount; i++) {
                    usedBlocks.push(shape);
                }
            }
        }

        return usedBlocks;
    },

    // ブロック要素を作成
    createBlockElement: function(shape, blockId) {
        var cellSize = BlockRenderer.getResponsiveCellSize(true);
        return BlockRenderer.createBlockElement({
            shape: shape,
            blockId: blockId,
            cellSize: cellSize,
            className: 'deck-view-block',
            cellClassName: 'deck-view-block-cell'
        });
    },

    // イベントリスナーを初期化
    init: function() {
        var deckButton = document.getElementById('deck-button');
        var closeButton = document.getElementById('deck-view-close');

        if (deckButton) {
            // クリックイベント（PC用）
            deckButton.addEventListener('click', function() {
                DeckView.show();
            });

            // タッチイベント（モバイル用）
            deckButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                DeckView.show();
            });
        }

        if (closeButton) {
            // クリックイベント（PC用）
            closeButton.addEventListener('click', function() {
                DeckView.hide();
            });

            // タッチイベント（モバイル用）
            closeButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                DeckView.hide();
            });
        }
    }
};
