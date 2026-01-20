// board.js - ボード（NxNグリッド）の管理

// ゲームボードの状態を管理するオブジェクト
var GameBoard = {
    board: [],

    // 空のセルオブジェクトを作成
    createEmptyCell: function() {
        return {
            filled: false,
            pattern: null,
            seal: null,
            buffs: [],
            blockSetId: null
        };
    },

    // ボードの初期化
    init: function() {
        var self = this;
        // ボード配列をオブジェクト形式で初期化
        this.board = [];
        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            this.board[row] = [];
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                this.board[row][col] = this.createEmptyCell();
            }
        }

        var boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        // グリッドの列数を動的に設定
        boardElement.style.gridTemplateColumns = 'repeat(' + CONFIG.BOARD_SIZE + ', 1fr)';

        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                var cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
            }
        }
    },

    // ボードをクリア
    clear: function() {
        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                this.board[row][col] = this.createEmptyCell();
            }
        }

        // ボードの見た目をリセット
        document.querySelectorAll('.cell').forEach(function(cell) {
            cell.className = 'cell';
        });
    },

    // 配置可能かチェック
    canPlace: function(row, col, shape) {
        for (var r = 0; r < shape.length; r++) {
            for (var c = 0; c < shape[0].length; c++) {
                if (shape[r][c]) {
                    var targetRow = row + r;
                    var targetCol = col + c;

                    // ボードの範囲外
                    if (targetRow < 0 || targetRow >= CONFIG.BOARD_SIZE ||
                        targetCol < 0 || targetCol >= CONFIG.BOARD_SIZE) {
                        return false;
                    }

                    // すでに埋まっている
                    var cellInfo = this.board[targetRow][targetCol];
                    if (cellInfo && cellInfo.filled) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    // ブロックを配置（メタ情報付き）
    place: function(row, col, shape, pattern, seals, blockSetId) {
        var self = this;
        var cellCount = 0;

        for (var r = 0; r < shape.length; r++) {
            for (var c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    cellCount++;
                    var targetRow = row + r;
                    var targetCol = col + c;

                    // メタ情報付きでボードに保存
                    this.board[targetRow][targetCol] = {
                        filled: true,
                        pattern: pattern || null,
                        seal: (seals && seals[r] && seals[r][c]) ? seals[r][c] : null,
                        buffs: [],
                        blockSetId: blockSetId || null
                    };

                    // DOM更新
                    var cellElement = document.querySelector(
                        '[data-row="' + targetRow + '"][data-col="' + targetCol + '"]'
                    );
                    if (cellElement) {
                        cellElement.classList.add('filled');
                        cellElement.classList.remove('highlight', 'invalid');

                        // パターン表示用クラス追加
                        if (pattern) {
                            cellElement.classList.add('pattern-' + pattern);
                        }

                        // シール表示用クラスとアイコン追加
                        var seal = (seals && seals[r] && seals[r][c]) ? seals[r][c] : null;
                        if (seal) {
                            var sealInfo = PatternManager.getSeal(seal);
                            if (sealInfo) {
                                cellElement.dataset.seal = seal;
                                cellElement.classList.add('seal-' + seal);

                                // シールアイコン要素を追加
                                var sealIcon = document.createElement('span');
                                sealIcon.className = 'cell-seal-icon';

                                // シールタイプに応じた表示テキスト
                                if (seal === 'gold') {
                                    sealIcon.textContent = 'G';
                                    sealIcon.classList.add('seal-text-gold');
                                } else if (seal === 'score') {
                                    sealIcon.textContent = '+5';
                                    sealIcon.classList.add('seal-text-score');
                                } else {
                                    sealIcon.textContent = sealInfo.icon;
                                }

                                cellElement.appendChild(sealIcon);
                            }
                        }
                    }
                }
            }
        }

        // オーラ配置時に隣接セルの視覚効果を更新
        if (pattern === 'aura') {
            this.updateAuraVisualEffects();
        }

        return cellCount;
    },

    // オーラ効果の視覚表示を更新（動的判定用）
    updateAuraVisualEffects: function() {
        var self = this;
        // 全セルをチェックしてオーラ隣接状態を更新
        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                var cell = this.board[row][col];
                var cellElement = document.querySelector(
                    '[data-row="' + row + '"][data-col="' + col + '"]'
                );
                if (cell && cell.filled && cellElement) {
                    // 隣接するオーラブロック（別セット）があるかチェック
                    if (PatternEffects.isAdjacentToAura(row, col, cell.blockSetId)) {
                        cellElement.classList.add('aura-affected');
                    } else {
                        cellElement.classList.remove('aura-affected');
                    }
                }
            }
        }
    },

    // 完成した行・列をチェック
    checkAndClearLines: function(onComplete, placedBlockSize) {
        var rowsToClear = [];
        var colsToClear = [];
        var self = this;

        // 行のチェック
        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            var rowComplete = this.board[row].every(function(cell) {
                return cell && cell.filled;
            });
            if (rowComplete) {
                rowsToClear.push(row);
            }
        }

        // 列のチェック
        for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
            var isComplete = true;
            for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
                var cell = this.board[row][col];
                if (!cell || !cell.filled) {
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
            this.clearLines(rowsToClear, colsToClear, onComplete, placedBlockSize);
        } else {
            if (onComplete) {
                onComplete();
            }
        }

        return rowsToClear.length + colsToClear.length;
    },

    // 行・列をクリア
    clearLines: function(rows, cols, onComplete, placedBlockSize) {
        var self = this;

        // アニメーション用のセル配列（順序付き）
        var cellsToAnimate = [];

        // 行のセルを追加（石セルは除外）
        rows.forEach(function(row) {
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                var cellInfo = self.board[row][col];
                // 石シールは消えない
                if (cellInfo && cellInfo.seal === 'stone') {
                    continue;
                }
                cellsToAnimate.push({
                    row: row,
                    col: col,
                    delay: col * CONFIG.ANIMATION.DELAY_PER_BLOCK,
                    key: row + '-' + col
                });
            }
        });

        // 列のセルを追加（石セルは除外）
        cols.forEach(function(col) {
            for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
                var cellInfo = self.board[row][col];
                // 石シールは消えない
                if (cellInfo && cellInfo.seal === 'stone') {
                    continue;
                }
                var key = row + '-' + col;
                var exists = cellsToAnimate.some(function(cell) {
                    return cell.key === key;
                });
                if (!exists) {
                    cellsToAnimate.push({
                        row: row,
                        col: col,
                        delay: row * CONFIG.ANIMATION.DELAY_PER_BLOCK,
                        key: key
                    });
                }
            }
        });

        // 各セルにアニメーションを適用
        cellsToAnimate.forEach(function(cellData) {
            setTimeout(function() {
                var cellElement = document.querySelector(
                    '[data-row="' + cellData.row + '"][data-col="' + cellData.col + '"]'
                );
                if (cellElement) {
                    cellElement.classList.add('clearing');

                    var rect = cellElement.getBoundingClientRect();
                    var centerX = rect.left + rect.width / 2;
                    var centerY = rect.top + rect.height / 2;
                    GameUI.showBlockPopup(centerX, centerY);
                }
            }, cellData.delay);
        });

        // 最大遅延 + アニメーション時間後にクリア処理
        var delays = cellsToAnimate.map(function(c) { return c.delay; });
        var maxDelay = Math.max.apply(null, delays.length > 0 ? delays : [0]);
        var totalAnimationTime = maxDelay + CONFIG.ANIMATION.DURATION;

        setTimeout(function() {
            // パターン効果を計算（クリア前に計算）
            var patternResult = PatternEffects.calculateEffects(cellsToAnimate);

            // シール効果を計算（クリア前に計算）
            var sealResult = PatternEffects.calculateSealEffects(cellsToAnimate);

            // ボードとDOM要素をクリア
            cellsToAnimate.forEach(function(cellData) {
                self.board[cellData.row][cellData.col] = self.createEmptyCell();
                var cellElement = document.querySelector(
                    '[data-row="' + cellData.row + '"][data-col="' + cellData.col + '"]'
                );
                if (cellElement) {
                    cellElement.className = 'cell';
                    cellElement.innerHTML = '';  // 子要素（シールアイコン等）を削除
                }
            });

            // オーラ視覚効果を更新（セルが消えた後）
            self.updateAuraVisualEffects();

            // スコア計算
            var totalLines = rows.length + cols.length;
            var baseBlocks = patternResult.baseBlocks;
            var auraBonus = patternResult.auraBonus;
            var mossBonus = patternResult.mossBonus;
            var totalBlocks = patternResult.totalBlocks;

            if (totalLines > 0 && baseBlocks > 0) {
                // 新しい計算式: (基本ブロック数 + オーラボーナス + 苔ボーナス) × ライン数
                var scoreAmount = totalBlocks * totalLines;

                // レリック効果を適用
                var relicEffects = RelicManager.calculateRelicEffects({
                    totalLines: totalLines,
                    totalBlocks: totalBlocks,
                    placedBlockSize: placedBlockSize,
                    isBoardEmpty: self.isBoardEmpty()
                });

                // 連鎖の達人: 複数ライン同時消しで1.5倍
                if (relicEffects.chainMasterActive) {
                    scoreAmount = Math.floor(scoreAmount * 1.5);
                }

                // 段階的スコア表示（オーラ・苔効果を含む）
                GameUI.showPatternScoreCalculation(
                    baseBlocks,
                    totalLines,
                    auraBonus,
                    mossBonus,
                    relicEffects.chainMasterActive,
                    function() {
                        // スコア加算後にレリックボーナスを適用
                        self.applyRelicBonuses(relicEffects, function() {
                            // シール効果を適用
                            self.applySealEffects(sealResult, onComplete);
                        });
                    }
                );
            } else {
                if (onComplete) {
                    onComplete();
                }
            }
        }, totalAnimationTime);
    },

    // レリックボーナスを適用（clearLinesから分離）
    applyRelicBonuses: function(relicEffects, onComplete) {
        // 小さな幸運: 3ブロックでライン消しすると+20
        if (relicEffects.smallLuckActive) {
            RelicManager.showRelicEffect('small_luck', '+20');
            GameUI.animateScoreIncrement(20);
        }

        // 全消しボーナス: 盤面が空になったら+20
        if (relicEffects.fullClearActive) {
            RelicManager.showRelicEffect('full_clear_bonus', '+20');
            GameUI.animateScoreIncrement(20, onComplete);
        } else {
            if (onComplete) {
                onComplete();
            }
        }
    },

    // シール効果を適用（clearLinesから分離）
    applySealEffects: function(sealResult, onComplete) {
        var hasEffect = false;

        // ゴールドシール: +1G
        if (sealResult.goldCount > 0) {
            hasEffect = true;
            GameUI.showSealEffect('gold', '+' + sealResult.goldCount + 'G');
            GameUI.animateGoldIncrement(sealResult.goldCount);
        }

        // スコアシール: +5スコア（別途加算、乗算ではない）
        if (sealResult.scoreBonus > 0) {
            hasEffect = true;
            // ゴールド効果の後に少し遅延して表示
            var delay = sealResult.goldCount > 0 ? 800 : 0;
            setTimeout(function() {
                GameUI.showSealEffect('score', '+' + sealResult.scoreBonus);
                GameUI.animateScoreIncrement(sealResult.scoreBonus, onComplete);
            }, delay);
        } else {
            if (onComplete) {
                onComplete();
            }
        }
    },

    // ボードが完全に空かどうかをチェック
    isBoardEmpty: function() {
        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                var cell = this.board[row][col];
                if (cell && cell.filled) {
                    return false;
                }
            }
        }
        return true;
    },

    // ボード状態を設定（復元用）
    setBoard: function(boardData) {
        this.board = boardData;
        // DOMを更新
        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                var cell = document.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
                var cellData = this.board[row][col];
                if (cell) {
                    cell.className = 'cell';
                    if (cellData && cellData.filled) {
                        cell.classList.add('filled');
                        if (cellData.pattern) {
                            cell.classList.add('pattern-' + cellData.pattern);
                        }
                        if (cellData.buffs && cellData.buffs.length > 0) {
                            cell.classList.add('has-buff');
                        }
                    }
                }
            }
        }
    },

    // 互換性のため: 古い形式のボードデータを新形式に変換
    convertLegacyBoard: function(boardData) {
        var newBoard = [];
        for (var row = 0; row < CONFIG.BOARD_SIZE; row++) {
            newBoard[row] = [];
            for (var col = 0; col < CONFIG.BOARD_SIZE; col++) {
                var oldValue = boardData[row] && boardData[row][col];
                if (typeof oldValue === 'boolean') {
                    // 古い形式（true/false）
                    newBoard[row][col] = {
                        filled: oldValue,
                        pattern: null,
                        seal: null,
                        buffs: [],
                        blockSetId: null
                    };
                } else if (oldValue && typeof oldValue === 'object') {
                    // blockSetIdが無い場合は追加
                    if (oldValue.blockSetId === undefined) {
                        oldValue.blockSetId = null;
                    }
                    // 新形式
                    newBoard[row][col] = oldValue;
                } else {
                    newBoard[row][col] = this.createEmptyCell();
                }
            }
        }
        return newBoard;
    }
};
