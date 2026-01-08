// block.js - ブロックの種類、生成

// ブロック管理オブジェクト
var BlockManager = {
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

    currentBlocks: [],

    // ランダムなブロックを選択
    getRandomBlocks: function(count) {
        const blocks = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * this.blockShapes.length);
            blocks.push({
                id: Date.now() + i,
                shape: this.blockShapes[randomIndex],
                placed: false
            });
        }
        return blocks;
    },

    // ブロックの初期化
    init: function() {
        this.currentBlocks = this.getRandomBlocks(3);
        this.render();
        this.checkGameOver();
    },

    // ブロックのレンダリング
    render: function() {
        const container = document.getElementById('blocks-container');
        container.innerHTML = '';

        this.currentBlocks.forEach(block => {
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
        for (const block of this.currentBlocks) {
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
        const cellCount = GameBoard.place(row, col, block.shape);

        // 配置スコア（マス数 × 10点）
        GameUI.updateScore(cellCount * 10);

        block.placed = true;
        this.render();

        // 行・列のクリアチェック
        GameBoard.checkAndClearLines();

        // 3つすべて配置したら新しいブロックを生成
        const allPlaced = this.currentBlocks.every(b => b.placed);
        if (allPlaced) {
            setTimeout(() => {
                this.currentBlocks = this.getRandomBlocks(3);
                this.render();
                this.checkGameOver();
            }, 600); // クリアアニメーション後に生成
        } else {
            // まだ配置していないブロックがある場合もゲームオーバーチェック
            this.checkGameOver();
        }
    }
};
