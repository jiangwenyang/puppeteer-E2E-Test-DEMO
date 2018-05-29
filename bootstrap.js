const puppeteer = require('puppeteer')
const {
    expect
} = require('chai')
const chalk = require('chalk')
const browserPromise = require('./browserPromise')

let borwser
before(async () => {
    browser = await browserPromise()
    console.log(chalk.green(`Start of test in ${await browser.version()}`))
})

after(() => {
    console.log(chalk.green('End of test'))
    browser.close()
})