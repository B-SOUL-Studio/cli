'use strict';

const path = require('path');
const SimpleGit = require('simple-git');
const userHome = require('user-home');
const fse = require('fs-extra');
const Github = require('../Git/Github');
const Gitee = require('../Git/Gitee');
const log = require('@der-cli-dev/log');
const {
  readFile,
  writeFile,
  inquirer,
  spinnerStart: spinner
} = require('@der-cli-dev/utils');
const {
  Error_CAN_NOT_FIND_USER_HOME,
  Error_INIT_GIT_SERVER_FAILED,
  Error_FAILED_GET_INFO,
  Error_FAILED_CREATE_REMOTE_REPO
} = require('./error');
const {
  DEFAULT_CLI_HOME,
  GIT_ROOT_DIR,
  GIT_SERVER_FILE,
  GIT_TOKEN_FILE,
  GIT_LOGIN_FILE,
  GIT_OWN_FILE,
  GIT_PUBLISH_FILE,
  GIT_IGNORE_FILE,
  REPO_OWNER_USER,
  REPO_OWNER_ORG,
  GITHUB,
  GITEE,
  VERSION_RELEASE,
  VERSION_DEVELOP,
  COMPONENT_FILE,
  TEMPLATE_TEMP_DIR,
  GIT_SERVER_TYPE,
  GIT_OWNER_TYPE,
  GIT_OWNER_TYPE_ONLY,
  GIT_PUBLISH_TYPE,
} = require('./const');
const {
  COMPONENT_LIBRARY_IGNORE,
  PROJECT_IGNORE
} = require('../Git/GitIgore');

/**
 * Git 基类
 *  Git Flow 自动化实现
 */
class Git {
  /**
   * 构造函数
   *
   * @param dir git 仓库本地目录
   * @param name git 仓库名称
   * @param version git 分支号
   * @param cliHome 缓存根目录
   * @param refreshToken 是否强制刷新token数据
   * @param refreshOwner 是否强制刷新own数据
   * @param refreshServer 是否强制刷新git远程仓库类型
   * @param prod 是否为正式发布，正式发布后会建立tag删除开发分支
   * @param sshUser 远程服务器用户名
   * @param sshIp 远程服务器IP
   * @param sshPath 远程服务器路径
   */
  constructor({ name, version, dir }, { refreshServer, refreshToken, refreshOwner }) {
    this.git = SimpleGit(dir) // 实例化
    this.name = name; //项目名称
    this.version = version; // 项目版本号
    this.dir = dir; // 仓库本地路径
    this.gitServer = null // 远程Git平台
    this.homePath = null // 用户缓存主目录
    this.user = null // 用户信息
    this.orgs = null // 用户所属组织
    this.login = null; // 当前登录用户信息 username or orgname
    this.owner = null // 远程仓库类型 user or org
    this.repo = null; // 远程 git 仓库信息
    this.remote = null; // 远程 git 仓库地址
    this.refreshServer = refreshServer // 强制刷新 git 远程仓库平台
    this.refreshToken = refreshToken // 强制刷新 token
    this.refreshOwner = refreshOwner // 强制刷新 owner
  }

  /* prepare */
  async prepare() {
    this.checkHomePath()
    await this.checkGitServer()
    await this.checkGitToken()
    await this.checkUserAndOrgs()
    await this.checkGitOwner();
    await this.checkRepo();
    await this.checkGitIgnore();

    await this.init();
  }

  // 检查缓存主目录
  checkHomePath() {
    if (!this.homePath) {
      if (process.env.CLI_HOME) {
        this.homePath = path.resolve(userHome, process.env.DER_CLI_HOME_PATH);
      } else {
        this.homePath = path.resolve(userHome, DEFAULT_CLI_HOME);
      }
    }
    log.verbose('[Git]检查缓存路径:', this.homePath);
    fse.ensureDirSync(this.homePath); // 确认目录可用
    if (!fs.existsSync(this.homePath)) {
      Error_CAN_NOT_FIND_USER_HOME()
    }
  }

  // 确认远程 git 平台
  async checkGitServer() {
    const gitServerPath = this.createPath(GIT_SERVER_FILE);
    log.verbose('[Git]平台信息缓存路径:', gitServerPath);
    let gitServer = readFile(gitServerPath);

    if (!gitServer || this.refreshServer) { // 文件不存在或开启强制刷新则新建内容
      gitServer = await inquirer({
        type: 'list',
        name: 'gitServer',
        message: '请选择远程托管平台:',
        default: GITHUB, // 默认值
        choices: GIT_SERVER_TYPE,
      });
      writeFile(gitServerPath, gitServer)
      log.success('[Git]平台信息缓存已更新:', `${gitServer} => ${gitServerPath}`);
    } else {
      log.info('[Git]托管平台:', `${gitServer}`);
    }

    this.gitServer = this.createGitServer(gitServer);
    if (!this.gitServer) {
      Error_INIT_GIT_SERVER_FAILED()
    }
  }

  // 检查 git API 必须的 远程仓库token
  async checkGitToken() {
    const tokenPath = this.createPath(GIT_TOKEN_FILE); // 创建缓存文件
    log.verbose('[Git]平台Token缓存路径:', tokenPath);
    let token = readFile(tokenPath);

    if (!token || this.refreshToken) {
      // TODO: Terminal link issue
      log.notice(`[Git]${this.gitServer.type} token未生成`, '快速生成token:', this.gitServer.getTokenHelpUrl());
      token = await inquirer({
        type: 'password',
        message: '请将token复制到此处:',
        defaultValue: '',
      });
      writeFile(tokenPath, token);
      log.success('[Git]Token写入成功:', `${token} => ${tokenPath}`);
    } else {
      // log.verbose('token', token);
      log.success('[Git]Token is ready');
    }
    this.token = token;
    this.gitServer.setToken(token);
  }

  // 获取用户和组织信息
  async checkUserAndOrgs() {
    this.user = await this.gitServer.getUser();
    this.orgs = await this.gitServer.getOrgs();
    // console.log(this.orgs);
    if (!this.user || !this.orgs) {
      Error_FAILED_GET_INFO()
    }
    log.success(`[Git]${this.gitServer.type}用户:`, `${this.user.login}(${this.user.name})`);
    // log.success(`[Git]${this.gitServer.type}组织:`, `${this.orgs}(${this.orgs.name})`);
  };

  // 检查 git owner 是否选择
  async checkGitOwner() {
    const ownerPath = this.createPath(GIT_OWN_FILE);
    const loginPath = this.createPath(GIT_LOGIN_FILE);
    let owner = readFile(ownerPath); // user or org
    let login = readFile(loginPath); // 登陆使用的用户名(username or orgname)

    if (!owner || !login || this.refreshOwner) {
      log.notice(`[Git]${this.gitServer.type} owner 未生成, 先选择 owner`);
      owner = await inquirer({
        type: 'list',
        choices: this.orgs.length > 0 ? GIT_OWNER_TYPE : GIT_OWNER_TYPE_ONLY,
        message: '请选择远程仓库类型:',
      });
      if (owner === REPO_OWNER_USER) {
        login = this.user.login;
      } else {
        login = await inquirer({
          type: 'list',
          choices: this.orgs.map(item => ({
            name: item.login,
            value: item.login,
          })),
          message: '请选择组织:',
        });
      }
      writeFile(ownerPath, owner);
      writeFile(loginPath, login);
      log.success('[Git]仓库类型更新:', `[${owner}] => ${ownerPath}`);
      log.success('[Git]仓库所有者更新:', `[${login}] => ${loginPath}`);
    } else {
      log.success('[Git]仓库类型:', owner === 'org' ? '组织' : '用户');
      log.success('[Git]仓库所有者:', login);
    }

    this.owner = owner;
    this.login = login;
  }

  // 检查远程仓库是否存在, 不存在则创建项目同名仓库
  async checkRepo() {
    // Get /repos/:owner/:repo
    let repo = await this.gitServer.getRepo(this.login, this.name);
    if (!repo) {
      let createStart = spinner('开始创建远程仓库...');
      try {
        if (this.owner === REPO_OWNER_USER) {
          repo = await this.gitServer.createRepo(this.name);
        } else {
          repo = await this.gitServer.createOrgRepo(this.name, this.login);
        }
      } finally {
        createStart.stop(true);
      }
      if (repo) {
        log.success('[Git]远程仓库创建成功');
      } else {
        Error_FAILED_CREATE_REMOTE_REPO()
      }
    }

    log.success('[Git]仓库名称:', repo.name);
    this.repo = repo;
  }

  // 检查 .gitignore
  async checkGitIgnore() {
    const gitIgnore = path.resolve(this.dir, GIT_IGNORE_FILE);
    if (!fs.existsSync(gitIgnore)) {
      if (this.isComponent()) {
        writeFile(gitIgnore, COMPONENT_LIBRARY_IGNORE);
      } else {
        writeFile(gitIgnore, PROJECT_IGNORE);
      }
      log.success('[Git]自动写入.gitignore文件');
    }
  }

  // 判断是否为组件
  isComponent() {
    const componentFilePath = path.resolve(this.dir, COMPONENT_FILE);
    return fs.existsSync(componentFilePath) && fse.readJsonSync(componentFilePath);
  };

  // 实例化 Github/Gitee
  createGitServer(gitServer = '') {
    const _gitServer = gitServer.trim();
    if (_gitServer === GITHUB) {
      return new Github();
    } else if (_gitServer === GITEE) {
      return new Gitee();
    }
    return null;
  }

  // 创建缓存目录
  createPath(file) {
    const rootDir = path.resolve(this.homePath, GIT_ROOT_DIR); // C:\Users\name\.der-cli-dev\.git
    const filePath = path.resolve(rootDir, file);
    fse.ensureDirSync(rootDir);
    return filePath;
    // C:\Users\name\.der-cli-dev\.git\.git_erver
  };

  /* init */
  async init() {
    if (await this.getRemote()) {
      return true;
    }
    await this.initAndAddRemote();
    await this.initCommit();
  }

  // 检查是否初始化本地git仓库
  async getRemote() {
    const gitPath = path.resolve(this.dir, GIT_ROOT_DIR);
    this.remote = this.gitServer.getRemote(this.login, this.name); // 远程仓库地址
    if (fs.existsSync(gitPath)) {
      log.notice('[Git]本地仓库已初始化, 执行"git remote -v"查看远程仓库地址');
      return true;
    }
  }

  // 初始化本地git仓库(创建.git)
  async initAndAddRemote() {
    log.notice('[Git]执行git初始化...');
    await this.git.init(this.dir);
    log.notice('[Git]添加gitremote...');
    const remotes = await this.git.getRemotes();
    log.verbose('[Git]git remotes:', remotes);
    if (!remotes.find(item => item.name === 'origin')) {
      await this.git.addRemote('origin', this.remote);
    }
  }

  // 提交源码到本地
  async initCommit() {
    await this.checkConflicted();
    await this.checkNotCommitted();
    if (await this.checkRemoteMaster()) {
      log.notice('远程存在 master 分支, 强制合并');
      await this.pullRemoteRepo('master', { '--allow-unrelated-histories': null });
    } else {
      await this.pushRemoteRepo('master');
    }
  };

}

module.exports = Git;