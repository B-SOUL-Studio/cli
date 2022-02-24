'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const should = require('should');
const Package = require('../lib');
const { getNpmLatestVersion } = require('@der-cli-dev/get-npm-info');
const {
  Error_CONST_EMPTY_OPTION,
  Error_CONST_OPTION_IS_NOT_OBJECT,
} = require('../lib/error');

const TARGET_PATH = 'D:/repository/QuickStart/der-cli-dev/commands/init'
const TARGET_PATH2 = 'C:\\Users\\86136\\.der-cli-dev\\dependencies'
const STORE_DIR = 'C:\\Users\\86136\\.der-cli-dev\\dependencies\\node_modules'
const PACKAGE_NAME = '@der-cli-dev/init'
const PACKAGE_NAME_CONVERT = '@der-cli-dev_init'
const PACKAGE_VERSION = '1.0.0'
const PACKAGE_LATEST_VERSION = 'latest'

function createPackageInstance(options = { haveTargetPath: true }) {
  const packageVersion = options.latestVersion ? PACKAGE_LATEST_VERSION : PACKAGE_VERSION
  const { haveTargetPath } = options
  return haveTargetPath ?
    new Package({
      targetPath: TARGET_PATH,
      storeDir: STORE_DIR,
      packageName: PACKAGE_NAME,
      packageVersion
    }) :
    new Package({
      storeDir: STORE_DIR,
      packageName: PACKAGE_NAME,
      packageVersion
    })
}

function createPackageInstanceWithoutTargetPath() {
  return createPackageInstance({ haveTargetPath: false })
}

describe('Package 对象实例化', function () {
  it('Options参数为空', function () {
    try {
      new Package();
    } catch (err) {
      err.message.should.equal(Error_CONST_EMPTY_OPTION)
    }
  });
  it('Options参数不为对象', function () {
    try {
      new Package(1);
    } catch (err) {
      err.message.should.equal(Error_CONST_OPTION_IS_NOT_OBJECT)
    }
    try {
      new Package(function () {});
    } catch (err) {
      err.message.should.equal(Error_CONST_OPTION_IS_NOT_OBJECT)
    }
  });
  it('带targetPath的实例化', function () {
    const pkg_instance = createPackageInstance();
    pkg_instance.should.have.property('targetPath', TARGET_PATH);
    pkg_instance.should.have.property('storeDir', STORE_DIR);
    pkg_instance.should.have.property('packageName', PACKAGE_NAME);
    pkg_instance.should.have.property('packageVersion', PACKAGE_VERSION);
    pkg_instance.should.have.property('cacheFilePathPrefix', PACKAGE_NAME_CONVERT);
  });
  it('不带targetPath的实例化', function () {
    const pkg_instance = createPackageInstanceWithoutTargetPath()
    pkg_instance.should.have.property('targetPath', undefined);
    pkg_instance.should.have.property('storeDir', STORE_DIR);
    pkg_instance.should.have.property('packageName', PACKAGE_NAME);
    pkg_instance.should.have.property('packageVersion', PACKAGE_VERSION);
    pkg_instance.should.have.property('cacheFilePathPrefix', PACKAGE_NAME_CONVERT);
  });
});

describe('Package prepare', function () {
  before(function () {
    if (fs.existsSync(STORE_DIR)) {
      this.timeout(30000)
      fse.removeSync(STORE_DIR)
    }
  })
  it('storeDir不存在时, 创建storeDir', async function () {
    fs.existsSync(STORE_DIR).should.be.false()
    const pkgInstance = createPackageInstance({ latestVersion: true });
    await pkgInstance.prepare();
    fs.existsSync(STORE_DIR).should.be.true()
  })
  it('packageVersion为latest获取最新版本号', async function () {
    const pkgInstance = createPackageInstance({ latestVersion: true });
    await pkgInstance.prepare();
    this.packageVersion = await getNpmLatestVersion(PACKAGE_NAME);
    // console.log(this.packageVersion);
    pkgInstance.packageVersion.should.equal(this.packageVersion)
  })
})

describe('Package cacheFilePath属性测试', function () {
  it('获取cacheFilePath属性', function () {
    const intance = createPackageInstance();
    const actulPath = `${STORE_DIR}\\_${PACKAGE_NAME_CONVERT}@${PACKAGE_VERSION}@@der-cli-dev\\init`
    intance.cacheFilePath.should.equal(actulPath);
  })
})

describe('Package getSpecificCacheFilePath方法测试', function () {
  it('获取getSpecificCacheFilePath属性', function () {
    const intance = createPackageInstance();
    const actulPath = `${STORE_DIR}\\_${PACKAGE_NAME_CONVERT}@${PACKAGE_VERSION}@@der-cli-dev\\init`
    intance.getSpecificCacheFilePath('1.0.0').should.equal(actulPath);
  })
})

describe('Package exists方法测试', function () {
  it('有targetPath时, 正确判断package是否存在', async function () {
    const pkg_intance = createPackageInstance();
    delete pkg_intance.storeDir;
    (await pkg_intance.exists()).should.be.true();
  })
  it('无targetPath时, 正确判断package是否存在', async function () {
    const pkg_intance = createPackageInstanceWithoutTargetPath();
    (await pkg_intance.exists()).should.be.false();
  })
})

describe('Package getRootFilePath方法测试', function () {
  it('有targetPath时, 正确获取入口文件', async function () {
    const pkg_intance = createPackageInstance();
    delete pkg_intance.storeDir;
    (await pkg_intance.getRootFilePath()).should.equal(`${TARGET_PATH}/lib/index.js`);
  })
  it('入口文件不存在时, 返回null', function () {
    const pkg_intance = createPackageInstanceWithoutTargetPath();
    should.strictEqual(pkg_intance.getRootFilePath(), null)
  })
})

describe('Package install方法测试', function () {
  it('正确install Package', async function () {
    this.timeout(30000)
    // const pkg_intance = createPackageInstanceWithoutTargetPath();
    const pkg_intance = new Package({
      targetPath: TARGET_PATH2,
      storeDir: STORE_DIR,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_LATEST_VERSION,
    })
    await pkg_intance.install();
    (await pkg_intance.getRootFilePath()).should.equal('C:/Users/86136/.der-cli-dev/dependencies/node_modules/_@der-cli-dev_init@0.0.10@@der-cli-dev/init/lib/index.js')
  })
  after(function () {
    if (fs.existsSync(STORE_DIR)) {
      this.timeout(30000)
      fse.removeSync(STORE_DIR)
    }
  })
})

describe('Package update方法测试', function () {
  it('正确update Package', async function () {
    this.timeout(30000)
    const pkg_intance = new Package({
      targetPath: TARGET_PATH2,
      storeDir: STORE_DIR,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
    })
    await pkg_intance.update();
    // console.log(await pkg_intance.getRootFilePath());
    (await pkg_intance.getRootFilePath()).should.equal('C:/Users/86136/.der-cli-dev/dependencies/node_modules/_@der-cli-dev_init@0.0.10@@der-cli-dev/init/lib/index.js')
  })
  after(function () {
    if (fs.existsSync(STORE_DIR)) {
      this.timeout(30000)
      fse.removeSync(STORE_DIR)
    }
  })
})