# Evaluation protocols and result boundaries

Snapshot: November 9, 2026. `home_fulltask_v1` development diagnostics are now available for 14 of 25 cells (five mug_hang, five lemon, four square) on 16-scene development sets, with repeat runs where available. The protocol is **not frozen** and these are **not official HOME scores**; the planned 256/512-scene frozen test has not been run. Historical `legacy_reset_v0` results remain unchanged and separately labelled.

## Historical protocol: legacy_reset_v0

Teacher means the separate robot-task baseline. v7 loads teacher world-model and critic weights, initializes its actor with behavior cloning (BC), then adds online Dyna collection and updates. Teacher pretraining, BC, initialization offset and online incremental work must be accounted for separately.

For the reported mug_hang checkpoints: 256 episodes, four reset categories with 64 episodes each, evaluation seed 100000, deterministic actor, observation noise off, startup physical randomization on, control period 0.05 s. An evaluation seed is not an independent training seed.

| Category | Legacy start condition | Interpretation |
|---|---|---|
| type-0 | Mug on table, ungrasped; broad random arm posture | Full-start posture-recovery stress test, **not HOME** |
| type-1 | Already grasped on table | Intermediate curriculum reset |
| type-2 | Already grasped in the air | Intermediate curriculum reset |
| type-3 | Handle already threaded | Intermediate curriculum reset |

The four-category mean is a **mixed reset-bank score**, not a full-task score. UR5e v7 at 4000 retains 0/64 on legacy type-0; xArm7 retains 1/64. These are policy/configuration observations, not proof of hardware impossibility. Robot-specific banks, gripper approximations, workcells and control parameters differ; morphology is not the only variable. Square, drawer and other tasks have their own categories and process criteria; the mug protocol must not be applied to them silently.

### Budget and seed accounting

- Panda and ARX5 v7 at label 3000: 87.1 ± 8.1% and 98.1 ± 1.4%, three training seeds each.
- Frozen-model controls from the same initialization: Panda 38.4 ± 7.9% across three completed seeds; ARX5 39.8 ± 12.7% across two completed seeds, with a third run diverging. The divergence remains disclosed, not silently counted as a completed score.
- PiPER: 220/256 = 85.9375% at 3000; 238/256 = 92.96875% at 4000.
- UR5e: 176/256 = 68.75% at 3000; 179/256 = 69.921875% at 4000.
- xArm7: historical reviewed summary 51.95% at 3000 and 57.81% at 4000; final type-0 1/64. Full source records are not bundled here; no unprovided raw-file hash or category breakdown is invented.
- PiPER, UR5e and xArm7 are **single-training-seed** observations. Labels 3000/4000 include an initialization offset of 1000, approximately 2000/3000 additional online iterations. They are separate budgets, not equal end-to-end compute against a from-scratch teacher.
- Historical held-out sets have been inspected during development/diagnosis; they are not advertised as a new untouched final test. Preserve old results and their labels rather than overwriting or selecting a new peak.

`results/mainline.json` retains original counts and recorded evaluation SHA256 values. Those hashes identify private archived source evaluations, not files shipped in this preview; local checks validate the public summary file, not the unavailable raw evaluations. Reported rounded multiseed summaries are not reconstructed into invented per-seed counts.

<a id="home-development-diagnostics"></a>
## Development diagnostics (November 2026)

Fourteen cells have `home_fulltask_v1` development diagnostics from teacher checkpoints: 16 independently sampled development validation scenes per cell, deterministic policy, no observation noise, native success criteria and time limits unchanged. They are development diagnostics, not official frozen HOME scores, and not the planned 256/512-scene test. Repeated runs are reported where available rather than selecting the best.

| Task | Panda | ARX5 | PiPER | UR5e | xArm7 |
|---|---|---|---|---|---|
| mug_hang | 12/16 (11/16 in an earlier run) | 7/16 | 1/16 | 9/16 | 7/16 after 8k training (1/16 before) |
| lemon | 15/16 | 0/16 (16 joint-limit) | 8/16 (8 joint-limit) | 16/16 (repeats 16/16, 15/16) | 16/16 after 8k (2/16, 4/16, 3/16 before) |
| square | 0/16 (also 0/16 at 8k and with the v2 bank) | 0/16 | blocked: bank sampling | 0/16 (16 joint-limit) | 0/16 (also 0/16 at 8k) |

- Joint-limit outcomes are configuration limitations, not task success and not evidence of hardware incapability. They stay in the denominator.
- Square: after reset-audit fixes, full reset banks and teachers were completed for four arms. All HOME development evaluations are 0/16. The original bank lacked the near-peg/above-peg insertion curriculum; a rebuilt bank (`insertion_subtypes`: near_peg / above_peg / threaded, 3,333 each in the partially-inserted category) was collected and retrained for 4,000 iterations. Training still only solves the pre-threaded start category (type-3 last-quarter success 14.6%; type-0/1/2/4 near zero) and HOME remains 0/16. Reward and curriculum changes are the next step; no success criteria were relaxed.
- Repeats show run-to-run variance in some cells; a single 16-scene diagnostic is not a stable benchmark score.

<a id="home_fulltask_v1"></a>
## Approved main evaluation: home_fulltask_v1

**Status: development diagnostics available; not frozen; no official HOME scores.** Fourteen cells have 16-scene development diagnostics (above); the planned 256/512-scene frozen test has not been run. The following is a public design overview, not a claim of completed validation or available training commands. The target remains all five robots (Panda, ARX5, PiPER, UR5e, xArm7) across all five tasks.

### Starts and task boundaries

Use a predeclared robot/task HOME, independent of each episode's randomly drawn object and goal. Prefer one HOME per robot where workcells permit; document task-specific exceptions. HOME is not an all-zero fallback, per-scene pre-grasp IK, or a hidden planner moving toward the object. The gripper starts open and empty, objects start in their native unsolved state, and the policy completes the episode without teacher takeover or intermediate resets.

| Task | Full-task start and scope | Existing time limit |
|---|---|---:|
| mug_hang | Mug on table, rack randomized, not grasped or threaded | 16 s |
| lemon | Lemon on table outside the randomized plate goal, not grasped | 32 s |
| square | Nut on table, peg base randomized, not grasped or inserted | 16 s |
| drawer | Capsule on table, cabinet randomized, drawer **already open by 0.13 m**; grasp/lift, place/release, push closed and hold | 60 s |
| box_in_bin | Box on table, bin randomized, not grasped or already inside | 16 s |

Drawer is **place-and-close from a preopened drawer**, not open-place-close. Reset all inherited process state and drawer prefix to zero. Preserve native success criteria, task time limits and the existing 0.5 s success hold; do not relax them to improve scores. Lemon's native final-state success does not by itself certify a canonical grasp-and-carry sequence: record stages separately. Resolved configurations and control periods must be frozen with the implementation.

“Safe HOME” means a validated initial state in the simulated model, not a collision-free execution guarantee or real-robot certification. Check joint order/limits, allowed contacts, open gripper, object stability, state/history reset, and small-action control response. Reachability witnesses do not prove a collision-free complete path and must not assist the policy during evaluation.

### Scene sampling, splits and accounting

- Draw scenes independently of the old random-arm bank and policy success. Record legality rules, candidate counts, rejection reasons and scene hashes; do not remove failures after scoring. Prefer shared scene IDs across robots, document workcell transforms and any configuration differences.
- Planned per-cell scales: 16 quick validation scenes, then 256 new development-validation scenes plus boundaries; 10,000 training full-start scenes, 256 development scenes, and 512 distinct final-test scenes. **These are design targets pending freeze, not completed datasets.**
- Keep separate train/dev/test namespaces and deduplicate initial-state/context hashes. Previously diagnosed held-out scenes are known diagnostic data, not a fresh final test. Pair methods and training seeds on a fixed final scene list.
- Main success rate is native success before timeout divided by all preregistered final episodes (planned denominator 512 per cell/method/training seed), with deterministic actor and no online parameter updates. Timeouts, invalid actions and episode-level numerical failures stay in the denominator with reasons. Batch infrastructure interruptions are `incomplete`, retried on the same scene list, not replaced with easier samples.
- Record true pre-reset termination states, precise episode IDs/quotas, success counts, Wilson 95% intervals, failure reasons and stage diagnostics. Three training seeds are summarized by mean and sample standard deviation; repeated evaluation seeds do not substitute for independent training runs.

### Training and release gates

Curriculum resets may remain in training, but the main score uses only full HOME starts. `legacy_train_home_eval` denotes old checkpoints on new development scenes, not newly trained HOME results. `home_train_home_eval` denotes the planned new experts. Keep native task criteria and disclose actual category weights and any recipe changes.

The intended first pass covers all 25 cells with one training seed, then adds two independent seeds. A 4000-total-iteration baseline, including existing warmup, is a **planned budget**, not a promise of success. Pre-register any task-wide longer-budget comparison on development data. Use a predeclared final checkpoint, not the best score on final test. v7 comparisons must separately disclose teacher, BC, warmup and incremental update/interaction costs.

Implementation → all-cell HOME validation → development diagnostics → independent expert training → frozen final evaluation. A cell with invalid initialization or failed sampling stays `blocked`; low policy success is a different outcome. A 25/25 environment contract does not certify HOME or curriculum-bank validity. Protocol migration, experiment coverage and multiseed evidence are separate milestones. Five-task training within each robot remains a later comparison, not part of this implementation claim.

### Keep three protocols separate

| ID | Purpose | Current public result status |
|---|---|---|
| `home_fulltask_v1` | Fixed HOME, random scene, ungrasped full task | Approved; implementation in progress; no scores |
| `home_jitter_v1` | Legal HOME-neighborhood perturbations | Planned appendix; no scores |
| `legacy_reset_v0` | Original broad-random and intermediate reset banks | Historical results preserved |

Do not pool these protocols or interpret their score difference as an algorithm improvement. A future frozen manifest must identify HOME/joint names, assets/layout/controller/config hashes, scene ranges, legality thresholds, success/time limits, splits, checkpoint hashes, seeds and actual training costs.

<a id="legacy-development-status"></a>
## Historical development status

November 4 snapshot: **25/25 environment contracts passed; 8/25 formal teacher cells** (five mug_hang, three lemon). Contracts cover model/action/observation consistency and finite short stepping, not task completion. Among 15 new square/drawer/box cells: six development-bank probes passed, nine failed. These are legacy checks, not new HOME validation.

**November 9 update:** 14/25 cells now have trained teachers and 16-scene HOME development diagnostics (five mug_hang, five lemon, four square); square remains 0/16 across the four arms with completed banks and is a diagnosed open problem (see the diagnostics section). The contract and probe counts below are the preserved November 4 snapshot.

| Task | Panda | ARX5 | PiPER | UR5e | xArm7 |
|---|---|---|---|---|---|
| mug_hang | Teacher evaluated | Teacher evaluated | Teacher evaluated | Teacher evaluated | Teacher evaluated |
| lemon | Teacher evaluated | Teacher evaluated | Teacher evaluated | Contract only | Contract only |
| square | Small bank passed | Small bank passed | Blocked: pre-grasp 0/3 | Small bank passed | Small bank passed |
| drawer (preopened) | Blocked: IK witness | Small bank passed | Blocked: IK witness | Blocked: collision/limit/grasp-lift checks | Blocked: collision/limit/grasp-lift checks |
| box_in_bin | Blocked: insufficient candidates | Small bank passed | Blocked: insufficient candidates | Blocked: insufficient candidates | Blocked: insufficient candidates |

Blocked is not 0% policy success, and a small-bank pass is not a full bank, trained expert or completed HOME evaluation. No partial matrix is reported as a complete 25-cell benchmark.

## Video interpretation

Selected simulation demonstrations are not a representative random test sample or a paired/synchronized comparison. Teacher labels identify baseline policies even when newer v7 scores exist. Some legacy clips begin from intermediate resets or omit early approach; they do not prove full table-to-rack performance. A retained opening approach does not establish a type-0 start.

The three reviewed PiPER/UR5e/xArm7 mug Teacher clips use real-time control timing (20 Hz); earlier captures have uncorrected timing, and the teaser is an edited montage. Plain and HUD Panda teacher clips are different episodes. Blue silhouettes show past poses, not world-model predictions. UR5e/xArm7 grippers use prismatic approximations rather than complete four-bar linkages.

Future HOME demonstrations must start at the formal HOME initial state, retain the uncut episode at disclosed real-time speed, and identify protocol, scene and checkpoint hashes. Selected success examples must remain labelled as such, alongside predeclared episodes including failures. Media rights and content boundaries are described in [Third-party notices](../THIRD_PARTY_NOTICES.md); attribution does not itself authorize reuse.
