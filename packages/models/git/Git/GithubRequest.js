const axios = require('axios');
// const log = require('../log');

const BASE_URL = 'https://api.github.com';

/**
 * 参考: https://docs.github.com/cn/rest/overview/resources-in-the-rest-api
 */
class GithubRequest {
  constructor(token) {
    this.token = token;
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    });
    this.service.interceptors.request.use(
      config => {
        config.headers['Authorization'] = `token ${this.token}`;
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );
    this.service.interceptors.response.use(
      response => {
        // 返回data对象
        return response.data;
      },
      error => {
        if (error.response && error.response.data) {
          // 返回response对象
          return error.response;
        } else {
          return Promise.reject(error);
        }
      },
    );
  }

  get(url, params, headers) {
    return this.service({
      url,
      data: params,
      method: 'get',
      headers,
    });
  }

  post(url, data, headers) {
    return this.service({
      url,
      data,
      method: 'post',
      headers,
    });
  }
}

module.exports = GithubRequest;