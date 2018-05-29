const path = require('path')
const fs = require('fs')
const {
    screenshotPath
} = require('../config.json')

/**
 * 创建截图保存目录，并返回保存路径
 * @param {string} saveDirName 保存截图的文件夹名
 * @param {string} rootDir 截图保存的根目录，默认读取config.json中的screenshotDir
 * @returns {string} 截图保存的最终目录
 * @example
 * 
 * createScreenshotDir('login') // config.json中默认保存目录为C:\Users\admin\Desktop\tmp
 * // => 'C:\Users\admin\Desktop\tmp\login'
 */
function createScreenshotDir(saveDirName, rootDir = screenshotPath) {
    const date = new Date()
    const savePath = path.resolve(rootDir, saveDirName, `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`, date.getTime().toString())
    createDirFromPath(savePath)
    return savePath
}

/**
 * 根据绝对路径创建目录
 * @param {string} absolutePath 目录的绝对路径
 * @example
 * 
 * createDirFromPath('C:\Users\admin\Desktop\tmp\path1\path2\path3')
 * // => 级联创建目录
 */
function createDirFromPath(absolutePath) {
    if (fs.existsSync(absolutePath)) {
        return true
    } else if (createDirFromPath(path.resolve(absolutePath, '..'))) {
        fs.mkdirSync(absolutePath);
        return true;
    }
}

exports = module.exports = {
    createScreenshotDir
}