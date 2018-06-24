/*
 * @Author: Saohui 
 * @Date: 2017-07-03 11:14:39 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-05-14 17:13:42
 */

import React from 'react'
import {SmartBlockComponent} from './BaseComponent/index'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import Alert from './component/alert/alert'
import Input from './component/signForm/input'
import registerToken from './module/RegisterToken'
import Cache from './lib/cache'
import './sign-in.less'
import './forget-pwd.less'

export default class ForgetPwd2 extends SmartBlockComponent {
  constructor(props) {
    super(props)
    
    const query = util.query()
    this.unionId = query.unionId
    this.corpId = query.corpId
    this.redirecturl = query.redirecturl

    this.phone = query.phoneNumber
    this.code = query.code

    this.password1 = ''

    this.cacheModule = Cache.getCacheModule()

    this.state = {
      ...this.state
      ,loading: false
      ,success: true
      ,maySubmit: false
    }
  }
  componentDidMount() {
    
  }

  async submit() {
    const REG_PASSWORD = /^\w{6,16}$/

    const { phone, code, unionId, password1, corpId } = this

    const _phone = phone.replace( /\s/g, '') // 把手机号的空格去掉
    if ( !REG_PASSWORD.test( password1 ) ) {
      Alert.show( '请输入6~16位的密码')
      return
    }  
    if(/^\d+$/.test(password1)||/^[a-z]+$/i.test(password1)){
      Alert.show('需包含数字和字母',1000)
      return
    }
    if(!/^[A-Za-z0-9]+$/.test(password1)){
      Alert.show('只能含有数字和字母',1000)
      return
    }
    // console.log(phone, code, unionId, password1)
    
    this.onSendBefore( null, null, '正在修改密码...')
    try {
      let result = await UserCenter.updatePassword( _phone, password1, code, unionId ).fetch()
      
      Alert.show('修改密码成功', 1000 )

      this.onSendBefore( null, null, '自动登入中...')
      result = await UserCenter.getLogin( _phone, password1, unionId, corpId ).fetch()

      this.autoLogin( result )
    } catch ( e ) {
      if ( e.success === false ) {
        Alert.show( e.msg, 2000 )
      }
    }

    this.onComplete()
  }

  autoLogin ( result ) {
    var self = this
    if( result.success ) {
      Alert.show( '登入成功，正在跳转', 1000 )
      registerToken.onComplate = function(result){ 
        // console.log('register device token: ', result.msg)
        try{
          if (window.localStorage){
            localStorage.clear()
          }
          let cache = Cache.getCacheModule()
          cache.remove("patient")
          cache = Cache.getCacheModule("AsynDataCache")
          cache.clear()

          //缓存手机号码
          self.cacheModule.set("phone", self.phone, '手机号码')
        }catch(e){
          console.log(e)
        }
        if( self.backview && util.isInYuantuApp() ){
          //在native中直接返回
          util.goBack(true)
        }else if(self.redirecturl && self.redirecturl != "undefined"){
          //在h5中返回到来路页面
          window.location.replace( self.redirecturl )
        }else{
          util.goBack(true)
        }
      }
      // 登记设备
      registerToken.run()
    }
  }

  judgeMaySubmit () {
    if( this.password1 != '' ) {
      this.setState({
        maySubmit: true
      })
    } else {
      this.setState({
        maySubmit: false
      })
    }
  }

  render() {
    const {unionId, redirecturl} = this
    const {maySubmit} = this.state
    
    return <div className="forget-pwd sign-in">
      <div className="main-body">
        <header style={{ height: '24px' }}></header>
        <section className="main-section">
          <Input onChange={ (e)=>{ this.password1 = e.target.value; this.judgeMaySubmit() } } type="password" placeholder="请输入6-16位密码" bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/5434b043edb7cbf6d74ac4ed86df59a2-60-69.png"></Input>
          <div className="btn-wrapper">
            <button onClick={(e)=>{ maySubmit && this.submit(e) }} className={"btn btn-block submit-btn" + ( maySubmit ? '' : ' btn-disabled') }>重新设定密码</button>
          </div>
        </section>
      </div>
    </div>
  }
}
