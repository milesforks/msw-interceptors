const [majorNodeVersion, _minorNodeVersion, _patchNodeVersion] = process.version
  .split('.')
  .map((x) => parseInt(x[0] === 'v' ? x.slice(1) : x))

// Only include test files containing `node-native` when running on v18 or later
const hasNativeFetch = majorNodeVersion >= 18
const excludePattern = hasNativeFetch ? 'browser' : 'browser|node-native'

module.exports = {
  testRegex: '(?<!(' + excludePattern + ').*)(\\.test)\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
