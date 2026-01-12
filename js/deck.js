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
    draw: function(count) {
        const blocks = [];

        for (let i = 0; i < count; i++) {
            // デッキが空になったら再シャッフル
            if (this.state.deck.length === 0) {
                this.state.deck = this.shuffle(this.createDeck());
            }

            const shape = this.state.deck.shift();
            blocks.push({
                id: Date.now() + i,
                shape: shape,
                placed: false
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
        const shapeCopy = shape.map(function(row) {
            return row.slice();
        });
        this.state.initialDeck.push(shapeCopy);
    },

    // 次のラウンド用にデッキをリセット
    reset: function() {
        this.state.deck = this.shuffle(this.createDeck());
    }
};
