'use strict';

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const glob = require('glob');
const ejs = require('ejs');
const semver = require('semver');
const userHome = require('user-home');
const Command = require('@der-cli-dev/command');
const Package = require('@der-cli-dev/package');
const log = require('@der-cli-dev/log');
const { spinnerStart, sleep, execAsync } = require('@der-cli-dev/utils');
const {
  Error_PROJECT_TEMPLATE_IS_NOT_EXSITS,
  Error_PROJECT_NAME_IS_INVALID,
  Error_PROJECT_VERSION_IS_INVALID
} = require('./error')

// const getProjectTemplate = require('./getProjectTemplate');
const {
  TYPE_PROJECT,
  TYPE_COMPONENT,
  TEMPLATE_TYPE_NORMAL,
  TEMPLATE_TYPE_CUSTOM,
  WHITE_COMMAND
} = require('./const');

class InitCommand extends Command {
  // 默认执行
  init() {
    this.projectName = this._argv[0] || '';
    // this.force = !!this._cmd.force;
    this.force = !!this._argv[1].force;
    // console.log(this._argv);
    log.verbose('正在创建项目:', this.projectName);
    log.verbose('强制清空目录:', this.force);
  }

  // 默认执行
  async exec() {
    try {
      // 1. 准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 2. 下载模板
        log.verbose('projectInfo', projectInfo);
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
        // 3. 安装模板
        // await this.installTemplate();
      }
    } catch (e) {
      log.error(e);
      if (process.env.DER_CLI_LOG_LEVEL === 'verbose') {
        console.log(e);
      }
    }
  }

  async downloadTemplate() {
    // 1.通过项目模板API获取模板信息
    // 1.1 通过egg.js搭建一套后端系统
    // 1.2 通过npm存储项目模板
    // 1.3 将模板信息存储到MongoDB
    // 1.4 通过egg.js获取MongoDB中的数据并通过API返回
  }

  async prepare() {
    // 0. 判断项目模板是否存在
    // const template = await getProjectTemplate();
    // if (!template || template.length === 0) {
    //   throw new Error('项目模板不存在');
    // }
    // this.template = template;

    // 1. 判断当前目录是否为空
    const localPath = process.cwd();
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;
      if (!this.force) {
        // 1.1 询问是否继续创建
        ifContinue = (await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '当前文件夹不为空, 是否继续创建项目',
        })).ifContinue;
        if (!ifContinue) {
          return; // 结束
        }
      }

      // 2. 是否启动强制更新
      if (ifContinue || this.force) {
        // 给用户做二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否清空当前目录(Make sure what you\'re doing)',
        });
        if (confirmDelete) {
          // 清空当前目录
          log.verbose('目录已清空:', localPath)
          fse.emptyDirSync(localPath);
        }
      }
    }

    return this.getProjectInfo();
  }

  // 获取项目基本信息
  async getProjectInfo() {
    // 项目名称合法性检验
    function isValidName(v) {
      // 1.首字符必须为英文字符
      // 2.尾字符必须为英文或数字，不能为字符
      // 3.字符仅允许 "-" "_" 分隔
      // 合法: a, a-b, a_b, a_b_c, a-b1-c2, a1_b2_c3
      // 不合法: a_, 1, a-, -a, a_1, a-1 
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
    }

    let projectInfo = {}; // 项目/组件信息  
    let isProjectNameValid = false;
    if (isValidName(this.projectName)) {
      isProjectNameValid = true;
      projectInfo['projectName'] = this.projectName;
    }

    // 1. 选择创建项目或组件
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型:',
      default: TYPE_PROJECT, // 默认值
      choices: [{ // 选项
        name: '项目',
        value: TYPE_PROJECT,
      }, {
        name: '组件',
        value: TYPE_COMPONENT,
      }],
    });


    // this.template = this.template.filter(template =>
    //   template.tag.includes(type));

    const title = type === TYPE_PROJECT ? '项目' : '组件';
    // 项目/组件名称
    const projectNamePrompt = {
      type: 'input',
      name: 'projectName',
      message: `请输入${title}名称`,
      default: '',
      validate: function (v) {
        const done = this.async();
        setTimeout(function () {
          if (!isValidName(v)) {
            done(Error_PROJECT_NAME_IS_INVALID(title));
            return;
          }
          done(null, true);
        }, 0);
      },
      filter: function (v) {
        return v;
      },
    };

    const projectPrompt = [];
    if (!isProjectNameValid) { // 若init命令时输入的项目名称不合法，则需要重新输入
      projectPrompt.push(projectNamePrompt);
    }

    // 项目/组件版本号
    projectPrompt.push({
        type: 'input',
        name: 'projectVersion',
        message: `请输入${title}版本号`,
        default: '1.0.0',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (!(!!semver.valid(v))) { // 校验版本号是否合法
              done(Error_PROJECT_VERSION_IS_INVALID());
              return;
            }
            done(null, true);
          }, 0);
        },
        filter: function (v) { // 提取
          if (!!semver.valid(v)) {
            return semver.valid(v);
          } else {
            return v;
          }
        },
      },
      //  {
      //   type: 'list',
      //   name: 'projectTemplate',
      //   message: `请选择${title}模板`,
      // choices: this.createTemplateChoice(),
      // }
    );

    if (type === TYPE_PROJECT) {
      // 2. 获取项目的基本信息
      const project = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...project,
      };
    } else if (type === TYPE_COMPONENT) {

    }

    // 生成classname
    if (projectInfo.projectName) {
      projectInfo.name = projectInfo.projectName;
      projectInfo.className = require('kebab-case')(projectInfo.projectName).replace(/^-/, '');
    }
    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion;
    }
    if (projectInfo.componentDescription) {
      projectInfo.description = projectInfo.componentDescription;
    }

    log.verbose('创建类型:', title);

    return projectInfo;
  }

  // 检查目录是否为空
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    // 文件过滤的逻辑
    fileList = fileList.filter(file => (
      // 排除 .xxx 和 node_modules
      // 默认.xxx/node_modules为缓存文件
      !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    ));
    return !fileList || fileList.length <= 0;
  }

  createTemplateChoice() {
    return this.template.map(item => ({
      value: item.npmName,
      name: item.name,
    }));
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;