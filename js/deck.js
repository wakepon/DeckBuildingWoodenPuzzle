// deck.js - デッキ管理

// デッキマネージャー
var DeckManager = {
    // ステート
    state: {
        initialDeck: [],  // 最初に決めた8種類のブロック（ラウンド間で共有）
        deck: []          // 残りのデッキ
    },

    // デッキを作成（BlockShapes.INITIAL_DECKをコピーして返す）
    createDeck: function() {
        // 深いコピーを作成（元の配列を変更しないため）
        return BlockShapes.INITIAL_DECK.map(function(shape) {
            return shape.map(function(row) {
                return row.slice();
            });
        });
    },

    // initialDeckの深いコピーを作成（ショップで追加されたブロックを含む）
    // 従来形式（shape配列）と拡張形式（{shape, pattern, seals}）の両方に対応
    copyInitialDeck: function() {
        var self = this;
        return this.state.initialDeck.map(function(item) {
            // 拡張形式の場合（オブジェクト）
            if (item.shape) {
                return {
                    shape: item.shape.map(function(row) { return row.slice(); }),
                    pattern: item.pattern || null,
                    seals: item.seals ? item.seals.map(function(row) { return row.slice(); }) : null
                };
            }
            // 従来形式の場合（shape配列のみ）
            return item.map(function(row) {
                return row.slice();
            });
        });
    },

    // デッキをシャッフル
    shuffle: function(deck) {
        const shuffled = deck.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    },

    // デッキから指定数のブロックを引く（デッキが足りない場合は再シャッフルして補充）
    // 従来形式（shape配列）と拡張形式（{shape, pattern, seals}）の両方に対応
    draw: function(count) {
        var blocks = [];

        for (var i = 0; i < count; i++) {
            // デッキが空になったら再シャッフル（initialDeckを使用）
            if (this.state.deck.length === 0) {
                this.state.deck = this.shuffle(this.copyInitialDeck());
            }

            var item = this.state.deck.shift();
            var shape, pattern, seals;

            // 拡張形式の場合（オブジェクト）
            if (item.shape) {
                shape = item.shape;
                pattern = item.pattern || null;
                seals = item.seals || PatternManager.createEmptySeals(shape);
            } else {
                // 従来形式の場合（shape配列のみ）
                shape = item;
                pattern = null;
                seals = PatternManager.createEmptySeals(shape);
            }

            blocks.push({
                id: Date.now() + i,
                shape: shape,
                placed: false,
                pattern: pattern,
                seals: seals
            });
        }

        return blocks;
    },

    // デッキを初期化
    init: function() {
        this.state.initialDeck = this.createDeck();
        this.state.deck = this.shuffle(this.createDeck());
    },

    // デッキにブロックを追加（ショップで選択したブロックを追加）
    addBlock: function(shape) {
        // initialDeckに追加（深いコピー）
        var shapeCopy = shape.map(function(row) {
            return row.slice();
        });
        this.state.initialDeck.push(shapeCopy);
    },

    // パターン・シール付きブロックをデッキに追加（ショップ購入用）
    addBlockWithEffects: function(shape, pattern, seals) {
        // 形状の深いコピー
        var shapeCopy = shape.map(function(row) {
            return row.slice();
        });

        // シールの深いコピー
        var sealsCopy = null;
        if (seals) {
            sealsCopy = seals.map(function(row) {
                return row.slice();
            });
        }

        // ブロック情報オブジェクトとして保存（拡張形式）
        var blockData = {
            shape: shapeCopy,
            pattern: pattern || null,
            seals: sealsCopy || PatternManager.createEmptySeals(shapeCopy)
        };

        this.state.initialDeck.push(blockData);
    },

    // 次のラウンド用にデッキをリセット（initialDeckを使用）
    reset: function() {
        this.state.deck = this.shuffle(this.copyInitialDeck());
    },

    // デッキ状態を設定（復元用）
    setState: function(stateData) {
        this.state.initialDeck = stateData.initialDeck;
        this.state.deck = stateData.deck;
    }
};
