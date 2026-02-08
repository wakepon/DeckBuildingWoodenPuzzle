// main.js - 初期化、ゲームループ

// ゲームの初期化
function initGame() {
    GameUI.loadHighScore();
    GameUI.loadGold();
    GameBoard.init();

    // 保存された状態があれば復元
    var savedState = GameUI.loadGameState();
    if (savedState && !savedState.gameState.roundEnding) {
        // 状態を復元
        BlockManager.gameState = savedState.gameState;
        // 古いセーブデータ互換: stockBlockがundefinedの場合はnullにする
        if (BlockManager.gameState.stockBlock === undefined) {
            BlockManager.gameState.stockBlock = null;
        }
        // 古い形式のボードデータを新形式に変換
        var boardData = GameBoard.convertLegacyBoard(savedState.board);
        GameBoard.setBoard(boardData);
        DeckManager.setState(savedState.deckState);
        if (savedState.relicState) {
            RelicManager.setState(savedState.relicState);
        }
        BlockManager.render();
        // UI表示を更新
        document.getElementById('score-display').textContent = 'スコア: ' + BlockManager.gameState.score;
        GameUI.updatePlacementInfo(BlockManager.gameState.blocksPlacedCount, BlockManager.gameState.round);
        GameUI.updateTargetScore(BlockManager.gameState.round);
        // ゲームオーバーチェック
        BlockManager.checkGameOver();
    } else {
        // 新規ゲーム開始 - ラウンド進行ウィンドウを表示
        DeckManager.init();  // デッキを初期化
        RoundProgress.show();  // ラウンド進行ウィンドウを表示
    }
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

    // 保存された状態をクリア
    GameUI.clearGameState();

    // ゲームステートを完全にリセット
    BlockManager.gameState.round = 0;
    BlockManager.gameState.score = 0;
    BlockManager.gameState.blocksPlacedCount = 0;
    BlockManager.gameState.roundEnding = false;
    BlockManager.gameState.currentBlocks = [];
    BlockManager.gameState.stockBlock = null;

    // レリックをリセット
    RelicManager.reset();

    // デッキマネージャーを初期化（ショップで追加されたブロックもクリア）
    DeckManager.init();

    // ラウンド進行ウィンドウを表示
    RoundProgress.show();
}

// リスタートボタンのイベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    document.getElementById('restart-button').addEventListener('click', restartGame);
    GameUI.initSettingsIcon();
    DeckView.init();
    Shop.init();
    RoundProgress.init();
    RelicManager.init();
    DebugManager.init();
});
