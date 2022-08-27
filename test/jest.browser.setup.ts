import { debug } from 'debug'
import { createBrowser, CreateBrowserApi, server } from 'page-with'
import webpackConfig from './webpack.config'

let browser: CreateBrowserApi

beforeAll(async () => {
  browser = await createBrowser({
    launchOptions: {
      args: ['--allow-insecure-localhost'],
      logger: {
        isEnabled: () => true,
        log: (...args) => debug('browser')('BROWSER:', ...args),
      },
    },
    serverOptions: {
      webpackConfig,
    },
  }).then((browser) => {
    // note: we know server connection is up because createBrowser waited `until`
    // it was up, meaning PreviewServer.listen() set `this.connectionInfo`
    const conn = server!.connectionInfo!

    // bug: `PreviewServer.listen()` serializes IPv6 hosts to invalid URL (missing square brackets)
    // see: node_modules/page-with/lib/server/PreviewServer.js / PreviewServer.listen

    // fix: re-serialize any URL containing an IPv6 host without surrounding brackets
    if (conn.host.includes(':') && !conn.url.includes(`[${conn.host}]`)) {
      // note: scheme is hardcoded to `http` to match `PreviewServer.listen()`
      server!.connectionInfo!.url = `http://[${conn.host}]:${conn.port}`
      console.log(`PATCH CONNECTION, new URL<conn.url> = ${conn.url}`)
      console.log(
        `PATCH CONNECTION, new URL<server!.connectionInfo!.url> = ${
          server!.connectionInfo!.url
        }`
      )
    }

    return browser
  })

  console.log(
    'createBrowser, new server.connectionInfo',
    server?.connectionInfo
  )
})

afterAll(async () => {
  await browser.cleanup()
})
