import React from 'react'
import renderHTMLPage from '../../_renderer/renderHTMLPage'
import HeaderPage from '../../components/HeaderPage'
import App from '../../components/App'
import defaultState from '../../../defaultStates/project.json' assert {type: "json"};

export default renderHTMLPage({
  meta: `<title>ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: props =>
          <HeaderPage session={props.session}>
            <App state={JSON.stringify(defaultState)}/>
          </HeaderPage>
})