/*
 * @Author: Saohui
 * @Date: 2017-06-16 11:49:36 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-05-07 10:17:52
 */
import React from 'react'
import {SmartBlockComponent} from './BaseComponent/index'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import Alert from './component/alert/alert'
import Input from './component/signForm/input'
import registerToken from './module/RegisterToken'
import SendCodeModule from './module/SendCodeModule'
import Cache from './lib/cache'
import './sign-in.less'

import GoWechatLogin from './module/GoWechatLogin'

export default class SignUp extends SmartBlockComponent {
  constructor(props) {
    super(props)
    
    const query = util.query()
    this.unionId = query.unionId
    this.corpId = query.corpId
    this.redirecturl = decodeURIComponent( query.redirecturl )

    this.phone = ''
    this.password = ''
    this.code = ''

    this.ctrCode = new SendCodeModule(this.unionId, this, false)

    this.cacheModule = Cache.getCacheModule()

    this.state = {
      ...this.state
      ,loading: false
      ,success: true
      ,btnCodeText: this.ctrCode.ctrText
      ,maySubmit: false
    }
  }
  componentDidMount() {
    
  }

  async submit() {
    const { phone, code, password, unionId, corpId } = this

    const _phone = phone.replace( /\s/g, '') // 把手机号的空格去掉
    , _code = code.replace( /\s/g, '')

    if( !/^\d{11}$/.test( _phone) ){
      Alert.show('请输入11位手机号', 1000)
      return ;
    }
    if( !(_code && _code.length == 6) ){
      Alert.show('请输入正确的验证码', 1000)
      return ;
    }
    if(!(password && password.length >=6 && password.length <= 30)){
      Alert.show('请输入6-30个字符的密码', 1000)
      return ;
    }
    if(/^\d+$/.test(password)||/^[a-z]+$/i.test(password)){
      Alert.show('需包含数字和字母',1000)
      return
    }
    if(!/^[A-Za-z0-9]+$/.test(password)){
      Alert.show('只能含有数字和字母',1000)
      return
    }

    this.onSendBefore( null, null,'注册中...')
    try {
      let result = await UserCenter.signUpUser(_phone, password, _code, unionId).fetch()
      
      Alert.show('注册成功', 2000)

      this.onSendBefore( null, null, '自动登入中...')
      result = await UserCenter.getLogin( _phone, password, unionId, corpId ).fetch()

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

  sendCode(e) {
    const {ctrCode, phone} = this
    ctrCode.handleClick(e, phone)
    // console.log(this.ctrCode)
  }

  judgeMaySubmit () {
    if( this.phone != '' && this.password != '' && this.code != '' ) {
      this.setState({
        maySubmit: true
      })
    } else {
      this.setState({
        maySubmit: false
      })
    }
    // console.log( this.phone, this.password, this.code )
  }

  render() {
    const {unionId, redirecturl} = this
    const {btnCodeText, maySubmit} = this.state
    const registerLinkParam = util.flat({
      unionId
      ,redirecturl: redirecturl
      ,target: '_blank'
    })
    
    return <div className="contrainer sign-in">
      <div className="main-body">
      {
        util.isInAliPay()?null:
      
        <header onClick={() => {
          GoWechatLogin.run( this )
        }} className="main-header">
          <div className="h-logo">
            <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/31a871f6bd3fb850ce33c18e7c133a57-160-160.png" alt=""/>
          </div>
          <div className="h-txt">
            一键登录，安全快捷
          </div>
          <div className="h-or-txt txt-weak txt-line-wrapper">
            <span className="txt-line">或</span>
          </div>
        </header>
      }
        <section className="main-section" style={{marginTop:'20px'}}>
          <Input onChange={ (e)=>{ this.phone = e.target.value; this.judgeMaySubmit() } } type="tel" defaultValue={''} placeholder="请输入您的手机号" maxLength={ 13 } bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/00cc30bb1695595ae90a528990bf9b9b-54-72.png"></Input>
          <Input showBtn={true} btnChecked={ this.phone != '' } btnDisable={ this.ctrCode.loading } btnVal={btnCodeText} btnClick={ (e)=>{ this.sendCode(e) } } onChange={ (e)=>{ this.code = e.target.value; this.judgeMaySubmit() } } type="tel" placeholder="请输入6位验证码" bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/81491471c25faa85c0558c1aad0d1bd8-63-72.png"></Input>
          <Input onChange={ (e)=>{ this.password = e.target.value; this.judgeMaySubmit() } } type="password" placeholder="请输入您的密码" bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/5434b043edb7cbf6d74ac4ed86df59a2-60-69.png"></Input>
          <div className="btn-wrapper">
            <button onClick={(e)=>{ maySubmit && this.submit(e) }} className={"btn btn-block submit-btn" + ( maySubmit ? '' : ' btn-disabled') }>注册</button>
          </div>
        </section>
      </div>
      <div className="main-footer">
        <p>已有账号，<a href={'sign-in.html?' + registerLinkParam}>立即登入</a></p>
      </div>
    </div>
  }
}