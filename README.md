# 手绘风官方图库市场（Handraw Official Gallery Market）

> 关联项目：[handraw-client](https://github.com/yang0/handraw-client) · [handraw-plugins](https://github.com/yang0/handraw-plugins) · [handraw-style](https://github.com/yang0/handraw-style)

本仓库是**手绘风桌面客户端**的官方扩展图库插件市场索引（`Format 1`），用于统一收录和分发可选的视觉参考图库插件。所有扩展图库均采用**按需选装、仅本机缓存**策略，用户可在客户端「画廊 → 扩展图库」市场中自由浏览、安装、更新或卸载。

## 市场订阅地址

客户端已默认内置订阅：

```text
https://raw.githubusercontent.com/yang0/handraw-galleries/main/index.json
```

你也可以基于相同格式搭建自己的私有或社区图库市场，并在客户端「扩展图库市场 → 添加图库源」中一键订阅。

## 当前收录图库

| ID | 名称 | 规模 / 特性 | 分类 | 协议 | 来源 |
| --- | --- | --- | --- | --- | --- |
| `ruic-poses` | 姿态图鉴 | 288 组 × 5 视角 | 人体姿态 | MIT | [RuiC-PoseAtlas](https://github.com/HRuiCcc/RuiC-PoseAtlas) |
| `ruic-costumes` | 衣装图鉴 | 1,407 套服饰单品 | 服装穿搭 | MIT | [RuiC-PoseAtlas](https://github.com/HRuiCcc/RuiC-PoseAtlas) |
| `ruic-faces` | 人像图鉴 | 1,499 张人像造型 | 人像与造型 | MIT | [RuiC-PoseAtlas](https://github.com/HRuiCcc/RuiC-PoseAtlas) |

## 如何新增或投稿一个图库插件

支持三种图库插件分发形态（详见 [docs/spec.md](docs/spec.md) 与 [examples/sample-gallery.json](examples/sample-gallery.json)）：

1. **声明式 JSON 图库（`type: "json"`，推荐）**：只需提供一个标准图库 JSON 文件链接，图片按需从远端缓存到用户本机，安装秒级完成。
2. **离线 ZIP 图库包（`type: "zip"`）**：把 `gallery.json` 与 `images/` 打包成单个 ZIP，安装后离线可用。
3. **第三方开源图鉴适配器（如 `type: "ruic-poseatlas"`）**：适配已有开源图鉴仓库格式与多镜像源。

提交 PR 将你的图库条目加入 `index.json`（确认素材来源合规且明确标注协议），审核合并后，所有手绘风客户端用户即可在图库市场直接看到并一键安装，**无需更新客户端程序**。
