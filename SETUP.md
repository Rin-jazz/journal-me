# セットアップ手順（リンさんが自分のアカウントで行う作業）

コードの修正・機能追加はClaude側で完了しています。
ここから下は「アカウント設定」なので、リンさん自身の操作が必要です。ひとつずつでOKです。

---

## ① Vercelの公開設定を直す（最優先・これが「接続エラー」の主原因）

原因：Vercelの本番URL `https://journal-me-rin-jazzs-projects.vercel.app` に
「Deployment Protection（デプロイ保護）」がかかっていて、ログインしないと開けない状態でした。
スマホではこのURLを開けず、APIが動かないGitHub Pages版を使うしかなかったため「接続エラー」が出ていました。

**手順**
1. https://vercel.com/rin-jazzs-projects/journal-me/settings/deployment-protection を開く（Vercelにログイン）
2. "Vercel Authentication" を **Disabled**（またはPreview Deploymentsのみに限定）に変更
3. 保存

## ② Gemini APIキーが設定されているか確認

1. https://vercel.com/rin-jazzs-projects/journal-me/settings/environment-variables を開く
2. `GEMINI_API_KEY` という変数があるか確認
   - なければ https://aistudio.google.com/app/apikey で無料のAPIキーを発行し、ここに追加（Production/Preview/Development すべてにチェック）
   - キーを追加/変更したら、Deploymentsタブから最新のデプロイを「Redeploy」する

## ③ 動作確認

1. スマホのSafariで `https://journal-me-rin-jazzs-projects.vercel.app` を開く
2. 日記を保存 → 「AIメンターより」にコメントが出れば成功
3. 成功したら、Safariの共有ボタン→「ホーム画面に追加」でアプリのように使えます

（GitHub Pages版 `rin-jazz.github.io/journal-me` は古い・API非対応なので、今後は使わないでください。混乱を避けたい場合はGitHubリポジトリのSettings→Pagesで無効化してもOKです）

---

## ④ Google Drive連携（日記をMyOSの14_journal/に保存する機能）

これは新しく追加した機能です。有効にするには、Googleの「OAuthクライアントID」を1つ発行する必要があります。
クライアントID自体は公開情報（パスワードではない）なので、コードに直接書き込んでも問題ありません。

**手順**
1. https://console.cloud.google.com/projectcreate を開き、新しいプロジェクトを作成（例：`myos-journal`）
2. 作成したプロジェクトで「APIとサービス」→「ライブラリ」→ **Google Drive API** を検索して有効化
3. 「APIとサービス」→「OAuth同意画面」
   - User Type: **外部（External）**
   - アプリ名：`MyOS Journal`（任意）
   - サポートメール・デベロッパー連絡先：rin09326@gmail.com
   - 公開ステータスは **テスト中（Testing）** のままでOK（自分しか使わないため審査不要）
   - 「テストユーザー」に rin09326@gmail.com を追加
4. 「認証情報」→「認証情報を作成」→ **OAuthクライアントID**
   - アプリケーションの種類：**ウェブアプリケーション**
   - 承認済みのJavaScript生成元 に以下を追加：
     - `https://journal-me-rin-jazzs-projects.vercel.app`
   - 作成すると「クライアントID」（`〜.apps.googleusercontent.com`という文字列）が発行されます
5. そのクライアントIDをこのClaude Codeの会話にそのまま貼ってください。私が `index.html` の該当箇所に反映してpushします
   （自分で編集する場合：`index.html` 内の `PASTE_YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com` を発行されたIDに置き換えるだけです）

設定が終わると、アプリ右上に「🔗 Google未連携」ボタンが出て、タップするとGoogleログイン→MyOSのDriveの `14_journal/YYYY-MM/YYYY-MM-DD.md` に日記が自動保存されるようになります（既存の14_journalのMarkdown形式と同じフォーマットです）。
