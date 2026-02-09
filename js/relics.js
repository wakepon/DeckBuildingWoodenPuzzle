// relics.js - レリックシステム管理

var RelicManager = {
    // レリックデータ定義
    RELICS: {
        FULL_CLEAR_BONUS: {
            id: 'full_clear_bonus',
            name: '全消しボーナス',
            description: '盤面を全て空にするとスコア+20',
            rarity: 'common',
            price: 4,
            icon: '✨'
        },
        SMALL_LUCK: {
            id: 'small_luck',
            name: '小さな幸運',
            description: '3ブロックのピースを配置した際に行または列が揃うとスコア+20',
            rarity: 'common',
            price: 3,
            icon: '🍀'
        },
        CHAIN_MASTER: {
            id: 'chain_master',
            name: '連鎖の達人',
            description: '複数行列を同時消しするとスコア倍率を1.5倍',
            rarity: 'rare',
            price: 7,
            icon: '⚡'
        },
        HAND_STOCK: {
            id: 'hand_stock',
            name: '手札ストック',
            description: 'ブロックセットを1つ保管できるストック枠が出現する',
            rarity: 'rare',
            price: 6,
            icon: '📦'
        },
        SINGLE_LINE: {
            id: 'single_line',
            name: 'シングルライン',
            description: '1行または1列のみ消した時、スコアが3倍になる',
            rarity: 'common',
            price: 4,
            icon: '1️⃣'
        },
        TAKENOKO: {
            id: 'takenoko',
            name: 'タケノコ',
            description: '縦列のみ揃った時、スコアが揃った列数倍になる',
            rarity: 'common',
            price: 4,
            icon: '🎍'
        },
        KANI: {
            id: 'kani',
            name: 'カニ',
            description: '横列のみ揃った時、スコアが揃った行数倍になる',
            rarity: 'common',
            price: 4,
            icon: '🦀'
        }
    },

    // 状態管理
    state: {
        ownedRelics: []  // 所持レリックIDのリスト
    },

    // 初期化
    init: function() {
        this.render();
    },

    // レリック追加
    addRelic: function(relicId) {
        if (this.state.ownedRelics.indexOf(relicId) === -1) {
            this.state.ownedRelics.push(relicId);
            this.render();
            // 手札ストック: ストック枠の表示を更新
            if (relicId === 'hand_stock') {
                BlockManager.renderStock();
            }
            GameUI.saveGameState();
        }
    },

    // レリック削除
    removeRelic: function(relicId) {
        var index = this.state.ownedRelics.indexOf(relicId);
        if (index !== -1) {
            // 手札ストック: 削除前にストックのブロックを手札に戻す
            if (relicId === 'hand_stock') {
                BlockManager.returnStockToHand();
            }
            this.state.ownedRelics.splice(index, 1);
            this.render();
            // 手札ストック: ストック枠を非表示にする
            if (relicId === 'hand_stock') {
                BlockManager.renderStock();
            }
            GameUI.saveGameState();
        }
    },

    // レリック情報取得（IDから）
    getRelic: function(relicId) {
        for (var key in this.RELICS) {
            if (this.RELICS[key].id === relicId) {
                return this.RELICS[key];
            }
        }
        return null;
    },

    // 全レリック一覧取得
    getAllRelics: function() {
        var relics = [];
        for (var key in this.RELICS) {
            relics.push(this.RELICS[key]);
        }
        return relics;
    },

    // レリック所持チェック
    hasRelic: function(relicId) {
        return this.state.ownedRelics.indexOf(relicId) !== -1;
    },

    // UI更新
    render: function() {
        var relicList = document.getElementById('relic-list');
        if (!relicList) return;

        relicList.innerHTML = '';

        var self = this;
        this.state.ownedRelics.forEach(function(relicId) {
            var relic = self.getRelic(relicId);
            if (relic) {
                var iconElement = document.createElement('div');
                iconElement.className = 'relic-icon rarity-' + relic.rarity;
                iconElement.textContent = relic.icon;
                iconElement.setAttribute('data-relic-id', relicId);

                // マウスイベント（PC用）
                iconElement.addEventListener('mouseenter', function(e) {
                    self.showTooltip(relicId, e.clientX, e.clientY);
                });
                iconElement.addEventListener('mousemove', function(e) {
                    self.moveTooltip(e.clientX, e.clientY);
                });
                iconElement.addEventListener('mouseleave', function() {
                    self.hideTooltip();
                });

                // タッチイベント（モバイル用）
                iconElement.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    var touch = e.touches[0];
                    self.showTooltip(relicId, touch.clientX, touch.clientY);
                });
                iconElement.addEventListener('touchend', function() {
                    setTimeout(function() {
                        self.hideTooltip();
                    }, 1500);
                });

                relicList.appendChild(iconElement);
            }
        });

        // パネルの表示/非表示
        var panel = document.getElementById('relic-panel');
        if (panel) {
            panel.style.display = this.state.ownedRelics.length > 0 ? 'block' : 'none';
        }
    },

    // ツールチップ表示
    showTooltip: function(relicId, x, y) {
        var relic = this.getRelic(relicId);
        if (!relic) return;

        var tooltip = document.getElementById('relic-tooltip');
        var nameEl = document.getElementById('relic-tooltip-name');
        var descEl = document.getElementById('relic-tooltip-desc');
        var rarityEl = document.getElementById('relic-tooltip-rarity');

        if (!tooltip || !nameEl || !descEl || !rarityEl) return;

        nameEl.textContent = relic.icon + ' ' + relic.name;
        descEl.textContent = relic.description;

        var rarityText = {
            'common': 'コモン',
            'rare': 'レア',
            'epic': 'エピック'
        };
        rarityEl.textContent = rarityText[relic.rarity] || relic.rarity;
        rarityEl.className = 'rarity-' + relic.rarity;

        tooltip.style.display = 'block';
        this.moveTooltip(x, y);
    },

    // ツールチップ位置移動
    moveTooltip: function(x, y) {
        var tooltip = document.getElementById('relic-tooltip');
        if (!tooltip) return;

        // 画面端での位置調整
        var tooltipWidth = tooltip.offsetWidth;
        var tooltipHeight = tooltip.offsetHeight;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        var left = x + 15;
        var top = y + 15;

        if (left + tooltipWidth > windowWidth - 10) {
            left = x - tooltipWidth - 15;
        }
        if (top + tooltipHeight > windowHeight - 10) {
            top = y - tooltipHeight - 15;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    },

    // ツールチップ非表示
    hideTooltip: function() {
        var tooltip = document.getElementById('relic-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    // 状態設定（復元用）
    setState: function(stateData) {
        if (stateData && stateData.ownedRelics) {
            this.state.ownedRelics = stateData.ownedRelics;
        }
        this.render();
    },

    // 状態リセット
    reset: function() {
        this.state.ownedRelics = [];
        this.render();
    },

    // レリック効果を計算
    // params: { totalLines, totalBlocks, placedBlockSize, isBoardEmpty }
    calculateRelicEffects: function(params) {
        var effects = {
            chainMasterActive: false,
            singleLineActive: false,
            smallLuckActive: false,
            fullClearActive: false,
            takenokoActive: false,
            takenokoCols: 0,
            kaniActive: false,
            kaniRows: 0
        };

        // 連鎖の達人: 複数行列を同時消しで1.5倍
        if (this.hasRelic('chain_master') && params.totalLines >= 2) {
            effects.chainMasterActive = true;
        }

        // シングルライン: 1ラインのみ消しで3倍
        if (this.hasRelic('single_line') && params.totalLines === 1) {
            effects.singleLineActive = true;
        }

        // 小さな幸運: 3ブロックのピースでライン消し
        if (this.hasRelic('small_luck') && params.placedBlockSize === 3 && params.totalLines > 0) {
            effects.smallLuckActive = true;
        }

        // 全消しボーナス: 盤面が完全に空
        if (this.hasRelic('full_clear_bonus') && params.isBoardEmpty) {
            effects.fullClearActive = true;
        }

        // タケノコ: 縦列のみ揃った時、揃った列数倍
        if (this.hasRelic('takenoko') && params.rowLines === 0 && params.colLines >= 1) {
            effects.takenokoActive = true;
            effects.takenokoCols = params.colLines;
        }

        // カニ: 横列のみ揃った時、揃った行数倍
        if (this.hasRelic('kani') && params.colLines === 0 && params.rowLines >= 1) {
            effects.kaniActive = true;
            effects.kaniRows = params.rowLines;
        }

        return effects;
    },

    // レリック効果発動時の視覚的フィードバック
    showRelicEffect: function(relicId, bonusText) {
        var relic = this.getRelic(relicId);
        if (!relic) return;

        // レリックアイコンを光らせる
        var relicIcon = document.querySelector('[data-relic-id="' + relicId + '"]');
        if (relicIcon) {
            relicIcon.classList.add('relic-activated');
            setTimeout(function() {
                relicIcon.classList.remove('relic-activated');
            }, 1000);
        }

        // 画面中央にエフェクト表示
        var effectPopup = document.createElement('div');
        effectPopup.className = 'relic-effect-popup';
        effectPopup.innerHTML = '<span class="relic-effect-icon">' + relic.icon + '</span>' +
                               '<span class="relic-effect-name">' + relic.name + '</span>' +
                               '<span class="relic-effect-bonus">' + bonusText + '</span>';
        document.body.appendChild(effectPopup);

        // アニメーション後に削除
        setTimeout(function() {
            if (effectPopup.parentNode) {
                effectPopup.parentNode.removeChild(effectPopup);
            }
        }, 1500);
    }
};
