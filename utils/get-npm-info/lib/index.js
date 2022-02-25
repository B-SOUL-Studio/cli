'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');
const {
  REGISTRY_TAOBAO_NPM,
  REGISTRY_ORIGIN_NPM
} = require('./const');

/**
 * 
 *
 * @param {*} npmName 包名
 * @param {*} registry 源
 * @return {*} 
 */
function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }
  const registryUrl = registry || getDefaultRegistry();
  // https://registry.npmjs.org/@der-cli/core
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  return axios.get(npmInfoUrl).then(response => {
    if (response.status === 200) {
      return response.data;
    }
    return null;
  }).catch(err => {
    // TODO log.fail(err);
    return Promise.reject(err);
  });
}

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? REGISTRY_ORIGIN_NPM : REGISTRY_TAOBAO_NPM;
}

// 获取npm包的版本号，返回数组
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

// 获取满足条件的版本号：过滤版本列表中大于当前版本号的版本
function getSemverVersions(baseVersion, versions) {
  return versions
    .filter(version => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => semver.gt(b, a) ? 1 : -1); // 降序排列
}

async function getNpmSemverVersion(baseVersion, npmName, _registry) {
  const versions = await getNpmVersions(npmName, _registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
  return null;
}

// 获取最新版本号
async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);

  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[versions.length - 1];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
};