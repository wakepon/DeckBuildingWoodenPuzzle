// round-progress.js - ラウンド進行画面管理

var RoundProgress = {
    // 次のラウンド情報を計算
    // currentRound: 現在クリアしたラウンド（次にプレイするのはcurrentRound + 1）
    getNextRoundInfo: function(currentRound) {
        var config = CONFIG.ROUND_PROGRESS;
        var nextRound = currentRound + 1;

        // セット番号（1始まり）
        var setNumber = Math.floor((nextRound - 1) / config.ROUNDS_PER_SET) + 1;

        // セット内の位置（0, 1, 2）
        var positionInSet = (nextRound - 1) % config.ROUNDS_PER_SET;

        // ラウンドタイプ
        var roundType = config.TYPES[positionInSet];

        return {
            round: nextRound,
            setNumber: setNumber,
            positionInSet: positionInSet,
            roundType: roundType,
            label: config.LABELS[roundType],
            color: config.COLORS[roundType],
            reward: config.REWARDS[roundType]
        };
    },

    // 指定されたラウンドの情報を取得
    getRoundInfo: function(round) {
        var config = CONFIG.ROUND_PROGRESS;

        // セット番号（1始まり）
        var setNumber = Math.floor((round - 1) / config.ROUNDS_PER_SET) + 1;

        // セット内の位置（0, 1, 2）
        var positionInSet = (round - 1) % config.ROUNDS_PER_SET;

        // ラウンドタイプ
        var roundType = config.TYPES[positionInSet];

        return {
            round: round,
            setNumber: setNumber,
            positionInSet: positionInSet,
            roundType: roundType,
            label: config.LABELS[roundType],
            color: config.COLORS[roundType],
            reward: config.REWARDS[roundType]
        };
    },

    // 報酬額を取得（ラウンドタイプから）
    getReward: function(roundType) {
        return CONFIG.ROUND_PROGRESS.REWARDS[roundType] || CONFIG.ROUND_PROGRESS.REWARDS.normal;
    },

    // 現在のラウンドから報酬額を取得
    getRewardForRound: function(round) {
        var info = this.getRoundInfo(round);
        return info.reward;
    },

    // ボス条件をランダムに選択
    selectBossCondition: function() {
        var conditions = CONFIG.BOSS_CONDITIONS;
        var index = Math.floor(Math.random() * conditions.length);
        return conditions[index];
    },

    // 進行画面を表示
    show: function() {
        var screen = document.getElementById('round-progress-screen');
        var currentRound = BlockManager.gameState.round;
        var nextRoundInfo = this.getNextRoundInfo(currentRound);

        // セット番号を更新
        document.getElementById('round-progress-set-number').textContent = nextRoundInfo.setNumber;

        // ボス条件の抽選
        // 次のラウンドが新しいセットの最初（positionInSet === 0）の場合、新しい条件を抽選
        // それ以外で、まだ条件が設定されていない場合も抽選
        if (nextRoundInfo.positionInSet === 0) {
            // 新しいセットに入る → 新しい条件を抽選
            BlockManager.gameState.bossCondition = this.selectBossCondition();
        } else if (!BlockManager.gameState.bossCondition) {
            // 同じセット内で初めての表示 → 条件を抽選
            BlockManager.gameState.bossCondition = this.selectBossCondition();
        }

        // カードをレンダリング
        this.renderCards(nextRoundInfo);

        screen.style.display = 'flex';
    },

    // カードをレンダリング
    renderCards: function(nextRoundInfo) {
        var container = document.getElementById('round-progress-cards');
        container.innerHTML = '';

        var config = CONFIG.ROUND_PROGRESS;
        var currentRound = BlockManager.gameState.round;

        // セット内の各ラウンドのカードを生成
        for (var i = 0; i < config.ROUNDS_PER_SET; i++) {
            var roundType = config.TYPES[i];
            var label = config.LABELS[roundType];
            var reward = config.REWARDS[roundType];

            var card = document.createElement('div');
            card.className = 'round-progress-card type-' + roundType;

            // 状態を判定
            // nextRoundInfo.positionInSet は次にプレイするラウンドのセット内位置
            if (i < nextRoundInfo.positionInSet) {
                // このセットでクリア済み
                card.classList.add('cleared');
            } else if (i === nextRoundInfo.positionInSet) {
                // 現在位置（次にプレイ）
                card.classList.add('current');
            } else {
                // 未到達
                card.classList.add('upcoming');
            }

            // カード内容
            var typeEl = document.createElement('div');
            typeEl.className = 'round-card-type';
            typeEl.textContent = label;
            card.appendChild(typeEl);

            var rewardEl = document.createElement('div');
            rewardEl.className = 'round-card-reward';
            rewardEl.textContent = reward + 'G';
            card.appendChild(rewardEl);

            // 状態テキスト
            var statusEl = document.createElement('div');
            statusEl.className = 'round-card-status';
            if (i < nextRoundInfo.positionInSet) {
                statusEl.textContent = 'クリア済み';
            } else if (i === nextRoundInfo.positionInSet) {
                statusEl.textContent = '次のラウンド';
            } else {
                statusEl.textContent = '';
            }
            card.appendChild(statusEl);

            // ボスカードに条件を表示（未到達でも表示）
            if (roundType === 'boss' && BlockManager.gameState.bossCondition) {
                var conditionEl = document.createElement('div');
                conditionEl.className = 'boss-condition-label';
                conditionEl.textContent = BlockManager.gameState.bossCondition.icon + ' ' + BlockManager.gameState.bossCondition.name;
                card.appendChild(conditionEl);
            }

            container.appendChild(card);
        }
    },

    // 進行画面を閉じる
    hide: function() {
        var screen = document.getElementById('round-progress-screen');
        screen.style.display = 'none';
    },

    // 次のラウンドへ進む
    proceedToRound: function() {
        this.hide();
        BlockManager.startNextRound();
    },

    // イベントリスナーを初期化
    init: function() {
        var self = this;
        var button = document.getElementById('round-progress-button');

        if (button) {
            // クリックイベント（PC用）
            button.addEventListener('click', function() {
                self.proceedToRound();
            });

            // タッチイベント（モバイル用）
            button.addEventListener('touchend', function(e) {
                e.preventDefault();
                self.proceedToRound();
            });
        }
    }
};
