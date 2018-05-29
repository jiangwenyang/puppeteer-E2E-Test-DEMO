/**
 * 清空输入框
 * @param {object} pageInstance 输入框元素所处的页面的puppeteer page实例
 * @param {object} elementHandle 元素句柄
 */
async function clearInput(pageInstance, elementHandle) {
    await elementHandle.click()
    await pageInstance.keyboard.down('Control')
    await pageInstance.keyboard.down('KeyA')
    await pageInstance.keyboard.press('Backspace')
    await pageInstance.keyboard.up('Control')
    await pageInstance.keyboard.up('KeyA')
}

exports = module.exports = {
    clearInput
}