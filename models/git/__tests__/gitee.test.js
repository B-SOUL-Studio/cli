'use strict';

const fs = require('fs');
const should = require('should');
const Gitee = require('../Git/Gitee');
const GiteeRequest = require('../Git/GiteeRequest');

const GIT_TOKEN_PATH = 'C:/Users/86136/.der-cli-dev/.git/.git_token'
const OWN_GITEE_REPO = 'DailyCode1.0'

function createGiteeInstance() {
  const token = fs.readFileSync(GIT_TOKEN_PATH).toString();
  const gitee = new Gitee();
  gitee.setToken(token);
  return gitee;
}

describe('Class Gitee 实例化', function () {
  it('Gitee实例化检查', function () {
    const gitee = new Gitee();
    gitee.setToken('123456')
    gitee.type.should.equal('gitee');
    // gitee.token.should.equal('123456');
    gitee.request.should.not.equal(null)
    // 检查gitee.request是否为GiteeRequest实例化对象
    gitee.request.__proto__.should.equal(GiteeRequest.prototype)
    gitee.request.token.should.equal('123456')
  });
});

describe('Gitee获取个人或组织信息', function () {
  it('[http] 获取个人信息', async function () {
    const gitee_instance = createGiteeInstance();
    const user = await gitee_instance.getUser();
    user.login.should.equal('ok-song');
  })
  it('[http] 获取组织信息', async function () {
    const gitee_instance = createGiteeInstance();
    const user = await gitee_instance.getUser();
    const org = await gitee_instance.getOrgs(user.login);
    org.should.be.an.Array();
    org[0].login.should.equal('der-cli');
  })
})

describe('Gitee获取仓库信息', function () {
  it('[http] 获取指定仓库信息', async function () {
    const gitee_instance = createGiteeInstance();
    const user = await gitee_instance.getUser();
    const { login } = user;
    const repo = await gitee_instance.getRepo(login, OWN_GITEE_REPO);
    repo.full_name.should.equal(`${login}/${OWN_GITEE_REPO}`);
  })
})