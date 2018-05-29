const {
    expect
} = require('chai')

const path = require('path')

const faker = require('faker')

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
    clientUser,
    server
} = require('../../config.json')

const USERINFO = {
    username: clientUser[0].username,
    password: clientUser[0].password
}

const SELECTOR = {
    headerSelector: '._-ShareWebComponents-src-Index-styles-desktop---header-font', // 主标题
    organizationSelector: '._-ShareWebComponents-src-Index-styles-desktop---oem-organization', // 组织信息

    inputContainerSelector: '._-ShareWebComponents-src-Login-styles-desktop---input-user', // 账号密码区域
    userInputSelector: '._-ShareWebComponents-src-Login-styles-desktop---input-user:nth-child(1)>input',
    passwordSelector: '._-ShareWebComponents-src-Login-styles-desktop---input-user:nth-child(2)>input',
    loginButtonSelector: '._-ShareWebComponents-src-Login-styles-desktop---login-submit > button', // 登录按钮
    inputErrorSelector: '._-ShareWebComponents-src-Login-styles-desktop---input-error', // 错误提示

    clientContainerSelector: '._-ShareWebComponents-src-Client-styles-desktop---client',
    clientQRCodeContainerSelector: '._-ShareWebComponents-src-Client-styles-desktop---qrcode-wrap',

    aboutSelector: '.src-views-Index-styles---about', // 底部关于信息，包含版本和版权信息
    aboutMessageSelector: '._-ShareWebComponents-src-About-styles-desktop---message',

    docContainerSelector: '._-ShareWebComponents-src-Docs-styles-desktop---docs',

    toastContainerSelector: '._-ShareWebUI-src-PopOver-styles-desktop---pop-container',
}

describe('登录首页', () => {

    let browser,
        page

    before(async () => {
        browser = await browserPromise()
        page = await browser.newPage()

        await page.setViewport({
            width: 1366,
            height: 768,
        })
        await page.goto(server.client)
        await page.waitFor(SELECTOR.aboutSelector) // 确保页面已经加载完成,使用二次跳转因此无法通过waitUntil判断
    })

    after(async () => {
        await page.close()
    })

    describe('UI', () => {

        it('登录页截图', async () => {
            await page.waitFor(SELECTOR.aboutSelector)
            await page.screenshot({
                path: `${screenshotDir}/fullpage.png`
            })

            const {
                misMatchPercentage
            } = await getDiff(screenshotDir, 'fullpage.png')

            expect(misMatchPercentage * 1).to.be.at.most(0.1, '图像差异大于阈值10%，请检查')
        })

        it('页面title', async () => {
            await page.waitFor('title')
            const title = await page.title()
            expect(title).to.equal('爱数 AnyShare')
        })

        it('页面主标题', async () => {
            await page.waitFor(SELECTOR.headerSelector)
            const headerElement = await page.$(SELECTOR.headerSelector)
            const headerElementText = await page.evaluate(el => el.innerText, headerElement)
            expect(headerElementText).to.equal('欢迎登录')
        })

        it('页面副标题', async () => {
            await page.waitFor(SELECTOR.organizationSelector)
            const organizationElement = await page.$(SELECTOR.organizationSelector)
            const organizationElementText = await page.evaluate(el => el.innerText, organizationElement)
            expect(organizationElementText).to.equal('AnyShare，统一的文档云')
        })

        it('账号密码输入框', async () => {
            const inputContainer = await page.$$(SELECTOR.inputContainerSelector)
            const userInputContainer = inputContainer[0]
            const passwordInputContainer = inputContainer[1]

            await userInputContainer.screenshot({
                path: `${screenshotDir}/账号输入框.png`
            })

            getDiff(screenshotDir, '账号输入框.png')

            await passwordInputContainer.screenshot({
                path: `${screenshotDir}/密码输入框.png`
            })
            getDiff(screenshotDir, '密码输入框.png')

            const userInputPlaceholder = await page.evaluate(el => el.querySelector('input').getAttribute('placeholder'), userInputContainer)
            expect(userInputPlaceholder).to.equal('请输入账号')

            const passwordInputPlaceholder = await page.evaluate(el => el.querySelector('input').getAttribute('placeholder'), passwordInputContainer)
            expect(passwordInputPlaceholder).to.equal('请输入密码')
        })

        it('登录按钮', async () => {
            await page.waitFor(SELECTOR.loginButtonSelector)
            const loginButton = await page.$(SELECTOR.loginButtonSelector)

            /* 文字内容为"登 录" */
            const loginButonText = await page.evaluate(el => el.innerText, loginButton)
            expect(loginButonText).to.equal('登 录')

            /* 按钮宽高400x40 */
            const loginButtonBoundingBox = await loginButton.boundingBox()
            expect(loginButtonBoundingBox.width).to.equal(400)
            expect(loginButtonBoundingBox.height).to.equal(40)

            /* 按钮颜色 */
            const loginButtonBackgoundColor = await page.evaluate(el => {
                const css = document.defaultView.getComputedStyle(el, null)
                return css.getPropertyValue('background-color')
            }, loginButton)
            expect(loginButtonBackgoundColor).to.equal('rgb(215, 0, 0)')

            await loginButton.screenshot({
                path: `${screenshotDir}/登录按钮.png`
            })
            getDiff(screenshotDir, '登录按钮.png')


        })

        it('关于信息', async () => {

            await page.waitFor(SELECTOR.aboutSelector)

            const about = await page.$(SELECTOR.aboutSelector)
            const aboutMessage = await page.$$(SELECTOR.aboutMessageSelector)

            await about.screenshot({
                path: `${screenshotDir}/关于信息.png`
            })
            getDiff(screenshotDir, '关于信息.png')


            const versionText = await page.evaluate(el => el.innerText, aboutMessage[0])
            const copyrightText = await page.evaluate(el => el.innerText, aboutMessage[1])

        })

    })

    describe('交互', () => {

        describe('客户端下载', () => {
            let clientContainer,
                QRCodeContainer;

            before(async () => {
                clientContainer = await page.$$(SELECTOR.clientContainerSelector)
                clientQRCodeContainer = await page.$$(SELECTOR.clientQRCodeContainerSelector)
            })

            it('Windows Advanced客户端-点击下载', async () => {

                let WindowsContainer;
                for (const item of clientContainer) {
                    if (await page.evaluate(el => el.querySelector('p').innerText === 'Windows Advanced', item)) {
                        WindowsContainer = item
                    }
                }

                await WindowsContainer.click()

                await page.screenshot({
                    path: `${screenshotDir}/Windows Advanced客户端点击下载.png`
                })

            })

            it('Windows Standard客户端-点击下载', async () => {

                let WindowsContainer;
                for (const item of clientContainer) {
                    if (await page.evaluate(el => el.querySelector('p').innerText === 'Windows Standard', item)) {
                        WindowsContainer = item
                    }
                }

                await WindowsContainer.click()

                await page.screenshot({
                    path: `${screenshotDir}/Windows Standard客户端点击下载.png`
                })

            })

            it('Mac客户端-点击下载', async () => {

                let MacContainer;
                for (const item of clientContainer) {
                    if (await page.evaluate(el => el.querySelector('p').innerText === 'Mac', item)) {
                        MacContainer = item
                    }
                }
                await MacContainer.click()

                await page.screenshot({
                    path: `${screenshotDir}/Mac客户端-点击下载.png`
                })

            })

            it('IOS-悬浮显示二维码', async () => {
                let IOSContainer;
                for (const item of clientContainer) {
                    if (await page.evaluate(el => el.querySelector('p').innerText === 'iOS', item)) {
                        IOSContainer = item
                    }
                }

                const IOSQRCodeContainer = await page.evaluateHandle((el, selector) => el.querySelector(selector), IOSContainer, SELECTOR.clientQRCodeContainerSelector)

                await IOSContainer.hover()

                await IOSQRCodeContainer.screenshot({
                    path: `${screenshotDir}/IOS二维码.png`
                })

                await page.screenshot({
                    path: `${screenshotDir}/IOS悬浮-显示二维码.png`
                })
            })

            it('Android-悬浮显示二维码', async () => {

                let AndroidContainer;
                for (const item of clientContainer) {
                    if (await page.evaluate(el => el.querySelector('p').innerText === 'Android', item)) {
                        AndroidContainer = item
                    }
                }

                const AndroidQRCodeContainer = await page.evaluateHandle((el, selector) => el.querySelector(selector), AndroidContainer, SELECTOR.clientQRCodeContainerSelector)

                await AndroidContainer.hover()

                await AndroidQRCodeContainer.screenshot({
                    path: `${screenshotDir}/Android下载二维码.png`
                })
                await page.screenshot({
                    path: `${screenshotDir}/Android悬浮显示二维码.png`
                })
            })

            it('Office插件-点击下载', async () => {

                let OfficeContainer;
                for (const item of clientContainer) {
                    if (await page.evaluate(el => el.querySelector('p').innerText.indexOf('Office') !== -1, item)) {
                        OfficeContainer = item
                    }
                }

                await OfficeContainer.click()
            })

            /* 必须放到最后一个，跳转会改变page实例 */
            it.skip('IOS客户端-点击跳转到iTunes商店', async () => {
                let IOSContainer;
                for (const item of clientContainer) {
                    if (await page.evaluate(el => el.querySelector('p').innerText === 'iOS', item)) {
                        IOSContainer = item
                    }
                }
                await IOSContainer.click()

                // 等待跳转
                await page.waitForNavigation({
                    waitUntil: 'networkidle2'
                })

                await page.screenshot({
                    path: `${screenshotDir}/itunes商店中Anyshare页面.png`
                })

                // 返回登录页
                await page.goBack({
                    waitUntil: 'load'
                })
            })

        })

        describe('登录', () => {
            beforeEach('清空输入框', async () => {

                const userInput = await page.$(SELECTOR.userInputSelector)
                const passwordInput = await page.$(SELECTOR.passwordSelector)

                await clearInput(page, userInput)
                await clearInput(page, passwordInput)
            })

            it('不输入账号密码，点击登录-提示没有输入账号', async () => {
                const userInput = await page.$$(SELECTOR.userInputSelector)
                const passwordInput = await page.$$(SELECTOR.passwordSelector)

                const loginButton = await page.$(SELECTOR.loginButtonSelector)
                await loginButton.click()

                const inputError = await page.$(SELECTOR.inputErrorSelector)
                const inputErrorText = await page.evaluate(el => el.innerText, inputError)

                await inputError.screenshot({
                    path: `${screenshotDir}/未输入账号和密码登录提示.png`
                })
                expect(inputErrorText).to.equal('你还没有输入账号')
            })

            it('只输入账号点击登录-提示没有输入密码', async () => {
                const loginButton = await page.$(SELECTOR.loginButtonSelector)
                const userInput = await page.$(SELECTOR.userInputSelector)
                await userInput.type(faker.internet.userName())
                await loginButton.click()

                const inputError = await page.$(SELECTOR.inputErrorSelector)
                const inputErrorText = await page.evaluate(el => el.innerText, inputError)

                await inputError.screenshot({
                    path: `${screenshotDir}/未输入密码登录提示.png`
                })
                expect(inputErrorText).to.equal('你还没有输入密码')
            })

            it('只输入密码点击登录-提示没有输入账号', async () => {
                const loginButton = await page.$(SELECTOR.loginButtonSelector)
                const passwordInput = await page.$(SELECTOR.passwordSelector)
                await passwordInput.type(faker.internet.password())
                await loginButton.click()

                const inputError = await page.$(SELECTOR.inputErrorSelector)
                const inputErrorText = await page.evaluate(el => el.innerText, inputError)

                await inputError.screenshot({
                    path: `${screenshotDir}/未输入账号登录提示.png`
                })
                expect(inputErrorText).to.equal('你还没有输入账号')
            })

            it('输入错误的账号密码登录-提示账号或密码不正确', async () => {
                const loginButton = await page.$(SELECTOR.loginButtonSelector)
                const userInput = await page.$(SELECTOR.userInputSelector)
                const passwordInput = await page.$(SELECTOR.passwordSelector)

                await userInput.type(faker.internet.userName())
                await passwordInput.type(faker.internet.password())
                await loginButton.click()

                // 等待提示内容改变
                await page.waitFor(selector => document.querySelector(selector).innerText == '账号或密码不正确', {}, SELECTOR.inputErrorSelector)

                // ElementHandle为静态，即获取到的ElementHandle不会跟随Element变化而变化，类似于Element的一个快照而不是引用
                // 必须在内容改变之后获取ElementHandle，否则ElementHandle保存将是提示内容改变前的元素句柄
                const inputError = await page.$(SELECTOR.inputErrorSelector)
                const inputErrorText = await page.evaluate(el => el.innerText, inputError)

                await inputError.screenshot({
                    path: `${screenshotDir}/输入错误的账号密码登录提示.png`
                })
                expect(inputErrorText).to.equal('账号或密码不正确')
            })

            it('输入正确的账号密码登录-正确登录', async () => {
                const loginButton = await page.$(SELECTOR.loginButtonSelector)
                const userInput = await page.$(SELECTOR.userInputSelector)
                const passwordInput = await page.$(SELECTOR.passwordSelector)

                await userInput.type(USERINFO.username)
                await passwordInput.type(USERINFO.password)
                await loginButton.click()

                await page.waitFor(SELECTOR.docContainerSelector)

                await page.screenshot({
                    path: `${screenshotDir}/正确登录.png`
                })

            })

        })

    })

})