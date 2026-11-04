# Release status

Snapshot: November 4, 2026. **Website-only research preview, deployed to GitHub Pages.** The publisher verified the public repository and deployment of commit `243bb861ee76caf0695fc070b6572fb19a3a2389` at https://fbddcz.github.io/Embodied-SuperMimic/ : HTTPS index, CSS/JS, the three long-video hashes and HTTP Range 206. Browser interaction and mobile layout were not verified because the preview safety classifier was unavailable.

The prior reader-first website redesign is superseded. This restoration preserves the established English layout, fonts, title, buttons and gallery, adding only a five-arm hero strip and factual labels. The Chinese README retains its reader-first structure and adds looping GIF derivatives. This local restoration requires its own publication verification; experimental result values and original media are unchanged. No project paper or full algorithm package is published.

## Protocol migration

`home_fulltask_v1` is approved and implementation is in progress. It is not yet frozen, and **there are no new HOME scores**. Do not describe old start-state intervention diagnostics as completed HOME evaluation. The [public protocol overview](EXPERIMENTS.md#home_fulltask_v1) states intended starts, task boundaries, splits, budgets, counting and acceptance gates. Planned sample counts and training budgets are not completed experiments.

All current numeric results are historical `legacy_reset_v0` mixed reset-bank results. Original numbers, teacher identities and recorded evaluation hashes are retained. The new HOME main table, HOME-jitter appendix and legacy table must remain separate.

## Evidence coverage

- Target: five robots × five tasks, 25 independent experts. Formal legacy teacher coverage: **8/25** (five mug_hang, three lemon).
- **25/25 environment contracts** passed in the historical snapshot. This is not 25/25 task completion, bank readiness or HOME validation.
- New square/drawer/box development-bank probes: six passed, nine failed/blocked. Failures and reasons remain visible; blocked does not mean 0% policy success or physical impossibility.
- PiPER, UR5e and xArm7 v7 results use one training seed. Labels 3000 and 4000 are reported separately and include a 1000 initialization offset; teacher pretraining and BC are additional costs.
- xArm7's reviewed legacy summary is 51.95% at 3000 and 57.81% at 4000; final type-0 1/64. This corrects a stale “training/pending” label, without fabricating raw hashes or unprovided category counts.
- Drawer is **place-and-close with the drawer preopened**, not a full open-place-close task. Same-robot five-task mixed training is not completed.

## Media and licensing boundary

Existing project-generated local simulation media remain in the whitelist as noncommercial research illustrations. Teacher clips stay Teacher even where a later Dyna score exists. Selected successful or intermediate-reset episodes do not establish full-task success; the three reviewed long clips use real-time control timing, older captures have legacy timing, and the teaser is edited.

Original third-party notices are preserved. ShapeNet mug provenance and published terms are explicitly attributed in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). A code license is not blanket media/model permission; the preview makes no general rights-clearance or downstream commercial-use claim. No third-party reference video is bundled. Raw model/database redistribution is not authorized as part of this website release. Any concrete asset-specific restriction identified before publication must be resolved or the affected item omitted by the release owner.

## Checks for subsequent updates

1. Review the exact public file allowlist and stage all approved edits; do not publish the stale pre-audit index or any experimental working tree.
2. Run `python3 scripts/check_site.py`, JS/Python syntax checks, preview-server unit tests and desktop/mobile player checks. Hashes and byte counts in `site/release-manifest.json` must match the final files.
3. Resolve any failed checks or concrete rights issue. Preserve license originals and all required attribution.
4. Publish approved contents to the created public repository and configure Pages only after review. The workflow deploys **only `site/`**, on `main`; local uncommitted edits do not deploy.
5. Verify the actual HTTPS page, project subpath, CSS/JS, all gallery media, seeking/Range and mobile layout. Record the real commit, URL and deployment outcome after success; a planned URL is not an acceptance result.

The local restoration does not itself commit, push or deploy any update. Browser checks, if run, are local preview checks, not proof of GitHub Pages deployment. A future algorithm/model/data release has separate provenance and reproducibility gates in [REPRODUCIBILITY.md](REPRODUCIBILITY.md).
