

/**
  登记设备好
*/

define("mods/register-token/index",function(require, exports, module){

  var PageModule = require("component/PageModule");

    //登记设备 token 
  var registerToken = PageModule.render({
    init:function(){
      
      var self = this;
      
      if(!this.util.isLogin()){
        //如果没有登录直接退出
        self.onComplate({msg:"not login"});
        return ;
      }

      this.corpId = this.query.corpId;

      // app 版本大于2.1.6 才有次功能
      if( !this.util.version.gt(2,1,6) ){
        self.onComplate({msg:"version low"});
        return ;
      }
      

      this.util.getDeviceToke(function(result){
        if(result.data){
          self.register(result.data)
        }else{
          self.onComplate({msg:"no deviceToke"});
        }
      }, function(){
          self.onComplate({msg:"getDeviceToke error"});
      });
    },
    //登记
    register:function( deviceToken ){

      //这个请求会触发 onComplate
      this.get("/user-web/restapi/device/addEx", {
        deviceTokens: deviceToken,
        platformType: this.util.getPlatform(),
        corpId:this.corpId
      });

    },
    clear:function(){
      this.get("/user-web/restapi/device/clearEx", {});
    },
    onComplate:function(){},
    //空方法不能删除，防止执行onError默认代码
    onSuccess:function(){},
    onError:function(){}
  })
  
  // registerToken.init();

  module.exports = registerToken;
  
})

