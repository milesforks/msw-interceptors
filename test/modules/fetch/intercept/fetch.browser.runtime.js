import { FetchInterceptor } from '@mswjs/interceptors/lib/interceptors/fetch'

const interceptor = new FetchInterceptor()
interceptor.on('request', async (request) => {
  try {
    console.log('DISPATCH REQUEST, request = ', request)
  } catch {
    console.log('DISPATCH REQUEST ERROR <request>')
  }

  try {
    console.log('DISPATCH REQUEST, request.url = ', request.url)
  } catch {
    console.log('DISPATCH REQUEST ERROR <request.url>')
  }

  try {
    console.log('DISPATCH REQUEST, request.url.href = ', request.url.href)
  } catch {
    console.log('DISPATCH REQUEST ERROR <request.url.href>')
  }

  window.dispatchEvent(
    new CustomEvent('resolver', {
      detail: {
        id: request.id,
        method: request.method,
        url: request.url.href,
        headers: request.headers.all(),
        credentials: request.credentials,
        body: await request.text(),
      },
    })
  )
})

interceptor.apply()
