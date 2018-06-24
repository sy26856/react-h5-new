/*
 * @Author: saohui 
 * @Date: 2017-09-26 09:31:14 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2017-12-26 14:23:02
 */
import React from 'react'
import { render } from 'react-dom'
// import {IS_DAILY, IS_UAT, IS_ONLINE, IS_ABTEST, API_DOMAIN} from './config'
import { Loading, BlockLoading } from './component/loading/index'
import Alert from './component/alert/alert'
import StatusBlock from './component/statusBlock/statusBlock'

import './all.less'

import Gi, { connect } from 'gi-mini-dvajs'
import router from './router'
import setModel from './model'

const app = Gi({
  onError ( err ) {
    console.error( err )
  }
})

setModel( app )

app.router( router )

let Page = app.start()

class AppComponent extends React.Component {

  render() {
    /**
     * 阻断性加载中状态  BlockLoading
     * 非阻断性加载中状态  Loading
     * **/
    if (Page) {
      return <div>
        <Loading />
        <BlockLoading />
        <Alert />
        <StatusBlock />
        <Page />
      </div>
    } else {
      return <div>您访问的页面不存在{ pathname }</div>
    }
  }
}

render(<AppComponent />, document.getElementById('root'))