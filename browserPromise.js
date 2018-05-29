const puppeteer = require('puppeteer')

const isDebugMode = process.argv.some(arg => arg === '--dev'); // 命令行参数传入--dev时，开启调试模式，将关闭无头模式，并默认打开控制台

// puppeteer 配置
// https://github.com/GoogleChrome/puppeteer/blob/v1.3.0/docs/api.md#puppeteerlaunchoptions
const defaultOpts = {
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\Chrome.exe', // Chrome执行路径（注意路径转义）
    headless: !isDebugMode, // 是否开启无头模式
    devtools: isDebugMode, // 是否默认打开开发者工具
    slowMo: isDebugMode ? 100 : 0,
    args: ['--lang=zh-cn,zh'] // 统一设置浏览默认语言为zh-cn(headless为true时默认en-us,headless为false时跟随操作系统)
}
const browserPromise = puppeteer.launch(defaultOpts)
exports = module.exports = () => browserPromise // 返回browser的Promise，所有测试用例共用同一个browser实例