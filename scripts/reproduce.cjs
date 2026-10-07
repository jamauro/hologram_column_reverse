// Run with Playwright available in NODE_PATH; see README.md.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
    headless: true,
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.REPRO_URL || 'http://127.0.0.1:4000/');
    await page.waitForFunction(() =>
      document.querySelector('#normal-count')?.textContent === '1' &&
      document.querySelector('#reversed-count')?.textContent === '1');

    const snapshot = () => page.evaluate(() =>
      Object.fromEntries(['normal', 'reversed'].map(name => {
        const el = document.getElementById(`${name}-scroll`);
        return [name, {
          count: Number(document.getElementById(`${name}-count`).textContent),
          scrollTop: el.scrollTop,
          range: el.scrollHeight - el.clientHeight,
        }];
      })));
    const move = async edge => {
      await page.evaluate(edge => {
        for (const name of ['normal', 'reversed']) {
          const el = document.getElementById(`${name}-scroll`);
          const range = el.scrollHeight - el.clientHeight;
          el.scrollTop = name === 'normal'
            ? (edge === 'top' ? 0 : range)
            : (edge === 'top' ? -range : 0);
        }
      }, edge);
      // Allow scroll, animation-frame processing, and Hologram rendering to settle.
      await page.waitForTimeout(300);
    };

    const results = { initial: await snapshot() };
    for (let cycle = 1; cycle <= 2; cycle++) {
      await move('bottom');
      results[`bottom${cycle}`] = await snapshot();
      await move('top');
      await page.waitForFunction(expected =>
        Number(document.querySelector('#normal-count').textContent) === expected,
        cycle + 1);
      results[`top${cycle}`] = await snapshot();
      assert.equal(results[`top${cycle}`].normal.count, cycle + 1);
      assert.equal(results[`top${cycle}`].normal.scrollTop, 0);
      assert.equal(results[`top${cycle}`].reversed.scrollTop,
        -results[`top${cycle}`].reversed.range);
      assert.equal(results[`top${cycle}`].reversed.count, 1,
        'Expected the current column-reverse bug: no new top event');
    }
    assert.deepEqual(errors, [], 'Unexpected browser errors');
    console.log(JSON.stringify(results, null, 2));
    console.log('Confirmed: normal top events increase; reversed top events stay at 1.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
