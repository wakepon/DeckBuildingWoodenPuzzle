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

    // UIリセット
    GameUI.hideGameOver();

    // 新しいブロックを生成
    BlockManager.init();
}

// リスタートボタンのイベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    document.getElementById('restart-button').addEventListener('click', restartGame);
});
