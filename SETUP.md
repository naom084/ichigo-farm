# 🍓 いちご農園 葉かき進捗アプリ セットアップ手順書

## 全体の流れ（所要時間：約30分）

```
STEP 1: Node.js インストール（5分）
STEP 2: Firebase プロジェクト作成（10分）
STEP 3: アプリにFirebase設定を貼り付け（5分）
STEP 4: Claude Code でアプリ起動・確認（5分）
STEP 5: Vercel にデプロイ → URLをLINEで共有（5分）
```

---

## STEP 1: Node.js をインストール

1. https://nodejs.org にアクセス
2. 「LTS（推奨版）」をダウンロードしてインストール
3. インストール後、ターミナル（Mac: Terminal / Win: PowerShell）で確認：
   ```
   node -v
   ```
   → `v20.x.x` のような表示が出ればOK ✅

---

## STEP 2: Firebase プロジェクトを作成

### 2-1. Firebaseコンソールにアクセス
1. https://console.firebase.google.com にアクセス
2. Googleアカウントでログイン

### 2-2. 新しいプロジェクトを作成
1. 「プロジェクトを追加」をクリック
2. プロジェクト名：`ichigo-farm`（何でもOK）
3. Googleアナリティクス：**オフ**でOK
4. 「プロジェクトを作成」→ 完了まで待つ

### 2-3. Webアプリを追加してキーを取得
1. プロジェクトのホーム画面で「**</>**」（Webアプリ）アイコンをクリック
2. アプリのニックネーム：`ichigo-app`
3. 「Firebase Hosting も設定する」は**チェックしない**
4. 「アプリを登録」をクリック
5. 表示される **firebaseConfig** をメモ帳にコピー

```javascript
// ↓ このようなコードが表示されます（値は例）
const firebaseConfig = {
  apiKey: "AIzaSyABC...",
  authDomain: "ichigo-farm-xxx.firebaseapp.com",
  projectId: "ichigo-farm-xxx",
  storageBucket: "ichigo-farm-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 2-4. Realtime Database を有効化
1. 左メニュー「構築」→「**Realtime Database**」をクリック
2. 「データベースを作成」をクリック
3. ロケーション：`asia-southeast1`（シンガポール）を選択
4. セキュリティルール：「**テストモードで開始**」を選択
5. 「有効にする」をクリック
6. 画面上部に表示される **databaseURL** をコピー
   - 例：`https://ichigo-farm-xxx-default-rtdb.asia-southeast1.firebasedatabase.app`

### 2-5. セキュリティルールを設定
1. Realtime Database の「**ルール**」タブをクリック
2. 以下に書き換えて「**公開**」ボタンを押す：

```json
{
  "rules": {
    "farm": {
      ".read": true,
      ".write": true
    }
  }
}
```

---

## STEP 3: アプリにFirebase設定を貼り付け

1. プロジェクトフォルダの `.env.local.example` を開く
2. **コピーして** `.env.local` という名前で保存
3. STEP 2-3・2-4 でコピーした値を貼り付ける：

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABC...（コピーした値）
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ichigo-farm-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://ichigo-farm-xxx-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ichigo-farm-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ichigo-farm-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## STEP 4: Claude Code でアプリを起動・確認

### Claude Code のターミナルで実行：

```bash
# プロジェクトフォルダに移動
cd ichigo-farm-tracker

# パッケージをインストール（初回のみ）
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開いて確認 ✅

---

## STEP 5: Vercel にデプロイ（URL発行）

### 5-1. Vercel アカウント作成
1. https://vercel.com にアクセス
2. 「Continue with GitHub」でGitHubアカウントでログイン
   - GitHubアカウントがない場合は無料で作成

### 5-2. GitHubにコードをアップロード
Claude Code のターミナルで：

```bash
# Gitリポジトリを初期化
git init
git add .
git commit -m "first commit"

# GitHubでリポジトリを新規作成後：
git remote add origin https://github.com/あなたのID/ichigo-farm.git
git push -u origin main
```

### 5-3. Vercel にデプロイ
1. Vercel ダッシュボードで「**New Project**」
2. GitHubのリポジトリ `ichigo-farm` を選択
3. 「**Environment Variables**」を展開
4. `.env.local` の7つの変数をすべて入力
5. 「**Deploy**」をクリック → 2〜3分で完了

### 5-4. URLをスタッフに共有
`https://ichigo-farm-xxx.vercel.app` のような URL が発行されます。
このURLをLINEグループに貼るだけで10人全員が使えます！🎉

---

## 使い方

| 操作 | 説明 |
|------|------|
| 初回起動 | 名前を入力（デバイスに保存） |
| ベッドをタップ | ステータスを変更 |
| ✅ 完了 | 葉かき終わったベッド |
| 🔄 途中 | 作業中のベッド |
| ⬜ 未着手 | これから作業するベッド |
| 右上の名前 | タップで名前変更 |

---

## ❓ トラブルシューティング

**Q: データが反映されない**
→ Firebase の databaseURL が `.env.local` に正しく入っているか確認

**Q: `npm install` でエラー**
→ Node.js のバージョンを確認（v18以上推奨）

**Q: 名前を変更したい**
→ 右上の名前ボタンをタップ

---

## 📞 サポート

困ったことがあれば、Claude に「ichigo-farm のエラーが出た」と伝えて
エラーメッセージをコピペしてください。すぐ解決します！
