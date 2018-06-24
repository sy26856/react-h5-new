/*
 * @Author: Saohui
 * @Date: 2017-06-16 11:49:36 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-28 13:57:18
 */
import React from 'react'
import {SmartBlockComponent} from './BaseComponent/index'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import Cache from './lib/cache'
import Alert from './component/alert/alert'
import registerToken from './module/RegisterToken'
import Input from './component/signForm/input'
import './sign-in.less'

import GoWechatLogin from './module/GoWechatLogin'

export default class SignIn extends SmartBlockComponent {
  constructor(props) {
    super(props)
    //url地址参数对象
    const query = util.query()
    //直接跳转到某个界面
    this.redirecturl = query.redirecturl
    //直接返回到上一个view
    this.backview = query.backview
    //是否自动登录
    this.isAutoLogin = query.aotuLogin

    //拿到缓存数据方法
    this.cacheModule = Cache.getCacheModule();
    //医院id
    this.corpId = query.corpId
    //地区id
    this.unionId = query.unionId
    this.state.weChatFlag=true;
    //是否自动登录
      //this.isAutoLogin = query.aotuLogin有这个值就自动登录,没有就手动
    if(this.isAutoLogin){
      this.aotuLogin()
    }

    const referrer = document.referrer;
    this.referrer = referrer || null
  
    const phone = this.cacheModule.get("phone")
    //获取电话号码缓存值
    this.phone = phone.value
    //密码
    this.password = ''
    this.state = {
      ...this.state
      ,loading: false
      ,success: true
      ,maySubmit: false
    }
  }

  componentWillMount() {
    if (util.isInAliPay()) {
      this.setState({
        weChatFlag: false
      })
    }
  }

  //自动登录调用的方法
  aotuLogin() {
    const self = this
    ,aotuLoginThis = {
      onSuccess(result){
        Alert.show( '自动登录成功，正在跳转', 1000 )
        self.onSuccess(result)
      }
    }
    //自动调用一次接口看看是否已经登录
    UserCenter.getUserInfo()
      .subscribe(aotuLoginThis)
      .fetch()
  }

  //调用submit方法,发送请求后:
  onSuccess(result) {
    //账号密码验证成功
    var self = this
    if( result.success ) {
      Alert.show( '登入成功，正在跳转', 1000)
      let data=result.data;
      registerToken.onComplate = function(result){ 
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
        Cache.set('appKey', data.appKey)
        Cache.set('patientToken', data.patientToken)
        Cache.set('userId', data.userId)
        if( self.backview && util.isInYuantuApp() ){
          //在native(远图App)中直接返回
          util.goBack(true)
        }else if(self.redirecturl && self.redirecturl != "undefined"){
          //在h5中返回到来路页面
          window.location.replace( self.redirecturl )
        }else{
          util.goBack(true)
        }
      }
      // 登记登录设备信息
      registerToken.run()

    }
  }

  //账号密码验证失败
  onError(result) {
    Alert.show( result.msg, 1000 )
  }

  //点击登录提交数据
  submit() {
    const {refs, phone, password, unionId, corpId} = this

    const _phone = phone.replace( /\s/g, '') // 把手机号的空格去掉
    
    // console.log( '账号密码：', phone, '-', password )
    //验证手机号码是格式正确
    if( !/^\d{11}$/.test( _phone ) ){
      Alert.show('请输入正确的手机号码', 1000)
      return ;
    }

    //没有输入密码,提示输入密码
    if( password.length == 0 ){
      Alert.show('请输入密码', 1000)
      return ;
    }
    //密码长度要符合要求
    if( !(password && password.length >=6 && password.length <= 50) ){
      Alert.show('密码的不正确，请重新输入', 1000)
      return ;
    }
    //账号和密码格式正确,弹出'请求中...'以增加用户体验
    Alert.show('请求中...', 3000)
    //将这些值作为参数发送到后台验证
    UserCenter.getLogin( _phone, password, unionId, corpId )
      .subscribe(this)
      .fetch()
  }

//判断是否允许条件
  judgeMaySubmit () {
    if( this.phone != '' && this.password != '' ) {
      this.setState({
        maySubmit: true
      })
    } else {
      this.setState({
        maySubmit: false
      })
    }
  }

  //render渲染页面
  render() {
    let {
      maySubmit,
      weChatFlag 
    } = this.state
    const {unionId, referrer, phone, redirecturl} = this
    //拼接url参数方法
    const registerLinkParam = util.flat({
      unionId
      ,redirecturl: redirecturl || referrer
      ,target: '_blank'
    })
    return <div className="contrainer sign-in">
      <div className="main-body">
      {/* 点击跳转到微信登录逻辑 */}
        {weChatFlag ?<header onClick = {
            () => {
          //将当前this传入到微信登录页面
          GoWechatLogin.run( this )
        }} className="main-header">
          <div className="h-logo">
            <img   src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/31a871f6bd3fb850ce33c18e7c133a57-160-160.png" alt=""/>
          </div>
          <div className="h-txt">
            一键登录，安全快捷
          </div>
          <div className="h-or-txt txt-weak txt-line-wrapper">
            <span className="txt-line">或</span>
          </div>
        </header>:null}
        {!weChatFlag?<div style={{"height":'30px'}}>
        </div>:null}
        <section className="main-section">
        {/* 文本框输入账户和密码 */}
          <Input onChange={ (e)=>{ this.phone = e.target.value; this.judgeMaySubmit() } } type="tel" defaultValue={phone} placeholder="请输入您的手机号" maxLength={ 13 } bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/00cc30bb1695595ae90a528990bf9b9b-54-72.png"></Input>
          <Input onChange={ (e)=>{ this.password = e.target.value; this.judgeMaySubmit() } } type="password" placeholder="请输入您的密码" bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/5434b043edb7cbf6d74ac4ed86df59a2-60-69.png"></Input>
          <div className="register-link">
          {/* 忘记密码,跳转到找回密码页面 */}
            <a href={`forget-pwd.html?${ registerLinkParam }`}>忘记密码?</a>
          </div>
          <div className="btn-wrapper">
          {/* 手机号码和密码输入完成,点击登录 */}
            <button onClick={(e)=>{ maySubmit && this.submit(e) }} className={"btn btn-block submit-btn" + ( maySubmit ? '' : ' btn-disabled') }>登录</button>
          </div>
        </section>
      </div>
      <div className="main-footer">
      {/* 点击注册,跳转到注册账号页面 */}
        <p>没有账号？<a href={'register.html?' + registerLinkParam}>注册新账号</a></p>
      </div>
    </div>
  }
}