# Scripts

<img width='300px' src='https://fastly.jsdelivr.net/gh/yesmore/img/img/der.png' alt='der'/>

## der 客户端命令

客户端命令

### init

```shell
$ cd your-project

$ der init my-project  -f -d
```

### publish

```shell
$ cd your-project

$ der go -d
# 更新平台、token
$ der go -d -rs -rt
# 更新平台、token、仓库类型
$ der go -d -rs -rt -ro
# 发布tag
$ der go -re
```

### tpl

```shell
$ der tpl

# Or only project template
$ der tpl --pro
# Or only component template
$ der tpl --com
```

### cache

```shell
$ der cache --all

# or 查看本地Git缓存信息
$ der cache --git
# or 查看本地模板缓存信息
$ der cache --template
# or 查看本地依赖缓存信息
$ der cache --dependencies
# or 查看App Token
$ der cache --token
```

## der-cli 开发者调试命令

本地调试

### init

```shell
$ cd your-project

$ der init my-project
$ der init my-project -d
$ der init my-project -f
$ der init my-project -d -f
```

### publish

```shell
$ cd your-project

$ der go -tp D:\\repository\\QuickStart\\der-cli\\commands\\publish -d
# 更新平台、token
$ der go -tp D:\\repository\\QuickStart\\der-cli\\commands\\publish -d -rs -rt
# 更新平台、token、仓库类型
$ der go -tp D:\\repository\\QuickStart\\der-cli\\commands\\publish -d -rs -rt -ro
# 发布tag
$ der go -tp D:\\repository\\QuickStart\\der-cli\\commands\\publish -re
```

## lerna 命令

### 新建模块

```shell
$ lerna create @der-cli/my-module
```

### 安装依赖

```shell
$ lerna add axios
# or
$ yarn add axios
```

### 代码提交

```shell
$ npm config set registry https://registry.npmjs.org/
$ yarn cp
```

## der 模板

发布 npm

```shell
$ npm publish
```

## der 服务端

`der-cli-server`: [der-cli/der-cli-server]()

#### 本地调试

```shell
$ yarn dev

# or
$ yarn start
```
