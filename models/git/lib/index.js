'use strict';

const path = require('path');
const SimpleGit = require('simple-git');
const { homedir } = require('os')
const userHome = homedir();
const fse = require('fs-extra');
const semver = require('semver');
const Listr = require('listr');
const colors = require('colors/safe');
const { Observable } = require('rxjs');
const Github = require('../Git/Github');
const Gitee = require('../Git/Gitee');
const log = require('@der-cli/log');
const {
  readFile,
  writeFile,
  inquirer,
  spinnerStart: spinner
} = require('@der-cli/utils');
const {
  Error_CAN_NOT_FIND_USER_HOME,
  Error_INIT_GIT_SERVER_FAILED,
  Error_FAILED_GET_INFO,
  Error_FAILED_CREATE_REMOTE_REPO,
  Error_CODE_CONFLICTS,
  Error_BUIILD_FAILED,
  Error_BUIILD_PATH_NOT_FOUND,
  Error_PACKAGE_JSON_NOT_FOUND
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
   * 初始化
   *
   * @param dir git 仓库本地目录
   * @param name git 仓库名称
   * @param version git 分支号
   * @param cliHome 缓存根目录
   * @param refreshToken 是否强制刷新token数据
   * @param refreshOwner 是否强制刷新own数据
   * @param refreshServer 是否强制刷新git远程仓库类型
   */
  constructor({ name, version, dir }, {
    refreshServer = false,
    refreshToken = false,
    refreshOwner = false,
    release = false,
  }) {
    this.name = name; //项目名称
    if (this.name.startsWith('@') && this.name.indexOf('/') > 0) {
      // @der/vui => der-vui
      const nameArr = this.name.split('/');
      this.name = nameArr.join('-').replace('@', '');
    }
    this.git = SimpleGit(dir) // 实例化
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
    this.branch = null; // 当前 分支/版本号
    this.refreshServer = refreshServer // 强制刷新 git 远程仓库平台
    this.refreshToken = refreshToken // 强制刷新 token
    this.refreshOwner = refreshOwner // 强制刷新 owner
    this.release = release // 发布 release 版本
  }

  /* prepare ********************************************/

  async prepare() {
    this.checkHomePath()
    await this.checkGitServer()
    await this.checkGitToken()
    await this.checkUserAndOrgs()
    await this.checkGitOwner();
    await this.checkRepo();
    await this.checkGitIgnore();
    await this.checkComponent();
    await this.init();
  }

  // 检查缓存主目录
  checkHomePath() {
    console.log();
    log.notice('[Git]  ******** CHECK ********');
    if (!this.homePath) {
      if (process.env.CLI_HOME) {
        this.homePath = path.resolve(userHome, process.env.DER_CLI_HOME_PATH);
      } else {
        this.homePath = path.resolve(userHome, DEFAULT_CLI_HOME);
      }
    }
    log.verbose('[Git] 检查缓存路径:', this.homePath);
    fse.ensureDirSync(this.homePath); // 确认目录可用
    if (!fs.existsSync(this.homePath)) {
      Error_CAN_NOT_FIND_USER_HOME()
    }
  }

  // 确认远程 git 平台
  async checkGitServer() {
    const gitServerPath = this.createPath(GIT_SERVER_FILE);
    log.verbose('[Git] 平台信息缓存路径:', gitServerPath);
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
      log.success('[Git] 平台信息缓存更新:', `${gitServer} => ${gitServerPath}...done`);
    } else {
      log.info('[Git] 托管平台:', `${gitServer}`);
    }

    this.gitServer = this.createGitServer(gitServer);
    if (!this.gitServer) {
      Error_INIT_GIT_SERVER_FAILED()
    }
  }

  // 检查 git API 必须的 远程仓库token
  async checkGitToken() {
    const tokenPath = this.createPath(GIT_TOKEN_FILE); // 创建缓存文件
    log.verbose('[Git] 平台Token缓存路径:', tokenPath);
    let token = readFile(tokenPath);

    if (!token || this.refreshToken) {
      // TODO: Terminal link issue
      log.notice(`[Git] ${this.gitServer.type} token未生成`, '快速生成token:', colors.cyan(this.gitServer.getTokenHelpUrl()));
      token = await inquirer({
        type: 'password',
        message: '请将token复制到此处:',
        defaultValue: '',
      });
      writeFile(tokenPath, token);
      log.success('[Git] Token写入成功:', `${token} => ${tokenPath}...done`);
    } else {
      // log.verbose('token', token);
      log.success('[Git] Token is ready.');
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
    log.success(`[Git] ${this.gitServer.type}用户:`, `${this.user.login}(${this.user.name})`);
    // log.success(`[Git] ${this.gitServer.type}组织:`, `${this.orgs}(${this.orgs.name})`);
  };

  // 检查 git owner 是否选择
  async checkGitOwner() {
    const ownerPath = this.createPath(GIT_OWN_FILE);
    const loginPath = this.createPath(GIT_LOGIN_FILE);
    let owner = readFile(ownerPath); // user or org
    let login = readFile(loginPath); // 登陆使用的用户名(username or orgname)

    if (!owner || !login || this.refreshOwner) {
      log.notice(`[Git] ${this.gitServer.type} 仓库类型未知, 请选择仓库类型`);
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
      log.verbose('[Git] 仓库类型更新:', `[${owner}] => ${ownerPath}...done`);
      log.verbose('[Git] 仓库所有者更新:', `[${login}] => ${loginPath}...done`);
    } else {
      log.success('[Git] 仓库类型:', owner === 'org' ? '组织仓库' : '个人仓库');
      log.success('[Git] 仓库所有者:', login);
    }

    this.owner = owner;
    this.login = login;
  }

  // 检查远程仓库是否存在, 不存在则创建项目同名仓库
  async checkRepo() {
    // Get /repos/:owner/:repo
    let repo = await this.gitServer.getRepo(this.login, this.name);

    if (!repo) {
      let createStart = spinner('[Git] 开始创建远程仓库...');
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
        log.success('[Git] 远程仓库创建', '...done');
      } else {
        Error_FAILED_CREATE_REMOTE_REPO()
      }
    }

    log.success('[Git] 仓库名称:', repo.name);
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
      log.success('[Git] 生成.gitignore文件', '...done');
    }
  }

  // 检查 component 是否打包
  async checkComponent() {
    let componentFile = this.isComponent();
    // 只有 component 才启动该逻辑
    if (componentFile) {
      log.notice('[Git] Building Component project...');
      try {
        require('child_process').execSync('npm run build', {
          cwd: this.dir,
        });
        const buildPath = path.resolve(this.dir, componentFile.buildPath);
        if (!fs.existsSync(buildPath)) {
          Error_BUIILD_FAILED(buildPath)
        }
        const pkg = this.getPackageJson();
        if (!pkg.files || !pkg.files.includes(componentFile.buildPath)) {
          Error_BUIILD_PATH_NOT_FOUND(componentFile.buildPath)
        }
      } finally {
        console.log();
        log.notice('[Git] Build', '...done');
      }
    }
  };

  // 获取项目package.json文件
  getPackageJson() {
    const pkgPath = path.resolve(this.dir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      Error_PACKAGE_JSON_NOT_FOUND()
    }
    return fse.readJsonSync(pkgPath);
  };

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
    const rootDir = path.resolve(this.homePath, GIT_ROOT_DIR); // C:\Users\name\.der-cli\.git
    const filePath = path.resolve(rootDir, file);
    fse.ensureDirSync(rootDir);
    return filePath;
    // C:\Users\name\.der-cli\.git\.git_erver
  };

  /* init **************************************************/

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
      log.notice('[Git] 本地仓库已初始化,', `执行 ${colors.cyan("git remote -v")} 查看远程仓库地址`);
      return true;
    }
  }

  // 初始化本地git仓库(创建.git)
  async initAndAddRemote() {
    log.notice('[Git] 执行git初始化...');
    await this.git.init(this.dir);
    log.notice('[Git] 添加git remote...');
    const remotes = await this.git.getRemotes();
    log.verbose('[Git] git remotes:', remotes);
    if (!remotes.find(item => item.name === 'origin')) {
      await this.git.addRemote('origin', this.remote);
    }
  }

  // 提交源码到本地
  async initCommit() {
    await this.checkConflicted();
    await this.checkNotCommitted();
    if (await this.checkRemoteMaster()) {
      log.notice('[Git] 远程存在master分支, 强制合并...');
      await this.pullRemoteRepo('master', { '--allow-unrelated-histories': null });
    } else {
      await this.pushRemoteRepo('master');
    }
  };

  // 检查远程分支master是否存在
  async checkRemoteMaster() {
    return (await this.git.listRemote(['--refs'])).indexOf('refs/heads/master') >= 0;
  };

  // 检查代码冲突
  async checkConflicted() {
    // log.notice('[Git] 代码冲突检查...');
    const status = await this.git.status();

    if (status.conflicted.length > 0) {
      Error_CODE_CONFLICTS()
    }
    log.success('[Git] 代码检查', '...done');
  };

  // 检查本地是否有未提交的代码
  async checkNotCommitted() {
    const status = await this.git.status();
    if (status.not_added.length > 0 ||
      status.created.length > 0 ||
      status.deleted.length > 0 ||
      status.modified.length > 0 ||
      status.renamed.length > 0) {
      // log.verbose('[Git] status', status);
      await this.git.add(status.not_added);
      await this.git.add(status.created);
      await this.git.add(status.deleted);
      await this.git.add(status.modified);
      await this.git.add(status.renamed);
      if (!this.release) {
        let message;
        while (!message) {
          message = await inquirer({
            type: 'text',
            message: '请输入commit信息:',
            defaultValue: '',
          });
        }
        await this.git.commit(message);
        log.success('[Git] git commit -m', `'${message}'`);
      }

    }
  };

  // 推送代码至指定远程分支
  async pushRemoteRepo(branchName, oTask = null) {
    if (oTask) {
      oTask.next(`[Git] 推送代码至远程[${branchName}]分支...`)
      await this.git.push('origin', branchName);
      oTask.next('[Git] done');
    } else {
      await this.git.push('origin', branchName);
    }
  };

  // 拉取远程代码
  async pullRemoteRepo(branchName, options = {}) {
    log.notice(`[Git] 同步远程${branchName}分支代码...pulling`);
    // 强制合并
    await this.git.pull('origin', branchName, options).catch(err => {
      if (err.message.indexOf('Permission denied (publickey)') >= 0) {
        throw new Error(`[Git] 请获取本地 ssh publickey 并配置到: ${this.gitServer.getSSHKeysUrl()}, 配置方法: ${this.gitServer.getSSHKeysHelpUrl()}`);
      } else if (err.message.indexOf('Couldn\'t find remote ref ' + branchName) >= 0) {
        log.notice(`[Git] 获取远程${colors.cyan(branchName)}分支失败`);
      } else {
        log.error(err.message);
      }
      log.error('[Git] 请重新执行 der go, 如仍然报错请尝试删除 .git 目录后重试');
      process.exit(0);
    });
  };

  /* commit 提交 *********************************************/

  async commit() {
    console.log();
    log.notice('[Git]  ******** COMMIT ********');
    await this.getCorrectVersion() // 1.获取正确的版本号
    await this.checkStash(); // 2.检查Stash区
    await this.checkConflicted(); // 3.检查是否代码冲突
    await this.checkNotCommitted(); // 4.检查是否有未提交
    await this.checkoutBranch(this.branch); // 5.切换开发分支
    await this.pullRemoteMasterAndBranch(); // 6.合并远程master分支和开发分支代码
    await this.pushRemoteRepo(this.branch); // 7. 将开发分支push到远程仓库
  }

  // 生成开发分支
  async getCorrectVersion() {
    // 1.1 获取远程开发分支
    log.notice(`[Git] 获取远程${colors.cyan('release')}分支...`);
    // ['1.1.1', '1.0.0']
    const remoteBranchList = await this.getRemoteBranchList(VERSION_RELEASE);
    let releaseVersion = null; // 远程分支最大版本号
    if (remoteBranchList && remoteBranchList.length > 0) {
      // 获取最近的线上版本(max)
      releaseVersion = remoteBranchList[0];
    }

    // 1.2 生成本地开发分支
    const devVersion = this.version; // 当前项目开发版本号(未提交)
    if (!releaseVersion) {
      // 若远程无release分支, 则直接以本地开发分支为准
      this.branch = `${VERSION_DEVELOP}/${devVersion}`;
    } else if (semver.gt(this.version, releaseVersion)) {
      // 若本地开发分支大于远程最大分支版本号
      log.info('[Git] 当前版本大于线上最新版本:', `${devVersion} >= ${releaseVersion}`);
      this.branch = `${VERSION_DEVELOP}/${devVersion}`;
    } else {
      log.notice('[Git] 线上版本大于或等于本地版本:', `${releaseVersion} >= ${devVersion}`);
      const incType = await inquirer({
        type: 'list',
        choices: [{
          name: `小版本(${releaseVersion} -> ${semver.inc(releaseVersion, 'patch')})`,
          value: 'patch',
        }, {
          name: `中版本(${releaseVersion} -> ${semver.inc(releaseVersion, 'minor')})`,
          value: 'minor',
        }, {
          name: `大版本(${releaseVersion} -> ${semver.inc(releaseVersion, 'major')})`,
          value: 'major',
        }],
        defaultValue: 'patch',
        message: '自动升级版本, 请选择升级版本类型:',
      });
      const incVersion = semver.inc(releaseVersion, incType); // 升级
      this.branch = `${VERSION_DEVELOP}/${incVersion}`; // 生成本地开发分支
      this.version = incVersion;
      this.syncVersionToPackageJson(); // 更新版本号
    }
    log.success(`[Git] 代码分支:`, `${this.branch}...done`);
  }

  // 获取远程开发分支
  async getRemoteBranchList(type) {
    /**
     * type
     *  - 'release': 已发布分支
     *  - 'dev': 开发分支
     */

    // shell: git ls-remote --refs
    const remoteList = await this.git.listRemote(['--refs']);
    let reg;
    // 提取版本号
    if (type === VERSION_RELEASE) {
      reg = /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/g;
    } else {
      reg = /.+?refs\/heads\/dev\/(\d+\.\d+\.\d+)/g;
    }
    return remoteList.split('\n').map(remote => {
      const match = reg.exec(remote);
      reg.lastIndex = 0; //重置, 重新匹配获取下一个release
      if (match && semver.valid(match[1])) {
        return match[1];
        // match: 1.0.0
      }
    }).filter(_ => _).sort((a, b) => {
      // 获取最新release版本号
      if (semver.lte(b, a)) {
        if (a === b) return 0;
        return -1;
      }
      return 1;
    });
  };

  // 更新项目版本号
  syncVersionToPackageJson = () => {
    const pkg = fse.readJsonSync(`${this.dir}/package.json`);
    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version;
      fse.writeJsonSync(`${this.dir}/package.json`, pkg, { spaces: 2 });
      log.verbose('[Git] 项目版本号更新:', `${this.version}...done`);
    }
  };

  // 检查 stash区缓存
  async checkStash() {
    log.notice('[Git] 检查stash记录...');
    const stashList = await this.git.stashList();
    if (stashList.all.length > 0) {
      await this.git.stash(['pop']);
      log.success('[Git] stash pop', '...done');
    }
  };

  // 自动切换分支
  async checkoutBranch(branch, oTask = null) {
    const localBranchList = await this.git.branchLocal();
    if (localBranchList.all.indexOf(branch) >= 0) {
      await this.git.checkout(branch);
    } else {
      await this.git.checkoutLocalBranch(branch);
    }

    if (oTask) {
      oTask.next(`[Git] 切换分支:`, `${branch}`)
    }
  };

  // 合并远程master分支和开发分支代码
  async pullRemoteMasterAndBranch() {
    console.log();
    log.notice('[Git]  ******** TREE ********');
    log.notice(`[Git] 合并分支:`, `master + ${this.branch}`);
    await this.pullRemoteRepo('master');
    log.success('[Git] 合并远程master分支内容', '...done');
    await this.checkConflicted();
    log.notice('[Git] 检查远程分支...');
    const remoteBranchList = await this.getRemoteBranchList();
    if (remoteBranchList.indexOf(this.version) >= 0) {
      log.notice(`[Git] 合并[${this.branch}] => [${this.branch}]...`);
      await this.pullRemoteRepo(this.branch);
      log.success(`[Git] 合并远程[${this.branch}]分支`, '...done');
      await this.checkConflicted();
    } else {
      log.success(`[Git] 不存在远程分支:`, `${this.branch}`);
    }
  };

  /* release Tag & delete dev branch **********************/

  async releaseTag(startTime) {
    if (this.release) {
      const tasks = new Listr([{
        title: '[Git] 自动发布Tag',
        task: () => new Listr([{
          title: '[Git] 创建Tag',
          task: () => {
            return new Observable(o => {
              this.checkTag(o).then(() => {
                o.complete()
              })
            });
          },
        }, {
          title: '[Git] 切换本地分支至master',
          task: () => {
            return new Observable(o => {
              this.checkoutBranch('master', o).then(() => {
                o.complete()
              })
            });
          },
        }, {
          title: '[Git] 合并dev分支至master',
          task: () => {
            return new Observable(o => {
              this.mergeReleaseToMaster(o).then(() => {
                o.complete()
              })
            });
          },
        }, {
          title: '[Git] 推送代码至远程master分支',
          task: () => {
            return new Observable(o => {
              this.pushRemoteRepo('master', o).then(() => {
                o.complete()
              })
            });
          },
        }, {
          title: '[Git] 删除本地开发分支',
          task: () => {
            return new Observable(o => {
              this.deleteLocalBranch(o).then(() => {
                o.complete()
              })
            });
          },
        }, {
          title: '[Git] 删除远程开发分支',
          task: () => {
            return new Observable(o => {
              this.deleteRemoteBranch(o).then(() => {
                o.complete()
              })
            });
          },
        }, ])
      }]);
      tasks.run().then(() => {
        const endTime = new Date().getTime();
        log.success('[Publish] 本次推送耗时:', Math.floor(endTime - startTime) + 'ms');
      })
    } else {
      log.notice('[Git] Dev commit done, publish this tag version to release by using [-re] parameter.');
    }
  }

  delay(fn) {
    setTimeout(fn, 1000);
  }

  // 检查本地与远程tag分支
  async checkTag(oTask) {
    oTask.next('[Git] 正在创建本地与远程Tag分支...')
    // log.info('[Git] 开始发布Tag...');
    const tag = `${VERSION_RELEASE}/${this.version}`;
    const tagList = await this.getRemoteBranchList(VERSION_RELEASE);
    if (tagList.includes(this.version)) {
      oTask.next(`[Git] 远程tag已存在: ${tag}`)
      oTask.next(`[Git] 执行操作: dev/${this.version} => ${tag}`);
      await this.git.push(['origin', `:refs/tags/${tag}`]);
      oTask.next(`[Git] 删除远程tag: ${tag}`);
    }
    // 获取本地tag
    const localTagList = await this.git.tags();
    if (localTagList.all.includes(tag)) {
      oTask.next(`[Git] 本地tag已存在: ${tag}`);
      await this.git.tag(['-d', tag]);
      oTask.next(`[Git] 本地tag已删除: ${tag}`);
    }
    await this.git.addTag(tag);
    oTask.next(`[Git] 本地tag创建成功, 推送至远程: ${tag}`);
    await this.git.pushTags(['origin']);
    oTask.next(`[Git] done`);
  }

  // 合并release分支到master
  async mergeReleaseToMaster(oTask) {
    oTask.next(`[Git] 正在合并分支: ${this.branch} => master`);
    await this.git.mergeFromTo(this.branch, 'master');
    oTask.next(`[Git] done`);
  }

  // 删除本地开发分支
  async deleteLocalBranch(oTask) {
    oTask.next(`[Git] 正在删除本地开发分支: ${this.branch}`);
    await this.git.deleteLocalBranch(this.branch);
    oTask.next('[Git] done');
  };

  // 删除远程开发分支
  async deleteRemoteBranch(oTask) {
    oTask.next(`[Git] 正在删除远程开发分支: ${this.branch}`);
    await this.git.push(['origin', '--delete', this.branch]);
    oTask.next('[Git] done');
  };
}

module.exports = Git;