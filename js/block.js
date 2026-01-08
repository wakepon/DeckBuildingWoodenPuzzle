// block.js - ブロックの種類、生成

// ブロック管理オブジェクト
var BlockManager = {
    // ゲームステート
    gameState: {
        initialDeck: [],    // 最初に決めた9種類のブロック（ラウンド間で共有）
        deck: [],           // 残りのデッキ
        currentBlocks: [],  // 現在の手札（3つ）
        round: 1,           // 現在のラウンド
        gold: 0,            // 所持ゴールド
        taxRate: 1          // 現在の税金額（初回は1）
    },

    // ブロックの定義（形状）- 3x3以内の全パターン（回転も別パターンとして扱う）
    blockShapes: [
        // ===== 1マス（モノミノ）: 1種類 =====
        [[1]],

        // ===== 2マス（ドミノ）: 2種類 =====
        [[1, 1]],
        [[1], [1]],

        // ===== 3マス（トリオミノ）: 4種類 =====
        [[1, 1, 1]],
        [[1], [1], [1]],
        [[1, 0], [1, 1]],
        [[1, 1], [1, 0]],

        // ===== 4マス（テトロミノ）: 19種類 =====
        // I字型（2種類）
        [[1, 1, 1, 1]],
        [[1], [1], [1], [1]],

        // O字型（1種類）
        [[1, 1], [1, 1]],

        // T字型（4種類）
        [[1, 1, 1], [0, 1, 0]],
        [[0, 1], [1, 1], [0, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 0], [1, 1], [1, 0]],

        // L字型（8種類）
        [[1, 0], [1, 0], [1, 1]],
        [[1, 1, 1], [1, 0, 0]],
        [[1, 1], [0, 1], [0, 1]],
        [[0, 0, 1], [1, 1, 1]],
        [[0, 1], [0, 1], [1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[1, 1], [1, 0], [1, 0]],
        [[1, 1, 1], [0, 0, 1]],

        // Z字型（4種類）
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1], [1, 1], [1, 0]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 0], [1, 1], [0, 1]],

        // ===== 5マス（ペントミノ）: 63種類 =====
        // F字型（4種類）
        [[0, 1, 1], [1, 1, 0], [0, 1, 0]],
        [[1, 0], [1, 1], [1, 1]],
        [[0, 1, 0], [0, 1, 1], [1, 1, 0]],
        [[1, 1], [1, 1], [0, 1]],

        // I字型（2種類）
        [[1, 1, 1, 1, 1]],
        [[1], [1], [1], [1], [1]],

        // L字型（8種類）
        [[1, 0], [1, 0], [1, 0], [1, 1]],
        [[1, 1, 1, 1], [1, 0, 0, 0]],
        [[1, 1], [0, 1], [0, 1], [0, 1]],
        [[0, 0, 0, 1], [1, 1, 1, 1]],
        [[0, 1], [0, 1], [0, 1], [1, 1]],
        [[1, 0, 0, 0], [1, 1, 1, 1]],
        [[1, 1], [1, 0], [1, 0], [1, 0]],
        [[1, 1, 1, 1], [0, 0, 0, 1]],

        // N字型（8種類）
        [[1, 0], [1, 1], [0, 1], [0, 1]],
        [[0, 1, 1], [1, 1, 0], [1, 0, 0]],
        [[0, 1], [0, 1], [1, 1], [1, 0]],
        [[0, 0, 1], [0, 1, 1], [1, 1, 0]],
        [[0, 1], [1, 1], [1, 0], [1, 0]],
        [[1, 0, 0], [1, 1, 0], [0, 1, 1]],
        [[1, 0], [1, 1], [0, 1], [0, 1]],
        [[0, 1, 1], [1, 1, 0], [1, 0, 0]],

        // P字型（8種類）
        [[1, 1], [1, 1], [1, 0]],
        [[1, 1, 1], [1, 1, 0]],
        [[0, 1], [1, 1], [1, 1]],
        [[0, 1, 1], [1, 1, 1]],
        [[1, 0], [1, 1], [1, 1]],
        [[1, 1, 0], [1, 1, 1]],
        [[1, 1], [1, 1], [0, 1]],
        [[1, 1, 1], [0, 1, 1]],

        // T字型（4種類）
        [[1, 1, 1], [0, 1, 0], [0, 1, 0]],
        [[0, 0, 1], [1, 1, 1], [0, 0, 1]],
        [[0, 1, 0], [0, 1, 0], [1, 1, 1]],
        [[1, 0, 0], [1, 1, 1], [1, 0, 0]],

        // U字型（4種類）
        [[1, 0, 1], [1, 1, 1]],
        [[1, 1], [1, 0], [1, 1]],
        [[1, 1, 1], [1, 0, 1]],
        [[1, 1], [0, 1], [1, 1]],

        // V字型（4種類）
        [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
        [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
        [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
        [[0, 0, 1], [0, 0, 1], [1, 1, 1]],

        // W字型（4種類）
        [[1, 0, 0], [1, 1, 0], [0, 1, 1]],
        [[0, 1, 1], [1, 1, 0], [1, 0, 0]],
        [[0, 0, 1], [0, 1, 1], [1, 1, 0]],
        [[1, 1, 0], [0, 1, 1], [0, 0, 1]],

        // X字型（1種類）
        [[0, 1, 0], [1, 1, 1], [0, 1, 0]],

        // Y字型（8種類）
        [[0, 1], [1, 1], [0, 1], [0, 1]],
        [[0, 0, 1, 0], [1, 1, 1, 1]],
        [[0, 1], [0, 1], [1, 1], [0, 1]],
        [[1, 1, 1, 1], [0, 1, 0, 0]],
        [[1, 0], [1, 1], [1, 0], [1, 0]],
        [[0, 1, 0, 0], [1, 1, 1, 1]],
        [[1, 0], [1, 1], [1, 0], [1, 0]],
        [[1, 1, 1, 1], [0, 0, 1, 0]],

        // Z字型（4種類）
        [[1, 1, 0], [0, 1, 0], [0, 1, 1]],
        [[0, 0, 1], [1, 1, 1], [1, 0, 0]],
        [[1, 1, 0], [0, 1, 0], [0, 1, 1]],
        [[0, 0, 1], [1, 1, 1], [1, 0, 0]],

        // ===== 6マス: 適用可能なパターン =====
        // 2x3, 3x2の長方形
        [[1, 1, 1], [1, 1, 1]],
        [[1, 1], [1, 1], [1, 1]],

        // 欠けた形状（多数のパターン）
        [[1, 1, 1], [1, 1, 0], [1, 0, 0]],
        [[1, 1, 1], [1, 0, 0], [1, 1, 0]],
        [[1, 1, 1], [0, 1, 1], [0, 0, 1]],
        [[1, 1, 1], [0, 0, 1], [0, 1, 1]],
        [[1, 0, 0], [1, 1, 0], [1, 1, 1]],
        [[0, 1, 1], [0, 1, 1], [1, 1, 0]],
        [[1, 1, 0], [1, 1, 1], [1, 0, 0]],
        [[1, 1, 0], [1, 1, 1], [0, 0, 1]],
        [[0, 1, 1], [1, 1, 1], [1, 0, 0]],
        [[0, 1, 1], [1, 1, 1], [0, 1, 0]],

        // その他の6マスパターン
        [[1, 1], [1, 1], [1, 1], [1, 0]],
        [[1, 0], [1, 1], [1, 1], [1, 1]],
        [[0, 1], [1, 1], [1, 1], [1, 1]],
        [[1, 1], [1, 1], [1, 1], [0, 1]],

        // ===== 7マス: 適用可能なパターン =====
        [[1, 1, 1], [1, 1, 1], [1, 0, 0]],
        [[1, 1, 1], [1, 1, 1], [0, 1, 0]],
        [[1, 1, 1], [1, 1, 1], [0, 0, 1]],
        [[1, 0, 0], [1, 1, 1], [1, 1, 1]],
        [[0, 1, 0], [1, 1, 1], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1], [1, 1, 1]],
        [[1, 1, 0], [1, 1, 1], [1, 1, 0]],
        [[0, 1, 1], [1, 1, 1], [0, 1, 1]],

        // ===== 8マス: 適用可能なパターン =====
        [[1, 1, 1], [1, 1, 1], [1, 1, 0]],
        [[1, 1, 1], [1, 1, 1], [0, 1, 1]],
        [[1, 1, 0], [1, 1, 1], [1, 1, 1]],
        [[0, 1, 1], [1, 1, 1], [1, 1, 1]],
        [[1, 1, 1], [1, 1, 0], [1, 1, 1]],
        [[1, 1, 1], [0, 1, 1], [1, 1, 1]],

        // ===== 9マス（3x3フル）: 1種類 =====
        [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
    ],

    // デッキを作成（9種類のブロックをランダムに選択）
    createDeck: function() {
        const deck = [];
        const shapes = CONFIG.DECK_BLOCK_SHAPES;

        for (let i = 0; i < 9; i++) {
            const randomIndex = Math.floor(Math.random() * shapes.length);
            deck.push(shapes[randomIndex]);
        }

        return deck;
    },

    // デッキをシャッフル
    shuffleDeck: function(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // デッキから3つのブロックを引く
    drawBlocks: function() {
        const blocks = [];
        const drawCount = Math.min(3, this.gameState.deck.length);

        for (let i = 0; i < drawCount; i++) {
            const shape = this.gameState.deck.shift();
            blocks.push({
                id: Date.now() + i,
                shape: shape,
                placed: false
            });
        }

        return blocks;
    },

    // ブロックの初期化
    init: function() {
        // 新しいデッキを作成して初期デッキとして保存
        this.gameState.initialDeck = this.createDeck();
        // 初期デッキのコピーをシャッフルして使用
        this.gameState.deck = this.shuffleDeck([...this.gameState.initialDeck]);

        // 最初の3つを引く
        this.gameState.currentBlocks = this.drawBlocks();
        this.render();

        // UI更新
        GameUI.updateDeckInfo(this.gameState.deck.length + this.gameState.currentBlocks.length, this.gameState.round);

        this.checkGameOver();
    },

    // ブロックのレンダリング
    render: function() {
        const container = document.getElementById('blocks-container');
        container.innerHTML = '';

        this.gameState.currentBlocks.forEach(block => {
            if (!block.placed) {
                const blockElement = this.createBlockElement(block);
                container.appendChild(blockElement);
            }
        });
    },

    // ブロック要素の作成（ボードの描画処理を参考に実装）
    createBlockElement: function(block) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block';
        blockDiv.dataset.blockId = block.id;

        // ブロックの形状サイズを取得
        const rows = block.shape.length;
        const cols = block.shape[0].length;

        // グリッドレイアウトを設定
        blockDiv.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        blockDiv.style.gridTemplateRows = `repeat(${rows}, 30px)`;

        // ボードと同様に、各セルをループで作成
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'block-cell';

                // セルの位置情報をdata属性として保存（ボードのパターンを参考）
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;

                // 形状配列の値に応じて表示/非表示を制御
                if (!block.shape[row][col]) {
                    cellDiv.style.visibility = 'hidden';
                }

                blockDiv.appendChild(cellDiv);
            }
        }

        // マウスイベント
        blockDiv.addEventListener('mousedown', (e) => InputHandler.startDrag(e, block));

        // タッチイベント
        blockDiv.addEventListener('touchstart', (e) => {
            e.preventDefault();
            InputHandler.startDrag(e.touches[0], block);
        });

        return blockDiv;
    },

    // ブロックが配置可能かチェック
    canPlaceAnyBlock: function() {
        for (const block of this.gameState.currentBlocks) {
            if (block.placed) continue;

            // ボード上のすべての位置を試す
            for (let row = 0; row < GameBoard.BOARD_SIZE; row++) {
                for (let col = 0; col < GameBoard.BOARD_SIZE; col++) {
                    if (GameBoard.canPlace(row, col, block.shape)) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    // ゲームオーバーチェック
    checkGameOver: function() {
        if (!this.canPlaceAnyBlock()) {
            GameUI.saveHighScore();
            GameUI.showGameOver();
        }
    },

    // ブロックを配置
    placeBlock: function(row, col, block) {
        GameBoard.place(row, col, block.shape);

        block.placed = true;
        this.render();

        // 行・列のクリアチェック
        GameBoard.checkAndClearLines();

        // 3つすべて配置したかチェック
        const allPlaced = this.gameState.currentBlocks.every(b => b.placed);
        if (allPlaced) {
            setTimeout(() => {
                // デッキに残りがあれば次の3つを引く
                if (this.gameState.deck.length > 0) {
                    this.gameState.currentBlocks = this.drawBlocks();
                    this.render();
                    GameUI.updateDeckInfo(this.gameState.deck.length + this.gameState.currentBlocks.length, this.gameState.round);
                    this.checkGameOver();
                } else {
                    // デッキが空ならラウンド終了
                    GameUI.showRoundEnd(this.gameState.round);
                }
            }, 600); // クリアアニメーション後に生成
        } else {
            // まだ配置していないブロックがある場合
            // UI更新（配置済みブロックを除く）
            const remainingInHand = this.gameState.currentBlocks.filter(b => !b.placed).length;
            GameUI.updateDeckInfo(this.gameState.deck.length + remainingInHand, this.gameState.round);
            this.checkGameOver();
        }
    },

    // 次のラウンドを開始
    startNextRound: function() {
        this.gameState.round++;
        // 初期デッキのコピーをシャッフルして再利用（新しいデッキは作成しない）
        this.gameState.deck = this.shuffleDeck([...this.gameState.initialDeck]);
        this.gameState.currentBlocks = this.drawBlocks();
        this.render();
        GameUI.updateDeckInfo(this.gameState.deck.length + this.gameState.currentBlocks.length, this.gameState.round);
        this.checkGameOver();
    },

    // ショップで選択されたブロックをデッキに追加
    addBlockToDeck: function(shape) {
        // 初期デッキに追加
        this.gameState.initialDeck.push(shape);
        // デッキ情報を更新（UI表示用）
        const totalDeckSize = this.gameState.initialDeck.length;
        GameUI.updateDeckInfo(this.gameState.deck.length + this.gameState.currentBlocks.length, this.gameState.round);
    }
};
