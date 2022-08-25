import { HttpServer, httpsAgent } from '@open-draft/test-server/http'

var origGetServerAddress = HttpServer.getServerAddress

HttpServer.getServerAddress = function () {
  const address = origGetServerAddress.apply(
    this,
    arguments as unknown as Parameters<typeof HttpServer.getServerAddress>
  )

  // host with `:` is definitely not IPv4, presumably IPv6, maybe valid address
  if (address.host.includes(':')) {
    console.log('Use IPv6 compatible host')
    address.href = new URL( // Square brackets around IPv6 address
      `${address.protocol}//[${address.host}]:${address.port}`
    ).href
    Object.defineProperty(address, 'href', {
      get() {},
      enumerable: true,
    })
  }

  return address
}

export { HttpServer, httpsAgent }
