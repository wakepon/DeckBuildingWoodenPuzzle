// ui.js - スコア表示、ゲームオーバー画面

// UI管理オブジェクト
var GameUI = {
    score: 0,
    highScore: 0,

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

    // ゲームオーバー画面を表示
    showGameOver: function() {
        document.getElementById('final-score').textContent = `スコア: ${this.score}`;
        document.getElementById('final-highscore').textContent = `ハイスコア: ${this.highScore}`;
        document.getElementById('game-over-screen').style.display = 'flex';
    },

    // ゲームオーバー画面を非表示
    hideGameOver: function() {
        document.getElementById('game-over-screen').style.display = 'none';
    }
};
