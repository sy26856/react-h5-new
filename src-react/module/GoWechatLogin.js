/*
 * @Author: saohui 
 * @Date: 2017-09-04 10:44:01 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-31 17:28:08
 */
import util from '../lib/util'
import CacheSession from '../lib/cacheSession'
import UserCenter from '../module/UserCenter'
import Alert from '../component/alert/alert'
class GoWechatLogin {
  constructor () {
    //获取url地址参数对象
    const query = util.query()
    //地区id
    this.unionId = query.unionId || ''
    //医院id
    this.corpId = query.corpId || ''

    this.isFromWXGZHQD = 'false',//新增,判断是否从健康青岛公众号登录,默认不是
    this.REDIRECT_URL = util.h5URL("/wechat-login.html")
    //大致意思是如果是App端(或者直接在微信打开网址),直接打开微信客户端进行登录操作,称为微信内;
    //如果是非客户端(H5),先弹出二维码,然后扫描二维码进入到微信授权登录页面,这里称为微信外;
    this.WECHAT_AUTH_LOGIN_URL = util.isWeixin() ? 'https://open.weixin.qq.com/connect/oauth2/authorize?' // 微信内
                                      : 'https://open.weixin.qq.com/connect/qrconnect?' // 微信外
  }

  //设定重定向地址参数
  setRedirectParam () {
    this.redirectParam = {
      corpId: this.corpId
      ,unionId: this.unionId
      ,redirecturl: this.reactCtx.redirecturl
      ,appId: this.appId
      ,isFromWXGZHQD:this.isFromWXGZHQD
    }

    // 由于微信登入回调地址中不可以带参数，故把参数放到 session 中
    CacheSession.set( 'wechatOauthLoginParam', this.redirectParam )
  }


  /**
   *优化之前的获取appId方法(网页appId)
   */
  getAppId () {
    UserCenter.getWechatAppId( this.corpId, this.unionId )
      .subscribe({
        onSuccess:result=>{  
          if ( !result.success ) {
            return
          }
          this.appId = result.data.appId
          this.unionId = result.data.unionId || this.unionId
          this.isFromWXGZHQD = 'false'
          this.setRedirectParam()
          const wechatParam = util.flat({
            appid: result.data.appId
            ,redirect_uri: this.REDIRECT_URL
            ,response_type: 'code'
            ,scope: 'snsapi_login'
          })
          window.location.href = this.WECHAT_AUTH_LOGIN_URL + wechatParam + '#wechat_redirect'
        },
        onError : result=>{
          Alert.show( result.msg, 2000 )
        },
      })
      .fetch()
  }

  
   /**
   *优化后获取公众号appId方法
   */
  getGZHAppId () {
    UserCenter.getWechatGZHAppId('', this.unionId )
      .subscribe({
        onSuccess:result=>{  
          if(result.success){
            this.appId = result.data.appId
            this.unionId = result.data.unionId || this.unionId,
            this.corpId =  result.data.corpId || this.corpId,//新增
            this.isFromWXGZHQD = 'true'
            this.setRedirectParam()  
            const wechatParam = util.flat({
              appid: result.data.appId
              ,redirect_uri: this.REDIRECT_URL
              ,response_type: 'code'
              ,scope: 'snsapi_base,snsapi_userinfo',
              state:'STATE',
              component_appid:result.data.componentAppId,
              connect_redirect:'1#wechat_redirect'
            })
            window.location.href = this.WECHAT_AUTH_LOGIN_URL + wechatParam + '#wechat_redirect'
            }
          },
          onError: ( result )=>{
            if( result.resultCode == 1000 ){//说明不是从健康青岛公众号登录的,是从其他公众号登录的
              let _this = this
              _this.getAppId()
            }
          },
      })
      .fetch()
  }

  run ( reactCtx ) {
    this.reactCtx = reactCtx
    
    // 获取授权需要的 appId => 请查看微信网页登入授权文档
    util.isWeixin()? this.getGZHAppId():this.getAppId()
  }
}

export default new GoWechatLogin()