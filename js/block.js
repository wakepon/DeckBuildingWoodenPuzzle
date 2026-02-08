// block.js - ブロック管理

// ブロック管理オブジェクト
var BlockManager = {
    // ゲームステート
    gameState: {
        currentBlocks: [],     // 現在の手札（3つ）
        round: 0,              // 現在のラウンド（0から開始し、RoundProgress.showで1になる）
        score: 0,              // 現在のスコア
        blocksPlacedCount: 0,  // 現在のラウンドで配置したブロック数
        roundEnding: false,    // ラウンド終了処理中フラグ
        bossCondition: null,   // ボスラウンドの特殊条件
        bossConditionOverridden: false,  // デバッグで上書きされたかどうか
        stockBlock: null       // ストックに保管されたブロック
    },

    // 現在の最大配置数を取得（ボス条件考慮）
    getMaxPlacements: function() {
        var roundInfo = RoundProgress.getRoundInfo(this.gameState.round);
        if (roundInfo.roundType === 'boss' &&
            this.gameState.bossCondition &&
            this.gameState.bossCondition.id === 'energy_save') {
            return 9;
        }
        return CONFIG.GAME.MAX_PLACEMENTS_PER_ROUND;
    },

    // 現在のドロー枚数を取得（ボス条件考慮）
    getDrawCount: function() {
        var roundInfo = RoundProgress.getRoundInfo(this.gameState.round);
        if (roundInfo.roundType === 'boss' &&
            this.gameState.bossCondition &&
            this.gameState.bossCondition.id === 'two_cards') {
            return 2;
        }
        return CONFIG.GAME.DRAW_COUNT;
    },

    // ブロックの初期化
    init: function() {
        // デッキマネージャーを初期化
        DeckManager.init();
        // 配置カウンターをリセット
        this.gameState.blocksPlacedCount = 0;

        // 最初のブロックを引く（ボス条件で枚数が変わる）
        this.gameState.currentBlocks = DeckManager.draw(this.getDrawCount());
        this.render();

        // UI更新
        GameUI.updatePlacementInfo(this.gameState.blocksPlacedCount, this.gameState.round);
        GameUI.updateTargetScore(this.gameState.round);

        this.checkGameOver();
    },

    // ブロックのレンダリング
    render: function() {
        const container = document.getElementById('blocks-container');
        container.innerHTML = '';

        this.gameState.currentBlocks.forEach(block => {
            if (!block.placed) {
                const blockElement = BlockRenderer.createBlockElement({
                    shape: block.shape,
                    blockId: block.id,
                    cellSize: CONFIG.CELL_SIZE.DEFAULT,
                    className: 'block',
                    cellClassName: 'block-cell',
                    pattern: block.pattern,
                    seals: block.seals,
                    onMouseDown: (e) => InputHandler.startDrag(e, block, 'hand'),
                    onTouchStart: (e) => {
                        e.preventDefault();
                        InputHandler.startDrag(e.touches[0], block, 'hand');
                    }
                });
                container.appendChild(blockElement);
            }
        });

        this.renderStock();
    },

    // ブロックが配置可能かチェック
    canPlaceAnyBlock: function() {
        for (const block of this.gameState.currentBlocks) {
            if (block.placed) continue;

            // ボード上のすべての位置を試す
            for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
                for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                    if (GameBoard.canPlace(row, col, block.shape)) {
                        return true;
                    }
                }
            }
        }

        // ストックブロックもチェック
        if (this.gameState.stockBlock) {
            var stock = this.gameState.stockBlock;
            for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
                for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                    if (GameBoard.canPlace(row, col, stock.shape)) {
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
            // ダイアログを表示して、コールバックで後処理を実行
            GameUI.showCannotPlaceDialog(() => {
                // 配置できないブロックをすべて「配置済み」としてマーク
                for (const block of this.gameState.currentBlocks) {
                    if (!block.placed) {
                        block.placed = true;
                        this.gameState.blocksPlacedCount++;
                    }
                }

                // UI更新
                this.render();
                GameUI.updatePlacementInfo(this.gameState.blocksPlacedCount, this.gameState.round);

                // 残りの配置可能数が最大配置数に達したかチェック
                if (this.gameState.blocksPlacedCount >= this.getMaxPlacements()) {
                    // ラウンド終了処理
                    this.gameState.roundEnding = true;
                    GameUI.showRoundEnd(this.gameState.round);
                } else {
                    // まだ残りがある場合は次のブロックを引く
                    const allPlaced = this.gameState.currentBlocks.every(b => b.placed);
                    if (allPlaced) {
                        this.gameState.currentBlocks = DeckManager.draw(this.getDrawCount());
                        this.render();
                        // 再度チェック（新しいブロックも置けない場合がある）
                        this.checkGameOver();
                    }
                }
            });
        }
    },

    // ブロックを配置
    placeBlock: function(row, col, block) {
        // ラウンド終了処理中は配置できない
        if (this.gameState.roundEnding) {
            return;
        }

        // ブロックのセル数を計算（レリック効果判定用）
        var placedBlockSize = BlockShapes.getSize(block.shape);

        // パターンとシール情報、ブロックセットIDを渡して配置
        GameBoard.place(row, col, block.shape, block.pattern, block.seals, block.id);

        block.placed = true;
        // 配置カウントを増やす
        this.gameState.blocksPlacedCount++;
        this.render();

        // UI更新
        GameUI.updatePlacementInfo(this.gameState.blocksPlacedCount, this.gameState.round);

        // ゲーム状態を保存
        GameUI.saveGameState();

        // 行・列のクリアチェック（スコアアニメーション完了後にコールバックが呼ばれる）
        // placedBlockSizeをレリック効果判定用に渡す
        var self = this;
        GameBoard.checkAndClearLines(function() {
            // スコアアニメーション完了後に実行される処理

            // 目標スコアに達成したかチェック
            var targetScore = self.gameState.round * CONFIG.GAME.TARGET_SCORE_MULTIPLIER;
            if (self.gameState.score >= targetScore) {
                // 目標達成！ラウンド終了
                self.gameState.roundEnding = true;
                GameUI.showRoundEnd(self.gameState.round);
                return;
            }

            // 最大配置数に達したかチェック
            if (self.gameState.blocksPlacedCount >= self.getMaxPlacements()) {
                // ラウンド終了
                self.gameState.roundEnding = true;
                GameUI.showRoundEnd(self.gameState.round);
                return;
            }

            // すべて配置したかチェック
            var allPlaced = self.gameState.currentBlocks.every(function(b) { return b.placed; });
            if (allPlaced) {
                // 次のブロックを引く（デッキが尽きても自動的に再シャッフルされる）
                self.gameState.currentBlocks = DeckManager.draw(self.getDrawCount());
                self.render();
                // ゲーム状態を保存
                GameUI.saveGameState();
                self.checkGameOver();
            } else {
                // ゲーム状態を保存（スコア更新後）
                GameUI.saveGameState();
                // ゲームオーバーチェック
                self.checkGameOver();
            }
        }, placedBlockSize);
    },

    // 次のラウンドを開始
    startNextRound: function() {
        this.gameState.round++;

        // スコアをリセット
        GameUI.resetScore();
        // ボードをリセット
        GameBoard.clear();

        // ボスラウンドでおじゃまブロック条件の場合、障害物を配置
        var roundInfo = RoundProgress.getRoundInfo(this.gameState.round);
        if (roundInfo.roundType === 'boss' &&
            this.gameState.bossCondition &&
            this.gameState.bossCondition.id === 'obstacle') {
            GameBoard.placeObstacle();
        }

        // ストック枠をリセット
        this.gameState.stockBlock = null;
        // デッキをリセット（初期デッキのコピーをシャッフルして再利用）
        DeckManager.reset();
        // 配置カウンターをリセット
        this.gameState.blocksPlacedCount = 0;
        // ラウンド終了フラグをリセット
        this.gameState.roundEnding = false;
        // ブロックを引く（ボス条件で枚数が変わる）
        this.gameState.currentBlocks = DeckManager.draw(this.getDrawCount());
        this.render();
        GameUI.updatePlacementInfo(this.gameState.blocksPlacedCount, this.gameState.round);
        GameUI.updateTargetScore(this.gameState.round);
        // ゲーム状態を保存
        GameUI.saveGameState();
        this.checkGameOver();
    },

    // ブロックをストックに移動（手札→ストック、既にあればスワップ）
    moveToStock: function(block) {
        var previousStock = this.gameState.stockBlock;

        // ストックにブロックを保管
        this.gameState.stockBlock = block;

        // 手札から削除（placedにする）
        block.placed = true;

        // 既にストックにブロックがあった場合はスワップ（手札に戻す）
        if (previousStock) {
            previousStock.placed = false;
            // currentBlocksに既にあるか確認し、なければ追加
            var found = false;
            for (var i = 0; i < this.gameState.currentBlocks.length; i++) {
                if (this.gameState.currentBlocks[i].id === previousStock.id) {
                    found = true;
                    this.gameState.currentBlocks[i] = previousStock;
                    break;
                }
            }
            if (!found) {
                this.gameState.currentBlocks.push(previousStock);
            }
        }

        this.render();

        // 手札が全て配置済みの場合、新しい手札をドロー
        var allPlaced = this.gameState.currentBlocks.every(function(b) { return b.placed; });
        if (allPlaced && this.gameState.blocksPlacedCount < this.getMaxPlacements()) {
            this.gameState.currentBlocks = DeckManager.draw(this.getDrawCount());
            this.render();
        }

        GameUI.saveGameState();
        this.checkGameOver();
    },

    // ストックから手札にブロックを戻す（レリック削除時）
    returnStockToHand: function() {
        if (!this.gameState.stockBlock) return;

        var stock = this.gameState.stockBlock;
        stock.placed = false;
        this.gameState.stockBlock = null;

        // 手札に追加
        this.gameState.currentBlocks.push(stock);
        this.render();
        GameUI.saveGameState();
    },

    // ストック枠のレンダリング
    renderStock: function() {
        var container = document.getElementById('stock-container');
        var slot = document.getElementById('stock-slot');
        if (!container || !slot) return;

        // レリック所持チェック
        if (!RelicManager.hasRelic('hand_stock')) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        slot.innerHTML = '';

        if (this.gameState.stockBlock) {
            var block = this.gameState.stockBlock;
            var blockElement = BlockRenderer.createBlockElement({
                shape: block.shape,
                blockId: block.id,
                cellSize: CONFIG.CELL_SIZE.DEFAULT,
                className: 'block',
                cellClassName: 'block-cell',
                pattern: block.pattern,
                seals: block.seals,
                onMouseDown: function(e) { InputHandler.startDrag(e, block, 'stock'); },
                onTouchStart: function(e) {
                    e.preventDefault();
                    InputHandler.startDrag(e.touches[0], block, 'stock');
                }
            });
            slot.appendChild(blockElement);
        }
    },

    // ショップで選択されたブロックをデッキに追加
    addBlockToDeck: function(shape) {
        // デッキマネージャーに追加
        DeckManager.addBlock(shape);
    }
};
