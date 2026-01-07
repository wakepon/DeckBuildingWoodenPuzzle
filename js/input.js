// input.js - ドラッグ&ドロップ操作

// 入力ハンドラー
var InputHandler = {
    draggedBlock: null,
    dragPreview: null,

    // ドラッグ開始
    startDrag: function(e, block) {
        this.draggedBlock = block;

        // ドラッグプレビューの作成
        this.dragPreview = document.createElement('div');
        this.dragPreview.className = 'drag-preview';
        const rows = block.shape.length;
        const cols = block.shape[0].length;
        this.dragPreview.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.dragPreview.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        block.shape.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'block-cell';
                if (!cell) {
                    cellDiv.style.visibility = 'hidden';
                }
                this.dragPreview.appendChild(cellDiv);
            });
        });

        document.body.appendChild(this.dragPreview);
        this.updateDragPreview(e.clientX || e.pageX, e.clientY || e.pageY);

        // イベントリスナーの追加
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragEnd);
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onDragEnd);

        // ドラッグ中のブロックを半透明に
        const blockElement = document.querySelector(`[data-block-id="${block.id}"]`);
        if (blockElement) {
            blockElement.classList.add('dragging');
        }
    },

    // ドラッグ中（マウス）
    onDragMove: function(e) {
        if (!InputHandler.draggedBlock) return;
        InputHandler.updateDragPreview(e.clientX, e.clientY);
        InputHandler.highlightCells(e.clientX, e.clientY);
    },

    // ドラッグ中（タッチ）
    onTouchMove: function(e) {
        if (!InputHandler.draggedBlock) return;
        e.preventDefault();
        const touch = e.touches[0];
        InputHandler.updateDragPreview(touch.clientX, touch.clientY);
        InputHandler.highlightCells(touch.clientX, touch.clientY);
    },

    // ドラッグプレビューの更新
    updateDragPreview: function(x, y) {
        if (this.dragPreview) {
            this.dragPreview.style.left = (x - 40) + 'px';
            this.dragPreview.style.top = (y - 40) + 'px';
        }
    },

    // セルのハイライト
    highlightCells: function(x, y) {
        // すべてのハイライトをクリア
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });

        const boardRect = document.getElementById('board').getBoundingClientRect();
        const cellSize = boardRect.width / GameBoard.BOARD_SIZE;

        // ボード上の位置を計算
        const col = Math.floor((x - boardRect.left) / cellSize);
        const row = Math.floor((y - boardRect.top) / cellSize);

        if (col < 0 || col >= GameBoard.BOARD_SIZE || row < 0 || row >= GameBoard.BOARD_SIZE) return;

        // ブロックが配置可能かチェック
        const canPlace = GameBoard.canPlace(row, col, this.draggedBlock.shape);
        const className = canPlace ? 'highlight' : 'invalid';

        // ハイライトを適用
        this.draggedBlock.shape.forEach((shapeRow, r) => {
            shapeRow.forEach((cell, c) => {
                if (cell) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    if (targetRow >= 0 && targetRow < GameBoard.BOARD_SIZE &&
                        targetCol >= 0 && targetCol < GameBoard.BOARD_SIZE) {
                        const cellElement = document.querySelector(
                            `[data-row="${targetRow}"][data-col="${targetCol}"]`
                        );
                        if (cellElement) {
                            cellElement.classList.add(className);
                        }
                    }
                }
            });
        });
    },

    // ドラッグ終了
    onDragEnd: function(e) {
        if (!InputHandler.draggedBlock) return;

        const x = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
        const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

        const boardRect = document.getElementById('board').getBoundingClientRect();
        const cellSize = boardRect.width / GameBoard.BOARD_SIZE;

        const col = Math.floor((x - boardRect.left) / cellSize);
        const row = Math.floor((y - boardRect.top) / cellSize);

        // 配置可能な場合のみ配置
        if (GameBoard.canPlace(row, col, InputHandler.draggedBlock.shape)) {
            BlockManager.placeBlock(row, col, InputHandler.draggedBlock);
        }

        // クリーンアップ
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });

        const blockElement = document.querySelector(`[data-block-id="${InputHandler.draggedBlock.id}"]`);
        if (blockElement) {
            blockElement.classList.remove('dragging');
        }

        if (InputHandler.dragPreview) {
            InputHandler.dragPreview.remove();
            InputHandler.dragPreview = null;
        }

        document.removeEventListener('mousemove', InputHandler.onDragMove);
        document.removeEventListener('mouseup', InputHandler.onDragEnd);
        document.removeEventListener('touchmove', InputHandler.onTouchMove);
        document.removeEventListener('touchend', InputHandler.onDragEnd);

        InputHandler.draggedBlock = null;
    }
};
