/**
  微信OpenId模块
  
  .isOpenId() //是否已存在openId
  .getOpenId() //方法内直接从缓存中获取openId
*/
define("mods/wxOpenId/index", function(require, exports, module) {

  let cache = require("../../libs/cache");
  let PageModule = require("component/PageModule");
  let cachePer = "wx_openid_by_corpid_";

  let weixin = PageModule.render({
    /**
      openId = coprId + 业务id 才能决定一个openId
      因为一家医院可能对应两个公众号 比如充值到医联体的公众号，缴费是到医院的公众号
    */
    getOpenIdByCode(code, corpId, optType){
      
      this.corpId = corpId;

      let key = this.getPre(corpId, optType);

      //获取openId
      PageModule.render({
        init(code, corpId, optType){
          this.get("/user-web/restapi/wx/getOpenId", {code:code, corpId:corpId, optType:optType})
        },
        onSuccess(result){
          //缓存openId
          if(result.data.openId){
            cache.set(key, result.data.openId);
            location.reload();
          }else{
            this.util.alert("无法获得OpenId，暂时无法使用微信充值");
          }
          // self.openId = result.data.openId;
        },
        onError(result){
          this.util.alert(result.msg || '');
        }
      }).init(code, this.corpId, 1);
    

    },
    getOpenId(corpId, optType){
      let openId = cache.get(this.getPre(corpId, optType));
      // console.log( this.query.code, openId )
      //没有openId
      if(!openId){
        //页面没有授权code, 就去微信授权
        if(this.query.code){
          this.getOpenIdByCode(this.query.code, corpId, optType);
        }else{
          this.goAuth(corpId, optType);
        }

        return null
      }

      return openId;//cache.get(cachePer+corpId)
    },
    //去授权一变获得openId
    goAuth(corpId, optType){
      this.get("/user-web/restapi/wx/getOpenIdParas", {corpId:corpId, optType:optType})
    },

    onSuccess(result){
      if(result && result.data && result.data.wxAppId){
        let appid = result.data.wxAppId;//"wx664b4dee4fbd814c";//南阳
        let redirect_uri = window.location.href;
        let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=261_1_jsonp4203#wechat_redirect`;
        // window.location.replace(url);// = ;
        window.location.href = url;
      }else{
        this.util.alert("医院未配置公众号，无法使用微信支付")
      }

    },
    getPre(corpId, optType){
      return cachePer+optType+"_"+corpId;
    }
  })
  
  module.exports = weixin;

});
