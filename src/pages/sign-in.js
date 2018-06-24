
define(function(require, exports, module){

  var md5 = require("libs/md5");
  var PageModule = require("component/PageModule");
  var registerToken = require("mods/register-token/index")


  var page = PageModule.render({
    init:function(){
      var self = this;
      //直接跳转到某个界面
      this.redirecturl = this.query.redirecturl;
      //直接返回到上一个view
      this.backview = this.query.backview;
      //是否自动登录
      this.autoLogin = this.query.aotuLogin;
      
      this.cacheModule = this.cache.getCacheModule();
      this.corpId = this.query.corpId;
      this.unionId = this.query.unionId;

      var phone = this.cacheModule.get("phone");
      if(phone && phone.value){
        $('#J_PhoneNumber').val( phone.value )
      }
      console.log(this.unionId);
      console.info(this.query.unionId);
      $('#forgetPwd').attr('href', 'forget-pwd.html?unionId=' + this.unionId + '&target=_blank');
      $('#registerNew').attr('href', 'register.html?unionId=' + this.unionId + '&target=_blank');

      this.regEvent();

    },
    regEvent:function(){

      var self = this;
      $('#J_Submit').click(function(){
        self.submit();
      });

      if(this.autoLogin){
    
        //自动调用一次接口看看是否已经登录
        this.io.get("/user-web/restapi/ytUsers/getUserInfo", {}, function(result){

          self.util.alert("自动登录成功，正在跳转")
          setTimeout(function(){
            self.onSuccess(result);
          }, 3000)

        }, function(){});
      }

      var referrer = document.referrer;
      if( referrer ){
        $('#J_RegisterLink a,.top-notice').each(function(){
          var href = $(this).attr("href");
          $(this).attr("href", href+"&redirecturl="+encodeURIComponent(referrer));
        });
      }
      
    },
    submit:function(){
      var phoneNumber = $.trim( $('#J_PhoneNumber').val() );
      var pwd = $.trim( $('#J_Pwd').val() );

      if( !/^\d{11}$/.test( phoneNumber ) ){
        this.util.alert("请输入正确的手机号码");
        return ;
      }

      if( pwd.length == 0 ){
        this.util.alert("请输入密码");
        return ;
      }

      if( !(pwd && pwd.length >=6 && pwd.length <= 50) ){
        this.util.alert("密码不正确");
        return ;
      }

      this.util.waitAlert("请求中...");
      //缓存手机号
      // this.cache.set("phoneNumber", phoneNumber);
      this.phoneNumber = phoneNumber;
      
      console.log(this.corpId);
      console.log(this.unionId);
      if (this.unionId) {
        this.get("/user-web/restapi/common/ytUsers/login", {
          phoneNum:phoneNumber,
          password:md5(pwd),
          unionId:this.unionId
        });
      } else {
        this.get("/user-web/restapi/common/ytUsers/login", {
          phoneNum: phoneNumber,
          password: md5(pwd),
          corpId: this.corpId,
          unionId: this.unionId
        });
      }
    },
    onSuccess:function( result ){

      var self = this;
      if(result.success){

        self.util.alert("登录成功");
        //预约成功登记设备号， 然后跳转
        registerToken.onComplate = function(){
          try{
            if (window.localStorage){
              localStorage.clear();
            }
            var cache = self.cache.getCacheModule();
            cache.remove("patient");
            cache = self.cache.getCacheModule("AsynDataCache");
            cache.clear();

            //缓存手机号码
            self.cacheModule.set("phone", self.phoneNumber, '手机号码');

          }catch(e){
            console.log(e);
          }
          console.log(self);
          if( self.backview && self.util.isInYuantuApp() ){
            //在native中直接返回
            self.util.goBack(true);
          }else if(self.redirecturl && self.redirecturl != "undefined"){
            //在h5中返回到来路页面
            window.location.replace( self.redirecturl );
          }else{
            self.util.goBack(true);
          }

        }
        //登记设备
        registerToken.init();
        
      }
    }
  });


  //页面
  page.init();

  module.exports = page;

});