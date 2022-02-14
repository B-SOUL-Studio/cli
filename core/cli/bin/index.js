#! /usr/bin/env node

const importLocal = require('import-local');
const log = require('@der-cli-dev/log');

// 生产/开发环境
if (importLocal(__filename)) {
  log.info('cli', '欢迎━(*｀∀´*)ノ亻!使用 der-cli 本地版本')
} else {
  require('../lib')(process.argv.slice(2));
}