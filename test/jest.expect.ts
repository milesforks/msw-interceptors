import { AsymmetricMatcher } from 'expect'
import { HeadersObject } from 'headers-polyfill'

/**
 * A custom asymetric matcher that asserts the `Headers` object.
 */
class HeadersContaining extends AsymmetricMatcher<Record<string, unknown>> {
  constructor(
    sample: Record<string, unknown> | { raw(): Record<string, unknown> },
    inverse = false
  ) {
    if (sample.hasOwnProperty('raw') && typeof sample.raw === 'function') {
      super(sample.raw(), inverse)
    } else {
      super(sample, inverse)
    }
  }

  asymmetricMatch(other: Headers) {
    return Object.entries(this.sample).every(([name, value]) => {
      return other.get(name) === value
    })
  }

  toString() {
    return 'HeadersContaining'
  }

  getExpectedType() {
    return 'Headers'
  }

  toAsymmetricMatcher() {
    return JSON.stringify(this.sample)
  }
}

class AnyUuid extends AsymmetricMatcher<string> {
  private uuidRegExp =
    /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/

  constructor() {
    super('', false)
  }

  asymmetricMatch(other: string) {
    return this.uuidRegExp.test(other)
  }

  toString() {
    return 'AnyUuid'
  }

  toAsymmetricMatcher() {
    return String(this.uuidRegExp)
  }
}

export const headersContaining = (expected: HeadersObject): any => {
  return new HeadersContaining(expected)
}

export const anyUuid = (): any => {
  return new AnyUuid()
}
