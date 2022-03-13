<p align="center">
	<img width='100px' src='https://cdn.jsdelivr.net/gh/yesmore/img/img/logo-der.png' alt='der'/>
</p>
<p align="center">
    <a href="https://www.npmjs.org/package/@der-cli/core" target='_blank'>
    	<img src="https://img.shields.io/npm/v/@der-cli/core?style=flat-square">
    </a>
    <a href="https://npmcharts.com/compare/@der-cli/core?minimal=true" target='_blank'>
    	<img src="https://img.shields.io/npm/dt/@der-cli/core?style=flat-square">
    </a>
    <a href="https://www.lernajs.cn/" target='_blank'>
    	<img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square">
    </a>
    <br>
    <img src="https://img.shields.io/github/stars/der-cli/der-cli.svg?logo=github&style=flat-square" alt="star"/>
	<img src="https://img.shields.io/github/license/der-cli/der-cli?style=flat-square" alt="GPL"/>
</p>
<p align="center">⚡𝓓𝓮𝓻 - A scaffolding tool for FE</p>

### What is 𝓓𝓮𝓻?

- A **scaffolding tool** to improve development efficiency for the front end, build with **Node.js**.
- 一个提升前端开发效率的脚手架工具。

## 𝓓𝓮𝓻 can do

- [x] Create a new project
- [x] Auto commit & create a remote repo(github/gitee)
- [x] Version control(Git Flow)
- [x] Specification submission code

## Quick Start

#### 本地安装

```shell
$ npm install @der-cli/core -g
# or
$ yarn global add @der-cli/core
```

#### 初始化项目

```shell
$ mikdir mytest && cd mytest

$ der init test-demo
# 根据步骤创建即可
```

#### 提交 & 初始化 Github/Gitee

```shell
$ der go
```

该命令会在本地初始化 `.git` , 且提交代码至远程仓库。

**注意**：`der go` 会将代码提交至项目**同名**远程仓库中( **仓库名即为 package.json 的 name 属性值** )，若远程仓库不存在，则会自动创建，这需要你提前准备好你的远程仓库 APP Token，Github 用户可以在 [此处](https://github.com/settings/tokens) 申请 Token, Gitee 用户详见 [App Token](https://github.com/der-cli/cli/blob/master/docs/Documents.md#App-Token).

如果你已经创建了远程仓库，那么检查一下 package.json 文件后可直接使用该命令。

执行完该命令后，会在远程产生一个 `dev/x.x.x` 分支，版本的[提升规则]()按照标准流程执行，

#### 发布 tag

```shell
$ der go --release
# or 简写
$ der go -re
```

该命令会将代码合并到master分发删除当前版本开发分支，创建同版本 tag 分支合并到远程master分支，然后提交至远程仓库（远程与本地操作同步）。

例: dev/1.0.1 => release/1.0.1，详见 [Git_Flow](https://github.com/der-cli/cli/blob/master/docs/Documents.md#Git-Flow-自动化).

每次执行 `der go [-re]` 时，脚手架会检查代码冲突，检查通过则正常提交， 未通过会退出命令进程，这需要你手动解决代码冲突，控制台会将冲突代码位置打印出来，解决冲突再次执行即可。

## More

#### 查看模板列表

```shell
$ der tpl

# Or only project template
$ der tpl --pro
# Or only component template
$ der tpl --com
```

#### 查看本地缓存

```shell
$ der cache --all

# or 查看本地Git缓存信息
$ der cache --git [--token]
# or 查看本地模板缓存信息
$ der cache --template
# or 查看本地依赖缓存信息
$ der cache --dependencies
# or 查看App Token

```

#### 清空本地缓存

> 关于脚手架缓存，详见 [Cache 缓存](https://github.com/der-cli/cli/blob/master/docs/Documents.md#Cache-缓存).

```shell
# Default: clean all
$ der clean
$ der clean --all

# or just clean dependencies
$ der clean --dep
```

#### DEBUG 模式

```shell
$ der --debug
# or
$ der -d
```

更多命令 [详情](https://github.com/der-cli/cli/blob/master/docs/Documents.md)

#### 调试本地包

see [docs](./docs/Documents.md)

## TODO

- [ ] Add feat: add page cmd(may)

## Documents

详情参考: [docs](https://github.com/der-cli/cli/blob/master/docs/Documents.md)

## Change Log

[CHANGELOG](./CHANGELOG.md)

## Q & A

#### 1.执行完初始化后，可以直接提交代码吗？

答：可以。前提是准备好你的 [App Token](https://github.com/der-cli/cli/blob/master/docs/Documents.md#App-Token).

## Licence

Der cli is open source software licensed as [GPL](LICENSE)
