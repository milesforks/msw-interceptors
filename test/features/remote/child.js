const fetch = require('node-fetch')
const { RemoteHttpInterceptor } = require('../../../lib/RemoteHttpInterceptor')

const interceptor = new RemoteHttpInterceptor()
interceptor.apply()

function makeRequest() {
  fetch('http://127.0.0.1/api')
    .then((res) => res.json())
    .then((json) => {
      process.send(`done:${JSON.stringify(json)}`)
    })
}

process.on('message', (message) => {
  if (message === 'make:request') {
    makeRequest()
  }
})
