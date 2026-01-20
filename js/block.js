// block.js - ブロック管理

// ブロック管理オブジェクト
var BlockManager = {
    // ゲームステート
    gameState: {
        currentBlocks: [],     // 現在の手札（3つ）
        round: 1,              // 現在のラウンド
        score: 0,              // 現在のスコア
        blocksPlacedCount: 0,  // 現在のラウンドで配置したブロック数
        roundEnding: false     // ラウンド終了処理中フラグ
    },

    // ブロックの初期化
    init: function() {
        // デッキマネージャーを初期化
        DeckManager.init();
        // 配置カウンターをリセット
        this.gameState.blocksPlacedCount = 0;

        // 最初の3つを引く
        this.gameState.currentBlocks = DeckManager.draw(CONFIG.GAME.DRAW_COUNT);
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
                    onMouseDown: (e) => InputHandler.startDrag(e, block),
                    onTouchStart: (e) => {
                        e.preventDefault();
                        InputHandler.startDrag(e.touches[0], block);
                    }
                });
                container.appendChild(blockElement);
            }
        });
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
                if (this.gameState.blocksPlacedCount >= CONFIG.GAME.MAX_PLACEMENTS_PER_ROUND) {
                    // ラウンド終了処理
                    this.gameState.roundEnding = true;
                    GameUI.showRoundEnd(this.gameState.round);
                } else {
                    // まだ残りがある場合は次の3つを引く
                    const allPlaced = this.gameState.currentBlocks.every(b => b.placed);
                    if (allPlaced) {
                        this.gameState.currentBlocks = DeckManager.draw(CONFIG.GAME.DRAW_COUNT);
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

        GameBoard.place(row, col, block.shape);

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
            if (self.gameState.blocksPlacedCount >= CONFIG.GAME.MAX_PLACEMENTS_PER_ROUND) {
                // ラウンド終了
                self.gameState.roundEnding = true;
                GameUI.showRoundEnd(self.gameState.round);
                return;
            }

            // 3つすべて配置したかチェック
            var allPlaced = self.gameState.currentBlocks.every(function(b) { return b.placed; });
            if (allPlaced) {
                // 次の3つを引く（デッキが尽きても自動的に再シャッフルされる）
                self.gameState.currentBlocks = DeckManager.draw(CONFIG.GAME.DRAW_COUNT);
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
        // デッキをリセット（初期デッキのコピーをシャッフルして再利用）
        DeckManager.reset();
        // 配置カウンターをリセット
        this.gameState.blocksPlacedCount = 0;
        // ラウンド終了フラグをリセット
        this.gameState.roundEnding = false;
        this.gameState.currentBlocks = DeckManager.draw(CONFIG.GAME.DRAW_COUNT);
        this.render();
        GameUI.updatePlacementInfo(this.gameState.blocksPlacedCount, this.gameState.round);
        GameUI.updateTargetScore(this.gameState.round);
        // ゲーム状態を保存
        GameUI.saveGameState();
        this.checkGameOver();
    },

    // ショップで選択されたブロックをデッキに追加
    addBlockToDeck: function(shape) {
        // デッキマネージャーに追加
        DeckManager.addBlock(shape);
    }
};
