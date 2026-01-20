// ゲーム設定
var CONFIG = {
    VERSION: 'v2026.01.20.1444',
    // ボードのグリッドサイズ（NxN）
    BOARD_SIZE: 5,
    // タッチ操作時のドラッグオフセット(px)
    // ブロックが指で隠れないよう、指の位置より上に表示
    TOUCH_DRAG_OFFSET_Y: 60,

    // ブロック消失アニメーション設定
    ANIMATION: {
        // アニメーション時間(ms)
        DURATION: 300,
        // 各ブロック間の遅延時間(ms)
        DELAY_PER_BLOCK: 50,
        // スケール倍率
        SCALE: 1.2,
        // 回転角度(度)
        ROTATION: 360
    },

    // ゲームルール定数
    GAME: {
        MAX_PLACEMENTS_PER_ROUND: 12,  // ラウンドあたり最大配置数
        DRAW_COUNT: 3,                  // 手札ドロー数
        TARGET_SCORE_MULTIPLIER: 20     // 目標スコア = ラウンド × この値
    },

    // セルサイズ設定（px）
    CELL_SIZE: {
        DEFAULT: 30,        // 通常
        MEDIUM: 28,         // 480px以下
        SMALL: 25,          // 380px以下
        SHOP_DEFAULT: 35,   // ショップ用
        SHOP_MEDIUM: 28,    // ショップ用（480px以下）
        SHOP_SMALL: 25      // ショップ用（380px以下）
    },

    // ゴールド関連の設定
    GOLD: {
        ROUND_CLEAR_REWARD: 50,     // ラウンドクリア報酬
        ANIMATION_DURATION: 800,    // アニメーション時間(ms)
        STORAGE_KEY: 'woodyPuzzleGold'  // localStorageのキー
    },

    // ゲーム状態保存用のキー
    GAME_STATE_STORAGE_KEY: 'woodyPuzzleGameState'
};
