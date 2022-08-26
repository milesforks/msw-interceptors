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

// const x = OrigHttpServer.prototype.buildHttpServerApi =

// @ts-ignore patch private method
HttpServer.prototype.buildHttpServerApi = (
  server: Parameters<typeof OrigHttpServer.getServerAddress>[0]
) => {
  console.log('WRAPPED buildHttpServerApi')
  console.log(
    'WRAPPED buildHttpServerApi, server hasKeys ',
    Object.keys(server)
  )
  try {
    console.log('WRAPPED server.address() =', server.address())
  } catch {
    console.log('WRAPPED error server missing key for host')
  }
  const address = HttpServer.getServerAddress(server)
  console.log('WRAPPED buildHttpServerApi, address = ', address)
  console.log('WRAPPED buildHttpServerApi, address.href = ', address.href)

  return {
    address,
    url(path = '/') {
      console.log('WRAPPED buildHttpServerApi, .url(), path = ', path)
      try {
        console.log('address.href = ', address.href)
      } catch {
        console.log('WRAPPED ERROR got bad address.href')
      }

      return new URL(path, address.href).href
    },
  }
}

// buildHttpServerApi(server) {
//         const address = HttpServer.getServerAddress(server);
//         return {
//             address,
//             url(path = '/') {
//                 return new URL(path, address.href).href;
//             },
//         };
//     }

// HttpServer.prototype.http.url

export { httpsAgent }
