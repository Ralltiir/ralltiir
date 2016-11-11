# Superframe 项目开发流程

Superframe项目源码使用Git进行版本控制。本文档描述了该项目的开发流程。
包括：开发，测试，提交，Review，发布等环节。

## 概述

每个开发者拥有一个Superframe的仓库副本，在新的分支上进行开发。
最终提交该分支的代码，由管理员Review代码并合并到主分支。
主分支用于发布和部署。

角色   | 职责 | 权限
---    | ---  | ---
开发者 | 在新的分支上进行特性开发，风格检查，测试，提交，Push | master只读，其他读写
管理员 | 合并特性分支，回归测试，触发上线流程 | 所有分支读写

## 目标

在满足团队所有成员快速开发的同时，保证流畅的特性合并以及低风险的部署。
这要求：

1. 公共可见的分支具有良好的命名。
2. Commit信息清晰明确。
3. 严格的分支权限控制。

关于Git项目的命名风格和开发规范，请查阅：<http://gitlab.baidu.com/psfe/spec/blob/master/develop-style.md>

## 特性开发

每个特性、Bug都应在新的仓库上进行开发。首先Fork并克隆仓库副本：

```bash
git clone xxx
```

为每个新特性创建新的分支（推荐）：

```bash
git checkout -b feature-x
```

在该分支进行修改，并可以随时Push到对应的远程分支，例如`origin/feature-x`：

```bash
git push origin feature-x
```

然后发起Pull Request到superframe。

> 代码风格请参考： <http://gitlab.baidu.com/psfe/superframe/wikis/coding-style-guide>

## 特性提交

在提交你开发的特性前，需要先运行代码风格检查和测试。
都通过后，才能发起Pull Request。在准备提交特性前请按下列步骤操作：

1. 运行代码风格检查；
2. 运行单元测试，修复所有的Fail；
3. 衍合到主分支；
4. 再次运行单元测试，如有错误修复后请再次运行代码风格检查；
5. Push到远程仓库；
6. 发起Merge Request。

### 代码风格检查

可使用JSHint进行代码风格检查。所有成员应保有一份JSHint配置文件以配置自己的编辑器。
同样一份配置文件将用于自动化的代码风格检查。

> 如有服务器权限，可设置Git Hook

### 单元测试

为了方便管理员进行Review和分支合并，在提交前请进行单元测试。务必100%通过。
测试代码风格请参考： <http://gitlab.baidu.com/psfe/superframe/wikis/test-style-guide>

> 如有服务器权限，可设置Git Hook

### 衍合主分支

在你开发的过程中，主分支可能已经发生了变化。
你有责任在发起Merge Request前解决和主分支的冲突。
因为你没有主分支的写权限应当做一次Rebase（衍合），这样你的分支是就是主分支的fast-forward。
也方便管理员进行分之合并。

```bash
# 获取最新的主分支
git fetch
# 检出你的开发分支
git checkout feature-x
# 衍合
git rebase master
```

注意：在`rebase`后仍然需要进行单元测试，以保证没有冲突。

## 分支合并

分支合并是管理员的职责。请按下列步骤进行：

1. 对Merge Request进行代码Review。
2. 拉取被合并的分支。
3. 进行单元测试（以及集成测试），以保证其他成员仍可正常工作。
4. 如通过则进行Merge，否则Reject。

```bash
# 检出目标分支
git fetch
git checkout feature-x

# 运行单元测试

# 合并分支
git checkout master
git merge feature-x
git push origin master
```

可通过commit信息（分支合并和普通的commit）关闭某个Issue，本次commit的代码改动将会被关联到对应的Issue上。
例如：<http://gitlab.baidu.com/MIP/mip-validator/issues/15>

相关文档：<https://help.github.com/articles/closing-issues-via-commit-messages/>
