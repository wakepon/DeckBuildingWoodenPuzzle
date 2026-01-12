// board.js - ボード（NxNグリッド）の管理

// ゲームボードの状態を管理するオブジェクト
var GameBoard = {
    board: [],

    // ボードの初期化
    init: function() {
        // ボード配列を動的に初期化
        this.board = Array(CONFIG.BOARD_SIZE).fill(null).map(() => Array(CONFIG.BOARD_SIZE).fill(false));

        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        // グリッドの列数を動的に設定
        boardElement.style.gridTemplateColumns = `repeat(${CONFIG.BOARD_SIZE}, 1fr)`;

        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
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
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
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
                    if (targetRow < 0 || targetRow >= CONFIG.BOARD_SIZE ||
                        targetCol < 0 || targetCol >= CONFIG.BOARD_SIZE) {
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
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            if (this.board[row].every(cell => cell)) {
                rowsToClear.push(row);
            }
        }

        // 列のチェック
        for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
            let isComplete = true;
            for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
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
        // アニメーション用のセル配列（順序付き）
        const cellsToAnimate = [];

        // 行のセルを追加（左から右へ順番）
        rows.forEach(row => {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                cellsToAnimate.push({
                    row: row,
                    col: col,
                    delay: col * CONFIG.ANIMATION.DELAY_PER_BLOCK,
                    key: `${row}-${col}`
                });
            }
        });

        // 列のセルを追加（上から下へ順番）
        cols.forEach(col => {
            for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
                const key = `${row}-${col}`;
                // 行ですでに含まれている場合はスキップ
                if (!cellsToAnimate.find(cell => cell.key === key)) {
                    cellsToAnimate.push({
                        row: row,
                        col: col,
                        delay: row * CONFIG.ANIMATION.DELAY_PER_BLOCK,
                        key: key
                    });
                }
            }
        });

        // 各セルにアニメーションを適用 + 「+1」ポップアップを表示
        cellsToAnimate.forEach(cellData => {
            setTimeout(() => {
                const cellElement = document.querySelector(
                    `[data-row="${cellData.row}"][data-col="${cellData.col}"]`
                );
                if (cellElement) {
                    cellElement.classList.add('clearing');

                    // セルの中心座標を取得して「+1」ポップアップを表示
                    const rect = cellElement.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    GameUI.showBlockPopup(centerX, centerY);
                }
            }, cellData.delay);
        });

        // 最大遅延 + アニメーション時間後にクリア処理
        const maxDelay = Math.max(...cellsToAnimate.map(c => c.delay), 0);
        const totalAnimationTime = maxDelay + CONFIG.ANIMATION.DURATION;

        setTimeout(() => {
            // ボードとDOM要素をクリア
            cellsToAnimate.forEach(cellData => {
                this.board[cellData.row][cellData.col] = false;
                const cellElement = document.querySelector(
                    `[data-row="${cellData.row}"][data-col="${cellData.col}"]`
                );
                if (cellElement) {
                    cellElement.classList.remove('filled', 'clearing');
                }
            });

            // スコア演出を表示（消滅した単位ブロック数 × 同時に消滅したライン数）
            const totalLines = rows.length + cols.length;
            const totalBlocks = cellsToAnimate.length;
            if (totalLines > 0 && totalBlocks > 0) {
                const scoreAmount = totalBlocks * totalLines;
                // スコア計算演出を表示（演出内でスコアがインクリメントされる）
                GameUI.showScoreCalculation(totalBlocks, totalLines, scoreAmount);
            }
        }, totalAnimationTime);
    }
};
