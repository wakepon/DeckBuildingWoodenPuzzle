# プロジェクト概要
Woody Puzzle風のブラウザパズルゲーム

# 技術スタック
- HTML5 / CSS3 / JavaScript（バニラJS）
- Canvas API

# コーディングルール

## JavaScript
- ES6 Modulesは使用しない（import/export禁止）
- scriptタグ複数方式でファイルを分割する
- グローバル変数は極力オブジェクトにまとめる（例：Game, Board, Block）

## ファイル構成

```
├── index.html
├── css/
│   └── style.css
└── js/
    ├── config.js      # 設定値
    ├── board.js       # ボード管理
    ├── block.js       # ブロック管理
    ├── input.js       # 入力処理
    └── game.js        # メイン（最後に読み込む）
```

## その他
- スマホ対応（タッチ操作）を考慮
- GitHub Pagesで動作すること
- コメントは日本語でOK

## 注意事項
- 外部ライブラリは使用しない（バニラJSのみ）
- 1ファイルが300行を超えたら分割を検討
