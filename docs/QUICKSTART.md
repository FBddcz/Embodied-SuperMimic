# 本地启动：没有隐藏的个人环境

## 依赖

- Python **3.9及以上**。网页预览与文件检查只用标准库，不用pip安装。
- 浏览器支持 H.264 MP4。既往 Chrome 播放回归不等于本次发布或 Safari 实机验收；浏览器自动播放设置可能要求手动点击 Play。
- GPU、CUDA、模型权重、API key：**本次网页预览不需要**。

## 从任意目录启动

下载或clone仓库后：

```bash
python3 Embodied-SuperMimic/scripts/serve.py --port 8765
```

脚本用自己的位置寻找 `../site`，不依赖当前终端目录，不写用户home，不修改系统Python。

如果已经进入仓库根目录：

```bash
python3 scripts/serve.py --port 8765
```

打开 http://127.0.0.1:8765/#gallery 。只绑定127.0.0.1，不对公网开放。退出使用Ctrl+C。

Windows可使用 `py -3`。端口冲突时换成 `--port 8766`。

## 修改与检查

- 页面文字：`site/index.html`。
- Gallery列表和视频路径：`site/static/js/gallery.js`。
- Gallery布局：`site/static/css/gallery.css`；全站样式：`site/static/css/index.css`。
- 片段和封面：`site/static/videos/rollouts/<robot>/<task>/`。
- 历史结果与新协议状态：`results/mainline.json`（HOME 实现中、尚无分数）。
- 公开协议概要：`docs/EXPERIMENTS.md`；Pages 页面也保留简明说明。

```bash
python3 scripts/check_site.py
```

检查涵盖站内资源、锚点、Gallery 素材、公开文件白名单、manifest 大小/哈希、元数据及发布目录边界。改变公开文件后需同步更新 manifest，不能静默忽略失败。检查不联网、不验证归档原始评测文件或远端部署。

`python3 scripts/test_preview.py` 是本地服务器单元测试：只在临时目录对短生命周期的本机 HTTP 服务发请求，不启动正式预览服务，也不是浏览器或 Pages 部署验收。

## 缓存与视频

预览服务器对响应设置no-store，支持MP4单段Range请求，便于拖动进度。线上GitHub Pages有自己的缓存策略；修改素材时使用版本路径，不覆盖文件后假定所有访问者立即更新。

## 这不是训练环境安装指南

当前仓库不含训练引擎。不能用这个预览命令启动机器人训练；训练包的依赖和数据下载入口要等审核后的独立发布。详见 [REPRODUCIBILITY.md](REPRODUCIBILITY.md)。
