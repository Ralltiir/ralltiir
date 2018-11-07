# Ralltiir 开发

我们欢迎你对Ralltiir提出建议或参与开发

## 开发指南

首先确保已经有 Node.js 环境，然后 npm 安装所有依赖：

```bash
npm install
```

完成开发后确保可以通过 Lint 和单元测试可以通过：

```bash
npm run lint
npm run test
```

使用 NPM version 发布到 npm 和 Github，例如发布一个 patch 版本：

```bash
npm version patch
npm publish
```

## 文档部署

首先安装 gitbook 依赖：

```bash
npm run doc:install
```

本地预览文档：

```bash
npm run doc:preview
```

部署到 <ralltiir.github.io/ralltiir>：

```bash
npm run doc:deploy
```
