# 向手绘风扩展图库市场提交 PR（投稿指南）

欢迎任何个人、画师或开源项目向 **手绘风扩展图库市场（handraw-galleries）** 提交图库！
只要你的图库符合 [Format 1 标准接口规范](docs/spec.md)、版权清晰且可公开访问，提交 PR 并通过自动校验后即可被收录，所有手绘风客户端用户都能在 **画廊 → 🧩 扩展图库** 中一键发现与安装。

## 投稿步骤

### 1. 准备你自己的图库仓库（或 Release）
你可以选择以下任意一种标准交付形态：
- **方式 A（推荐）：标准声明式清单 `gallery.json`**
  - 参考 [`examples/sample-gallery.json`](examples/sample-gallery.json)（单图）或 [`examples/sample-multivariant-gallery.json`](examples/sample-multivariant-gallery.json)（多视角/多变体）。
  - 可参考官方标准适配示例仓：[yang0/handraw-gallery-ruic-poseatlas](https://github.com/yang0/handraw-gallery-ruic-poseatlas)。
  - 强烈建议同时在 Gitee 或国内 CDN 提供镜像，并在 `gallery.json` 的 `imageMirrors` 字段中配置双镜像。
- **方式 B：离线整包 `.zip`**
  - 在 ZIP 根目录放入符合 Format 1 的 `gallery.json` 及对应相对路径图片（如 `images/*.webp`），单包不超过 150 MB。

### 2. 在本机手绘风客户端中实测
打开手绘风桌面端 → **画廊** → **🧩 扩展图库** → **🔗 链接直装**，粘贴你的 `gallery.json` 或 `.zip` 链接，确认：
- 能正常安装并在画廊标签栏出现；
- 分类筛选、搜索、缩略图/原图预览（以及多视角切换）全部正常；
- 在生图工作台点击「添加参考图」可正常选中并带入参考。

### 3. 编辑 `index.json` 并运行校验
Fork 本仓库，在 `index.json` 的 `galleries` 数组末尾添加你的条目，然后运行：

```bash
node scripts/validate.mjs --check-remote
```

确认输出 `Validation passed`。

### 4. 提交 Pull Request
向 `yang0/handraw-galleries` 的 `main` 分支提交 PR（按 PR 模板填写信息）。GitHub Actions 会自动运行 `validate.mjs --check-remote` 校验格式与可访问性；合并后将同步至 Gitee 国内镜像。

## 审核基本原则
- **接口合规**：必须使用标准 `json` 或 `zip` 接口并通过 `validate.mjs --check-remote`。
- **版权清晰**：必须声明明确的开源或创作共用协议（如 `MIT`、`CC0-1.0`、`CC-BY-4.0` 等），禁止收录侵犯他人版权或违法违规内容。
- **命名不冲突**：`id` 须全局唯一且不得与内置画廊保留 ID 冲突。
