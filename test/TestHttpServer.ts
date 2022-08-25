import {
  HttpServer as OrigHttpServer,
  httpsAgent,
} from '@open-draft/test-server/http'

var origGetServerAddress = OrigHttpServer.getServerAddress

export const HttpServer = OrigHttpServer

HttpServer.getServerAddress = function () {
  const address = origGetServerAddress.apply(
    this,
    arguments as unknown as Parameters<typeof HttpServer.getServerAddress>
  )

  console.log('CALL WRAPPED VERSION FOR ADDRESS.HOST =', address.host)

  Object.defineProperty(address, 'href', {
    get() {
      // assume: host with `:` is definitely not valid IPv4, likely valid IPv6
      return new URL(
        `${this.protocol}//${
          this.host.includes(':') &&
          !this.host.startsWith('[') &&
          !this.host.endsWith(']')
            ? `[${this.host}]`
            : this.host
        }:${this.port}`
      ).href
    },
    enumerable: true,
  })

  return address
}

export { httpsAgent }
