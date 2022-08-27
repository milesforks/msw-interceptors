import {
  HttpServer as OrigHttpServer,
  httpsAgent,
} from '@open-draft/test-server/http'

var origGetServerAddress = OrigHttpServer.getServerAddress

export const HttpServer = OrigHttpServer

// const IS_PATCHED_IPV6_COMPAT: unique symbol = Symbol('isPatchedIPv6Compat')

// type PatchedForIPv6Compat<Method> = Method & {
//   [IS_PATCHED_IPV6_COMPAT]?: true
// }

// if (HttpServer.getServerAddress[IS_PATCHED_IPV6_COMPAT]) {
//   console.log('DUPLICATE PATCH: HttpServer.getServerAddress')
// }

HttpServer.getServerAddress = function () {
  const address = origGetServerAddress.apply(
    {}, // we're patching a static method; there is no this
    arguments as unknown as Parameters<typeof HttpServer.getServerAddress>
  )

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

// as PatchedForIPv6Compat<typeof HttpServer.getServerAddress>

// @ts-ignore if this works i'll augment it
// if (HttpServer.prototype.buildHttpServerApi[IS_PATCHED_IPV6_COMPAT]) {
//   console.log('DUPLICATE PATCH: HttpServer.prototype.buildHttpServerApi')
// }

// NOTE: This method is the same as the original, except we need to re-implement
// it so that it can call the newly patched static HttpServer.getServerAddress
// @ts-ignore patching a private method
HttpServer.prototype.buildHttpServerApi = (
  server: Parameters<typeof OrigHttpServer.getServerAddress>[0]
) => {
  const address = HttpServer.getServerAddress(server)

  return {
    address,
    url(path = '/') {
      return new URL(path, address.href).href
    },
  }
}

// as PatchedForIPv6Compat<typeof HttpServer.prototype['buildHttpServerApi']>

export { httpsAgent }
