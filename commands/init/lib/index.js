'use strict';

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const glob = require('glob');
const ejs = require('ejs');
const semver = require('semver');
const { homedir } = require('os')
const userHome = homedir();
const Command = require('@der-cli/command');
const Package = require('@der-cli/package');
const log = require('@der-cli/log');
const { spinnerStart, sleep, execAsync } = require('@der-cli/utils');
const getProjectTemplate = require('./getProjectTemplate');
const {
  Error_PROJECT_TEMPLATE_IS_NOT_EXSITS,
  Error_PROJECT_NAME_IS_INVALID,
  Error_PROJECT_VERSION_IS_INVALID,
  Error_UNRECOGNIZED_TEMPLATE_TYPE,
  Error_TEMPLATE_INFO_IS_NOT_EXISTS,
  Error_DEPENDENCY_INSTALLATION_FAILD,
  Error_NPM_START_FAILD,
  Error_COMMAND_IS_NOT_EXISTS,
  Error_COMPONENT_DESCRIPTION_INFO_IS_EMPTY,
  Error_COSTOM_TEMPLATE_INDEX_IS_NOT_EXISTS
} = require('./error')
const {
  TYPE_PROJECT,
  TYPE_COMPONENT,
  TEMPLATE_TYPE_NORMAL,
  TEMPLATE_TYPE_CUSTOM,
  WHITE_COMMAND,
  COMPONENT_FILE
} = require('./const');

class InitCommand extends Command {
  // 默认执行
  init() {
    this.projectName = this._argv[0] || '';
    // this.force = !!this._cmd.force;
    this.force = !!this._argv[1].force;
    log.verbose('[init] 工程名称:', this.projectName);
    log.verbose('[init] 强制清空目录:', this.force);
  }

  // 默认执行
  async exec() {
    try {
      // 1. 准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 2. 下载模板
        // log.verbose('projectInfo', projectInfo);
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
        // 3. 安装模板
        await this.installTemplate();
      }
    } catch (e) {
      log.error(e);
      if (process.env.DER_CLI_LOG_LEVEL === 'verbose') {
        console.log(e);
      }
    }
  }

  async prepare() {
    // 0. 判断项目模板是否存在
    const template = await getProjectTemplate();
    if (!template || template.length === 0) {
      Error_PROJECT_TEMPLATE_IS_NOT_EXSITS()
    }
    this.template = template;

    // 1. 判断当前目录是否为空
    const localPath = process.cwd();
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;
      // 1.1 询问是否继续创建
      if (!this.force) {
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
        // 二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否清空当前目录(Make sure what you\'re doing)',
        });
        if (confirmDelete) {
          // 清空当前目录
          log.verbose('[init] 目录已清空:', localPath)
          fse.emptyDirSync(localPath);
        }
      }
    }

    return this.getProjectInfo();
  }

  // 终端交互: 获取项目基本信息
  async getProjectInfo() {
    // 项目名称合法性检验
    function isValidName(v) {
      // 1.首字符必须为英文字符
      // 2.尾字符必须为英文或数字，不能为字符
      // 3.字符仅允许 "-" "_" 分隔
      // 合法: a, a-b, a_b, a_b_c, a-b1-c2, a1_b2_c3, @abc/dfg 
      // 不合法: a_, 1, a-, -a, a_1, a-1
      return /^(@[a-zA-Z0-9-_]+\/)?[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
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

    // 过滤API数据: 筛选出项目/组件模板
    this.template = this.template.filter(template =>
      template.tag.includes(type));

    const title = type === TYPE_PROJECT ? '项目' : '组件';
    // 1.1 用户输入 项目/组件名称
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

    // 1.2 用户输入 项目/组件版本号
    projectPrompt.push({
      type: 'input',
      name: 'projectVersion',
      message: `请输入${title}版本号:`,
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
    }, {
      type: 'list',
      name: 'projectTemplate',
      message: `请选择${title}模板:`,
      choices: this.createTemplateChoice(),
    });

    if (type === TYPE_PROJECT) {
      // 2. 终端执行 获取项目的基本信息
      const project = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...project,
      };
    } else if (type === TYPE_COMPONENT) {
      // 2.1 用户输入 组件描述信息
      const descriptionPrompt = {
        type: 'input',
        name: 'componentDescription',
        message: '请输入组件描述信息',
        default: '',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (!v) {
              done(Error_COMPONENT_DESCRIPTION_INFO_IS_EMPTY());
              return;
            }
            done(null, true);
          }, 0);
        },
      };
      projectPrompt.push(descriptionPrompt);

      // 2. 获取组件的基本信息
      const component = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...component,
      };
    }

    // 生成classname
    if (projectInfo.projectName) {
      projectInfo.name = projectInfo.projectName;
      // 项目名称转换: MyReact => my-react, 适配package.json的name规则
      projectInfo.className = require('kebab-case')(projectInfo.projectName).replace(/^-/, '');
    }
    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion;
    }
    if (projectInfo.componentDescription) {
      projectInfo.description = projectInfo.componentDescription;
    }

    // log.verbose('创建类型:', title);

    return projectInfo;
  }

  async downloadTemplate() {
    // console.log(this.projectInfo, this.template);

    const { projectTemplate } = this.projectInfo; // @der-cli/xxx-template
    // 将用户选中的模板与API接口返回的模板进行对比，提取出用户选中的模板
    const templateInfo = this.template.find(item => item.npmName === projectTemplate);
    const targetPath = path.resolve(userHome, '.der-cli', 'template');
    const storeDir = path.resolve(userHome, '.der-cli', 'template', 'node_modules');
    const { npmName, version } = templateInfo;
    // 保存用户选择后的模板信息
    this.templateInfo = templateInfo;
    // 初始化 Package 对象
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });

    if (!await templateNpm.exists()) {
      // 如果模板不存在，则下载
      const spinner = spinnerStart('[init] 正在下载模板...');
      await sleep();
      try {
        await templateNpm.install();
      } catch (e) {
        throw e;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success('[init] 下载模板', '...done');
          this.templateNpm = templateNpm;
        }
      }
    } else {
      // 如果模板存在，则检测or更新
      const spinner = spinnerStart('[init] 正在更新模板...');
      await sleep();
      try {
        await templateNpm.update();
      } catch (e) {
        throw e;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success(`[init] 更新模板成功(${npmName})`);
          this.templateNpm = templateNpm;
        }
      }
    }
  }

  async installTemplate() {
    // log.verbose('templateInfo', this.templateInfo);
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }

      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        // 标准安装
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        // 自定义安装
        await this.installCustomTemplate();
      } else {
        Error_UNRECOGNIZED_TEMPLATE_TYPE()
      }
    } else {
      Error_TEMPLATE_INFO_IS_NOT_EXISTS()
    }
  }

  async installNormalTemplate() {
    const { cacheFilePath } = this.templateNpm;
    log.verbose('[init] 模板缓存路径:', cacheFilePath);
    // 拷贝模板代码至当前目录
    let spinner = spinnerStart('[init] 正在安装模板...');
    await sleep();
    const targetPath = process.cwd(); // 终端执行的路径
    try {
      // 模板缓存路径
      const templatePath = path.resolve(cacheFilePath, 'template');
      fse.ensureDirSync(templatePath); // 确保目录存在
      fse.ensureDirSync(targetPath);
      fse.copySync(templatePath, targetPath);
    } catch (e) {
      throw e;
    } finally {
      spinner.stop(true);
      log.success('[init] 模板安装', '...done');
    }

    const templateIgnore = this.templateInfo.ignore || [];
    const ignore = [
      '**/node_modules/**',
      '**/.git/**',
      '**/.vscode/**',
      '**/.DS_Store',
      ...templateIgnore
    ];
    await this.ejsRender({ ignore }); // ejs模板渲染
    // 如果初始化组件, 则生成组件配置文件
    await this.createComponentFile(targetPath);
    const { installCommand, startCommand } = this.templateInfo;
    // 依赖安装 [yarn / npm install]
    await this.execCommand(installCommand, Error_DEPENDENCY_INSTALLATION_FAILD());
    // 启动命令执行 [yarn serve / npm run serve]
    await this.execCommand(startCommand, Error_NPM_START_FAILD());
  }

  async installCustomTemplate() {
    // 查询自定义模板的入口文件
    if (await this.templateNpm.exists()) {
      const rootFile = this.templateNpm.getRootFilePath();
      if (fs.existsSync(rootFile)) {
        log.notice('[init] 开始执行自定义模板...');
        const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
        const options = {
          templateInfo: this.templateInfo,
          projectInfo: this.projectInfo,
          sourcePath: templatePath,
          targetPath: process.cwd(),
        };
        // 加载自定义index.js
        const code = `require('${rootFile}')(${JSON.stringify(options)})`;
        log.verbose('code', code);
        await execAsync('node', ['-e', code], { stdio: 'inherit', cwd: process.cwd() });
        log.success('[init] 自定义模板安装', '...done');
      } else {
        Error_COSTOM_TEMPLATE_INDEX_IS_NOT_EXISTS()
      }
    }
    //  {
    //   "name": "vue2自定义模板",
    //   "npmName": "@der-cli/vue2-standard-custom-template",
    //   "version": "1.0.0",
    //   "type": "costom",
    //   "installCommand": "yarn --registry=https://registry.npm.taobao.org",
    //   "startCommand": "yarn serve",
    //   "tag": [
    //     "project"
    //   ],
    //   "ignore": [
    //     "**/public/**"
    //   ]
    // }
  }

  async ejsRender(options) {
    log.verbose('ejsRender:', this.projectInfo.projectName);
    const dir = process.cwd();
    const projectInfo = this.projectInfo;
    return new Promise((resolve, reject) => {
      glob('**', {
        cwd: dir,
        ignore: options.ignore || [],
        nodir: true, // 排除文件夹
      }, function (err, files) {
        if (err) {
          reject(err);
        }
        Promise.all(files.map(file => {
          const filePath = path.join(dir, file);
          return new Promise((resolve1, reject1) => {
            ejs.renderFile(filePath, projectInfo, {}, (err, result) => {
              if (err) {
                reject1(err);
              } else {
                fse.writeFileSync(filePath, result); // 写入
                resolve1(result);
              }
            });
          });
        })).then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        });
      });
    })
  }

  // 命令执行-子进程
  async execCommand(command, errMsg) {
    let ret;
    if (command) {
      // 参数处理 npm, ['install']
      const cmdArray = command.split(' ');
      const cmd = this.checkCommand(cmdArray[0]);
      if (!cmd) {
        Error_COMMAND_IS_NOT_EXISTS(command)
      }
      const args = cmdArray.slice(1);
      ret = await execAsync(cmd, args, {
        stdio: 'inherit', // 当前命令输出流
        cwd: process.cwd(),
      });
    }
    if (ret !== 0) {
      throw new Error(errMsg);
    }
    return ret;
  }

  // 如果是组件项目，则创建组件相关文件
  async createComponentFile(dir) {
    const templateInfo = this.templateInfo;
    const projectInfo = this.projectInfo;
    if (templateInfo.tag.includes(TYPE_COMPONENT)) {
      const componentData = {
        ...projectInfo,
        buildPath: templateInfo.buildPath,
        examplePath: templateInfo.examplePath,
        npmName: templateInfo.npmName,
        npmVersion: templateInfo.version,
      }
      const componentFile = path.resolve(dir, COMPONENT_FILE);
      fs.writeFileSync(componentFile, JSON.stringify(componentData));
    }
  }

  createTemplateChoice() {
    // 模板名称列表
    return this.template.map(item => ({
      value: item.npmName,
      name: item.name,
    }));
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

  // 命令白名单: 检查命令是否存在
  checkCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) {
      return cmd;
    }
    return null;
  }

}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;