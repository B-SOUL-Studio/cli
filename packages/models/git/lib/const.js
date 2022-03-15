const DEFAULT_CLI_HOME = '.der-cli';
const GIT_ROOT_DIR = '.git';
const GIT_SERVER_FILE = '.git_server';
const GIT_TOKEN_FILE = '.git_token';
const GIT_LOGIN_FILE = '.git_login';
const GIT_OWN_FILE = '.git_own';
const GIT_PUBLISH_FILE = '.git_publish';
const GIT_IGNORE_FILE = '.gitignore';
const REPO_OWNER_USER = 'user'; // 用户仓库
const REPO_OWNER_ORG = 'org'; // 组织仓库

const GITHUB = 'github';
const GITEE = 'gitee';

const VERSION_RELEASE = 'release';
const VERSION_DEVELOP = 'dev';
const COMPONENT_FILE = '.componentrc';

const TEMPLATE_TEMP_DIR = 'oss';

const GIT_SERVER_TYPE = [{
  name: 'Github',
  value: GITHUB,
}, {
  name: 'Gitee(码云)',
  value: GITEE,
}];

const GIT_OWNER_TYPE = [{
  name: '个人',
  value: REPO_OWNER_USER,
}, {
  name: '组织',
  value: REPO_OWNER_ORG,
}];

const GIT_OWNER_TYPE_ONLY = [{
  name: '个人',
  value: REPO_OWNER_USER,
}];

const GIT_PUBLISH_TYPE = [{
  name: 'OSS',
  value: 'oss',
}];

const GIT_COMMIT_TYPE = [{
    value: 'feat',
    name: 'feat:      新功能',
  },
  {
    value: 'fix',
    name: 'fix:       修复',
  },
  {
    value: 'docs',
    name: 'docs:      文档变更',
  },
  {
    value: 'style',
    name: 'style:     代码格式(不影响代码运行的变动)',
  },
  {
    value: 'refactor',
    name: 'refactor:  重构(既不是增加feature),也不是修复bug',
  },
  {
    value: 'pref',
    name: 'pref:      性能优化',
  },
  {
    value: 'test',
    name: 'test:      增加测试',
  },
  {
    value: 'chore',
    name: 'chore:     构建过程或辅助工具的变动',
  },
  {
    value: 'revert',
    name: 'revert:    回退',
  },
  {
    value: 'build',
    name: 'build:     打包',
  },
]

module.exports = {
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
  GIT_COMMIT_TYPE
}