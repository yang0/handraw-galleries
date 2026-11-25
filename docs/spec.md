# Handraw 扩展图库插件规范（Format 1）

## 1. 市场索引文件 `index.json`

市场源是一个标准的 UTF-8 JSON 文件，顶层字段如下：

```json
{
  "format": 1,
  "title": { "zh": "图库市场名称", "en": "Gallery Market Title" },
  "description": { "zh": "简介", "en": "Description" },
  "metadata": {
    "categories": {
      "pose": { "title": { "zh": "人体姿态", "en": "Poses" } }
    },
    "labels": {
      "open-source": { "title": { "zh": "开源图鉴", "en": "Open Source" } }
    }
  },
  "galleries": [
    {
      "id": "hairstyles-demo",
      "version": "1.0.0",
      "name": "示例发型图鉴",
      "nameEn": "Sample Hairstyles",
      "badge": "60 款发型",
      "description": "精选日常与古风手绘发型参考",
      "author": "your-name",
      "license": "MIT",
      "homepage": "https://github.com/your-name/your-gallery",
      "categories": ["portrait"],
      "labels": ["open-source", "local-only"],
      "localOnly": true,
      "promptRole": "hairstyle",
      "supportsRefImage": true,
      "source": {
        "type": "json",
        "url": "https://raw.githubusercontent.com/your-name/your-gallery/main/gallery.json",
        "mirrors": {
          "gitee": "https://gitee.com/your-name/your-gallery/raw/main/gallery.json",
          "github": "https://raw.githubusercontent.com/your-name/your-gallery/main/gallery.json"
        }
      }
    }
  ]
}
```

### ID 约束
- 仅允许小写字母、数字、短横线、下划线（`^[a-z0-9][a-z0-9_-]{0,40}$`）。
- 禁止使用系统内置保留 ID：`styles`、`layouts`、`colors`、`tones`、`assets`、`characters`、`props`、`scenes`。

---

## 2. 三种 `source.type` 规范

### 2.1 `type: "json"`（声明式图库 JSON，推荐）
客户端拉取 `source.url`（如有 `mirrors` 则优先按用户所选镜像拉取），JSON 结构遵循手绘风 `Registration` 规范（参见 [examples/sample-gallery.json](../examples/sample-gallery.json)）：
- 每个 `item` 可填写 `id`、`name`、`nameEn`、`category`、`categoryName`、`tags`、`traits`、`promptZh`、`promptEn`、`remoteImage`、`remoteThumb`，以及可选的多角度 `variants`。
- 若 `remoteImage` / `remoteThumb` 为相对路径（如 `images/hs-01.webp`），客户端会自动基于 `source.baseUrl` 或 JSON 文件所在目录拼接完整 URL，并在浏览/使用时自动按需缓存到本机 `<galleriesDir>/cache/<id>/`。

### 2.2 `type: "zip"`（本地打包图库 ZIP）
- 压缩包根目录（或唯一顶层子目录）需包含 `gallery.json`（或 `<id>.json`）以及相对引用的图片目录（如 `images/...`）。
- 客户端会做安全路径检查（拒绝 `..` 路径穿越）并解压到 `<galleriesDir>/<id>/`，解压后可完全离线浏览和引用。

### 2.3 `type: "ruic-poseatlas"`（RuiC-PoseAtlas 适配源）
- 通过 `packId`（`ruic-poses` / `ruic-costumes` / `ruic-faces`）与 `mirrors` 适配 RuiC-PoseAtlas 开源仓库数据结构与 5 视角姿势图鉴。
