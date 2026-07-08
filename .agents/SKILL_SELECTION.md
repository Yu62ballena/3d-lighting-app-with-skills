# スキル選定結果 (SKILL_SELECTION.md)

## 概要
「器ライティングシミュレーター」プロトタイプ開発に向けて、必要なスキルを自動選定・配置しました。

## 選定プラン

### タスク
飲食店メニュー写真撮影のライティングをThree.js上でシミュレーションするツールの開発

### 選定カテゴリ
- `frontend`
- `design`

### 配置したスキル一覧
- **threejs-skills** (source: aas)
  - 役割：WebGL・Three.jsを用いた3Dグラフィックス・インタラクティブシーン全体の基礎構築。
- **threejs-lighting** (source: aas)
  - 役割：各種光源（特にRectAreaLightなどの面光源）の設定、光量調整。
- **threejs-loaders** (source: aas)
  - 役割：USDZモデルの読み込み、GLBへのフォールバック処理。
- **threejs-interaction** (source: aas)
  - 役割：TransformControlsを使用したドラッグ操作とカメラ制御（OrbitControls等）。
- **threejs-postprocessing** (source: aas)
  - 役割：EffectComposerやShaderPassによるポストプロセスの適用（白飛び検出の準備）。
- **threejs-shaders** (source: aas)
  - 役割：白飛び検出用カスタムフラグメントシェーダーの実装。

### 重複・補完判定
- 今回のカテゴリ (`frontend`, `design`) に `source: user` のスキルは未登録のため、すべて `source: aas` のスキルを採用。
- 各スキルは役割が明確に分かれており、重複なく「器ライティングシミュレーター」に必要な技術を補完し合っています。
