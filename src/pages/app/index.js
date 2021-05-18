import React from 'react'
import renderHTMLPage from '../../_renderer/renderHTMLPage'
import App from '../../components/App'

export default renderHTMLPage({
  meta: `<title>ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: App
})