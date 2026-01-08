// main.js - 初期化、ゲームループ

// ゲームの初期化
function initGame() {
    GameUI.loadHighScore();
    GameBoard.init();
    BlockManager.init();
}

// ゲームリスタート
function restartGame() {
    // ボードをクリア
    GameBoard.clear();

    // スコアリセット
    GameUI.resetScore();

    // ゴールドリセット
    GameUI.resetGold();

    // UIリセット
    GameUI.hideGameOver();

    // ラウンドと税金をリセット
    BlockManager.gameState.round = 1;
    BlockManager.gameState.taxRate = 1;

    // 新しいブロックを生成
    BlockManager.init();
}

// リスタートボタンのイベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    document.getElementById('restart-button').addEventListener('click', restartGame);
});
