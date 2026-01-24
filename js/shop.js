// shop.js - ショップ管理

// ショップ管理オブジェクト
var Shop = {
    // 現在の商品リスト
    currentProducts: {
        blockSets: [],  // ブロックセット商品
        relics: []      // レリック商品
    },

    // ショップを表示
    show: function() {
        var shopScreen = document.getElementById('shop-screen');

        // ラウンドクリア報酬を付与
        var reward = CONFIG.GOLD.ROUND_CLEAR_REWARD;
        GameUI.showGoldPopup(reward);
        GameUI.animateGoldIncrement(reward);

        // 商品を生成
        this.generateProducts();

        // G所持数を更新
        this.updateGoldDisplay();

        // 商品を表示
        this.renderProducts();

        shopScreen.style.display = 'flex';
    },

    // 商品生成
    generateProducts: function() {
        this.currentProducts.blockSets = this.generateBlockSetProducts();
        this.currentProducts.relics = this.generateRelicProducts();
    },

    // ブロックセット商品を生成（3つ）
    generateBlockSetProducts: function() {
        var products = [];
        var config = CONFIG.SHOP;

        for (var i = 0; i < config.DISPLAY_COUNT.BLOCK_SETS; i++) {
            // パターン付きかシール付きかをランダム選択（50:50）
            var isPattern = Math.random() < 0.5;

            if (isPattern) {
                products.push(this.generatePatternBlockSet());
            } else {
                products.push(this.generateSealBlockSet());
            }
        }

        return products;
    },

    // パターン付きブロックセット生成
    generatePatternBlockSet: function() {
        var patterns = PatternManager.getAllPatterns();
        var pattern = patterns[Math.floor(Math.random() * patterns.length)];

        // ブロック形状を選択（1-5マス）
        var config = CONFIG.SHOP;
        var blocks = BlockShapes.filterBySize(config.BLOCK_SIZE.MIN, config.BLOCK_SIZE.MAX);
        var shape = blocks[Math.floor(Math.random() * blocks.length)];

        // 価格計算（サイズに応じて変動）
        var blockSize = BlockShapes.getSize(shape);
        var basePrice = config.BLOCK_SET_PRICE.PATTERN.MIN;
        var maxPrice = config.BLOCK_SET_PRICE.PATTERN.MAX;
        var price = basePrice + Math.floor((maxPrice - basePrice) * (blockSize - 1) / 4);

        return {
            type: 'pattern',
            shape: shape,
            pattern: pattern,
            price: price,
            name: pattern.name + 'セット',
            description: pattern.description,
            icon: pattern.icon,
            sold: false
        };
    },

    // シール付きブロックセット生成
    generateSealBlockSet: function() {
        // 全シール対象（石シールも含む）
        var seals = PatternManager.getAllSeals();
        var seal = seals[Math.floor(Math.random() * seals.length)];

        // ブロック形状を選択（1-5マス）
        var config = CONFIG.SHOP;
        var blocks = BlockShapes.filterBySize(config.BLOCK_SIZE.MIN, config.BLOCK_SIZE.MAX);
        var shape = blocks[Math.floor(Math.random() * blocks.length)];

        // シールを適用するセルをランダムに1つ選択
        var validCells = [];
        for (var row = 0; row < shape.length; row++) {
            for (var col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    validCells.push({ row: row, col: col });
                }
            }
        }
        var targetCell = validCells[Math.floor(Math.random() * validCells.length)];

        // 価格計算
        var basePrice = config.BLOCK_SET_PRICE.SEAL.MIN;
        var maxPrice = config.BLOCK_SET_PRICE.SEAL.MAX;
        var price = basePrice + Math.floor(Math.random() * (maxPrice - basePrice + 1));

        return {
            type: 'seal',
            shape: shape,
            seal: seal,
            sealPosition: targetCell,
            price: price,
            name: seal.name + 'ブロック',
            description: seal.description,
            icon: seal.icon,
            sold: false
        };
    },

    // レリック商品を生成（3つ、未所持のみ）
    generateRelicProducts: function() {
        var products = [];
        var allRelics = RelicManager.getAllRelics();

        // 未所持のレリックをフィルタリング
        var availableRelics = allRelics.filter(function(relic) {
            return !RelicManager.hasRelic(relic.id);
        });

        // シャッフル
        availableRelics = this.shuffle(availableRelics);

        // 最大3つまで選択
        var count = Math.min(CONFIG.SHOP.DISPLAY_COUNT.RELICS, availableRelics.length);
        for (var i = 0; i < count; i++) {
            var relic = availableRelics[i];
            products.push({
                type: 'relic',
                relic: relic,
                price: relic.price,
                name: relic.name,
                description: relic.description,
                icon: relic.icon,
                rarity: relic.rarity,
                sold: false
            });
        }

        return products;
    },

    // 配列シャッフル
    shuffle: function(array) {
        var shuffled = array.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    },

    // 商品表示
    renderProducts: function() {
        this.renderBlockSetProducts();
        this.renderRelicProducts();
    },

    // ブロックセット商品を表示
    renderBlockSetProducts: function() {
        var container = document.getElementById('shop-block-sets');
        container.innerHTML = '';
        var self = this;

        this.currentProducts.blockSets.forEach(function(product, index) {
            var card = self.createBlockSetCard(product, index);
            container.appendChild(card);
        });
    },

    // ブロックセットカード作成
    createBlockSetCard: function(product, index) {
        var self = this;
        var canAfford = GameUI.gold >= product.price;

        var card = document.createElement('div');
        card.className = 'shop-product-card';
        if (product.sold) {
            card.classList.add('sold');
        } else if (!canAfford) {
            card.classList.add('disabled');
        }

        // 効果アイコン
        var iconEl = document.createElement('div');
        iconEl.className = 'shop-effect-icon';
        iconEl.textContent = product.icon;
        card.appendChild(iconEl);

        // 商品名
        var nameEl = document.createElement('div');
        nameEl.className = 'shop-product-name';
        nameEl.textContent = product.name;
        card.appendChild(nameEl);

        // ブロックプレビュー
        var previewContainer = document.createElement('div');
        previewContainer.className = 'shop-block-preview';
        var cellSize = BlockRenderer.getResponsiveCellSize(true);

        // シール配列を作成（シール付きの場合）
        var seals = PatternManager.createEmptySeals(product.shape);
        if (product.type === 'seal' && product.sealPosition) {
            seals[product.sealPosition.row][product.sealPosition.col] = product.seal.id;
        }

        var blockElement = BlockRenderer.createBlockElement({
            shape: product.shape,
            cellSize: cellSize,
            className: 'shop-block',
            cellClassName: 'shop-block-cell',
            pattern: product.type === 'pattern' ? product.pattern.id : null,
            seals: seals
        });
        previewContainer.appendChild(blockElement);
        card.appendChild(previewContainer);

        // 説明
        var descEl = document.createElement('div');
        descEl.className = 'shop-product-desc';
        descEl.textContent = product.description;
        card.appendChild(descEl);

        // 価格
        var priceEl = document.createElement('div');
        priceEl.className = 'shop-product-price';
        if (!canAfford) {
            priceEl.classList.add('cannot-afford');
        }
        priceEl.textContent = product.price + ' G';
        card.appendChild(priceEl);

        // 購入イベント
        if (!product.sold && canAfford) {
            card.addEventListener('click', function() {
                self.purchaseBlockSet(product, index, card);
            });
            card.addEventListener('touchend', function(e) {
                e.preventDefault();
                self.purchaseBlockSet(product, index, card);
            });
        }

        return card;
    },

    // レリック商品を表示
    renderRelicProducts: function() {
        var container = document.getElementById('shop-relics');
        container.innerHTML = '';
        var self = this;

        this.currentProducts.relics.forEach(function(product, index) {
            var card = self.createRelicCard(product, index);
            container.appendChild(card);
        });

        // レリックが0件の場合
        if (this.currentProducts.relics.length === 0) {
            var emptyMsg = document.createElement('div');
            emptyMsg.className = 'shop-empty-message';
            emptyMsg.textContent = '購入可能なレリックはありません';
            container.appendChild(emptyMsg);
        }
    },

    // レリックカード作成
    createRelicCard: function(product, index) {
        var self = this;
        var canAfford = GameUI.gold >= product.price;

        var card = document.createElement('div');
        card.className = 'shop-product-card';
        if (product.sold) {
            card.classList.add('sold');
        } else if (!canAfford) {
            card.classList.add('disabled');
        }

        // レアリティ
        var rarityEl = document.createElement('div');
        rarityEl.className = 'shop-product-rarity rarity-' + product.rarity;
        var rarityText = { 'common': 'コモン', 'rare': 'レア', 'epic': 'エピック' };
        rarityEl.textContent = rarityText[product.rarity] || product.rarity;
        card.appendChild(rarityEl);

        // レリックアイコン
        var iconEl = document.createElement('div');
        iconEl.className = 'shop-relic-icon';
        iconEl.textContent = product.icon;
        card.appendChild(iconEl);

        // 商品名
        var nameEl = document.createElement('div');
        nameEl.className = 'shop-product-name';
        nameEl.textContent = product.name;
        card.appendChild(nameEl);

        // 説明
        var descEl = document.createElement('div');
        descEl.className = 'shop-product-desc';
        descEl.textContent = product.description;
        card.appendChild(descEl);

        // 価格
        var priceEl = document.createElement('div');
        priceEl.className = 'shop-product-price';
        if (!canAfford) {
            priceEl.classList.add('cannot-afford');
        }
        priceEl.textContent = product.price + ' G';
        card.appendChild(priceEl);

        // 購入イベント
        if (!product.sold && canAfford) {
            card.addEventListener('click', function() {
                self.purchaseRelic(product, index, card);
            });
            card.addEventListener('touchend', function(e) {
                e.preventDefault();
                self.purchaseRelic(product, index, card);
            });
        }

        return card;
    },

    // ブロックセット購入
    purchaseBlockSet: function(product, index, cardElement) {
        if (product.sold || GameUI.gold < product.price) return;

        // 購入処理
        product.sold = true;
        GameUI.gold -= product.price;
        GameUI.saveGold();
        this.updateGoldDisplay();

        // デッキにブロックを追加（パターン/シール付き）
        this.addBlockToDeck(product);

        // カードを更新
        cardElement.classList.add('purchasing');
        var self = this;
        setTimeout(function() {
            self.renderProducts();
        }, 500);
    },

    // デッキにブロックを追加
    addBlockToDeck: function(product) {
        // 形状をコピー
        var shapeCopy = product.shape.map(function(row) {
            return row.slice();
        });

        // シール配列を作成
        var seals = PatternManager.createEmptySeals(shapeCopy);

        // パターンまたはシールを適用
        var pattern = null;
        if (product.type === 'pattern') {
            pattern = product.pattern.id;
        } else if (product.type === 'seal' && product.sealPosition) {
            seals[product.sealPosition.row][product.sealPosition.col] = product.seal.id;
        }

        // DeckManagerに追加（パターン・シール情報を含めて）
        DeckManager.addBlockWithEffects(shapeCopy, pattern, seals);
    },

    // レリック購入
    purchaseRelic: function(product, index, cardElement) {
        if (product.sold || GameUI.gold < product.price) return;

        // 購入処理
        product.sold = true;
        GameUI.gold -= product.price;
        GameUI.saveGold();
        this.updateGoldDisplay();

        // レリックを追加
        RelicManager.addRelic(product.relic.id);

        // カードを更新
        cardElement.classList.add('purchasing');
        var self = this;
        setTimeout(function() {
            self.renderProducts();
        }, 500);
    },

    // ショップのG表示を更新
    updateGoldDisplay: function() {
        var goldDisplay = document.getElementById('shop-gold-display');
        if (goldDisplay) {
            goldDisplay.textContent = '所持金: ' + GameUI.gold + ' G';
        }
    },

    // ショップを閉じる
    hide: function() {
        var shopScreen = document.getElementById('shop-screen');
        shopScreen.style.display = 'none';
    },

    // 次のステップへ進む
    proceedToNextStep: function() {
        // ショップを閉じる
        this.hide();

        // 次のラウンド開始
        BlockManager.startNextRound();
    },

    // イベントリスナーを初期化
    init: function() {
        var nextButton = document.getElementById('shop-next-button');
        if (nextButton) {
            // クリックイベント（PC用）
            nextButton.addEventListener('click', function() {
                Shop.proceedToNextStep();
            });

            // タッチイベント（モバイル用）
            nextButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                Shop.proceedToNextStep();
            });
        }
    }
};
