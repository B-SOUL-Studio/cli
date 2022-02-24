<p align="center">
	<img width='100px' src='https://cdn.jsdelivr.net/gh/yesmore/img/img/logo-der.png' alt='der'/>
</p>

<p align="center">⚡𝓓𝓮𝓻 - A scaffolding tool for FE</p>

> TODO
>
> - [ ] Add [clean] command
> - [ ] Add support for other languages
> - [ ] Add template for new project
> - [ ] Add BDD tests
> - [ ] Add commit standard

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

### More

清空本地缓存：

```shell
$ der clean
```

DEBUG 模式：

```shell
$ der --debug
# or
$ der -d
```

调试本地包：

```shell
$ der init --targetPath /Users/[username]/your/der-cli/core/init/
# or
$ der init -tp /Users/[username]/your/der-cli/core/init/
```

## License

[GPL](LICENSE)
