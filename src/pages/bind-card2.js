define(function(require, exports, module){

  var md5 =require("libs/md5");

  var PageModule = require("component/PageModule");

  alert(1)

  try{

  var fromModule = PageModule.render({
    init:function(){

      this.patientId = this.query.patientId;
      this.patientName = this.query.patientName;

      //绑定新卡片需要跳转到原来就诊人页面
      this.newCard = this.query.newCard;

      //本页面 unionId  corpId 二选1
      this.unionId = this.query.unionId;
      this.corpId = this.query.corpId;


      $('#J_CardDescription').html( this.query.cardName );

      this.regEvent();

    },
    regEvent:function(){

      var self = this;
      $('#J_SubmintBtn').click(function(){
        self.submit();
      });

    },
    submit:function(){

      var fromData = this.getData();

      var cardNumber = fromData.cardNumber; //$.trim( $('#cardNumber').val() );
      var phone = fromData.phone;// $.trim( $('#J_Phone').val() );
      var cardType = fromData.cardType;// $.trim( $('#J_CardTypesList').val() );
      var validCode = fromData.validCode;//


      if( !cardType ){
          this.util.alert("无可用的就诊卡类型");
          return ;
      }

      if(!(cardNumber.length >5 && cardNumber.length < 30)){
        this.util.alert("请输入正确的卡号");
        return ;
      }

      if( !/^\d{11}$/.test( phone) ){
          this.util.alert("请输入正确的手机号码");
          return ;
      }

      if(validCode.length == 0){
          this.util.alert("请输入验证码");
          return ;
      }

      //绑定卡片
      this.get("/user-web/restapi/card/add", {
        unionId:this.unionId,
        corpId:this.corpId,
        cardNo:cardNumber,
        cardType:cardType,
        mobile:phone,
        patientId:this.patientId,
        validCode:validCode
      });

    },
    getData:function (){
        return {
            cardNumber: $.trim( $('#cardNumber').val() ),
            phone: $.trim( $('#J_Phone').val() ),
            cardType: $.trim( $('#J_CardTypesList').val() ),
            validCode: $.trim( $('#J_Code').val() )
        }
    },
    onSuccess:function( result ){
      var self = this;
      if( result.success ){
        this.util.alert("卡片绑定成功", function(){
            
            self.util.goBack(true);
        });
      }else{
        this.util.alert( result.msg );
      }
    },
    onError:function(result){

      this.util.alert( result.msg );

    }
  });

  //初始化可以选择的卡片类型
  var CardTypes = PageModule.render({
      init:function(){
          this.unionId = this.query.unionId;
          this.corpId = this.query.corpId
          console.log(this.unionId, this.corpId)
          this.get("/user-web/restapi/card/types", {
              unionId:this.unionId,
              corpId:this.corpId
          })
      },
      onError(){
          $('#J_CardTypesList').html('<option>无就诊卡类型</option>').attr("disabled", true)
      },
      onSuccess:function(result){
          console.log(result)
          var list = result.data && result.data.cardType ? [result.data] : null;

          if( list && list.length ){
              var tmpl = '{@each list as item}'+
                '<option value="${item.cardType}">${item.cardName}</option>'+
              '{@/each}'
              $('#J_CardTypesList').html(this.juicer(tmpl, {list:list}))
          }else{
              $('#J_CardTypesList').html('<option>当前区域无就诊卡</option>').attr("disabled", true)
          }
      }
  })


  //发送验证码模块
  var sendCodeModule = PageModule.render({
        isLoading:false,
        init:function(){

          this.countTime = 0;
          var self = this;
          this.unionId = this.query.unionId;
          this.corpId = this.query.corpId;
          this.patientId = this.query.patientId;


          $('#J_SendCode').click(function(){

            if(self.isLoading){
              return ;
            }

            var data = fromModule.getData();
            cardType = data.cardType;
            cardNumber = data.cardNumber;
            phone = data.phone;

            if( !cardType ){
                self.util.alert("无可用的就诊卡类型");
                return ;
            }

            if(!(cardNumber.length >5 && cardNumber.length < 30)){
              self.util.alert("请输入正确的卡号");
              return ;
            }

            if( !/^\d{11}$/.test( phone ) ){
                self.util.alert("请输入正确的手机号码");
                return ;
            }

            self.isLoading = true;
            self.sendCode( phone,cardType,cardNumber, self.unionId, self.patientId, self.corpId );
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
              $('#J_SendCode').text("重新验证")
              clearInterval(a);
            }
          }, 1000);
        },
        sendCode:function(phone,cardType,cardNumber,unionId,patientId,corpId ){
          //先验证手机号码是否已经注册，没有注册的用户提示他去注册
          //发送验证码
          this.util.waitAlert("正在验证信息是否匹配...");
          this.get("/user-web/restapi/card/validate", {
            mobile:phone,
            cardType:cardType,
            cardNo:cardNumber,
            unionId:unionId,
            patientId:patientId,
            corpId:corpId
          });
        },

        onSuccess:function(){

          $('#J_SendCode').text("60s");
          this.util.alert("验证码已发送");
          this.countdown();
        },
        onError:function( result ){
          this.isLoading = false;
          this.util.alert(result.msg || "网络错误，请稍后再试");
        }
    });

  //初始化可以选择的卡片类型
  CardTypes.init()

  //初始化验证码发送模块
  sendCodeModule.init();

  //初始化表单验证
  fromModule.init();

  module.exports = fromModule;
}catch(e){
  alert(JSON.stringify( e ))
}
alert(2)
});

