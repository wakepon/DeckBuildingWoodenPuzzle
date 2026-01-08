// ui.js - スコア表示、ゲームオーバー画面

// UI管理オブジェクト
var GameUI = {
    score: 0,
    highScore: 0,
    gameOverReason: '', // ゲームオーバーの理由

    // ハイスコアの読み込み
    loadHighScore: function() {
        const saved = localStorage.getItem('woodyPuzzleHighScore');
        if (saved) {
            this.highScore = parseInt(saved, 10);
            document.getElementById('highscore-display').textContent = `ハイスコア: ${this.highScore}`;
        }
    },

    // ハイスコアの保存
    saveHighScore: function() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('woodyPuzzleHighScore', this.highScore.toString());
            document.getElementById('highscore-display').textContent = `ハイスコア: ${this.highScore}`;
        }
    },

    // スコア更新
    updateScore: function(points) {
        this.score += points;
        document.getElementById('score-display').textContent = `スコア: ${this.score}`;
    },

    // スコアリセット
    resetScore: function() {
        this.score = 0;
        this.updateScore(0);
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
        document.getElementById('final-score').textContent = `スコア: ${this.score}`;
        document.getElementById('final-highscore').textContent = `ハイスコア: ${this.highScore}`;
        document.getElementById('final-round').textContent = `最終ラウンド: ${BlockManager.gameState.round}`;
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

                    // 次のラウンドの税金を計算（2n-1: 1, 3, 5, 7, 9...）
                    BlockManager.gameState.taxRate += 2;

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
