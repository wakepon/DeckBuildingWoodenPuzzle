// ui.js - スコア表示、ゲームオーバー画面

// UI管理オブジェクト
var GameUI = {
    highScore: 1,
    gold: 0, // 所持ゴールド
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

    // スコア計算演出を表示（レガシー用）
    showScoreCalculation: function(totalBlocks, totalLines, scoreAmount, callback) {
        var self = this;
        var display = document.getElementById('score-effect-display');
        if (!display) {
            this.animateScoreIncrement(scoreAmount, callback);
            return;
        }

        display.innerHTML = totalBlocks + '<br>×<br>' + totalLines + 'ライン';
        display.classList.add('show');

        setTimeout(function() {
            display.innerHTML = '' + scoreAmount;
            self.animateScoreIncrement(scoreAmount, callback);
        }, 1000);

        setTimeout(function() {
            display.classList.remove('show');
        }, 2000);
    },

    // パターン効果付きスコア計算演出（段階的表示）
    showPatternScoreCalculation: function(baseBlocks, totalLines, auraBonus, mossBonus, chainMasterActive, callback) {
        var self = this;
        var display = document.getElementById('score-effect-display');
        if (!display) {
            var totalBlocks = baseBlocks + auraBonus + mossBonus;
            var finalScore = totalBlocks * totalLines;
            if (chainMasterActive) {
                finalScore = Math.floor(finalScore * 1.5);
            }
            this.animateScoreIncrement(finalScore, callback);
            return;
        }

        var currentTotal = baseBlocks;

        // 第1段階: 基本ブロック数を表示
        display.innerHTML = baseBlocks + '<br>×<br>' + totalLines + 'ライン';
        display.classList.add('show');

        setTimeout(function() {
            // 第2段階: オーラボーナス加算
            if (auraBonus > 0) {
                self.showBonusAddition(display, currentTotal, auraBonus, 'オーラ', '✨', function() {
                    currentTotal += auraBonus;

                    // 第3段階: 苔ボーナス加算
                    if (mossBonus > 0) {
                        self.showBonusAddition(display, currentTotal, mossBonus, '苔', '🌿', function() {
                            currentTotal += mossBonus;
                            self.showFinalScore(display, currentTotal, totalLines, chainMasterActive, callback);
                        });
                    } else {
                        self.showFinalScore(display, currentTotal, totalLines, chainMasterActive, callback);
                    }
                });
            } else if (mossBonus > 0) {
                self.showBonusAddition(display, currentTotal, mossBonus, '苔', '🌿', function() {
                    currentTotal += mossBonus;
                    self.showFinalScore(display, currentTotal, totalLines, chainMasterActive, callback);
                });
            } else {
                self.showFinalScore(display, currentTotal, totalLines, chainMasterActive, callback);
            }
        }, 1500);
    },

    // ボーナス加算アニメーション
    showBonusAddition: function(display, current, bonus, name, icon, callback) {
        display.innerHTML = current + ' +' + bonus + '<br>' + icon + ' ' + name;
        setTimeout(callback, 1000);
    },

    // 最終スコア表示とスコア加算
    showFinalScore: function(display, totalBlocks, totalLines, chainMasterActive, callback) {
        var self = this;
        var finalScore = totalBlocks * totalLines;

        if (chainMasterActive) {
            display.innerHTML = totalBlocks + ' × ' + totalLines + '<br>=<br>' + (totalBlocks * totalLines) + '<br>×1.5 連鎖の達人';
            finalScore = Math.floor(finalScore * 1.5);
            setTimeout(function() {
                display.innerHTML = '=' + finalScore;
                setTimeout(function() {
                    self.animateScoreIncrement(finalScore, callback);
                    display.classList.remove('show');
                }, 800);
            }, 1000);
        } else {
            display.innerHTML = totalBlocks + ' × ' + totalLines + '<br>=<br>' + finalScore;
            setTimeout(function() {
                self.animateScoreIncrement(finalScore, callback);
                display.classList.remove('show');
            }, 1200);
        }
    },

    // スコアのインクリメントアニメーション
    animateScoreIncrement: function(targetAmount, callback) {
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

                // コールバックが指定されている場合は実行
                if (callback) {
                    callback();
                }
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
        const targetScore = round * CONFIG.GAME.TARGET_SCORE_MULTIPLIER;
        document.getElementById('target-score-display').textContent = `目標スコア: ${targetScore}`;
    },

    // ゲームオーバー画面を表示
    showGameOver: function(reason) {
        this.gameOverReason = reason || 'ブロックを配置できません';
        document.getElementById('game-over-reason').textContent = this.gameOverReason;
        document.getElementById('final-round').textContent = `到達ラウンド: ${BlockManager.gameState.round}`;
        document.getElementById('final-highscore').textContent = `最高ラウンド: ${this.highScore}`;
        document.getElementById('game-over-screen').style.display = 'flex';

        // ゴールドを0にリセット
        this.gold = 0;
        this.updateGoldDisplay();
        this.saveGold();
    },

    // ゲームオーバー画面を非表示
    hideGameOver: function() {
        document.getElementById('game-over-screen').style.display = 'none';
    },

    // 配置情報を更新
    updatePlacementInfo: function(blocksPlaced, round) {
        const deckInfoElement = document.getElementById('deck-info');
        if (deckInfoElement) {
            const remaining = CONFIG.GAME.MAX_PLACEMENTS_PER_ROUND - blocksPlaced;
            deckInfoElement.textContent = `ラウンド ${round} - 残り配置数: ${remaining}/${CONFIG.GAME.MAX_PLACEMENTS_PER_ROUND}`;
        }
    },

    // ラウンド終了メッセージを表示
    showRoundEnd: function(round) {
        const deckInfoElement = document.getElementById('deck-info');
        if (deckInfoElement) {
            const targetScore = round * CONFIG.GAME.TARGET_SCORE_MULTIPLIER;
            const currentScore = BlockManager.gameState.score;

            // 目標スコア判定
            if (currentScore >= targetScore) {
                // 目標達成！
                deckInfoElement.textContent = `ラウンド ${round} クリア！ 目標達成！`;
                deckInfoElement.style.background = 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)';
                deckInfoElement.style.color = '#fff';
                deckInfoElement.style.fontWeight = 'bold';

                // 3秒後にショップ画面を表示
                setTimeout(() => {
                    // UI リセット
                    deckInfoElement.style.background = '';
                    deckInfoElement.style.color = '';
                    deckInfoElement.style.fontWeight = '';

                    // ラウンド終了フラグをリセット
                    BlockManager.gameState.roundEnding = false;

                    // ショップ画面を表示
                    Shop.show();
                }, 3000);
            } else {
                // 目標未達成 → ゲームオーバー
                this.saveHighScore();
                this.showGameOver(`目標スコアに到達できませんでした（目標: ${targetScore}、獲得: ${currentScore}）`);
            }
        }
    },

    // 「どこにもブロックを置けません」ダイアログを表示
    showCannotPlaceDialog: function(callback) {
        const dialog = document.getElementById('cannot-place-dialog');
        if (!dialog) {
            // ダイアログ要素が存在しない場合でもコールバックを呼ぶ
            if (callback) {
                setTimeout(callback, 3000);
            }
            return;
        }

        dialog.textContent = 'どこにもブロックを置けません';
        dialog.classList.add('show');

        // 3秒後に非表示にしてコールバックを実行
        setTimeout(() => {
            dialog.classList.remove('show');
            if (callback) {
                callback();
            }
        }, 3000);
    },

    // シール効果発動エフェクト
    showSealEffect: function(sealId, text) {
        var sealInfo = PatternManager.getSeal(sealId);
        if (!sealInfo) return;

        var popup = document.createElement('div');
        popup.className = 'seal-effect-popup';
        popup.innerHTML = '<span class="seal-effect-icon">' + sealInfo.icon + '</span>' +
                         '<span class="seal-effect-text">' + text + '</span>';
        document.body.appendChild(popup);

        setTimeout(function() {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    },

    // ゴールドの読み込み
    loadGold: function() {
        const saved = localStorage.getItem(CONFIG.GOLD.STORAGE_KEY);
        if (saved) {
            this.gold = parseInt(saved, 10);
        } else {
            this.gold = 0;
        }
        this.updateGoldDisplay();
    },

    // ゴールドの保存
    saveGold: function() {
        localStorage.setItem(CONFIG.GOLD.STORAGE_KEY, this.gold.toString());
    },

    // ゴールド表示更新（演出なし）
    updateGoldDisplay: function() {
        document.getElementById('gold-display').textContent = `${this.gold} G`;
    },

    // ゴールドのインクリメントアニメーション
    animateGoldIncrement: function(targetAmount, callback) {
        const startGold = this.gold;
        const endGold = startGold + targetAmount;
        const duration = CONFIG.GOLD.ANIMATION_DURATION;
        const startTime = Date.now();
        const self = this;

        const animate = function() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // イージング関数（easeOutCubic）
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentGold = Math.floor(startGold + (targetAmount * easeProgress));

            self.gold = currentGold;
            self.updateGoldDisplay();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 最終的な正確な値を設定
                self.gold = endGold;
                self.updateGoldDisplay();
                self.saveGold();

                // コールバックが指定されている場合は実行
                if (callback) {
                    callback();
                }
            }
        };

        requestAnimationFrame(animate);
    },

    // ゴールド獲得ポップアップ表示
    showGoldPopup: function(amount) {
        const popup = document.createElement('div');
        popup.className = 'gold-popup';
        popup.textContent = '+' + amount + ' G';
        document.body.appendChild(popup);

        // アニメーション終了後に削除
        setTimeout(function() {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    },

    // ゲーム状態の保存
    saveGameState: function() {
        var state = {
            gameState: BlockManager.gameState,
            board: GameBoard.board,
            deckState: DeckManager.state,
            relicState: RelicManager.state
        };
        localStorage.setItem(CONFIG.GAME_STATE_STORAGE_KEY, JSON.stringify(state));
    },

    // ゲーム状態の読み込み
    loadGameState: function() {
        var saved = localStorage.getItem(CONFIG.GAME_STATE_STORAGE_KEY);
        if (!saved) return null;
        return JSON.parse(saved);
    },

    // 保存された状態があるかチェック
    hasGameState: function() {
        return localStorage.getItem(CONFIG.GAME_STATE_STORAGE_KEY) !== null;
    },

    // ゲーム状態のクリア
    clearGameState: function() {
        localStorage.removeItem(CONFIG.GAME_STATE_STORAGE_KEY);
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
