# Claude Code Commands

このフォルダには、Claude Code で使用できるカスタムコマンド（スキル）が含まれています。

## 使い方

Claude Code のチャットで `/コマンド名` と入力することで実行できます。

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `/update-documents` | コード実装後にDocumentsフォルダを更新します |
| `/git-commit` | 適切なコミットメッセージを生成してgit commitします |
| `/test-unity` | MCP経由でUnityのTest Runnerを実行し、テスト結果を表示します |
| `/git-pullrequest` | 現在のブランチでGitHubにPull Requestを作成します |

## 各コマンドの詳細

### /update-documents
コード実装後のドキュメント更新を行います。
- csファイルを追加した際にDocumentsフォルダを更新
- 各csファイルから仕様書、AI生成メモへのパスを参照できるように設定

### /git-commit
変更内容を分析し、適切なコミットメッセージを自動生成してコミットを実行します。

### /test-unity
Unity MCP を使用してEditMode/PlayModeのテストを実行し、結果を表示します。

### /git-pullrequest
現在のブランチの変更内容をもとにPull Requestを作成します。
- 変更内容のサマリーを自動生成
- GitHubにPRを投稿

## コマンドの追加方法

新しいコマンドを追加するには、このフォルダに `.md` ファイルを作成します。
ファイル名がコマンド名になります（例: `my-command.md` → `/my-command`）。
