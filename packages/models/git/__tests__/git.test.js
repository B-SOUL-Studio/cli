'use strict';

const should = require('should');
const Git = require('../lib');

function createGitInstance({ complexName = false } = {}) {
  if (complexName) {
    return new Git({
      name: '@der-ui/vui',
      version: '0.0.9',
      dir: 'D:\\repository\\QuickStart\\test-ct1',
    }, {})
  } else {
    return new Git({
      name: 'der-ui',
      version: '1.0.0',
      dir: 'D:\\repository\\QuickStart\\test-ct2',
    }, {});
  }
}

// describe('Class Git测试', function () {
//   it('Class Git实例化测试', function () {
//     const git_instance = createGitInstance({ complexName: true });
//     // console.log(git_instance.name);
//     git_instance.name.should.equal('der-ui-vui');
//   })

//   it('获取正确的分支号', async function () {
//     const git_instance = createGitInstance({ complexName: true });
//     const branch = await git_instance.getCorrectVersion();

//   })
// })