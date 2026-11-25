# Handraw Official Gallery Market（手绘风官方扩展图库市场）

这是 [手绘风客户端（handraw-client）](https://github.com/yang0/handraw-client) 的**官方扩展图库插件市场仓库**。
市场采用通用、可扩展的 **Format 1 标准接口**，欢迎社区开发者和创作者提交 PR，任何符合标准接口规范的图库（单图、多视角、在线多镜像清单或离线 ZIP 整包）均可被收录，用户在桌面端按需选装、仅缓存在本机。

## 市场订阅地址（国内镜像与 GitHub 保持一致）

| 镜像 | 仓库主页 | 市场订阅索引 (`index.json`) |
| --- | --- | --- |
| **Gitee 国内镜像（默认优先）** | https://gitee.com/yang02010/handraw-galleries | `https://gitee.com/yang02010/handraw-galleries/raw/main/index.json` |
| **GitHub 官方原仓** | https://github.com/yang0/handraw-galleries | `https://raw.githubusercontent.com/yang0/handraw-galleries/main/index.json` |

手绘风桌面端默认内置上述双镜像订阅源，自动优先从国内 Gitee 镜像拉取，失败时自动回退至 GitHub。

## 当前收录图库

| ID | 名称 | 分类 | 类型 | 版本 | 协议 | 标准图库仓库 |
| --- | --- | --- | --- | --- | --- | --- |
| `ruic-poses` | 姿态图鉴（288组 × 5视角） | `pose` | `json`（标准多变体） | `1.0.0` | MIT | [GitHub](https://github.com/yang0/handraw-gallery-ruic-poseatlas) / [Gitee](https://gitee.com/yang02010/handraw-gallery-ruic-poseatlas) |
| `ruic-costumes` | 衣装图鉴（1,407 套服饰） | `costume` | `json`（标准清单） | `1.0.0` | MIT | [GitHub](https://github.com/yang0/handraw-gallery-ruic-poseatlas) / [Gitee](https://gitee.com/yang02010/handraw-gallery-ruic-poseatlas) |
| `ruic-faces` | 人像图鉴（1,499 张人像） | `portrait` | `json`（标准清单） | `1.0.0` | MIT | [GitHub](https://github.com/yang0/handraw-gallery-ruic-poseatlas) / [Gitee](https://gitee.com/yang02010/handraw-gallery-ruic-poseatlas) |

## 如何提交新图库（PR 投稿）

1. 阅读 [标准图库接口规范（Format 1）](docs/spec.md) 与 [投稿指南](CONTRIBUTING.md)。
2. 按 [`examples/sample-gallery.json`](examples/sample-gallery.json) 或 [`examples/sample-multivariant-gallery.json`](examples/sample-multivariant-gallery.json) 制作你的图库清单或离线 ZIP 包。
3. 在 `index.json` 中添加你的图库条目，运行本地与远程合规性校验：
   ```bash
   node scripts/validate.mjs --check-remote
   ```
4. 向 `main` 分支提交 Pull Request，CI 自动校验通过并合入后即可在所有手绘风客户端的 **扩展图库市场** 中展示。
