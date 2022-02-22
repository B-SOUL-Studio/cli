# Scripts

## 脚手架 core

### init

本地调试

```shell
$ cd test

$ der-dev init my-project -tp D:\repository\QuickStart\der-cli-dev\commands\init -f -d
```

远程调试

```shell
$ der-dev init my-project
$ der-dev init my-project -d
$ der-dev init my-project -f
$ der-dev init my-project -d -f
```

### publish

```shell
$ cd test

$ der-dev publish -tp D:\repository\QuickStart\der-cli-dev\commands\publish -d
# 更新平台、token
$ der-dev publish -tp D:\repository\QuickStart\der-cli-dev\commands\publish -d -rs -rt
# 更新平台、token、仓库类型
$ der-dev publish -tp D:\repository\QuickStart\der-cli-dev\commands\publish -d -rs -rt -ro
#
```

### 新建模块

```shell
$ lerna create @der-cli-dev/my-module
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
$ lerna publish
```

## 模板

发布 npm

```shell
$ npm publish
```

## 脚手架服务端

#### 本地调试

```shell
$ yarn dev

# or
$ yarn start
```
