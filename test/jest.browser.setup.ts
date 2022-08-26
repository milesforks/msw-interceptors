import { createBrowser, CreateBrowserApi, server } from 'page-with'
import webpackConfig from './webpack.config'

let browser: CreateBrowserApi

beforeAll(async () => {
  console.log(
    'createBrowser, current server.connectionInfo =',
    server?.connectionInfo
  )
  browser = await createBrowser({
    launchOptions: {
      args: ['--allow-insecure-localhost'],
      logger: {
        isEnabled: () => true,
        log: (...args) => console.log('BROWSER:', ...args),
      },
    },
    serverOptions: {
      webpackConfig,
    },
  })

  console.log(
    'createBrowser, new server.connectionInfo =',
    server?.connectionInfo
  )
})

afterAll(async () => {
  await browser.cleanup()
})
