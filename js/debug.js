/**
 * デバッグウィンドウ管理
 * デバッグ用のモーダルウィンドウを制御する
 */
var DebugManager = {
    // 現在アクティブなタブ
    activeTab: 'relics',

    // タブ定義
    TABS: {
        relics: { name: 'レリック', icon: '✨' },
        gameState: { name: 'ゲーム状態', icon: '📊' },
        blockSets: { name: 'ブロックセット', icon: '🧱' }
    },

    /**
     * 初期化・イベント登録
     */
    init: function() {
        var self = this;

        // デバッグボタンクリック
        var debugButton = document.getElementById('debug-button');
        if (debugButton) {
            debugButton.addEventListener('click', function() {
                self.show();
            });
        }

        // 閉じるボタンクリック
        var closeButton = document.getElementById('debug-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                self.hide();
            });
        }

        // モーダル背景クリックで閉じる
        var modal = document.getElementById('debug-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    self.hide();
                }
            });
        }

        // 初期タブをレンダリング
        this.renderTabs();
        this.renderContent();
    },

    /**
     * ウィンドウを開く
     */
    show: function() {
        var modal = document.getElementById('debug-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    /**
     * ウィンドウを閉じる
     */
    hide: function() {
        var modal = document.getElementById('debug-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * タブ切り替え
     * @param {string} tabId - 切り替え先のタブID
     */
    switchTab: function(tabId) {
        if (!this.TABS[tabId]) return;

        this.activeTab = tabId;
        this.renderTabs();
        this.renderContent();
    },

    /**
     * タブボタンをレンダリング
     */
    renderTabs: function() {
        var self = this;
        var tabsContainer = document.getElementById('debug-tabs');
        if (!tabsContainer) return;

        // クイックアクションをタブの前にレンダリング
        this.renderQuickActions();

        tabsContainer.innerHTML = '';

        Object.keys(this.TABS).forEach(function(tabId) {
            var tab = self.TABS[tabId];
            var tabButton = document.createElement('button');
            tabButton.className = 'debug-tab';
            if (tabId === self.activeTab) {
                tabButton.className += ' active';
            }
            tabButton.textContent = tab.icon + ' ' + tab.name;
            tabButton.addEventListener('click', function() {
                self.switchTab(tabId);
            });
            tabsContainer.appendChild(tabButton);
        });
    },

    /**
     * クイックアクションセクションをレンダリング
     */
    renderQuickActions: function() {
        var self = this;
        var tabsContainer = document.getElementById('debug-tabs');
        if (!tabsContainer) return;

        // 既存のクイックアクションを削除
        var existingQuickActions = document.querySelector('.debug-quick-actions');
        if (existingQuickActions) {
            existingQuickActions.remove();
        }

        // クイックアクションセクションを作成
        var quickActionsDiv = document.createElement('div');
        quickActionsDiv.className = 'debug-quick-actions';

        var title = document.createElement('h3');
        title.textContent = 'クイックアクション';
        quickActionsDiv.appendChild(title);

        // 盤面クリアボタン
        var boardClearBtn = document.createElement('button');
        boardClearBtn.className = 'debug-action-btn danger';
        boardClearBtn.textContent = '盤面クリア';
        boardClearBtn.addEventListener('click', function() {
            self.forceClearBoard();
        });
        quickActionsDiv.appendChild(boardClearBtn);

        // 全レリック獲得ボタン
        var allRelicsBtn = document.createElement('button');
        allRelicsBtn.className = 'debug-action-btn info';
        allRelicsBtn.textContent = '全レリック獲得';
        allRelicsBtn.addEventListener('click', function() {
            self.acquireAllRelics();
        });
        quickActionsDiv.appendChild(allRelicsBtn);

        // タブコンテナの前に挿入
        tabsContainer.parentNode.insertBefore(quickActionsDiv, tabsContainer);
    },

    /**
     * 盤面を強制クリア
     */
    forceClearBoard: function() {
        if (confirm('盤面上の全ブロックを削除しますか？')) {
            GameBoard.clear();
            GameUI.saveGameState();
        }
    },

    /**
     * 全レリックを獲得
     */
    acquireAllRelics: function() {
        var allRelics = RelicManager.getAllRelics();
        var self = this;
        allRelics.forEach(function(relic) {
            if (!RelicManager.hasRelic(relic.id)) {
                RelicManager.addRelic(relic.id);
            }
        });
        RelicManager.render();
        this.renderRelicsTab();
    },

    /**
     * 現在タブのコンテンツを表示
     */
    renderContent: function() {
        var contentContainer = document.getElementById('debug-tab-content');
        if (!contentContainer) return;

        var tab = this.TABS[this.activeTab];
        if (!tab) return;

        if (this.activeTab === 'relics') {
            this.renderRelicsTab();
        } else if (this.activeTab === 'gameState') {
            this.renderGameStateTab();
        } else if (this.activeTab === 'blockSets') {
            this.renderBlockSetsTab();
        } else {
            contentContainer.innerHTML = '<p class="debug-placeholder">' + tab.icon + ' ' + tab.name + 'タブの内容</p>';
        }
    },

    /**
     * レリックタブのコンテンツをレンダリング
     */
    renderRelicsTab: function() {
        var contentContainer = document.getElementById('debug-tab-content');
        if (!contentContainer) return;

        var self = this;
        var allRelics = RelicManager.getAllRelics();
        var ownedRelics = RelicManager.state.ownedRelics;

        // レアリティ表示用マップ
        var rarityText = {
            'common': 'コモン',
            'rare': 'レア',
            'epic': 'エピック'
        };

        var html = '<div class="debug-relics-container">';

        // 所持中セクション
        html += '<div class="debug-section">';
        html += '<h3 class="debug-section-title">所持中のレリック (' + ownedRelics.length + ')</h3>';
        html += '<div class="debug-relic-list">';

        if (ownedRelics.length === 0) {
            html += '<p class="debug-empty-message">レリックを所持していません</p>';
        } else {
            ownedRelics.forEach(function(relicId) {
                var relic = RelicManager.getRelic(relicId);
                if (relic) {
                    html += '<div class="debug-relic-card owned">';
                    html += '<span class="debug-relic-icon">' + relic.icon + '</span>';
                    html += '<div class="debug-relic-info">';
                    html += '<span class="debug-relic-name">' + relic.name + '</span>';
                    html += '<span class="debug-relic-rarity rarity-' + relic.rarity + '">' + rarityText[relic.rarity] + '</span>';
                    html += '<span class="debug-relic-desc">' + relic.description + '</span>';
                    html += '</div>';
                    html += '<button class="debug-relic-remove" data-relic-id="' + relic.id + '">削除</button>';
                    html += '</div>';
                }
            });
        }

        html += '</div>';
        html += '</div>';

        // 全レリック一覧セクション
        html += '<div class="debug-section">';
        html += '<h3 class="debug-section-title">全レリック一覧</h3>';
        html += '<div class="debug-relic-list">';

        allRelics.forEach(function(relic) {
            var isOwned = RelicManager.hasRelic(relic.id);
            html += '<div class="debug-relic-card' + (isOwned ? ' owned' : '') + '">';
            html += '<span class="debug-relic-icon">' + relic.icon + '</span>';
            html += '<div class="debug-relic-info">';
            html += '<span class="debug-relic-name">' + relic.name + '</span>';
            html += '<span class="debug-relic-rarity rarity-' + relic.rarity + '">' + rarityText[relic.rarity] + '</span>';
            html += '<span class="debug-relic-desc">' + relic.description + '</span>';
            html += '</div>';
            if (isOwned) {
                html += '<span class="debug-relic-owned-badge">所持中</span>';
            } else {
                html += '<button class="debug-relic-add" data-relic-id="' + relic.id + '">追加</button>';
            }
            html += '</div>';
        });

        html += '</div>';
        html += '</div>';

        html += '</div>';

        contentContainer.innerHTML = html;

        // イベントリスナー登録
        var addButtons = contentContainer.querySelectorAll('.debug-relic-add');
        addButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var relicId = btn.getAttribute('data-relic-id');
                self.addRelic(relicId);
            });
        });

        var removeButtons = contentContainer.querySelectorAll('.debug-relic-remove');
        removeButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var relicId = btn.getAttribute('data-relic-id');
                self.removeRelic(relicId);
            });
        });
    },

    /**
     * レリックを追加
     */
    addRelic: function(relicId) {
        RelicManager.addRelic(relicId);
        RelicManager.render();
        this.renderContent();
    },

    /**
     * レリックを削除
     */
    removeRelic: function(relicId) {
        RelicManager.removeRelic(relicId);
        RelicManager.render();
        this.renderContent();
    },

    /**
     * ゲーム状態タブのコンテンツをレンダリング
     */
    renderGameStateTab: function() {
        var contentContainer = document.getElementById('debug-tab-content');
        if (!contentContainer) return;

        var self = this;

        // 現在値を取得
        var currentRound = BlockManager.gameState.round;
        var currentPlaced = BlockManager.gameState.blocksPlacedCount;
        var maxPlacements = CONFIG.GAME.MAX_PLACEMENTS_PER_ROUND;
        var remainingPlacements = maxPlacements - currentPlaced;
        var currentGold = GameUI.gold;
        var currentScore = BlockManager.gameState.score;
        var targetScore = currentRound * CONFIG.GAME.TARGET_SCORE_MULTIPLIER;

        var html = '<div class="debug-gamestate-container">';

        // ラウンド数
        html += '<div class="debug-state-row">';
        html += '<label class="debug-state-label">📊 ラウンド数</label>';
        html += '<div class="debug-state-controls">';
        html += '<button class="debug-quick-btn" data-field="round" data-delta="-5">-5</button>';
        html += '<button class="debug-quick-btn" data-field="round" data-delta="-1">-1</button>';
        html += '<input type="number" id="debug-round" class="debug-state-input" value="' + currentRound + '" min="1">';
        html += '<button class="debug-quick-btn" data-field="round" data-delta="1">+1</button>';
        html += '<button class="debug-quick-btn" data-field="round" data-delta="5">+5</button>';
        html += '</div>';
        html += '</div>';

        // 残り配置可能数
        html += '<div class="debug-state-row">';
        html += '<label class="debug-state-label">🧱 残り配置可能数</label>';
        html += '<div class="debug-state-controls">';
        html += '<button class="debug-quick-btn" data-field="remaining" data-delta="-5">-5</button>';
        html += '<button class="debug-quick-btn" data-field="remaining" data-delta="-1">-1</button>';
        html += '<input type="number" id="debug-remaining" class="debug-state-input" value="' + remainingPlacements + '" min="0" max="' + maxPlacements + '">';
        html += '<button class="debug-quick-btn" data-field="remaining" data-delta="1">+1</button>';
        html += '<button class="debug-quick-btn" data-field="remaining" data-delta="5">+5</button>';
        html += '</div>';
        html += '</div>';

        // 所持ゴールド
        html += '<div class="debug-state-row">';
        html += '<label class="debug-state-label">💰 所持ゴールド</label>';
        html += '<div class="debug-state-controls">';
        html += '<button class="debug-quick-btn" data-field="gold" data-delta="-50">-50</button>';
        html += '<button class="debug-quick-btn" data-field="gold" data-delta="-10">-10</button>';
        html += '<input type="number" id="debug-gold" class="debug-state-input" value="' + currentGold + '" min="0">';
        html += '<button class="debug-quick-btn" data-field="gold" data-delta="10">+10</button>';
        html += '<button class="debug-quick-btn" data-field="gold" data-delta="50">+50</button>';
        html += '</div>';
        html += '</div>';

        // 現在のスコア
        html += '<div class="debug-state-row">';
        html += '<label class="debug-state-label">🎯 現在のスコア</label>';
        html += '<div class="debug-state-controls">';
        html += '<button class="debug-quick-btn" data-field="score" data-delta="-50">-50</button>';
        html += '<button class="debug-quick-btn" data-field="score" data-delta="-10">-10</button>';
        html += '<input type="number" id="debug-score" class="debug-state-input" value="' + currentScore + '" min="0">';
        html += '<button class="debug-quick-btn" data-field="score" data-delta="10">+10</button>';
        html += '<button class="debug-quick-btn" data-field="score" data-delta="50">+50</button>';
        html += '</div>';
        html += '</div>';

        // 目標スコア（読み取り専用）
        html += '<div class="debug-state-row">';
        html += '<label class="debug-state-label">🏆 目標スコア（ラウンドから自動計算）</label>';
        html += '<div class="debug-state-controls">';
        html += '<input type="number" id="debug-target" class="debug-state-input debug-state-readonly" value="' + targetScore + '" readonly>';
        html += '</div>';
        html += '</div>';

        // アクションボタン
        html += '<div class="debug-state-actions">';
        html += '<button id="debug-apply-state" class="debug-action-btn apply">適用</button>';
        html += '<button id="debug-reset-state" class="debug-action-btn reset">リセット</button>';
        html += '</div>';

        html += '</div>';

        contentContainer.innerHTML = html;

        // クイックボタンのイベントリスナー登録
        var quickButtons = contentContainer.querySelectorAll('.debug-quick-btn');
        quickButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var field = btn.getAttribute('data-field');
                var delta = parseInt(btn.getAttribute('data-delta'), 10);
                self.adjustInputValue(field, delta);
            });
        });

        // 適用ボタンのイベントリスナー
        var applyBtn = document.getElementById('debug-apply-state');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                self.applyGameState();
            });
        }

        // リセットボタンのイベントリスナー
        var resetBtn = document.getElementById('debug-reset-state');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                self.resetGameState();
            });
        }

        // ラウンド入力変更時に目標スコアを自動更新
        var roundInput = document.getElementById('debug-round');
        if (roundInput) {
            roundInput.addEventListener('input', function() {
                self.updateTargetScorePreview();
            });
        }
    },

    /**
     * 入力フィールドの値を調整
     */
    adjustInputValue: function(field, delta) {
        var inputId = 'debug-' + field;
        var input = document.getElementById(inputId);
        if (!input) return;

        var currentValue = parseInt(input.value, 10) || 0;
        var newValue = currentValue + delta;

        // 最小値・最大値の制限
        var min = parseInt(input.getAttribute('min'), 10);
        var max = parseInt(input.getAttribute('max'), 10);

        if (!isNaN(min) && newValue < min) newValue = min;
        if (!isNaN(max) && newValue > max) newValue = max;

        input.value = newValue;

        // ラウンドが変更された場合は目標スコアを更新
        if (field === 'round') {
            this.updateTargetScorePreview();
        }
    },

    /**
     * 目標スコアプレビューを更新
     */
    updateTargetScorePreview: function() {
        var roundInput = document.getElementById('debug-round');
        var targetInput = document.getElementById('debug-target');
        if (!roundInput || !targetInput) return;

        var round = parseInt(roundInput.value, 10) || 1;
        var targetScore = round * CONFIG.GAME.TARGET_SCORE_MULTIPLIER;
        targetInput.value = targetScore;
    },

    /**
     * ゲーム状態を適用
     */
    applyGameState: function() {
        // 入力値を取得
        var roundInput = document.getElementById('debug-round');
        var remainingInput = document.getElementById('debug-remaining');
        var goldInput = document.getElementById('debug-gold');
        var scoreInput = document.getElementById('debug-score');

        if (!roundInput || !remainingInput || !goldInput || !scoreInput) return;

        var newRound = parseInt(roundInput.value, 10) || 1;
        var newRemaining = parseInt(remainingInput.value, 10) || 0;
        var newGold = parseInt(goldInput.value, 10) || 0;
        var newScore = parseInt(scoreInput.value, 10) || 0;

        // 残り配置数から blocksPlacedCount を計算
        var maxPlacements = CONFIG.GAME.MAX_PLACEMENTS_PER_ROUND;
        var newPlacedCount = maxPlacements - newRemaining;

        // 値を適用
        BlockManager.gameState.round = newRound;
        BlockManager.gameState.blocksPlacedCount = newPlacedCount;
        BlockManager.gameState.score = newScore;
        GameUI.gold = newGold;

        // UI更新
        document.getElementById('score-display').textContent = 'スコア: ' + newScore;
        GameUI.updateGoldDisplay();
        GameUI.saveGold();
        GameUI.updateTargetScore(newRound);
        GameUI.updatePlacementInfo(newPlacedCount, newRound);
        GameUI.saveGameState();

        // 確認メッセージ（タブ内容を再レンダリング）
        this.renderGameStateTab();
    },

    /**
     * ゲーム状態をリセット（初期値に戻す）
     */
    resetGameState: function() {
        // 初期値を設定
        BlockManager.gameState.round = 1;
        BlockManager.gameState.blocksPlacedCount = 0;
        BlockManager.gameState.score = 0;
        GameUI.gold = 0;

        // UI更新
        document.getElementById('score-display').textContent = 'スコア: 0';
        GameUI.updateGoldDisplay();
        GameUI.saveGold();
        GameUI.updateTargetScore(1);
        GameUI.updatePlacementInfo(0, 1);
        GameUI.saveGameState();

        // タブ内容を再レンダリング
        this.renderGameStateTab();
    },

    /**
     * ブロックセットタブのコンテンツをレンダリング
     */
    renderBlockSetsTab: function() {
        var contentContainer = document.getElementById('debug-tab-content');
        if (!contentContainer) return;

        var self = this;
        var allShapes = BlockShapes.ALL;
        var currentBlocks = BlockManager.gameState.currentBlocks;

        // パターンとシール一覧を取得
        var allPatterns = PatternManager.getAllPatterns();
        var allSeals = PatternManager.getAllSeals();

        var html = '<div class="debug-blocksets-container">';

        // 全ブロック形状一覧セクション
        html += '<div class="debug-section">';
        html += '<h3 class="debug-section-title">全ブロック形状 (' + allShapes.length + '種類)</h3>';
        html += '<div class="debug-shape-grid">';

        for (var i = 0; i < allShapes.length; i++) {
            var shape = allShapes[i];
            html += '<div class="debug-shape-card">';
            html += '<div class="debug-shape-preview" id="debug-shape-preview-' + i + '"></div>';
            html += '<button class="debug-shape-add" data-shape-index="' + i + '">追加</button>';
            html += '</div>';
        }

        html += '</div>';
        html += '</div>';

        // 現在の手札セクション
        html += '<div class="debug-section">';
        html += '<h3 class="debug-section-title">現在の手札 (' + currentBlocks.length + '個)</h3>';
        html += '<div class="debug-hand-list">';

        if (currentBlocks.length === 0) {
            html += '<p class="debug-empty-message">手札がありません</p>';
        } else {
            for (var j = 0; j < currentBlocks.length; j++) {
                var block = currentBlocks[j];
                html += '<div class="debug-hand-card">';
                html += '<div class="debug-hand-preview" id="debug-hand-preview-' + j + '"></div>';
                html += '<div class="debug-hand-controls">';

                // パターン選択ドロップダウン
                html += '<select class="debug-pattern-select" data-block-index="' + j + '">';
                html += '<option value="">パターンなし</option>';
                for (var k = 0; k < allPatterns.length; k++) {
                    var pattern = allPatterns[k];
                    var selected = (block.pattern === pattern.id) ? ' selected' : '';
                    html += '<option value="' + pattern.id + '"' + selected + '>' + pattern.icon + ' ' + pattern.name + '</option>';
                }
                html += '</select>';

                // シールボタン
                html += '<div class="debug-seal-buttons">';
                for (var m = 0; m < allSeals.length; m++) {
                    var seal = allSeals[m];
                    var hasThisSeal = this.blockHasSeal(block, seal.id);
                    var activeClass = hasThisSeal ? ' active' : '';
                    html += '<button data-block-index="' + j + '" data-seal-id="' + seal.id + '" class="' + activeClass + '" title="' + seal.name + '">' + seal.icon + '</button>';
                }
                html += '</div>';

                html += '<button class="debug-hand-remove" data-block-index="' + j + '">削除</button>';
                html += '</div>';
                html += '</div>';
            }
        }

        html += '</div>';
        html += '</div>';

        html += '</div>';

        contentContainer.innerHTML = html;

        // 形状プレビューを描画
        for (var pi = 0; pi < allShapes.length; pi++) {
            this.renderShapePreview('debug-shape-preview-' + pi, allShapes[pi]);
        }

        // 手札プレビューを描画（BlockRendererを使用）
        for (var hi = 0; hi < currentBlocks.length; hi++) {
            var handBlock = currentBlocks[hi];
            var previewContainer = document.getElementById('debug-hand-preview-' + hi);
            if (previewContainer) {
                previewContainer.innerHTML = '';
                var blockElement = BlockRenderer.createBlockElement({
                    shape: handBlock.shape,
                    pattern: handBlock.pattern,
                    seals: handBlock.seals,
                    cellSize: 12
                });
                previewContainer.appendChild(blockElement);
            }
        }

        // イベントリスナー登録
        // 形状追加ボタン
        var addButtons = contentContainer.querySelectorAll('.debug-shape-add');
        addButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var shapeIndex = parseInt(btn.getAttribute('data-shape-index'), 10);
                self.addBlockToHand(shapeIndex);
            });
        });

        // 削除ボタン
        var removeButtons = contentContainer.querySelectorAll('.debug-hand-remove');
        removeButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var blockIndex = parseInt(btn.getAttribute('data-block-index'), 10);
                self.removeBlockFromHand(blockIndex);
            });
        });

        // パターン選択
        var patternSelects = contentContainer.querySelectorAll('.debug-pattern-select');
        patternSelects.forEach(function(select) {
            select.addEventListener('change', function() {
                var blockIndex = parseInt(select.getAttribute('data-block-index'), 10);
                var patternId = select.value;
                self.updateBlockPattern(blockIndex, patternId);
            });
        });

        // シールボタン
        var sealButtons = contentContainer.querySelectorAll('.debug-seal-buttons button');
        sealButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var blockIndex = parseInt(btn.getAttribute('data-block-index'), 10);
                var sealId = btn.getAttribute('data-seal-id');
                self.cycleBlockSeal(blockIndex, sealId);
            });
        });
    },

    /**
     * 形状プレビューを描画（シンプルな5x5グリッド）
     */
    renderShapePreview: function(containerId, shape) {
        var container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        var previewGrid = document.createElement('div');
        previewGrid.style.display = 'grid';
        previewGrid.style.gridTemplateColumns = 'repeat(' + shape[0].length + ', 8px)';
        previewGrid.style.gap = '1px';

        for (var r = 0; r < shape.length; r++) {
            for (var c = 0; c < shape[r].length; c++) {
                var cell = document.createElement('div');
                cell.style.width = '8px';
                cell.style.height = '8px';
                cell.style.borderRadius = '1px';
                if (shape[r][c] === 1) {
                    cell.style.background = 'linear-gradient(135deg, #8d6e63 0%, #795548 100%)';
                    cell.style.border = '1px solid #5d4037';
                } else {
                    cell.style.background = 'transparent';
                }
                previewGrid.appendChild(cell);
            }
        }

        container.appendChild(previewGrid);
    },

    /**
     * ブロックが指定シールを持っているか確認
     */
    blockHasSeal: function(block, sealId) {
        if (!block.seals) return false;
        for (var r = 0; r < block.seals.length; r++) {
            for (var c = 0; c < block.seals[r].length; c++) {
                if (block.seals[r][c] === sealId) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 手札にブロックを追加
     */
    addBlockToHand: function(shapeIndex) {
        var shape = BlockShapes.ALL[shapeIndex];
        var newBlock = {
            id: Date.now(),
            shape: shape,
            placed: false,
            pattern: null,
            seals: PatternManager.createEmptySeals(shape)
        };
        BlockManager.gameState.currentBlocks.push(newBlock);
        BlockManager.render();
        this.renderBlockSetsTab();
    },

    /**
     * 手札からブロックを削除
     */
    removeBlockFromHand: function(blockIndex) {
        BlockManager.gameState.currentBlocks.splice(blockIndex, 1);
        BlockManager.render();
        this.renderBlockSetsTab();
    },

    /**
     * ブロックのパターンを変更
     */
    updateBlockPattern: function(blockIndex, patternId) {
        var block = BlockManager.gameState.currentBlocks[blockIndex];
        block.pattern = patternId || null;
        BlockManager.render();
        this.renderBlockSetsTab();
    },

    /**
     * シールをサイクル（追加/移動/削除）
     */
    cycleBlockSeal: function(blockIndex, sealId) {
        var block = BlockManager.gameState.currentBlocks[blockIndex];
        var shape = block.shape;

        // シール配列がない場合は初期化
        if (!block.seals) {
            block.seals = PatternManager.createEmptySeals(shape);
        }

        // 形状の有効セル位置を取得
        var validCells = [];
        for (var r = 0; r < shape.length; r++) {
            for (var c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    validCells.push({row: r, col: c});
                }
            }
        }

        // 現在のシール位置を検索
        var currentSealIndex = -1;
        for (var i = 0; i < validCells.length; i++) {
            var cell = validCells[i];
            if (block.seals[cell.row][cell.col] === sealId) {
                currentSealIndex = i;
                block.seals[cell.row][cell.col] = null;
                break;
            }
        }

        // 次の位置にシールを配置（最後の場合は削除のまま）
        var nextIndex = currentSealIndex + 1;
        if (nextIndex < validCells.length) {
            var nextCell = validCells[nextIndex];
            block.seals[nextCell.row][nextCell.col] = sealId;
        }

        BlockManager.render();
        this.renderBlockSetsTab();
    }
};
