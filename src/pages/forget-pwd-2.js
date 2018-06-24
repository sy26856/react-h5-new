define(function(require, exports, module){

  var md5 =require("libs/md5");
  
  var PageModule = require("component/PageModule");


  var page = PageModule.render({
    init:function(){

      this.phoneNumber = this.query.phoneNumber;
      this.code = this.query.code;
      this.unionId = this.query.unionId;
      this.redirecturl = this.query.redirecturl;

      if( !this.phoneNumber || !this.code){
        alert("页面参数不正确");
        return ;
      }

      var self = this;

      this.regEvent();

    },
    regEvent:function(){

      var self = this;
      $('#J_Submit').click(function(){
        self.submit();
      });
    },
    submit:function(){
      var pwd1 = $.trim( $('#J_Pwd').val() );
      var pwd2 = $.trim( $('#J_Pwd2').val() );
      
      if(!(pwd1.length >=6 && pwd1.length <= 50)){
        this.util.alert("密码应设置为6-50位字符");
        return ;
      }

      if( pwd1 != pwd2 ){
        this.util.alert("两次输入密码不一致");
        return ;
      }


      //验证
      this.get("/user-web/restapi/common/ytUsers/updatePassword", {
        phoneNum:this.phoneNumber,
        valCode:this.code,
        password:md5(pwd1),
        //corpId:this.corpId,
        unionId: this.unionId
      });

    },
    onSuccess:function( result ){
      var self = this;
      if( result.success ){
        this.util.alert("密码重设成功，请重新登录", function(){
          //self.util.getPlatform() == "ios" && 
          // if( self.util.version.gt(2,1,7) ){
              self.util.goBack();
          // }else{
              // window.location.replace( "login2.html?redirecturl="+self.redirecturl );    
          // }
          
        });
      }else{
        this.util.alert( result.msg );
      }
    },
    onError:function(result){

      this.util.alert( result.msg );
      
    }
  });

  

  page.init();

  module.exports = page;

});