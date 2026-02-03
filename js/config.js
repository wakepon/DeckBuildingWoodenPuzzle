// ゲーム設定
var CONFIG = {
    VERSION: '__VERSION__',
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
        ROUND_CLEAR_REWARD: 5,     // ラウンドクリア報酬
        ANIMATION_DURATION: 800,    // アニメーション時間(ms)
        STORAGE_KEY: 'woodyPuzzleGold'  // localStorageのキー
    },

    // ショップ関連の設定
    SHOP: {
        // ブロックセット価格帯
        BLOCK_SET_PRICE: {
            PATTERN: { MIN: 1, MAX: 5 },  // パターン付き
            SEAL: { MIN: 1, MAX: 2 }       // シール付き
        },
        // 各カテゴリの表示数
        DISPLAY_COUNT: {
            BLOCK_SETS: 3,
            RELICS: 3
        },
        // ブロックサイズ範囲
        BLOCK_SIZE: {
            MIN: 1,
            MAX: 5
        }
    },

    // ゲーム状態保存用のキー
    GAME_STATE_STORAGE_KEY: 'woodyPuzzleGameState',

    // ラウンド進行設定
    ROUND_PROGRESS: {
        ROUNDS_PER_SET: 3,
        TYPES: ['normal', 'elite', 'boss'],
        LABELS: { normal: '雑魚', elite: 'エリート', boss: 'ボス' },
        COLORS: { normal: '#5fa8ff', elite: '#b46eff', boss: '#ef5350' },
        REWARDS: { normal: 5, elite: 7, boss: 10 }
    },

    // ボスラウンド特殊条件
    BOSS_CONDITIONS: [
        { id: 'obstacle', name: 'おじゃまブロック', icon: '🪨', description: 'ランダムな1マスが埋まっている' },
        { id: 'energy_save', name: '省エネ', icon: '🔋', description: '配置可能数が9に減少' },
        { id: 'two_cards', name: '手札2枚', icon: '✌️', description: '手札が2枚になる' }
    ]
};
