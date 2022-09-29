import { Agent } from 'http'
import { RequestOptions, Agent as HttpsAgent } from 'https'

const debug = require('debug')('utils getUrlByRequestOptions')

// Request instance constructed by the "request" library
// has a "self" property that has a "uri" field. This is
// reproducible by performing a "XMLHttpRequest" request in JSDOM.
export interface RequestSelf {
  uri?: URL
}

export type ResolvedRequestOptions = RequestOptions & RequestSelf

export const DEFAULT_PATH = '/'
const DEFAULT_PROTOCOL = 'http:'
const DEFAULT_HOST = 'localhost'
const DEFAULT_PORT = 80
const SSL_PORT = 443

function getAgent(
  options: ResolvedRequestOptions
): Agent | HttpsAgent | undefined {
  return options.agent instanceof Agent ? options.agent : undefined
}

function getProtocolByRequestOptions(options: ResolvedRequestOptions): string {
  if (options.protocol) {
    return options.protocol
  }

  const agent = getAgent(options)
  const agentProtocol = (agent as RequestOptions)?.protocol

  if (agentProtocol) {
    return agentProtocol
  }

  const port = getPortByRequestOptions(options)
  const isSecureRequest = options.cert || port === SSL_PORT

  return isSecureRequest ? 'https:' : options.uri?.protocol || DEFAULT_PROTOCOL
}

function getPortByRequestOptions(
  options: ResolvedRequestOptions
): number | undefined {
  const agent = getAgent(options)
  const agentPort =
    (agent as HttpsAgent)?.options.port ||
    (agent as RequestOptions)?.defaultPort
  const optionsPort = options.port

  if (optionsPort || agentPort) {
    const explicitPort = optionsPort || agentPort || DEFAULT_PORT
    return Number(explicitPort)
  }
}

function getHostByRequestOptions(options: ResolvedRequestOptions): string {
  return options.hostname || options.host || DEFAULT_HOST
}

function getAuthByRequestOptions(options: ResolvedRequestOptions) {
  if (options.auth) {
    const [username, password] = options.auth.split(':')
    return { username, password }
  }
}

function isValidURL(url?: string) {
  try {
    new URL(url ?? '')
    return true
  } catch {
    return false
  }
}

/**
 * Encode a URI by surrounding an IPv6 host with brackets if it seems necessary
 *
 * In this context, `host` could be `hostname` or `hostname:port`,
 * and `hostname` may be a bracketed or unbracketed IPv6 address.
 *
 * If `host` appears to include an unbracketed IPv6 address,
 * add the brackets and return the string.
 */
function uriEncodedHost(host: string) {
  const definitelyNotIPv6 = !host.includes(':')
  if (definitelyNotIPv6) {
    return host
  }

  const alreadyHasOrderedBracketPair =
    host
      .split('')
      .filter((x) => ['[', ']'].includes(x))
      .join('') === '[]'
  if (alreadyHasOrderedBracketPair) {
    return host
  }

  const upToLastSegmentMaybeHost = host.split(':').slice(0, -1).join(':') ?? ''
  const lastSegmentMaybePort = host.split(':').slice(-1).pop() ?? ''

  if (isValidURL(`http://${host}`)) {
    return host
  } else if (isValidURL(`http://[${host}]`)) {
    return `[${host}]`
  } else if (
    isValidURL(`http://[${upToLastSegmentMaybeHost}]:${lastSegmentMaybePort}`)
  ) {
    return `[${host}]:${lastSegmentMaybePort}`
  } else {
    return host
  }
}

/**
 * Creates a `URL` instance from a given `RequestOptions` object.
 */
export function getUrlByRequestOptions(options: ResolvedRequestOptions): URL {
  debug('request options', options)

  const protocol = getProtocolByRequestOptions(options)
  const host = getHostByRequestOptions(options)
  const port = getPortByRequestOptions(options)
  const path = options.path || DEFAULT_PATH
  const auth = getAuthByRequestOptions(options)

  debug('protocol', protocol)
  debug('host', host)
  debug('port', port)
  debug('path', path)

  // NOTE: as of node >= 17, hosts (including "localhost") can resolve to IPv6
  // addresses, so construct valid URL by surrounding IPv6 host with brackets
  const baseUrl = `${protocol}//${uriEncodedHost(host)}`
  debug('base URL:', baseUrl)

  const url = options.uri ? new URL(options.uri.href) : new URL(path, baseUrl)

  if (port) {
    debug('detected explicit port', port)
    url.port = port.toString()
  }

  if (auth) {
    debug('resolved auth', auth)

    url.username = auth.username
    url.password = auth.password
  }

  debug('created URL:', url)

  return url
}
