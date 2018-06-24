import React from 'react'
import UserCenter from './module/UserCenter'
import util from './lib/util'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import Alert from './component/alert/alert'
import RegisterToken from './module/RegisterToken'
import Cache from './lib/cache'
import './my.less'

import config from './config'

export default class Setting extends SmartBlockComponent {
  constructor ( props ) {
    super( props )
    const query = util.query()
    this.unionId = query.unionId
    this.corpId = query.corpId
    
    if( !this.unionId && !this.corpId ) {
      Alert.show( '缺少corpId or unionId', 1000 )
    }
    // console.log( myTabList )

    this.cacheModule = Cache.getCacheModule();

    this.state = {
      ...this.state
      ,tabList: myTabList
      ,isLogin: util.isLogin()
    }
  }
  componentWillMount () {
    this.setState({
      loading: false
      ,success: true
    })
  }
  componentDidMount () {
  }
  loginOut () {
    RegisterToken.onComplate = ()=>{
      UserCenter.loginOut( this.unionId )
        .subscribe( this )
        .fetch()
    }
    RegisterToken.clear()
  }
  onSuccess ( result ) {
    const param = util.flat({
      unionId: this.unionId
      ,corpId: this.corpId
      ,target: '_blank'
    })
    , phone = this.cacheModule.get( 'phone' )
    Cache.clear()
    this.cacheModule.set( phone.key, phone.value, phone.name )
    window.location.replace( `my.html?${ param }` )
  }
  signIn () {
    util.goLogin()
  }

  renderBodyTabList () {
    const { tabList, isLogin } = this.state
    , param = util.flat({ 
      unionId: this.unionId
      ,corpId: this.corpId
      })
    return <div className="panel g-space">
      <ul className="list-ord">
        {
          tabList[4].column.map((item) => {
            let { needLogin, key, imageUrl, title, show, url, extra } = item
            return show ? <li key={'' + 4 + key} className="list-item ">
              <a href={needLogin && !isLogin ? 'javascript:;' : `${url}?${param}`} onClick={() => { needLogin && !isLogin && util.goLogin() }} className="txt-arrowlink list-link-wrapper">
                <div className="list-content txt-nowrap" >
                  <div className="list-title ">{title}</div>
                </div>
                {extra ? <div className="list-extra txt-nowrap" >{extra}</div> : null}
              </a>
            </li> : null
          })
        }
      </ul>
    </div>
  }
  renderCliInfo () {

    return <div className="panel g-space">
      <ul className="list-ord">
        <li className="list-item ">
          <div className="list-content txt-nowrap" >
            <div className="list-title ">H5 版本号</div>
          </div>
          <div className="list-extra txt-nowrap" >{ config.VERSION }</div>
        </li>
        <li className="list-item ">
          <div className="list-content txt-nowrap" >
            <div className="list-title ">APP 环境</div>
          </div>
          <div className="list-extra txt-nowrap" >{ util.isInYuantuApp() ? '远图 APP' : ( util.isWeixin() ? '微信' : util.isInAliPay() ? '支付宝' : '其它' ) }</div>
        </li>
      </ul>
    </div>
  }
  render () {
    const { isLogin } = this.state
    return <div className="my-wraper">
      <header className="my-main-header"></header>
      <section className="my-main_section">
        { this.renderBodyTabList() }
        { this.renderCliInfo()}
        <div className=" g-space"></div>
        <div className="btn-wrapper">
        { 
          isLogin ?
            <button onClick={ this.loginOut.bind( this ) } className="btn btn-block">退出登录</button>
           : ''
        }
        </div>
      </section>
      <footer className="my-main_footer"></footer>
    </div>
  }
}
