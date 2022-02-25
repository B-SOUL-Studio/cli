const GitServer = require('./GitServer');
const GithubRequest = require('./GithubRequest');

/**
 * Git 类
 */
class Github extends GitServer {
  constructor() {
    super('github'); // git server type
    this.request = null
  }

  getTokenHelpUrl() {
    return 'https://github.com/settings/tokens';
  };

  getUser() {
    return this.request.get('/user').then(response => {
      return this.handleResponse(response);
    });
  };

  getOrgs() {
    return this.request.get('/user/orgs', {
      page: 1,
      per_page: 100,
    }).then(response => {
      return this.handleResponse(response);
    });
  };

  setToken(token) {
    this.request = new GithubRequest(token);
  };

  // 获取仓库详情
  getRepo(owner, repo) {
    return new Promise((resolve, reject) => {
      this.request.get(`/repos/${owner}/${repo}`)
        .then(response => {
          resolve(this.handleResponse(response));
          // resolve(response);
        }).catch(error => {
          reject(error);
        });
    })
  };

  // 创建个人仓库
  createRepo(repo) {
    return this.request.post('/user/repos', {
      name: repo,
    }, {
      Accept: 'application/vnd.github.v3+json',
    });
  };

  // 创建组织仓库
  createOrgRepo(repo, login) {
    return this.request.post(`/orgs/${login}/repos`, {
      name: repo,
    }, {
      Accept: 'application/vnd.github.v3+json',
    });
  };

  // 获取远程仓库地址
  getRemote(login, repo) {
    return `git@github.com:${login}/${repo}.git`;
  };

  getSSHKeysUrl() {
    return 'https://github.com/settings/keys';
  };

  getSSHKeysHelpUrl() {
    return 'https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/connecting-to-github-with-ssh';
  };
}

module.exports = Github;