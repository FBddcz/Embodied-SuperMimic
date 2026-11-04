# Third-party notices

This website-first, noncommercial research preview contains static HTML/CSS/JavaScript, project-generated simulation illustrations and selected recorded rollouts. It does **not** distribute robot meshes, task-model files, the ShapeNet database, reset banks, weights or raw trajectories. The root MIT license covers original website/tooling/documentation contributions and attributed MIT portions only, not every depicted asset or render. No blanket media-reuse or asset-clearance claim is made.

## Research and implementation attribution

- [SuperMimic](https://supermimic.github.io/): method reference; its humanoid results are not this manipulation project's results.
- [emoPointer/supermimic_manipulation](https://github.com/emoPointer/supermimic_manipulation): upstream manipulation implementation, MIT; original copyright retained in [licenses/upstream-manipulation-MIT.txt](licenses/upstream-manipulation-MIT.txt). Its README also credits the independent `zita-ch/supermimic_vibed` implementation; this website does not redistribute that training code.
- Simulation: [mjlab](https://github.com/mujocolab/mjlab) and [MuJoCo](https://github.com/google-deepmind/mujoco).
- Robot models: [MuJoCo Menagerie](https://github.com/google-deepmind/mujoco_menagerie), with model-specific terms, not a blanket repository license.
  - Franka Emika Panda: [Apache-2.0 notice](licenses/panda-Apache-2.0.txt).
  - AgileX PiPER: [MIT notice](licenses/piper-MIT.txt).
  - Universal Robots UR5e: [BSD-style notice](licenses/ur5e-BSD.txt).
  - Robotiq 2F-85: [BSD-style notice](licenses/robotiq-BSD.txt).
  - UFACTORY xArm7: [BSD-3-Clause notice](licenses/xarm7-BSD-3-Clause.txt).
- ARX5 and task assets are inherited through the manipulation implementation. The upstream code's MIT label is not proof of separate rights to every model asset; raw-model redistribution is outside this release.
- Robosuite-derived task assets: the original [notice](licenses/robosuite.txt) is retained.

## ShapeNet and generated research illustrations

The upstream manipulation README identifies the MugHang mug as a ShapeNet asset. ShapeNet is associated with Princeton University and Stanford University; see [ShapeNet](https://shapenet.org/) and its [published terms](https://huggingface.co/spaces/ShapeNet/README/blob/main/TERMS.md) (reviewed November 4, 2026). Those terms restrict database use to noncommercial research/education and disclaim IP warranties. They are not a blanket license for redistributing models or a general grant to relicense rendered media under MIT.

The existing local mug demonstrations and montage are retained as generated, noncommercial research illustrations of these experiments, not copies of reference projects' video files. This boundary does not certify all underlying IP rights or authorize downstream commercial use. Anyone reusing models or media must independently establish the applicable rights. A later model/data release needs asset-level provenance and a separate audit.

## Presentation and media scope

- All MP4/JPG/PNG files in the release manifest are local experimental renders/posters or the project's edited montage; no reference-project video is downloaded, embedded or bundled by this release. Hero/teaser are legacy presentation edits, not full HOME episodes or evidence of a completed new protocol.
- Gallery Teacher/BC/Dyna labels remain separate. Selected successful cases, intermediate resets, unverified legacy timing and the teaser's edited timing are disclosed in the page and [protocol overview](docs/EXPERIMENTS.md). Ghost poses are historical poses, not world-model predictions.
- Presentation inspiration: [MorphMimic](https://lzyang2000.github.io/morphmimic/) and SuperMimic. These are attribution links, not a permission claim for their footage, figures, code or page templates. No external reference clip is used as this project's experimental evidence. Any future imported template/code/media needs its own notice and licensing review.
- UI fonts are requested from Google Fonts: Fraunces and Nunito Sans. No font binaries are redistributed.
- Unreferenced stock sky footage, unpublished papers and private experimental artifacts are excluded. No new charts or external media were added in this release audit.

Model/vendor names identify experimental platforms only. No endorsement, official affiliation, real-hardware equivalence or safety certification is implied. Retain the original notices when redistributing portions governed by them; do not rewrite them as a single MIT asset license.
