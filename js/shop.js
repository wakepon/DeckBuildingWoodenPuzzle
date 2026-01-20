// shop.js - ショップ管理

// ショップ管理オブジェクト
var Shop = {
    // ショップを表示
    show: function() {
        var shopScreen = document.getElementById('shop-screen');

        // G所持数を更新
        this.updateGoldDisplay();

        shopScreen.style.display = 'flex';
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
