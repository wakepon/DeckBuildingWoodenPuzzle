// input.js - ドラッグ&ドロップ操作

// 入力ハンドラー
var InputHandler = {
    draggedBlock: null,
    dragPreview: null,

    // ドラッグ開始
    startDrag: function(e, block) {
        this.draggedBlock = block;

        // ドラッグプレビューの作成（BlockRendererを使用）
        this.dragPreview = BlockRenderer.createBlockElement({
            shape: block.shape,
            cellSize: CONFIG.CELL_SIZE.DEFAULT,
            className: 'drag-preview',
            cellClassName: 'block-cell',
            pattern: block.pattern,
            seals: block.seals
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
        InputHandler.updateDragPreview(touch.clientX, touch.clientY, true);
        InputHandler.highlightCells(touch.clientX, touch.clientY);
    },

    // ドラッグプレビューの更新
    updateDragPreview: function(x, y, isTouch) {
        if (this.dragPreview) {
            this.dragPreview.style.left = (x - 40) + 'px';
            // タッチ操作の場合はオフセットを適用
            const offsetY = isTouch ? CONFIG.TOUCH_DRAG_OFFSET_Y : 0;
            this.dragPreview.style.top = (y - 40 - offsetY) + 'px';
        }
    },

    // セルのハイライト
    highlightCells: function(x, y) {
        // すべてのハイライトをクリア
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });

        const boardRect = document.getElementById('board').getBoundingClientRect();
        const cellSize = boardRect.width / CONFIG.BOARD_SIZE;

        // ボード上の位置を計算
        const col = Math.floor((x - boardRect.left) / cellSize);
        const row = Math.floor((y - boardRect.top) / cellSize);

        if (col < 0 || col >= CONFIG.BOARD_SIZE || row < 0 || row >= CONFIG.BOARD_SIZE) return;

        // ブロックが配置可能かチェック
        const canPlace = GameBoard.canPlace(row, col, this.draggedBlock.shape);
        const className = canPlace ? 'highlight' : 'invalid';

        // ハイライトを適用
        this.draggedBlock.shape.forEach((shapeRow, r) => {
            shapeRow.forEach((cell, c) => {
                if (cell) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    if (targetRow >= 0 && targetRow < CONFIG.BOARD_SIZE &&
                        targetCol >= 0 && targetCol < CONFIG.BOARD_SIZE) {
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
        const cellSize = boardRect.width / CONFIG.BOARD_SIZE;

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
    },

    // 入力ハンドラーをリセット
    reset: function() {
        // イベントリスナーをすべて削除
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onDragEnd);

        // ドラッグプレビューを削除
        if (this.dragPreview) {
            this.dragPreview.remove();
            this.dragPreview = null;
        }

        // すべてのハイライトをクリア
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });

        // draggingクラスを削除
        document.querySelectorAll('.block.dragging').forEach(block => {
            block.classList.remove('dragging');
        });

        // 状態をリセット
        this.draggedBlock = null;
    }
};
