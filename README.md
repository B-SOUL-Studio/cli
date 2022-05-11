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

- A **scaffolding tool** to improve development efficiency for FE, build with **Node.js**.

## 𝓓𝓮𝓻 can do

- [x] Create a new project
- [x] Auto commit & create a remote repo(github/gitee)
- [x] Version control(Git Flow)
- [x] Specification submission code

## Quick Start

#### Install CLI

```shell
$ npm install @der-cli/core -g
# or
$ yarn global add @der-cli/core
```

#### Create a project with 'der init'

```shell
$ mikdir mytest && cd mytest

$ der init test-demo
```

Before initialization, you can execute the **`der tpl`** command to see which templates are available(Network dependent).

#### Commit to Github/Gitee with 'der go'

This command initializes the repo locally (.git) and commits the code to the remote repo.

Please check:

- package.json
- App Token

```shell
$ der go
```

**Note**: ` der go` will commit the code to the remote repo with the same name of the project ( **repo name is the name attribute value of package.json**). If the remote repo does not exist, it will be created **automatically**. This requires you to prepare your remote repo APP Token in advance. GitHub users can apply for a token [here](https://github.com/settings/tokens). For Gitee users, see [App Token](https://github.com/der-cli/cli/blob/master/docs/Documents.md#App-Token).

If you have created a remote repo, check package.json file, you can use this command directly.

After executing the command, a `dev / x.x.x` branch will be generated remotely.

#### Release tag with 'der go -re'

```shell
$ der go --release
# or abbreviation
$ der go -re
```

该命令会将代码合并到 master 分发删除当前版本开发分支，创建同版本 tag 分支合并到远程 master 分支，然后提交至远程仓库（远程与本地操作同步）。

例: dev/1.0.1 => release/1.0.1，详见 [Git_Flow](https://github.com/der-cli/cli/blob/master/docs/Documents.md#Git-Flow-自动化).

每次执行 `der go [-re]` 时，脚手架会检查代码冲突，检查通过则正常提交， 未通过会退出命令进程，这需要你手动解决代码冲突，控制台会将冲突代码位置打印出来，解决冲突再次执行即可。

## More Commands

#### View template list

```shell
$ der tpl

# Or only project template
$ der tpl --pro
# Or only component template
$ der tpl --com
```

#### View local cache

```shell
$ der cache --all

# or
$ der cache --git [--token]
# or
$ der cache --template
# or
$ der cache --dependencies
```

#### Empty local cache

> For scaffold cache, see [Cache](https://github.com/der-cli/cli/blob/master/docs/Documents.md#Cache-缓存).

```shell
# Default: clean all
$ der clean
$ der clean --all

# or just clean dependencies
$ der clean --dep
```

#### DEBUG Mode

```shell
$ der --debug
# or
$ der -d
```

More Commands [here](https://github.com/der-cli/cli/blob/master/docs/Documents.md).

#### Debug local package

see [docs](./docs/Documents.md)

## TODOs

- [ ] Add feat: choice yarn/npm
- [ ] Add feat: add page cmd(may)
- [ ] Add feat: add component cmd(may)
- [ ] Add feat: Commit code to GitHub and gitee at the same time

## Documents

详情参考: [docs](https://github.com/der-cli/cli/blob/master/docs/Documents.md)

## Change Log

[CHANGELOG](./CHANGELOG.md)

## Q & A

#### 1.Can I Commit code directly after initialization？

A: Sure. The premise is to prepare your [App Token](https://github.com/der-cli/cli/blob/master/docs/Documents.md#App-Token).

#### 2.Can I use the 'der go' command for projects I create directly?

A: Sure. `der go` will be based on your **package.json** content creates a repository and commits branch code.

## Licence

Der cli is open source software licensed as [GPL](LICENSE)
