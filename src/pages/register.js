define(function(require, exports, module){


  var md5 = require("libs/md5");

  var PageModule = require("component/PageModule");


  var page = PageModule.render({
    init:function(){

      var self = this;
      this.redirecturl = this.query.redirecturl;
      this.unionId = this.query.unionId;
      this.regEvent();
    },
    regEvent:function(){

      var self = this;
      $('#J_Submit').click(function(){
        //send
        self.submit();
        $('#J_Uiform').removeClass("focus");
      });

       $('#J_MobileNumber').focus(function(){
          $('#J_Uiform').addClass("focus");
       });

      if( this.redirecturl ){
       var signin = $('.go-signin');
       signin.attr("href", signin.attr("href")+"?redirecturl="+this.redirecturl);
      }
    },
    submit:function(){
      var phoneNumber = $.trim( $('#J_MobileNumber').val() );
      var code = $.trim( $('#J_Code').val() );
      var pwd = $.trim( $('#J_Pwd').val() );


      if( !/^\d{11}$/.test( phoneNumber) ){
        this.util.alert("请输入11位手机号");
        return ;
      }

      if(!(code && code.length == 6)){
        this.util.alert("请输入正确的验证码");
        return ;
      }

      if( !(pwd && pwd.length >=6 && pwd.length <= 50) ){
        this.util.alert("请输入6-50个字符的密码");
        return ;
      }

      this.get("/user-web/restapi/common/ytUsers/reg", {
        phoneNum:phoneNumber,
        password:md5(pwd),
        valCode:code,
        //corpId:this.corpId,
        unionId: this.query.unionId
      });
      //
    },
    onSuccess:function( result ){
      var util = this.util;
      var redirecturl = this.redirecturl || "";
      if( result.success ){
        this.util.alert("注册成功");
        //ios大于2.1.7版本注册成功跳转回上一个native界面
        setTimeout(function(){
          util.goBack();
        },2000)
        
      }else{
        this.util.alert(result.msg);
      }
    },
    onError:function(result){
      this.util.alert( result.msg );
    }
  });




  //发送验证码模块
  var sendCodeModule = PageModule.render({
    isLoading:false,
    init:function(){

      this.countTime = 0;
      this.unionId = this.query.unionId;
      var self = this;

      $('#J_SendCode').click(function(){
        if(self.isLoading){
          return ;
        }
        self.isLoading = true;
        var phoneNumber = $.trim($('#J_MobileNumber').val());
        if(/^\d{11}$/.test( phoneNumber )){
          //验证是否已经注册
          self.checkIsReg( phoneNumber, function(){
            self.sendCode( phoneNumber );
          })
        }else{
          self.isLoading = false
          self.util.alert("请输入11位手机号")
        }
      });

    },
    checkIsReg:function(phoneNumber, success){
      var self = this;
      this.io.get("/user-web/restapi/common/ytUsers/checkIsReg", {phoneNum:phoneNumber, unionId:self.unionId}, function(result){
        if( !result.data ){
          success();
        }else{
          self.isLoading = false;
          self.util.alert( "该手机已注册" );
        }
      },success);
    },
    //倒计时
    countdown:function(){
      var self = this;
      this.countTime = 60;
      var a = setInterval(function(){
        $('#J_SendCode').text((--self.countTime) +"s");
        if( self.countTime <=0 ){
          self.isLoading = false;
          $('#J_SendCode').text("重新发送");
          clearInterval(a);
        }
      }, 1000);
    },
    sendCode:function(phoneNum){
      var self = this;
      //发送验证码
      this.util.waitAlert("正在发送验证码...");
      this.get("/user-web/restapi/common/ytUsers/getValidateCode", {
        phoneNum:phoneNum,
        isApp: self.util.isInYuantuApp(),
        unionId: this.unionId
      })
    },
    onSuccess:function(){

      this.countdown();
    },
    onError:function(result){
      this.isLoading = false;
      this.util.alert(result.msg || "网络错误，请稍后再试")
    }
  })

  //手机验证码模块
  sendCodeModule.init();

  //页面
  page.init();

  module.exports = page;

});
