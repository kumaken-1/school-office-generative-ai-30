import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("READMEが企画の前提と運用を説明している", async () => {
  const readme = await read("../README.md");

  for (const phrase of [
    "自由参加",
    "順番も速さも自由",
    "ランキング",
    "生成AIを開けないとき",
    "localStorage",
    "収集しません",
    "外部API",
    "個人情報",
    "材料",
    "GitHub Pages",
    "npm test",
    "npm run build:print",
    "js/challenges.js",
    "MIT License",
    "CC BY 4.0",
  ]) {
    assert.ok(readme.includes(phrase), `READMEに無い: ${phrase}`);
  }
});

test("READMEが手順・色・補足・記録の扱いを説明している", async () => {
  const readme = await read("../README.md");

  for (const phrase of [
    "手順の番号は1回目から2回目まで通しで振ってあります",
    "添付と文章が同じメッセージで、送信は1回",
    "そのままコピーして送る",
    "自分の文を貼ってから送る",
    "写真・資料を添付してから送る",
    "空欄をうめてから送る",
    "ラベルとアイコンだけで何をするか決まる",
    "押しても、マウスを乗せても開きます",
    "添付ボタンの場所",
    "端末にも保存しません",
    "sample-notice.md",
    "sample-minutes.md",
    "sample-survey.md",
    "sample-check-doc.md",
    "sample-error-screen.svg",
  ]) {
    assert.ok(readme.includes(phrase), `READMEに無い: ${phrase}`);
  }
});

// 初心者講座の増量版ではないこと、AIの答えをそのまま使わないことを、READMEで明示する。
test("READMEが対象者とAIの答えの扱いを明示している", async () => {
  const readme = await read("../README.md");

  for (const phrase of [
    "初心者向けの講座を終えた人が対象です",
    "校務そのもの",
    "校務分掌の主担当でなくても",
    "AIの回答をそのまま校務に使わないでください",
    "個人が分かる情報を取り除く手順を、添付する前の手順として示しています",
  ]) {
    assert.ok(readme.includes(phrase), `READMEに無い: ${phrase}`);
  }
});

test("廃止した仕掛けと、初心者講座の呼び方を残さない", async () => {
  const readme = await read("../README.md");
  for (const word of [
    "7つの力",
    "７つの力",
    "称号",
    "ポイント",
    "クエスト",
    "3ステップ",
    "今日のおすすめ",
    "夏の自由研究",
  ]) {
    assert.ok(!readme.includes(word), `READMEに残っている: ${word}`);
  }
});

test("練習用の素材が架空であることを明示している", async () => {
  for (const path of [
    "../assets/sample-notice.md",
    "../assets/sample-minutes.md",
    "../assets/sample-survey.md",
    "../assets/sample-check-doc.md",
  ]) {
    const material = await read(path);
    assert.match(material, /練習用/);
    assert.match(material, /実在の[^\n]*とは関係ありません/);
    assert.ok(!material.includes("クエスト"), `旧版の呼び方が残っている: ${path}`);
  }
});

// 実際の機器画面を撮らせずに試せるようにするための素材。外部を読まない自前のSVGにする。
test("練習用の画面素材が自己完結していて、架空だと分かる", async () => {
  const svg = await read("../assets/sample-error-screen.svg");

  assert.match(svg, /<svg[^>]+viewBox="0 0 \d+ \d+"/i);
  assert.match(svg, /<title[^>]*>[^<]*練習用[^<]*<\/title>/);
  assert.match(svg, /実在の[^<]*とは関係ありません/);
  assert.doesNotMatch(svg, /(?:href|src)=["']https?:\/\//i);
  assert.doesNotMatch(svg, /<script/i);
});

// READMEを読まない利用者でも素材にたどり着けるようにする。
test("講座の画面から練習用の素材へ移動できる", async () => {
  const html = await read("../index.html");

  for (const asset of [
    "sample-survey.md",
    "sample-minutes.md",
    "sample-notice.md",
    "sample-check-doc.md",
    "sample-error-screen.svg",
  ]) {
    assert.match(
      html,
      new RegExp(`<a\\s+href="\\./assets/${asset.replaceAll(".", "\\.")}"`),
      `画面から開けない素材がある: ${asset}`,
    );
  }
  assert.match(html, /すべて架空の内容で、実在の学校・自治体・人物とは関係ありません/);
});

// 巻をまたぐ行き来は片道になりやすい。Ⅰ側からⅡへのリンクと対にしておく。
test("第1巻へ戻る導線があり、記録が巻ごとに別だと分かる", async () => {
  const html = await read("../index.html");
  const readme = await read("../README.md");

  const url = "https://kumaken-1.github.io/generative-ai-summer-research-30/";
  assert.ok(html.includes(url), "画面から第1巻へ戻れない");
  assert.ok(readme.includes(url), "READMEに第1巻へのリンクがない");
  assert.match(html, /記録は巻ごとに別々です/);
  assert.match(html, /生成AI 30のチャレンジⅠ/);
});

test("コードとコンテンツのライセンスが分かれている", async () => {
  const codeLicense = await read("../LICENSE-CODE");
  const contentLicense = await read("../LICENSE-CONTENT");

  assert.match(codeLicense, /MIT License/);
  assert.match(codeLicense, /Permission is hereby granted, free of charge/);
  assert.match(contentLicense, /Creative Commons Attribution 4\.0 International/);
  assert.match(contentLicense, /CC BY 4\.0/);
});

test("404ページは自己完結していて、相対リンクで戻る", async () => {
  const html = await read("../404.html");

  assert.match(html, /<html\s+lang="ja"/i);
  assert.match(html, /<meta\s+charset="utf-8"/i);
  assert.match(html, /<meta\s+name="viewport"/i);
  assert.match(html, /<main[\s>]/i);
  assert.match(html, /<a\s+href="\.\/">[\s\S]*トップへ戻る[\s\S]*<\/a>/i);
  assert.doesNotMatch(html, /(?:src|href)=["']https?:\/\//i);
  assert.doesNotMatch(html, /<script/i);
  assert.ok(!html.includes("クエスト"), "404ページに旧版の呼び方が残っている");
});
