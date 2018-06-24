define(function(require, exports, module){


  var PageModule = require("component/PageModule");


  var page = PageModule.render({
    init:function(){

      var self = this;

      console.info(this.query.redirecturl);
      this.redirecturl = this.query.redirecturl;
      this.unionId = this.query.unionId;
      this.regEvent();
    },
    regEvent:function(){

      var self = this;
      $('#J_Submit').click(function(){
        //send
        self.submit();
      });
    },
    submit:function(){
      var phoneNumber = $.trim( $('#J_MobileNumber').val() );
      var code = $.trim( $('#J_Code').val() );

      this.phoneNumber = phoneNumber;
      this.code = code;

      if( !/^\d{11}$/.test( phoneNumber) ){
        this.util.alert("请输入11位手机号");
        return ;
      }

      if(!(code && code.length == 6)){
        this.util.alert("请输入正确的验证码");
        return ;
      }

      //验证
      this.util.waitAlert("验证中...");
      this.get("/user-web/restapi/common/ytUsers/checkValidateCode", {
        phoneNum:phoneNumber,
        valCode:code,
        //corpId:this.corpId,
        unionId:this.unionId
      });

    },
    onSuccess:function( result ){
      // console.log(result)
      // this.util.alert("验证成功");
      if( result.success ){
        window.location.replace("forget-pwd-2.html?phoneNumber="+this.phoneNumber+"&code="+this.code+"&unionId="+this.unionId+"&redirecturl="+encodeURIComponent(this.redirecturl));
      }else{
        this.util.alert( result.msg );
      }
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

        var phoneNumber = $('#J_MobileNumber').val();
        if(/^\d{11}$/.test( $.trim(phoneNumber) )){
          self.isLoading = true;
          self.sendCode( $.trim(phoneNumber) );
        }else{
          self.util.alert("请输入11位手机号");
        }
      });

    },
    //倒计时
    countdown:function(){
      var self = this;
      this.countTime = 60;
      var a = setInterval(function(){
        $('#J_SendCode').text((--self.countTime) +"s");
        if( self.countTime <=0 ){
          self.isLoading = false;
          $('#J_SendCode').text("重新发送")
          clearInterval(a);
        }
      }, 1000);
    },
    sendCode:function(phoneNum){
      var self = this;

      //先验证手机号码是否已经注册，没有注册的用户提示他去注册
      this.checkIsReg(phoneNum, function(isReg){
        if( isReg ){
          //发送验证码
          self.util.waitAlert("正在发送验证码...");
          self.get("/user-web/restapi/common/ytUsers/getValidateCode", {
            phoneNum:phoneNum,
            isApp:self.util.isInYuantuApp(),
            unionId: self.unionId
          });
        }else{
          self.isLoading = false;
          self.util.alert("该手机未注册，可注册新用户");
          // self.onError({msg:"该手机未注册，可注册新用户"});
        }

      });
    },
    checkIsReg:function(phoneNumber, success){
      var self = this;

      PageModule.render({
        init:function(phoneNum){
          this.util.waitAlert("正在验证手机...");
          this.unionId = this.query.unionId;
          this.get("/user-web/restapi/common/ytUsers/checkIsReg", {phoneNum:phoneNum, unionId: this.unionId});
        },
        onSuccess:function(result){
          success(result.data || false);
        },
        onError:function(){
          success(false);
        }
      }).init(phoneNumber);

    },
    onSuccess:function(){

      $('#J_SendCode').text("60s");
      this.util.alert("验证码已发送");
      this.countdown();
    },
    onError:function( result ){
      this.isLoading = false;
      // this.supperClass.onError( result );
      this.util.alert(result.msg || "网络错误，请稍后再试");
    }
  })

  page.init();
  //页面
  sendCodeModule.init();

  module.exports = page;

});
