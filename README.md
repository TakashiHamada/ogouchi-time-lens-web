# 小河内タイムレンズ — 公式Webサイト

**奥多摩町町制施行70周年記念事業**

1957年、小河内ダムの完成により湖底に沈んだ小河内村。
スマートフォンをかざすと、かつての村の暮らしが浮かび上がる——
奥多摩湖の底に眠る記憶を蘇らせるARプロジェクト「小河内タイムレンズ」の公式サイトです。

## サイト概要

| セクション | 内容 |
|---|---|
| **はじめに** | 小河内村の歴史とプロジェクトの背景 |
| **紹介動画** | プロモーション映像（YouTube） |
| **アプリ** | WebARアプリの機能紹介とスクリーンショット |
| **伝統芸能** | 鹿島踊り・川野車人形・獅子舞・民話のデジタルアーカイブ |
| **開発チーム** | スタッフクレジットとSpecial Thanks |
| **お問い合わせ** | Google Formsへのリンク |

## 技術構成

- **HTML / CSS / Vanilla JS** — フレームワーク・ビルドツール不使用
- **GitHub Pages** でホスティング
- Google Fonts（Noto Serif JP / Noto Sans JP）
- Google Analytics（本番環境のみ）
- レスポンシブ対応（モバイル〜デスクトップ）

## ローカルでの確認

```bash
# リポジトリをクローン
git clone https://github.com/code-for-okutama/ogouchi-time-lens-web.git
cd ogouchi-time-lens-web

# 任意のローカルサーバーで起動（例）
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## リンク

- **公式サイト**: https://code-for-okutama.github.io/ogouchi-time-lens-web/
- **ARアプリ**: https://code-for-okutama.github.io/ogouchi-time-lens/
- **X (Twitter)**: https://x.com/kawanokuruma
- **Instagram**: https://www.instagram.com/kawanokuruma/

## ライセンス

&copy; 2026 川野車人形保存会. All rights reserved.
