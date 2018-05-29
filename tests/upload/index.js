const {
    expect
} = require('chai')

const faker = require('faker')

const path = require('path')

const {
    getDiff
} = require('../../util/imgDiff')

const {
    createScreenshotDir
} = require('../../util/path')

const {
    clearInput
} = require('../../util/keyboard')

const browserPromise = require('../../browserPromise')
const screenshotDir = createScreenshotDir(path.basename(__dirname))

const {
    server,
    clientUser
} = require('../../config.json')

// 用户信息
const USERINFO = {
    username: clientUser[0].username,
    password: clientUser[0].password
}

const SELECTOR = {

    aboutSelector: '.src-views-Index-styles---about', // 底部关于信息，包含版本和版权信息
    
    userInput: '._-ShareWebComponents-src-Login-styles-desktop---input-user:nth-child(1)>input', // 账号输入框
    password: '._-ShareWebComponents-src-Login-styles-desktop---input-user:nth-child(2)>input', // 密码输入框
    loginButton: '._-ShareWebComponents-src-Login-styles-desktop---login-submit > button', // 登录按钮

    docContainer: '._-ShareWebComponents-src-Docs-styles-desktop---docs', // 文档容器
    userDocItem: '._-ShareWebComponents-src-Docs-List-styles-desktop---item', // 顶层用户文档

    uploadInput: '._-ShareWebComponents-src-Upload-Picker-styles-desktop---input', // 所有上传按钮（默认|悬浮出现的文件上传|悬浮出现的文件夹上传）
    docname: '._-ShareWebComponents-src-Docs-List-styles-desktop---name', // 文档列表中的文件名

    crumbs: '._-ShareWebComponents-src-Docs-Crumbs-styles-desktop---crumb', // 包含返回按钮路径

    selectAll: '._-ShareWebComponents-src-Docs-ToolBar-styles-desktop---container ._-ShareWebUI-src-CheckBox-styles-desktop---checkbox', // 全选按钮
    toolbarButton: '._-ShareWebComponents-src-Docs-ToolBar-styles-desktop---button', // 所有工具栏按钮

    dialogContainer: '._-ShareWebUI-src-Dialog2-styles-desktop---container', // 弹出框
    dialogButton: '._-ShareWebUI-src-Dialog2-styles-desktop---container ._-ShareWebUI-src-Panel-Footer-styles-desktop---container button' // 弹出框按钮，可能包含多个

}

describe('文件上传', () => {

    let browser,
        page;

    before(async () => {
        browser = await browserPromise()
        page = await browser.newPage()

        await page.setViewport({
            width: 1366,
            height: 768,
        })
        await page.goto(server.client)
        await page.waitFor(SELECTOR.aboutSelector) // 确保页面已经加载完成,使用二次跳转因此无法通过waitUntil判断
        
        /* 登录 */
        await page.type(SELECTOR.userInput, USERINFO.username)
        await page.type(SELECTOR.password, USERINFO.password)
        await page.click(SELECTOR.loginButton)

        await page.waitFor(SELECTOR.docContainer)
        /* 登录完成 */

        // 进入个人文档
        await page.click(SELECTOR.userDocItem, {
            clickCount: 2
        })
    })

    after(async () => {
        await page.close()
    })

    describe('交互', async () => {
        let inputsHandle, // 所有文件上传按钮句柄集合
            defalutUpload, // 默认点击上传按钮句柄
            fileUploadInput, // 悬浮选择文件上传句柄
            dirUploadInput; // 悬浮选择文件夹上传句柄

        before(async () => {
            await page.waitFor(SELECTOR.uploadInput)
            inputsHandle = await page.$$(SELECTOR.uploadInput)
            defalutUpload = inputsHandle[0]
            fileUploadInput = inputsHandle[1]
            dirUploadInput = inputsHandle[2]
        })

        it('上传单个文件', async () => {

            await fileUploadInput.uploadFile(path.resolve(__dirname + '/source/jpg.jpg'))
            await page.waitFor(selector => [...document.querySelectorAll(selector)].some(node => node.innerText === 'jpg.jpg'), {}, SELECTOR.docname)

        })

        it('上传文件夹', async () => {

            await dirUploadInput.uploadFile(path.resolve(__dirname + '/source'))
            // 文件夹显示在列表中
            await page.waitFor(selector => [...document.querySelectorAll(selector)].some(node => node.innerText === 'source'), {}, SELECTOR.docname)

            // 进入文件夹，检查文件数量正确
            const docHandleList = await page.$$(SELECTOR.docname)

            page.$$eval(SELECTOR.docname, (docs) => {
                docs.forEach(doc => {
                    doc.innerText === 'source' && doc.click()
                })
            })
            await page.waitFor(selector => [...document.querySelectorAll(selector)].length === 4, {}, SELECTOR.crumbs)
            await page.waitFor(SELECTOR.docname, (doc) => doc.length === 5)

            await page.click(SELECTOR.crumbs)
            await page.waitFor(selector => [...document.querySelectorAll(selector)].length === 3, {}, SELECTOR.crumbs)

            await page.click(SELECTOR.selectAll)
            const deleteAllButton = (await page.$$(SELECTOR.toolbarButton))[3]

            await deleteAllButton.click()

            await page.waitFor(SELECTOR.dialogContainer)

            await page.click(SELECTOR.dialogButton)

            await page.waitFor(SELECTOR.dialogContainer, {
                hidden: true
            })
        })

    })

})