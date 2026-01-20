// pattern-effects.js - パターン効果の計算ロジック

var PatternEffects = {
    // パターン効果を計算（新方式: 乗算対象のブロック数に加算）
    // cellsToAnimate: クリアされるセルの配列 [{row, col, ...}]
    calculateEffects: function(cellsToAnimate) {
        var baseBlocks = cellsToAnimate.length;
        var auraBonus = 0;
        var mossBonus = 0;
        var enhancedBonus = 0;
        var self = this;

        cellsToAnimate.forEach(function(cellData) {
            var cellInfo = GameBoard.board[cellData.row][cellData.col];
            if (!cellInfo || !cellInfo.filled) return;

            // オーラ効果: 隣接するオーラブロック（別セット）があるか
            if (self.isAdjacentToAura(cellData.row, cellData.col, cellInfo.blockSetId)) {
                auraBonus++;
            }

            // 苔効果: 端と接している辺の数
            if (cellInfo.pattern === 'moss') {
                mossBonus += self.countEdges(cellData.row, cellData.col);
            }

            // 強化効果: +2点/ブロック（従来通り加算）
            if (cellInfo.pattern === 'enhanced') {
                enhancedBonus += 2;
            }
        });

        return {
            baseBlocks: baseBlocks,
            auraBonus: auraBonus,
            mossBonus: mossBonus,
            enhancedBonus: enhancedBonus,
            totalBlocks: baseBlocks + auraBonus + mossBonus
        };
    },

    // 隣接するオーラブロック（別セット）があるかチェック
    isAdjacentToAura: function(row, col, myBlockSetId) {
        var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (var i = 0; i < directions.length; i++) {
            var adjRow = row + directions[i][0];
            var adjCol = col + directions[i][1];

            // ボードの範囲外チェック
            if (adjRow < 0 || adjRow >= CONFIG.BOARD_SIZE ||
                adjCol < 0 || adjCol >= CONFIG.BOARD_SIZE) {
                continue;
            }

            var adjCell = GameBoard.board[adjRow][adjCol];
            if (adjCell && adjCell.filled &&
                adjCell.pattern === 'aura' &&
                adjCell.blockSetId !== myBlockSetId) {
                return true;
            }
        }
        return false;
    },

    // 苔効果: 盤面端と接している辺をカウント
    countEdges: function(row, col) {
        var count = 0;
        if (row === 0) count++;                           // 上端
        if (row === CONFIG.BOARD_SIZE - 1) count++;       // 下端
        if (col === 0) count++;                           // 左端
        if (col === CONFIG.BOARD_SIZE - 1) count++;       // 右端
        return count;
    },

    // パターン効果発動時の視覚演出（強化用）
    showPatternEffect: function(effectType, bonus) {
        var pattern = PatternManager.getPattern(effectType);
        if (!pattern) return;

        var popup = document.createElement('div');
        popup.className = 'pattern-effect-popup';
        popup.innerHTML = '<span class="pattern-effect-icon">' + pattern.icon + '</span>' +
                         '<span class="pattern-effect-name">' + pattern.name + '</span>' +
                         '<span class="pattern-effect-bonus">+' + bonus + '</span>';
        document.body.appendChild(popup);

        setTimeout(function() {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    },

    // シール効果を計算
    calculateSealEffects: function(cellsToAnimate) {
        var goldCount = 0;
        var scoreBonus = 0;

        cellsToAnimate.forEach(function(cellData) {
            var cellInfo = GameBoard.board[cellData.row][cellData.col];
            if (!cellInfo || !cellInfo.filled || !cellInfo.seal) return;

            // ゴールドシール
            if (cellInfo.seal === 'gold') {
                goldCount++;
            }

            // スコアシール
            if (cellInfo.seal === 'score') {
                scoreBonus += 5;
            }
        });

        return {
            goldCount: goldCount,
            scoreBonus: scoreBonus
        };
    }
};
