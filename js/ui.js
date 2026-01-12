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

    // スコア更新
    updateScore: function(amount) {
        BlockManager.gameState.score += amount;
        document.getElementById('score-display').textContent = `スコア: ${BlockManager.gameState.score}`;
    },

    // スコアリセット
    resetScore: function() {
        BlockManager.gameState.score = 0;
        document.getElementById('score-display').textContent = `スコア: 0`;
    },

    // 目標スコア表示更新
    updateTargetScore: function(round) {
        const targetScore = round * 20;
        document.getElementById('target-score-display').textContent = `目標スコア: ${targetScore}`;
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
            const totalDeckSize = BlockManager.gameState.initialDeck.length;
            deckInfoElement.textContent = `ラウンド ${round} - 残りブロック: ${remainingBlocks}/${totalDeckSize}`;
        }
    },

    // ラウンド終了メッセージを表示
    showRoundEnd: function(round) {
        const deckInfoElement = document.getElementById('deck-info');
        if (deckInfoElement) {
            const targetScore = round * 20;
            const currentScore = BlockManager.gameState.score;

            // 目標スコア判定
            if (currentScore >= targetScore) {
                // 目標達成！
                deckInfoElement.textContent = `ラウンド ${round} クリア！ 目標達成！`;
                deckInfoElement.style.background = 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)';
                deckInfoElement.style.color = '#fff';
                deckInfoElement.style.fontWeight = 'bold';

                // 3秒後にショップ表示
                setTimeout(() => {
                    // UI リセット
                    deckInfoElement.style.background = '';
                    deckInfoElement.style.color = '';
                    deckInfoElement.style.fontWeight = '';

                    // ショップを表示
                    Shop.show();
                }, 3000);
            } else {
                // 目標未達成 → ゲームオーバー
                this.saveHighScore();
                this.showGameOver(`目標スコアに到達できませんでした（目標: ${targetScore}、獲得: ${currentScore}）`);
            }
        }
    }
};
