module.exports = {
  hooks: {
    readPackage(pkg) {
      // 允许 electron 运行构建脚本
      return pkg
    }
  }
}
