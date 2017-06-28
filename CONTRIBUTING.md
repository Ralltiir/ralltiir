# 贡献代码

Superframe 以开放的心态接纳外部贡献，请按以下方法做出你的贡献。

## 准备

在开始书写代码前，请先确认以下事项：

* 若你还没有，那么注册一个 GitHub 帐号
* 在 Issue 列表中检查是否有人已经在进行该工作了
* 提交一个 Issue，简要描述你希望实现的功能或要修复的问题
* 在你的电脑上安装好 `git`, `nodejs`, `make`
  * 我们强烈建议你使用 macOS / Linux 等 UNIX-Like 系统
  * 对 Windows 系统开发者，我们推荐使用 Bash On Windows

## 改动

* **Fork** superframe 仓库到你的个人命名空间中
* 使用 `git clone` 将你的个人仓库拷贝克隆到本地
* 使用 `git checkout -b` 创建一个新的分支以进行你的工作
  * 通常而言，它是基于 master 分支的
  * 建议使用 [GitHub Workflow](https://guides.github.com/introduction/flow/) 命名分支
* 使用 `npm install` 安装相关依赖
* 开发并编写测试、提交代码
  * 模块的测试文件路径应当与其代码的相对路径保持一致：例如，`src/lang/underscore.js` 对应的测试应当在 `test/lang/underscore.js` 中编写
  * 在必要的地方使用 jsdoc 书写 API 文档

## 测试

* 使用 `npm test` 运行测试
* 使用 `npm run test-reports` 检查测试覆盖率
  * 对于 bug 修复，覆盖率不得下降
  * 对于新特性，建议覆盖 80% 以上代码

## 提交

- 使用 `git rebase master` 将你的修改分支 rebase 到 master
- 在 GitHub 上发起 Pull Request，描述你的修改，并使用 `#XX` 链接到你的 Issue
- 在 GitHub GUI 上检查你的 CI 报告和测试覆盖率报告
  - 若 CI 不通过或覆盖率不满足要求，PR 可能被直接关闭