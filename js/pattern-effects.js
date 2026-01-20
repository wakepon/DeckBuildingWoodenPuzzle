// pattern-effects.js - パターン効果の計算ロジック

var PatternEffects = {
    // パターン効果によるボーナススコアを計算
    // cellsToAnimate: クリアされるセルの配列 [{row, col, ...}]
    calculateBonus: function(cellsToAnimate) {
        var totalBonus = 0;
        var effects = [];
        var self = this;

        cellsToAnimate.forEach(function(cellData) {
            var cellInfo = GameBoard.board[cellData.row][cellData.col];
            if (!cellInfo || !cellInfo.filled) return;

            // 強化 (enhanced): +2点/ブロック
            if (cellInfo.pattern === 'enhanced') {
                totalBonus += 2;
                effects.push({
                    type: 'enhanced',
                    row: cellData.row,
                    col: cellData.col,
                    bonus: 2
                });
            }

            // オーラバフ (aura_buff): +2点/ブロック
            if (cellInfo.buffs && cellInfo.buffs.indexOf('aura_buff') !== -1) {
                totalBonus += 2;
                effects.push({
                    type: 'aura_buff',
                    row: cellData.row,
                    col: cellData.col,
                    bonus: 2
                });
            }

            // 苔 (moss): 盤面端と接している辺の数だけ+1点
            if (cellInfo.pattern === 'moss') {
                var edgeCount = self.countEdges(cellData.row, cellData.col);
                if (edgeCount > 0) {
                    totalBonus += edgeCount;
                    effects.push({
                        type: 'moss',
                        row: cellData.row,
                        col: cellData.col,
                        bonus: edgeCount
                    });
                }
            }
        });

        return {
            totalBonus: totalBonus,
            effects: effects
        };
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

    // パターン効果をグループ化（同じパターンは合算）
    groupEffects: function(effects) {
        var grouped = {};
        effects.forEach(function(effect) {
            if (!grouped[effect.type]) {
                grouped[effect.type] = {
                    type: effect.type,
                    bonus: 0,
                    count: 0
                };
            }
            grouped[effect.type].bonus += effect.bonus;
            grouped[effect.type].count++;
        });

        var result = [];
        for (var type in grouped) {
            result.push(grouped[type]);
        }
        return result;
    },

    // パターン効果発動時の視覚演出
    showPatternEffect: function(effectType, bonus) {
        var pattern = null;
        var name = '';
        var icon = '';

        // パターンまたはバフの情報を取得
        if (effectType === 'aura_buff') {
            name = 'オーラバフ';
            icon = '✨';
        } else {
            pattern = PatternManager.getPattern(effectType);
            if (pattern) {
                name = pattern.name;
                icon = pattern.icon;
            }
        }

        if (!name) return;

        var popup = document.createElement('div');
        popup.className = 'pattern-effect-popup';
        popup.innerHTML = '<span class="pattern-effect-icon">' + icon + '</span>' +
                         '<span class="pattern-effect-name">' + name + '</span>' +
                         '<span class="pattern-effect-bonus">+' + bonus + '</span>';
        document.body.appendChild(popup);

        setTimeout(function() {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    },

    // 複数のパターン効果を順次表示
    showAllEffects: function(effects, onComplete) {
        var grouped = this.groupEffects(effects);
        var self = this;
        var index = 0;

        function showNext() {
            if (index >= grouped.length) {
                if (onComplete) onComplete();
                return;
            }

            var effect = grouped[index];
            self.showPatternEffect(effect.type, effect.bonus);
            index++;

            // 次の効果を少し遅らせて表示
            setTimeout(showNext, 800);
        }

        if (grouped.length > 0) {
            showNext();
        } else if (onComplete) {
            onComplete();
        }
    }
};
