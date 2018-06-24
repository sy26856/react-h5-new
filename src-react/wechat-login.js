/*
 * @Author: saohui 
 * @Date: 2017-09-06 10:08:39 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-24 11:35:40
 */
import React from 'react'
import { SmartBlockComponent } from './BaseComponent/index'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import Alert from './component/alert/alert'
import BindTel from './component/BindTel/BindTel'
import CacheSession from './lib/cacheSession'
import './sign-in.less'
import './forget-pwd.less'

export default class WechatLogin extends SmartBlockComponent {
  constructor ( props ) {
    super( props )
    const query = util.query()
    //拿到了url地址中的code参数
    this.wechatCode = query.code
    //从缓存中获取以下信息(因为微信要求重定向地址不能有参数,所以缓存)
    const param = CacheSession.get( 'wechatOauthLoginParam' )
    this.unionId = param.unionId
    this.corpId = param.corpId
    this.redirecturl = param.redirecturl
    this.appId = param.appId
    this.isFromWXGZHQD = param.isFromWXGZHQD

    this.phone = ''
    this.code = ''

    this.state = {
      ...this.state
      ,loading: true
      ,success: false
    }
  }
  componentDidMount () {
    //优化之后的逻辑
    const { wechatCode, appId, unionId, corpId, isFromWXGZHQD } = this
    if( isFromWXGZHQD == 'true' ){//从健康青岛公众号
      this.loginByWechatGZH(appId, wechatCode) 
    }else{//从其他渠道(网页或者其他公招号)
      this.loginByWechat(wechatCode, appId, corpId, unionId)
    }

  }

  //健康青岛公众号授权登录
  loginByWechatGZH(appId,wechatCode){
        UserCenter.loginByWechatGZH( appId, wechatCode )
        .subscribe( this )
        .subscribe({
          onSuccess: result => {
            // 没有绑定手机
            if ( result.resultCode == 511 ) {
              const { data } = result
              this.setState({
                loading: false
                ,success: true
              })

              document.title = '绑定手机'

              this.appId = data.appId
              this.openId = data.openid
              this.openUinonid = data.openUnionid
            }
          }
        })
        .subscribe({
          onSuccess: result => this.loginSuccess( result )
        })
        .fetch()
  }
  //非健康青岛授权登录
  loginByWechat(wechatCode,appId,corpId,unionId){
    UserCenter.loginByWechat( wechatCode, appId, corpId, unionId )
      .subscribe( this )
      .subscribe({
        onSuccess: result => {
          // 没有绑定手机,需要通过手机号码和手机验证码绑定手机,点击submit绑定手机
          if ( result.resultCode == 511 ) {
            const { data } = result
            this.setState({
              loading: false
              ,success: true
            })

            document.title = '绑定手机'

            this.appId = data.appId
            this.openId = data.openid
            this.openUinonid = data.openUnionid
          }
        }
      })
      .subscribe({
        onSuccess: result => this.loginSuccess( result )
      })
      .fetch()
  }
  
  //绑定手机号码
  submit ( phone, code ) {
    const { appId, openId, openUinonid, corpId, unionId } = this
    // console.log( 'bind phone', { phone, code, appId, openId, openUinonid })
    //将这些信息发送到后台数据库
    UserCenter.bindPhoneNumToWechat( phone, code, appId, openId, openUinonid, corpId, unionId )
      .subscribe( this )
      .subscribe({
        onSuccess: result => this.loginSuccess( result )
      })
      .fetch()
  }
  onError ( result ) {
    Alert.show( result.msg, 2000 )
  }

  //登陆成功,正在跳转...
  loginSuccess ( result ) {
    // 登入成功，跳转
    if ( result.resultCode == 100 ) {
      document.title = '正在跳转...'
      Alert.show( '登入成功，正在跳转...', 2000 )
      
      if ( this.redirecturl && this.redirecturl != "undefined" ) {
        //在h5中返回到来路页面
        window.location.replace( this.redirecturl )
      } else {
        window.location.replace( './my.html?'+ util.flat({
          unionId: this.unionId
          ,corpId: this.corpId
          ,target: '_blank'
        }))
      }
    }
  }

  render () {
    const { unionId, redirecturl } = this
    const registerLinkParam = util.flat({
      unionId
      ,redirecturl: encodeURIComponent(redirecturl)
      ,target: '_blank'
    })
    return <div className="forget-pwd sign-in">
      <div className="main-body">
        <header className='main-header txt-prompt'>
          <p>为了您的隐私安全和提供更多服务</p>
          <p>请先绑定手机号</p>
        </header>
        <section className="main-section">
          <BindTel isCheckTel={ false } onSubmit={( phone, code ) => this.submit( phone, code )} unionId={ unionId } />
        </section>
      </div>
    </div>
  }
}

