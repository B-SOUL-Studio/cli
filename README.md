<p align="center">
	<img width='100px' src='https://cdn.jsdelivr.net/gh/yesmore/img/img/logo-der.png' alt='der'/>
</p>
<p align="center">
    <a href="https://www.npmjs.org/package/@der-cli/core" target='_blank'>
    	<img src="https://img.shields.io/npm/v/@der-cli/core">
    </a>
    <a href="https://npmcharts.com/compare/@der-cli/core?minimal=true" target='_blank'>
    	<img src="https://img.shields.io/npm/dt/@der-cli/core">
    </a>
    <img src="https://img.shields.io/github/stars/der-cli/der-cli.svg?logo=github" alt="star"/><br>
	<img src="https://img.shields.io/github/license/der-cli/der-cli" alt="GPL"/>
</p>



<p align="center">⚡𝓓𝓮𝓻 - A scaffolding tool for FE</p>

### What is 𝓓𝓮𝓻?

- A **scaffolding tool** to improve development efficiency for the front end, build with **Node.js**.
- 一个提升前端开发效率的脚手架工具。

## 𝓓𝓮𝓻's Feature

<img width='300px' src='https://cdn.jsdelivr.net/gh/yesmore/img/img/der.png' alt='der'/>

- 😎 专一性: 专注于前端**模板**与**自动化发布功能**;
- ⚡ 高性能: 基于 Node.js 多进程执行任务, 并配合本地缓存;
- 🔨 扩展性: 基于 Class 式编程，功能扩展更便捷;
- 🔥 规范化: 使用 **Lerna** 工具架构仓库, 优化工作流程;
- 🔰 安全性: 所有私人信息以本地缓存保存.

## 𝓓𝓮𝓻 can do

- [x] Create a new project
- [x] Auto commit & create a remote repo(github/gitee)
- [x] Version control
- [ ] Specification submission code
- [ ] then...

## Quick Start

#### 本地安装

```shell
$ npm install @der-cli/core -g
```

#### 初始化项目

```shell
$ mikdir mytest
$ cd mytest

$ der init test-demo
# 根据步骤创建
```

#### 提交 & 初始化 Github/Gitee

> 该命令会在本地初始化 `.git` , 且提交代码至远程仓库。

> 注意：`der go` 会将代码提交至项目**同名**远程仓库中(package.json的name属性值)，若远程仓库不存在，则会自动创建，这需要你提前准备好你的远程仓库 APP Token, 详见  [docs: APP TOKEN](https://github.com/der-cli/der-cli/blob/master/Documents.md#APP_TOKEN)

```shell
$ der go
```

发布 tag

> 该命令会删除当前版本开发分支并创建同版本 tag 分支，然后提交至远程仓库
>
> 例: dev/1.0.1 => release/1.0.1，详见 [docs: Git Flow](https://github.com/der-cli/der-cli/blob/master/Documents.md#Git_Flow)

```shell
$ der go -release
# or 
$ der go -re
```



## More

#### 清空本地缓存

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

#### 调试本地包

see [docs](./Documents.md)

## TODO

- [x] Add feat:`clean` command
- [x] Add feat:support for other languages
- [ ] Add test:BDD tests
- [ ] Add feat:commit standard
- [ ] Add fix:logs
- [ ] Add docs:APP token
- [ ] Add docs:cache
- [ ] Add docs:template monorepo
- [ ] Add docs:der flow
- [ ] Add docs:env
- [ ] Add feat:template for new project
- [ ] Add feat:add page(may)



## Documents

详情参考: [docs](https://github.com/der-cli/der-cli/blob/master/Documents.md)



## Q & A

TODO



## License

[GPL](LICENSE)
