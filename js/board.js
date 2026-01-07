// board.js - ボード（10x10グリッド）の管理

// ゲームボードの状態を管理するオブジェクト
var GameBoard = {
    BOARD_SIZE: 10,
    board: Array(10).fill(null).map(() => Array(10).fill(false)),

    // ボードの初期化
    init: function() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
            }
        }
    },

    // ボードをクリア
    clear: function() {
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                this.board[row][col] = false;
            }
        }

        // ボードの見た目をリセット
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('filled', 'highlight', 'invalid', 'clearing');
        });
    },

    // 配置可能かチェック
    canPlace: function(row, col, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c]) {
                    const targetRow = row + r;
                    const targetCol = col + c;

                    // ボードの範囲外
                    if (targetRow < 0 || targetRow >= this.BOARD_SIZE ||
                        targetCol < 0 || targetCol >= this.BOARD_SIZE) {
                        return false;
                    }

                    // すでに埋まっている
                    if (this.board[targetRow][targetCol]) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    // ブロックを配置
    place: function(row, col, shape) {
        let cellCount = 0;

        shape.forEach((shapeRow, r) => {
            shapeRow.forEach((cell, c) => {
                if (cell) {
                    cellCount++;
                    const targetRow = row + r;
                    const targetCol = col + c;
                    this.board[targetRow][targetCol] = true;

                    const cellElement = document.querySelector(
                        `[data-row="${targetRow}"][data-col="${targetCol}"]`
                    );
                    if (cellElement) {
                        cellElement.classList.add('filled');
                        cellElement.classList.remove('highlight', 'invalid');
                    }
                }
            });
        });

        return cellCount;
    },

    // 完成した行・列をチェック
    checkAndClearLines: function() {
        const rowsToClear = [];
        const colsToClear = [];

        // 行のチェック
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            if (this.board[row].every(cell => cell)) {
                rowsToClear.push(row);
            }
        }

        // 列のチェック
        for (let col = 0; col < this.BOARD_SIZE; col++) {
            let isComplete = true;
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                if (!this.board[row][col]) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                colsToClear.push(col);
            }
        }

        // クリア処理
        if (rowsToClear.length > 0 || colsToClear.length > 0) {
            this.clearLines(rowsToClear, colsToClear);
        }

        return rowsToClear.length + colsToClear.length;
    },

    // 行・列をクリア
    clearLines: function(rows, cols) {
        // アニメーション用のセルを収集
        const cellsToClear = new Set();

        rows.forEach(row => {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                cellsToClear.add(`${row}-${col}`);
            }
        });

        cols.forEach(col => {
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                cellsToClear.add(`${row}-${col}`);
            }
        });

        // アニメーション開始
        cellsToClear.forEach(key => {
            const [row, col] = key.split('-').map(Number);
            const cellElement = document.querySelector(
                `[data-row="${row}"][data-col="${col}"]`
            );
            if (cellElement) {
                cellElement.classList.add('clearing');
            }
        });

        // アニメーション終了後にクリア
        setTimeout(() => {
            cellsToClear.forEach(key => {
                const [row, col] = key.split('-').map(Number);
                this.board[row][col] = false;
                const cellElement = document.querySelector(
                    `[data-row="${row}"][data-col="${col}"]`
                );
                if (cellElement) {
                    cellElement.classList.remove('filled', 'clearing');
                }
            });

            // スコア計算
            const totalLines = rows.length + cols.length;
            let points = 0;

            if (totalLines === 1) {
                points = 100;
            } else if (totalLines === 2) {
                points = 300;
            } else if (totalLines === 3) {
                points = 500;
            } else if (totalLines >= 4) {
                points = 500 + (totalLines - 3) * 200;
            }

            GameUI.updateScore(points);
        }, 500);
    }
};
