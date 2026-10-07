# `$reach_top` with `column-reverse`

Minimal reproduction based on [bartblast/hologram_skeleton](https://github.com/bartblast/hologram_skeleton), commit `16fe18dcec97e986b8fc23969a3114f2302e6e67`.
Uses the skeleton's unchanged lockfile: **Hologram 0.11.1**.

## Run

Use Elixir 1.19+ and Erlang/OTP 27, with Node.js/npm available.
No database is needed (the skeleton leaves its Repo supervisor disabled).

```sh
mix setup
HOLOGRAM_START=1 mix phx.server
```

In this prepared cloud environment, first run `source /workspace/setup/activate.sh`
from `/workspace/hologram_column_reverse`. Dependencies and assets are already installed.
`HOLOGRAM_START=1` enables Hologram's development compilation/runtime.

Open the application's root page. It contains two identical scroll containers;
only `flex-direction` differs. Both bind `$reach_top.within(0px)` to an action
that increments a visible counter. Non-shrinking rows ensure both boxes overflow.

1. In **column**, scroll down to the bottom, then back to the top. Repeat.
2. In **column-reverse**, the initial position is the visual bottom. Scroll up
   until Item 20 is visible at the visual top, back down, and up again.
3. Compare the counters.

Expected: a new top event on each arrival at the visual top.
The issue: the reversed box fires at its initial bottom and does not fire again
when reaching the actual visual top. The normal box increments on every return.

The component is in `app/reach_top_demo.ex`; the comparison page is in
`app/home_page.ex`. There are no changes to Hologram itself.

## Why it happens

Hologram 0.11.1's `assets/js/event_listeners.mjs` computes the distance to the top
as `element.scrollTop` and tests `distance <= threshold`. In a reversed flex
column, `scrollTop` is zero at the visual bottom and becomes negative toward the
visual top. It therefore stays within the top threshold throughout the scroll
range. The listener fires on entering the threshold (or content growth), so
scrolling up never produces another entry transition.

## Automated browser reproduction

With the server running and Chromium installed:

```sh
npm install --prefix /tmp/repro-browser --cache /tmp/npm-cache playwright@1.63.0
NODE_PATH=/tmp/repro-browser/node_modules node scripts/reproduce.cjs
```

Override `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`, or `REPRO_URL`
to use another server address. The script exercises the real Hologram page in
Chromium, checks two bottom-to-top cycles and browser errors, and prints scroll
metrics and counters. It **passes when the bug is reproduced**, rather than
asserting that the framework's behavior is correct.

Validated in headless Chromium with Elixir 1.19.5 / OTP 27: after two
bottom-to-top cycles, the normal counter was `1 → 2 → 3`, while the reversed
counter stayed at `1`. At the reversed visual top, `scrollTop` was `-720`
(a 960px content height minus a 240px viewport). No browser errors occurred.
