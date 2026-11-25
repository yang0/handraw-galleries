# 手绘风扩展图库标准规范（Format 1）

手绘风（Handraw）扩展图库市场采用 **两层统一标准接口**：

1. **市场注册表（Market Registry `index.json`，Format 1）**：负责收录与发现图库，任何第三方组织或个人也可自建 `index.json` 供客户端订阅。
2. **标准图库清单（Gallery Manifest `gallery.json`，Format 1）**：每个图库本身的数据契约。无论单图库、多视角图库（如 5 视角姿势）、远程图床多镜像还是离线 ZIP 整包，全部使用同一套标准接口，客户端无需针对任何图库写专属代码。

---

## 一、标准图库清单规范（`gallery.json`，Format 1）

### 1.1 顶层字段

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `format` | 是 | `number` | 固定为 `1` |
| `id` | 是 | `string` | 唯一标识，匹配 `^[a-z0-9][a-z0-9_-]{0,40}$`，**不可使用内置保留 ID** |
| `version` | 推荐 | `string` | 语义化版本号（如 `"1.0.0"`），用于客户端提示更新 |
| `name` | 是 | `string` | 图库中文/主显示名称 |
| `nameEn` | 否 | `string` | 英文名称 |
| `description` | 推荐 | `string` | 简介 |
| `icon` | 否 | `string` | Emoji 图标（如 `"🧍"`、`"🎨"`） |
| `author` | 推荐 | `string` | 作者或组织名 |
| `license` | 推荐 | `string` | 开源/版权协议（如 `MIT`、`CC-BY-4.0`、`CC0-1.0`） |
| `upstreamUrl` | 否 | `string` | 项目主页或仓库地址（`https://`） |
| `promptRole` | 否 | `string` | 参考角色提示词语义：`pose` / `costume` / `face` / `character` / `scene` / `prop` / `style` / `layout` / `custom` |
| `supportsRefImage` | 否 | `boolean` | 默认 `true`；设为 `true` 时支持在生图工作台作为参考图加入 |
| `localOnly` | 否 | `boolean` | 默认 `true`（仅本机缓存，不上传至网站） |
| `multiVariant` | 否 | `boolean` | 是否为多视角/多变体图库 |
| `imageMirrors` | 否 | `object` | 远程图片多镜像前缀映射，如 `{"gitee": "https://.../raw/main/", "github": "https://raw.githubusercontent.com/.../main/"}`。客户端按用户所选镜像优先拉取，失败自动切备用镜像 |
| `imageBaseUrl` | 否 | `string` | 单一远程图片根路径（`https://.../`）；未设置且无 `imageMirrors` 时默认以 `gallery.json` 所在目录为基准 |
| `items` | 是 | `Item[]` | 非空素材条目数组 |

**系统内置保留 ID（不可占用）**：`styles`、`layouts`、`colors`、`tones`、`assets`、`characters`、`props`、`scenes`。

### 1.2 单图条目（`Item`）

```json
{
  "id": "chair-001",
  "name": "复古藤编扶手椅",
  "nameEn": "Vintage Rattan Armchair",
  "category": "furniture",
  "categoryName": "家具道具",
  "tags": ["藤编", "复古", "暖色"],
  "traits": "法式藤编木框，温暖自然光",
  "promptZh": "参考复古藤编扶手椅的材质与轮廓",
  "promptEn": "vintage rattan wooden armchair",
  "remoteThumb": "thumbs/chair-001.webp",
  "remoteImage": "images/chair-001.png",
  "author": "YourName"
}
```

- **远程清单模式（`source.type = "json"`）**：填写 `remoteImage`（及可选 `remoteThumb`），既可以是相对路径（自动拼接 `imageMirrors` / `imageBaseUrl`），也可以是完整 `https://` 链接。客户端浏览或生图时按需下载并缓存到本机，安装过程秒级完成。
- **离线 ZIP 模式（`source.type = "zip"`）**：填写相对路径 `image`（及可选 `thumb`），并将图片随 `gallery.json` 一起打包进 `.zip` 根目录（或单层子目录），安装后完全离线可用。

### 1.3 多视角/多变体条目（`Item.variants[]`）

适用于人体多视角姿势、角色三视图、同款多配色服饰等场景：

```json
{
  "id": "pose-001",
  "name": "回眸站姿",
  "nameEn": "Looking Back Standing",
  "category": "站姿",
  "categoryName": "站姿",
  "tags": ["基础", "站姿"],
  "traits": "基础 · 站姿 · 3视角",
  "promptZh": "参考人物姿态：回眸站姿",
  "remoteThumb": "thumbs/pose-001_front.webp",
  "remoteImage": "images/pose-001_front.jpg",
  "variants": [
    { "key": "front", "label": "正面", "labelEn": "Front", "remoteThumb": "thumbs/pose-001_front.webp", "remoteImage": "images/pose-001_front.jpg" },
    { "key": "diagonal", "label": "斜侧", "labelEn": "Three-quarter", "remoteThumb": "thumbs/pose-001_diag.webp", "remoteImage": "images/pose-001_diag.jpg" },
    { "key": "side", "label": "侧面", "labelEn": "Side", "remoteThumb": "thumbs/pose-001_side.webp", "remoteImage": "images/pose-001_side.jpg" }
  ]
}
```

---

## 二、市场注册表规范（`index.json`，Format 1）

市场索引文件用于被客户端订阅，记录每个可安装图库的元信息与下载地址：

```json
{
  "id": "my-gallery-id",
  "version": "1.0.0",
  "name": "图库中文名",
  "nameEn": "My Gallery",
  "badge": "120 张素材",
  "description": "一句话说明图库内容与适用场景。",
  "author": "AuthorName",
  "license": "CC-BY-4.0",
  "homepage": "https://github.com/you/my-gallery",
  "categories": ["scene"],
  "labels": ["community", "open-source", "local-only"],
  "multiVariant": false,
  "localOnly": true,
  "promptRole": "scene",
  "supportsRefImage": true,
  "source": {
    "type": "json",
    "url": "https://raw.githubusercontent.com/you/my-gallery/main/gallery.json",
    "mirrors": {
      "gitee": "https://gitee.com/you/my-gallery/raw/main/gallery.json",
      "github": "https://raw.githubusercontent.com/you/my-gallery/main/gallery.json"
    },
    "upstreamUrl": "https://github.com/you/my-gallery",
    "mirrorUrl": "https://gitee.com/you/my-gallery"
  }
}
```

### `source.type` 说明（仅允许通用标准类型）

1. **`json`**（推荐）：指向符合本文第一节规范的 Format 1 `gallery.json`。推荐同时在 `source.mirrors` 中提供 `gitee` 与 `github` 两个地址，方便国内外用户流畅安装。
2. **`zip`**：指向离线 `.zip` 压缩包（内含 `gallery.json` 与相对路径图片，单包上限 150 MB，单图上限 25 MB，禁止包含 `..` 或绝对路径）。

---

## 三、自动化校验

仓库内置零依赖校验脚本，所有 PR 均会自动运行：

```bash
# 本地校验 index.json 结构
node scripts/validate.mjs

# 同时拉取远程 gallery.json / zip 校验接口合规性
node scripts/validate.mjs --check-remote
```
