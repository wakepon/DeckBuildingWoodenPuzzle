// patterns.js - パターン・シールシステム

var PatternManager = {
    // パターン定義（ブロックセット全体に付与）
    PATTERNS: {
        ENHANCED: {
            id: 'enhanced',
            name: '強化ブロック',
            description: 'このセットのブロックが消えると+2点/ブロック',
            color: '#ff6b6b',
            icon: '💪'
        },
        LUCKY: {
            id: 'lucky',
            name: 'ラッキーブロック',
            description: '配置時に10%の確率でスコア2倍',
            color: '#4ecdc4',
            icon: '🎲'
        },
        COMBO: {
            id: 'combo',
            name: 'コンボブロック',
            description: '連続配置でボーナススコア',
            color: '#f39c12',
            icon: '🔥'
        },
        AURA: {
            id: 'aura',
            name: 'オーラブロック',
            description: '配置時、隣接する既存ブロックにバフ付与（消去時+2点）',
            color: '#9b59b6',
            icon: '✨'
        },
        MOSS: {
            id: 'moss',
            name: '苔ブロック',
            description: 'フィールド端と接している辺の数だけスコア加算',
            color: '#27ae60',
            icon: '🌿'
        }
    },

    // シール定義（個別セルに付与）
    SEALS: {
        GOLD: {
            id: 'gold',
            name: 'ゴールドシール',
            description: 'このブロックが消えると+1G',
            color: '#ffd700',
            icon: '💰'
        },
        SCORE: {
            id: 'score',
            name: 'スコアシール',
            description: 'このブロックが消えると+5点',
            color: '#9b59b6',
            icon: '⭐'
        },
        MULTI: {
            id: 'multi',
            name: 'マルチシール',
            description: 'ライン消し時にこのブロックが2回カウントされる',
            color: '#3498db',
            icon: '✖'
        },
        STONE: {
            id: 'stone',
            name: '石',
            description: 'このブロックは消えず、スコア計算にもカウントされない',
            color: '#7f8c8d',
            icon: '🪨'
        }
    },

    // パターン情報を取得
    getPattern: function(patternId) {
        if (!patternId) return null;
        for (var key in this.PATTERNS) {
            if (this.PATTERNS[key].id === patternId) {
                return this.PATTERNS[key];
            }
        }
        return null;
    },

    // シール情報を取得
    getSeal: function(sealId) {
        if (!sealId) return null;
        for (var key in this.SEALS) {
            if (this.SEALS[key].id === sealId) {
                return this.SEALS[key];
            }
        }
        return null;
    },

    // 全パターン一覧を取得
    getAllPatterns: function() {
        var patterns = [];
        for (var key in this.PATTERNS) {
            patterns.push(this.PATTERNS[key]);
        }
        return patterns;
    },

    // 全シール一覧を取得
    getAllSeals: function() {
        var seals = [];
        for (var key in this.SEALS) {
            seals.push(this.SEALS[key]);
        }
        return seals;
    },

    // シール用の空配列を作成（shapeと同じサイズ）
    createEmptySeals: function(shape) {
        return shape.map(function(row) {
            return row.map(function() {
                return null;
            });
        });
    },

    // ブロックにパターンを付与
    applyPattern: function(block, patternId) {
        block.pattern = patternId;
        return block;
    },

    // ブロックの特定セルにシールを付与
    applySeal: function(block, row, col, sealId) {
        if (!block.seals) {
            block.seals = this.createEmptySeals(block.shape);
        }
        if (block.seals[row] && block.shape[row][col]) {
            block.seals[row][col] = sealId;
        }
        return block;
    },

    // ブロックからパターンを除去
    removePattern: function(block) {
        block.pattern = null;
        return block;
    },

    // ブロックの特定セルからシールを除去
    removeSeal: function(block, row, col) {
        if (block.seals && block.seals[row]) {
            block.seals[row][col] = null;
        }
        return block;
    },

    // ブロックがパターンを持っているか
    hasPattern: function(block) {
        return block.pattern !== null && block.pattern !== undefined;
    },

    // ブロックがシールを持っているか（任意のセル）
    hasAnySeal: function(block) {
        if (!block.seals) return false;
        for (var row = 0; row < block.seals.length; row++) {
            for (var col = 0; col < block.seals[row].length; col++) {
                if (block.seals[row][col]) return true;
            }
        }
        return false;
    },

    // 特定セルがシールを持っているか
    hasSealAt: function(block, row, col) {
        return block.seals && block.seals[row] && block.seals[row][col] !== null;
    }
};
