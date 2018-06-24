import React from 'react'
import UserCenter from './UserCenter'
import JSONPAsyncData from '../lib/JSONPAsyncData'
import util from '../lib/util'
import hybridAPI from '../lib/hybridAPI'
import cache from '../lib/cache'

const CACHE_PER = "wx_openid_by_corpid_";

/**
  new WXOpenIdModule(corpId, optType).subscribe({
    onSuccess:(result)=>{
      result.data.openId
    }
  })
*/

export default class WXOpenIdModule extends JSONPAsyncData{


  constructor(corpId, optType,unionId){
    super();
    this.corpId = corpId;
    this.optType = optType;
    this.unionId = unionId;
  }

  getPre(corpId, optType){
    return CACHE_PER+optType+"_"+corpId;
  }


  fetch(){

    let corpId = this.corpId;
    let optType = this.optType;
    let unionId = this.unionId;
    //正在获取
    this.emit(this.SEND_BEFORE, {status:100, success:false, msg:"正在获取OpenId...", data:null});

    let openId = cache.get(this.getPre(corpId, optType));
    let query = util.query();
    if(openId){
      this.emit(this.SUCCESS, {status:200, success:true, data:{openId:openId}});
    }else{
      //页面没有授权code, 就去微信授权
      if(query.code){
        this.getOpenIdByCode(query.code, corpId, optType);
      }else{
        this.goAuth(corpId, optType,unionId);
      }

    }


  }

  /**
    openId = coprId + 业务id 才能决定一个openId
    因为一家医院可能对应两个公众号 比如充值到医联体的公众号，缴费是到医院的公众号
  */
  getOpenIdByCode(code, corpId, optType){

    let key = this.getPre(corpId, optType);

    UserCenter.getWXOpenId(code, corpId, optType).subscribe({
      onSuccess:(result)=>{

        cache.set(key, result.data.openId);
        location.reload();//直接刷新页面，下次去缓存里去openId
        // this.emit( this.SUCCESS, {success:true, data:{result.data.openId}});
      },
      onError:(result)=>{

        this.emit( this.ERROR, {success:false, msg:result.msg} )
      }
    }).fetch();

  }
  //去微信授权页面 获得code 通过code再获得openid
  goAuth(corpId, optType,unionId){

    UserCenter.getOpenIdParas(corpId, optType,unionId).subscribe({
      onSuccess:(result)=>{
        if(result && result.data && result.data.wxAppId){
          let appid = result.data.wxAppId;//"wx664b4dee4fbd814c";//南阳

          let redirect_uri = encodeURIComponent(window.location.href);
          //跳转到微信授权页面 获取code
          let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=261_1_jsonp4203#wechat_redirect`;
          window.location.href = url;
        }else{
          this.emit(this.ERROR, {msg:"医院未配置公众号，无法使用微信支付", sucess:false});
        }
      },
      onError:(result)=>{
        this.emit(this.ERROR, result);
      }
    }).fetch();
  }
}





