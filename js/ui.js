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

    // スコア更新（演出なし）
    updateScore: function(amount) {
        BlockManager.gameState.score += amount;
        document.getElementById('score-display').textContent = `スコア: ${BlockManager.gameState.score}`;
    },

    // 単位ブロック「+1」ポップアップを表示
    showBlockPopup: function(x, y) {
        const popup = document.createElement('div');
        popup.className = 'block-popup';
        popup.textContent = '+1';
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        document.body.appendChild(popup);

        // アニメーション終了後に削除
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 600);
    },

    // スコア計算演出を表示
    showScoreCalculation: function(totalBlocks, totalLines, scoreAmount) {
        const display = document.getElementById('score-effect-display');
        if (!display) return;

        // 第1段階: ブロック数 × ライン数
        display.innerHTML = `${totalBlocks}<br>×<br>${totalLines}ライン`;
        display.classList.add('show');

        // 1秒後に第2段階: 計算結果とスコアインクリメント
        setTimeout(() => {
            display.innerHTML = `${scoreAmount}`;
            this.animateScoreIncrement(scoreAmount);
        }, 1000);

        // さらに1秒後に非表示
        setTimeout(() => {
            display.classList.remove('show');
        }, 2000);
    },

    // スコアのインクリメントアニメーション
    animateScoreIncrement: function(targetAmount) {
        const startScore = BlockManager.gameState.score;
        const endScore = startScore + targetAmount;
        const duration = 800; // 0.8秒
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // イージング関数（easeOutCubic）
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.floor(startScore + (targetAmount * easeProgress));

            BlockManager.gameState.score = currentScore;
            document.getElementById('score-display').textContent = `スコア: ${currentScore}`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 最終的な正確な値を設定
                BlockManager.gameState.score = endScore;
                document.getElementById('score-display').textContent = `スコア: ${endScore}`;
            }
        };

        requestAnimationFrame(animate);
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

    // 配置情報を更新
    updatePlacementInfo: function(blocksPlaced, round) {
        const deckInfoElement = document.getElementById('deck-info');
        if (deckInfoElement) {
            const remaining = 12 - blocksPlaced;
            deckInfoElement.textContent = `ラウンド ${round} - 残り配置数: ${remaining}/12`;
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
    },

    // データリセット機能
    resetData: function() {
        if (confirm('データをリセットしますか？')) {
            // localStorageをクリア
            localStorage.clear();
            // ページをリロード
            window.location.reload();
        }
    },

    // 設定アイコンのイベントリスナーを初期化
    initSettingsIcon: function() {
        const settingsIcon = document.getElementById('settings-icon');
        if (settingsIcon) {
            // クリックイベント（PC用）
            settingsIcon.addEventListener('click', function() {
                GameUI.resetData();
            });

            // タッチイベント（モバイル用）
            settingsIcon.addEventListener('touchend', function(e) {
                e.preventDefault(); // デフォルトのタッチ動作を防止
                GameUI.resetData();
            });
        }
    }
};
