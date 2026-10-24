# 利尼恩 LINIEN 陶瓷餐具网站

保留原有设计、35 个产品系列、176 项规格和 376 个图片素材的静态品牌网站。

## 源码与素材

- 根目录 `index.html`、`style.css`、`app.js`、`data.js`：可编辑的网页源码。
- `linien-website.rar`：仓库已有的原始素材包，包含 352 个网站文件。
- `public/assets/`：原始素材包中缺失的 28 张图片。
- `scripts/build.cjs`：解包、校验、补齐图片并生成完整网站到 `dist/`。
- `.github/website-source.json`：本次 380 个原始网站文件的校验清单。
- `netlify.toml`：免费托管配置。

原仓库根目录已有的图片继续保留；构建程序以经过校验的压缩包和补齐图片生成正确的 `dist/assets/` 目录，解决原仓库图片路径错位与素材不完整的问题。

## 本地构建

安装 Node.js 20 或更高版本后运行：

```sh
npm ci
npm run build
```

构建仅使用固定版本 `node-unrar-js@2.0.2`，无需系统解压软件。成功时输出 380 个网站文件。将 `dist/` 交给任意静态 HTTP 服务器即可预览。

修改网页文案或交互时编辑根目录四个源码文件。新增或替换产品图片时，需要同步调整素材校验清单与构建素材来源。

## 以后部署到 Netlify 免费方案

1. 登录 https://app.netlify.com/ ，从 GitHub 导入 `a15994963829/linien`。
2. 选择 **Free**，生产分支为 `main`，基础目录留空。
3. 构建命令为 `npm run build`，发布目录为 `dist`；仓库配置已提供这两个值。
4. 等待构建成功，使用控制台实际分配的 `https://项目名.netlify.app` 地址。
5. 后续推送到默认分支后，由托管平台重新构建与发布。

本次仅整理 GitHub，未创建 Netlify 项目、未上线网页。实际域名需要部署成功后才能确定。

## 免费与大陆访问

截至 2026-10-24，Netlify Free 每月包含 300 credits，有硬性使用额度，用完后暂停至下个账期。请以控制台最新方案为准，不启用付费升级。

- 价格：https://www.netlify.com/pricing/
- 免费额度：https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- 免费方案允许商用项目：https://www.netlify.com/blog/introducing-netlify-free-plan/

免费平台子域名不是自有独立域名。中国大陆的运营商访问表现需上线后实测，境外托管不保证长期稳定访问。网页图片和样式均从本站加载，不依赖 Google Fonts 或外部图片 CDN。

EdgeOne 默认域名对大陆访问有限制，不作为永久免费大陆访问地址。官方规则：https://edgeone.cloud.tencent.com/pages/document/175191784523485184

## 网站行为与素材权利

收藏和补充需求保存在当前浏览器；规格 CSV 和选品清单在浏览器生成，不提交到服务器。网站不提供在线支付或后端订单系统。

保留原网站品牌、图片和文案；本仓库未授予第三方使用这些品牌素材的许可。
