/**
 * GitServer 基类
 *  用于实现 Github/Gitee类
 */
class GitServer {
  constructor(type, token) {
    this.type = type; // github or gitee
    this.token = token; // 调用API的token
  }

  // 设置token
  setToken() {
    error('setToken');
  };
  // 创建个人仓库
  createRepo() {
    error('createRepo');
  };
  // 创建组织仓库
  createOrgRepo() {
    error('createOrgRepo');
  };
  // 获取仓库
  getRepo() {
    error('getRepo');
  };
  // 获取平台用户信息
  getUser() {
    error('getUser');
  };
  // 获取组织用户信息
  getOrgs() {
    error('getOrgs');
  };
  // 获取
  getTokenHelpUrl() {
    error('getTokenHelpUrl');
  };

  getSSHKeysUrl() {
    error('getSSHKeysUrl');
  };

  getSSHKeysHelpUrl() {
    error('getSSHKeysHelpUrl');
  };

  getRemote() {
    error('getRemote');
  };

  isHttpResponse(response) {
    return response && response.status && response.statusText &&
      response.headers && response.data && response.config;
  };

  handleResponse(response) {
    if (this.isHttpResponse(response) && response !== 200) {
      return null;
    } else {
      return response;
    }
  };
}

const error = (methodName) => {
  throw new Error(`${methodName} must be implemented!`);
}

module.exports = GitServer;