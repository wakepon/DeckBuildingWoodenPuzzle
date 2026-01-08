// ui.js - スコア表示、ゲームオーバー画面

// UI管理オブジェクト
var GameUI = {
    highScore: 1,
    gameOverReason: '', // ゲームオーバーの理由

    // ハイスコアの読み込み
    loadHighScore: function() {
        const saved = localStorage.getItem('woodyPuzzleHighScore');
        if (saved) {
            this.highScore = parseInt(saved, 10);
            document.getElementById('highscore-display').textContent = `最高ラウンド: ${this.highScore}`;
        }
    },

    // ハイスコアの保存
    saveHighScore: function() {
        const currentRound = BlockManager.gameState.round;
        if (currentRound > this.highScore) {
            this.highScore = currentRound;
            localStorage.setItem('woodyPuzzleHighScore', this.highScore.toString());
            document.getElementById('highscore-display').textContent = `最高ラウンド: ${this.highScore}`;
        }
    },

    // ゴールド更新
    updateGold: function(amount) {
        BlockManager.gameState.gold += amount;
        document.getElementById('gold-display').textContent = `💰 ゴールド: ${BlockManager.gameState.gold}`;
    },

    // ゴールドリセット
    resetGold: function() {
        BlockManager.gameState.gold = 0;
        document.getElementById('gold-display').textContent = `💰 ゴールド: 0`;
    },

    // ゲームオーバー画面を表示
    showGameOver: function(reason) {
        this.gameOverReason = reason || 'ブロックを配置できません';
        document.getElementById('game-over-reason').textContent = this.gameOverReason;
        document.getElementById('final-round').textContent = `到達ラウンド: ${BlockManager.gameState.round}`;
        document.getElementById('final-highscore').textContent = `最高ラウンド: ${this.highScore}`;
        document.getElementById('game-over-screen').style.display = 'flex';
    },

    // ゲームオーバー画面を非表示
    hideGameOver: function() {
        document.getElementById('game-over-screen').style.display = 'none';
    },

    // デッキ情報を更新
    updateDeckInfo: function(remainingBlocks, round) {
        const deckInfoElement = document.getElementById('deck-info');
        if (deckInfoElement) {
            deckInfoElement.textContent = `ラウンド ${round} - 残りブロック: ${remainingBlocks}/9`;
        }
    },

    // ラウンド終了メッセージを表示
    showRoundEnd: function(round) {
        const deckInfoElement = document.getElementById('deck-info');
        if (deckInfoElement) {
            const taxAmount = BlockManager.gameState.taxRate;

            // 税金表示
            deckInfoElement.textContent = `ラウンド ${round} 終了！ 税金: ${taxAmount}ゴールド`;
            deckInfoElement.style.background = 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)';
            deckInfoElement.style.color = '#fff';
            deckInfoElement.style.fontWeight = 'bold';

            // 3秒後に税金支払い処理
            setTimeout(() => {
                // 税金判定時に最新のゴールド額を取得（ライン消去で獲得したゴールドを含む）
                const currentGold = BlockManager.gameState.gold;

                if (currentGold >= taxAmount) {
                    // 税金支払い可能
                    BlockManager.gameState.gold -= taxAmount;
                    this.updateGold(0); // 表示更新

                    // 次のラウンドの税金を計算（1, 2, 3, 4, 5...）
                    BlockManager.gameState.taxRate += 1;

                    // UI リセット
                    deckInfoElement.style.background = '';
                    deckInfoElement.style.color = '';
                    deckInfoElement.style.fontWeight = '';

                    // 次のラウンド開始
                    BlockManager.startNextRound();
                } else {
                    // 税金支払い不可 → ゲームオーバー
                    this.saveHighScore();
                    this.showGameOver(`税金を支払えませんでした（必要: ${taxAmount}ゴールド、所持: ${currentGold}ゴールド）`);
                }
            }, 3000);
        }
    }
};
