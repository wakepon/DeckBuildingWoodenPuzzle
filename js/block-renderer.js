// block-renderer.js - ブロック要素作成の共通処理

// ブロックレンダラー
var BlockRenderer = {
    // ブロック要素を作成（共通処理）
    // options: {
    //   shape: ブロック形状配列,
    //   blockId: ブロックID（省略可）,
    //   cellSize: セルサイズ(px)（省略時はCONFIG.CELL_SIZE.DEFAULT）,
    //   className: ブロック要素のクラス名（省略時は'block'）,
    //   cellClassName: セル要素のクラス名（省略時は'block-cell'）,
    //   onClick: クリックイベントハンドラ（省略可）,
    //   onMouseDown: マウスダウンイベントハンドラ（省略可）,
    //   onTouchStart: タッチスタートイベントハンドラ（省略可）,
    //   onTouchEnd: タッチエンドイベントハンドラ（省略可）
    // }
    createBlockElement: function(options) {
        const blockDiv = document.createElement('div');
        blockDiv.className = options.className || 'block';

        // ブロックIDを設定（省略可能）
        if (options.blockId) {
            blockDiv.dataset.blockId = options.blockId;
        }

        // ブロックの形状サイズを取得
        const rows = options.shape.length;
        const cols = options.shape[0].length;
        const cellSize = options.cellSize || CONFIG.CELL_SIZE.DEFAULT;
        const cellClassName = options.cellClassName || 'block-cell';

        // グリッドレイアウトを設定
        blockDiv.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        blockDiv.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

        // 各セルを作成
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = cellClassName;

                // セルの位置情報をdata属性として保存
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;

                // 形状配列の値に応じて表示/非表示を制御
                if (!options.shape[row][col]) {
                    cellDiv.style.visibility = 'hidden';
                }

                blockDiv.appendChild(cellDiv);
            }
        }

        // イベントリスナー設定
        if (options.onClick) {
            blockDiv.addEventListener('click', options.onClick);
        }
        if (options.onMouseDown) {
            blockDiv.addEventListener('mousedown', options.onMouseDown);
        }
        if (options.onTouchStart) {
            blockDiv.addEventListener('touchstart', options.onTouchStart);
        }
        if (options.onTouchEnd) {
            blockDiv.addEventListener('touchend', options.onTouchEnd);
        }

        return blockDiv;
    },

    // レスポンシブなセルサイズを取得（ショップ用）
    getResponsiveCellSize: function(isShop) {
        const sizeConfig = isShop ? {
            default: CONFIG.CELL_SIZE.SHOP_DEFAULT,
            medium: CONFIG.CELL_SIZE.SHOP_MEDIUM,
            small: CONFIG.CELL_SIZE.SHOP_SMALL
        } : {
            default: CONFIG.CELL_SIZE.DEFAULT,
            medium: CONFIG.CELL_SIZE.MEDIUM,
            small: CONFIG.CELL_SIZE.SMALL
        };

        if (window.innerWidth <= 380) {
            return sizeConfig.small;
        } else if (window.innerWidth <= 480) {
            return sizeConfig.medium;
        }
        return sizeConfig.default;
    }
};
