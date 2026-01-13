// main.js - 初期化、ゲームループ

// ゲームの初期化
function initGame() {
    GameUI.loadHighScore();
    GameBoard.init();
    BlockManager.init();
}

// ゲームリスタート
function restartGame() {
    // 入力ハンドラーをリセット
    InputHandler.reset();

    // UIリセット
    GameUI.hideGameOver();

    // ボードをクリア
    GameBoard.clear();

    // スコアリセット
    GameUI.resetScore();

    // ゲームステートを完全にリセット
    BlockManager.gameState.round = 1;
    BlockManager.gameState.score = 0;
    BlockManager.gameState.blocksPlacedCount = 0;
    BlockManager.gameState.roundEnding = false;
    BlockManager.gameState.currentBlocks = [];

    // デッキマネージャーを初期化（ショップで追加されたブロックもクリア）
    DeckManager.init();

    // 新しいブロックを生成
    BlockManager.init();
}

// リスタートボタンのイベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    document.getElementById('restart-button').addEventListener('click', restartGame);
    GameUI.initSettingsIcon();
});
