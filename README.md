# Puppeteer端到端（E2E）测试DEMO
基于puppeteer的AnyShare端到端（E2E）测试。

## 项目结构

## 使用

- 无头模式

  ```shell
  $ yarn test
  ```

- 调试模式

  默认slowMo为100ms，开启devtools

  ```
  $ yarn test-dev
  ```

## 依赖库
- [puppeteer](https://github.com/GoogleChrome/puppeteer) Chrome团队推出的headless browser
- [mocha](https://github.com/mochajs/mocha) 测试框架
- [chai](https://github.com/chaijs/chai) 支持TDD 和 BDD 风格的断言库
- [faker.js](https://github.com/Marak/Faker.js) 用于生成各种模拟数据
- [lodash](https://github.com/lodash/lodash) JavaScript函数库，提供一些相互独立的实用的函数
- [chalk](https://github.com/chalk/chalk) 命令行输出美化库
- [Resemble.js](https://github.com/HuddleEng/Resemble.js) 图像分析和对比的库

## Debug

- 使用`console.log()` 调试

- 使用VS-Code的node调试工具：【调试】-【添加配置】，配置信息参考：

  ```json
  {
      // 使用 IntelliSense 了解相关属性。 
      // 悬停以查看现有属性的描述。
      // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
      "version": "0.2.0",
      "configurations": [
          {
              "type": "node",
              "request": "launch",
              "name": "Puppeteer Mocha test",
              "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
              "args": [
                  "${workspaceFolder}/bootstrap.js",
                  "${workspaceFolder}/tests"
                  "--no-timeouts",
                  "--colors",
                  "--recursive",
              ],
              "internalConsoleOptions": "openOnSessionStart"
          },
      ]
  }
  ```

  然后F5就可以启动调试，建议使用这种方式进行调试。

- ​



## Troubleshooting

- puppeteer安装缓慢？

  puppeteer安装的时候默认会下载最新版的Chromium(~170Mb Mac, ~282Mb Linux, ~280Mb Win) ，鉴于国内的网络环境，耗时较长建议跳过安装。

  通过环境变量的方式：

  ```shell
  $ env PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true" yarn add puppeteer
  ```

  或者设置npm config的方式：

  ```shell
  $ yarn config set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD "true"
  $ yarn add puppeteer
  ```

  [Environment variables](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#environment-variables)

  或者简单忽略intall.js脚本的执行：

  ```
  $ yarn add puppeteer --ignore-scripts
  ```

  然后在使用的时候指定Chrome的执行路径

  ```js
  puppeteer.launch({
      headless:false,
      executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  })
  ```

- 启动puppeteer报错

  错误信息：UnhandledPromiseRejectionWarning: Error: Protocol error (Page.getFrameTree): 'Page.g
  etFrameTree' wasn't found undefined

  ![](http://ow67vzejn.bkt.clouddn.com/18-3-27/51229198.jpg)

  **issue**:https://github.com/GoogleChrome/puppeteer/issues/1681

- 使用Async Await报错

  使用Async Await的语法需要node v7.6版本以上，因此如果node版本低于v7.6原生是不支持的，可以升级node到v7.6以上版本。

- puppeteer headless模式默认语言为en-us

  headless模式下，puppeteer使用的Chrome为en-us，而界面模式则会跟随操作系统。可以通过在`page.launch({args: ['--lang=zh-cn,zh']})` 设置默认语言为zh-cn

  参考：https://stackoverflow.com/questions/46908636/how-to-specify-browser-language-in-puppeteer

- Dom更新后通过保存的ElementHandle获取Dom节点信息时节点信息未更新

  ElementHandle相当于节点的快照，而不是引用。因此如果要获取最新的Dom节点信息，必须在dom更新后再重新获取。

  ```javascript
  const elementHandleOld = page.$('.elment-selector')
  elementHandleOldText = page.evalute(el=>el.innerText,elementHandleOld) // 'old innerText'

  buttonHandle.click() // 点击之后ElementHandleOld的元素内容改变

  console.log(page.evalute(el=>el.innerText,elementHandleOld)) // 'old innerText',使用原来的句柄，仍然返回句柄定义时的Dom节点信息

  let elementHandleNew = page.$('.elment-selector') // 获取新的句柄
  console.log(page.evalute(el=>el.innerText,elementHandleOld)) // 'new innerText'，获取到新的Dom节点信息

  /*另外两种获取最新的Dom节点信息的方式*/
  console.log(page.$eval('.elment-selector',el=>el.innerText)) // 'new innerText'
  console.log(page.evaluate(()=>document.querySelector('.elment-selector').innerText)) // 'new innerText'
  ```

- ​文件上传
Puppeteer支持单个文件或文件夹，无法同时上传多个文件或文件夹。使用时注意路径，尽量使用绝对路径，如果传入相对路径则会以程序进程所在路径进行绝对路径的计算，可以使用`process.cwd()`查看当前的进程所在路径。
  ```javascript
  // upload example
  const fileInputHandle = page.$('input[type="file"]') // 获取上传按钮句柄
  fileInputHandle.uploadFile(require('path').resolve(__dirname,'source/test.png')) // 传入文件的绝对路径上传文件
  ```
  **tips：** ElementHandle.uploadFile() 这个API resolve的时候并不代表文件已经上传完成，关于文件是否上传完成需要自行判断。
- 

