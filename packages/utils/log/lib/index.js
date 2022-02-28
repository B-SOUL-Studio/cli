'use strict';

const log = require('npmlog');

// 判断debug模式
log.level = process.env.DER_CLI_LOG_LEVEL ? process.env.DER_CLI_LOG_LEVEL : 'info';
// 前缀
log.heading = 'der';
log.headingStyle = { fg: 'white', bg: 'cyan' };

// 添加自定义命令
log.addLevel('success', 2000, { fg: 'green', bold: true });
log.addLevel('fail', 2000, { fg: 'red', bold: true });

module.exports = log;