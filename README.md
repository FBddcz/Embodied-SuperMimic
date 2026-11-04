<div align="center">

# Embodied-SuperMimic

**让机械臂在世界模型中学习，把结果留在明确的评测协议里。**

[本地网站入口](site/index.html) · [网站源码仓库](https://github.com/FBddcz/Embodied-SuperMimic) · [实验与协议边界](docs/EXPERIMENTS.md) · [发布状态](docs/RELEASE_STATUS.md)

**网站优先的 research preview。公开 GitHub 仓库已创建；内容上传与 Pages 部署尚待发布者验收，不宣称网站已经上线。本项目尚无公开论文。**

**5 种本体 × 5 类任务是研究目标，不是已完成的宣传数字。**

</div>

## 当前范围

- 本仓库只提供静态网页、选定的仿真演示、精简结果、公开说明与许可声明；不是算法复现包。
- 当前所有已报告成绩均为历史 **`legacy_reset_v0` 混合复位库协议**，不等于安全 HOME 完整任务成绩。
- 新主评测 **`home_fulltask_v1` 已获实施授权，正在实现；尚未冻结，也没有新 HOME 正式分数**。本文不把先前起点干预诊断改标成新协议结果。
- Teacher、BC、Dyna 分开标注；多训练 seed、单训练 seed、不同迭代预算分别披露。
- 训练代码、复位库、权重、轨迹和原始日志不在本次网站发布范围内。独立研究项目，非 SuperMimic 官方实现。

## 本地预览

从本仓库根目录运行：

```bash
python3 scripts/serve.py --port 8765
```

打开 **http://127.0.0.1:8765/#gallery**。仅需 Python 3.9+，没有 npm 构建、API key 或 GPU 依赖。Windows 可将 `python3` 换成 `py -3`。只绑定本机，按 `Ctrl+C` 停止；端口已占用时使用 `--port 8766`。

只检查文件，不启动网站：

```bash
python3 scripts/check_site.py
node --check site/static/js/gallery.js
```

完整说明：[本地环境与目录](docs/QUICKSTART.md) · [复现边界](docs/REPRODUCIBILITY.md)。公开地址须在实际部署验收后记录，不以预定 URL 代替上线验证。

## 历史结果：legacy_reset_v0

下表是 mug_hang 的四类混合复位成绩；每个检查点 256 集（每类 64），不是 HOME 完整任务主分数。

| mug_hang | Teacher | 在线 Dyna（v7） | 说明 |
|---|---:|---:|---|
| Panda | 79.3% | 87.1 ± 8.1% @3000 | Dyna 三个训练 seed |
| ARX5 | 97.7% | 98.1 ± 1.4% @3000 | Dyna 三个训练 seed |
| PiPER | 46.1% | 85.94% @3000；92.97% @4000 | 单训练 seed；220/256、238/256 |
| UR5e | 62.5% | 68.75% @3000；69.92% @4000 | 单训练 seed；176/256、179/256；最终 legacy type-0 为 0/64 |
| xArm7 | 46.5% | 51.95% @3000；57.81% @4000 | 单训练 seed；历史核对摘要；最终 legacy type-0 为 1/64 |

- `@3000/@4000` 是总迭代标签。v7 的初始化计数为 1000，对应约 2000/3000 新增迭代；教师 WM/critic 预训练与 BC 初始化成本另外计入。**不是相同从零训练预算的胜负。**
- legacy type-0 从桌面、未抓取开始，但臂姿态采用旧广范围随机复位；它是姿态恢复压力测试，不是新 HOME 协议。其余类别包含桌面已抓握、空中已抓握、已穿柄起点；混合平均不能称完整任务成功率。
- 本体之间复位分布、夹爪近似、控制参数不同；低分反映当前配置与策略，不证明硬件能力上限。
- `results/mainline.json` 保留原计数与已有原始评测哈希。xArm7 新补的历史摘要不伪造未随包提供的逐类计数或原始文件哈希。原始文件不随本仓库分发，因此不能只凭本包重新计算其哈希。
- 视频为选定演示（通常为成功案例），不是整体成功率证据；Teacher 视频仍为教师，不会改标为 v7。短片和中途复位不证明完整从桌面抓挂。
- 三条核对过的长片按真实控制时间播放；旧片标为 legacy capture，teaser 是编辑后的蒙太奇。蓝色残影是过去姿态，不是世界模型预测。

## 获批的新主评测：home_fulltask_v1

目标仍是 Panda / ARX5 / PiPER / UR5e / xArm7 × mug_hang / lemon / square / drawer / box_in_bin 全 25 格。每格使用预先固定并验证的安全 HOME，随机物体/目标，夹爪张开且未抓取；不按测试场景临时放到预抓取位置。安全起点不等于全路径安全或真机认证。

**drawer 是预打开抽屉的放物并关抽屉，不含开抽屉。** 保持原生成功判据和时限，清零过程前缀；lemon 的原生成功也不能自动证明经历了标准抓取搬运。完整协议摘要、数据划分、计分和验收门槛见 [实验与协议](docs/EXPERIMENTS.md#home_fulltask_v1)。512 场景/格/seed、先单 seed 再三个训练 seed、4,000 总迭代基线均为待冻结的设计目标，不是已有数据。

HOME 邻域扰动 `home_jitter_v1` 与历史 `legacy_reset_v0` 独立报告，不混表、不用新旧分数之差冒充算法提升。

## 覆盖不是完成

2026-11-04 历史快照：**25/25 环境契约通过，8/25 正式教师格完成**（mug_hang 五格、lemon 三格）；新增 15 格的开发库探测 6 通过、9 失败。失败格维持 `blocked`，不是策略 0%，契约通过也不是 HOME 验证通过。逐格状态见 [实验说明](docs/EXPERIMENTS.md#legacy-development-status) 与 `results/mainline.json`。

接下来按实现、25 格安全验证、开发诊断、独立专家训练、冻结测试的顺序推进；同一本体五任务混训是后续独立阶段，尚未完成。

## 发布目录与来源

`site/` 是 Pages 唯一部署目录；`docs/`、`results/`、`scripts/` 和 `licenses/` 是仓库说明、摘要、预览/检查工具及第三方原文。`site/release-manifest.json` 为站点资产和公开元数据记录大小与 SHA256；自身不自哈希。不得把整个实验工作树、原始 bank/checkpoint/log/trajectory、内部文档、未发表论文、凭据或个人路径加入仓库。

基于 [emoPointer/supermimic_manipulation](https://github.com/emoPointer/supermimic_manipulation) 与 [SuperMimic](https://supermimic.github.io/) 方法。仿真依赖 mjlab / MuJoCo，部分机器人资产来自 MuJoCo Menagerie。原版权与混合许可边界见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)；根目录 MIT **不覆盖所有第三方模型或渲染素材**。保留现有生成演示作非商业研究说明，不分发原模型；这不等于对底层资产或下游媒体复用作全面授权保证。发现具体限制时由发布者处理。

欢迎提交浏览器问题、失败案例和复现记录，见 [CONTRIBUTING.md](CONTRIBUTING.md)。不声明官方关联、厂商背书、真机验证或安全认证。
