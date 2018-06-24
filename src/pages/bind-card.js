"use strict";

define(function(require, exports, module){

  var md5 =require("libs/md5");

  var VModule = require("component/VModule");

  var page = VModule.render({
    init:function(){

      // this.patientId = this.query.patientId;
      // this.patientName = this.query.patientName;

      // //绑定新卡片需要跳转到原来就诊人页面
      // this.newCard = this.query.newCard;

      // //本页面 unionId  corpId 二选1
      this.unionId = this.query.unionId;
      this.corpId = this.query.corpId;
      this.patientId = this.query.patientId;
      this.redirect = this.query.redirect;
      console.log(this.redirect)
      this.isSendMsg = false;
      this.state = this.util.vis({
        loading:false,
        success:true,
        sendCodeMsgTime:0,
        newCard:this.query.newCard,
        unionId:this.unionId,
        corpId:this.corpId,
        patientId:this.patientId,
        patientName:this.query.patientName,
        cardName:this.query.cardName,
        cardType:"",
        phone:"",
        cardNo:"",
        validCode:"",
        cards:null, // null 正在请求  [] 没有可绑定的卡片
      });

      this.module = this.initModule(this.state, '#J_Page');

      this.regEvent();
      this.loadCards();
	    this.getMsg();
    },
    regEvent(){

      $('#J_Page').delegate('.J_Submit', 'click', ()=>{
        this.getFormData();
        this.submit();
      });
      //发送验证码
      $('#J_Page').delegate('.J_SendCode', 'click', ()=>{
        this.getFormData();

        if(this.state.sendCodeMsgTime > 0){
          return ;
        }

        var cardType = this.state.cardType;
        var cardNo = this.state.cardNo;
        var phone = this.state.phone;

        if( !cardType ){
          this.util.alert("无可用的就诊卡类型");
          return false;
        }

        if(!(cardNo.length >5 && cardNo.length < 30)){
          this.util.alert("请输入正确的卡号");
          return false;
        }

        if( !/^\d{11}$/.test( phone ) ){
          this.util.alert("请输入正确的手机号码");
          return false;
        }
        this.util.waitAlert("正在验证信息是否匹配...");

        var self = this;
        VModule.render({
          init(phone, cardType, cardNo, unionId, patientId, corpId){
            this.get("/user-web/restapi/card/validate", {
              mobile:phone,
              cardType:cardType,
              cardNo:cardNo,
              unionId:unionId,
              patientId:patientId,
              corpId:corpId
            })
          },
          onSuccess(result){
            self.util.alert("发送成功");
            self.setState({
              sendCodeMsgTime:60
            });
            self.sendCodeCountDown();
          },
          onError(result){
            self.util.alert(result.msg || "验证码发送失败，请稍后再试");
          }
        }).init(phone, cardType, cardNo, this.unionId, this.patientId, this.corpId);

      })
    },
    sendCodeCountDown(){
      let a = setInterval(()=>{
        let sendCodeMsgTime = this.state.sendCodeMsgTime - 1;
        if(sendCodeMsgTime <= 0){
          this.setState({
            sendCodeMsgTime:0
          });
          clearInterval(a)
        }else{
          this.setState({
            sendCodeMsgTime:sendCodeMsgTime
          });

        }
      }, 1000)
    },
    getFormData(){
      let cardType = $('#J_Page .cardType').val();
      let cardNo = $('#J_Page .cardNo').val();
      let phone = $('#J_Page .phone').val();
      let validCode = $('#J_Page .J_Code').val();

      this.setState({
        cardType:cardType,
        cardNo:cardNo,
        phone:phone,
        validCode:validCode
      })
    },
    loadCards(){
      //获取可绑定的卡片列表

      var self = this;
      VModule.render({
        init(unionId, corpId){
		        this.get("/user-web/restapi/card/types", {
			        unionId: unionId,
			        corpId: corpId,
		        })

        },
        onSuccess(result){
          if(result.data && result.data.cardType){
            self.setState({
              cards:[result.data]
            })
          }else{
            //没有可使用的卡片
            self.setState({
              cards:[]
            })
          }
        },
        onError(result){
          self.setState({
            cards:[]
          })
        }
      }).init( this.unionId, this.corpId);

    },
	  getMsg(){
		  //从后台获取提示信息
		  var self = this;
		  VModule.render({
			  init(unionId, corpId){
				  this.get("/user-web/restapi/card/getRemind", {
					  unionId: unionId,
					  corpId: corpId,
				  })
			  },
			  onSuccess(result){
				  if(result.data ){
					  self.setState({
						  msg:result.data
					  })
				  }else{
					  //没有信息
					  self.setState({
						  msg:""
					  })
				  }
			  },
			  onError(result){
				  self.setState({
					  msg:""
				  })
			  }
		  }).init( this.unionId, this.corpId);

	  },
    //发送验证码
    sendMsgCode(){

    },
    onChangeCard(){
      this.getFormData();
    },
    render( state ){
      let util = this.util;
      let {
        cardName,
        cards,
        unionId,
        cardType,
        sendCodeMsgTime,
	      msg,
      } = state;

      /**
        cardName:"南阳就诊卡"
        cardType:"5"
        description:""
        isTiedCard:true
      */

      let isSendMsg = true;
      let card = null;

      if( cards.length ){
        card = cards.filter((item)=>{
          return item.cardType == cardType;
        })[0];
        card = card ? card :cards[0];
        if(card && card.isSendMsg == false){
          isSendMsg = false;
        }
      }

      this.isSendMsg = isSendMsg;
      return `
        <div class="ui-tips  center">
          绑定<em>${cardName}</em>就诊卡，可在挂号、缴费等环节直接支付
        </div>
        <div class="ui-form">
          <div class="ui-form-item ui-form-item-show ui-border-tb">
            <label>就诊卡:</label>
            <div class="ui-select">
              <select class="cardType" onChange="${this.bind(this.onChangeCard)}">
                ${
                  util.is(cards == null , `<option>正在获取...</option>`)
                }
                ${
                  typeof cards == 'object' ? cards.map((item)=>{
                    return `<option value="${item.cardType}" >${item.cardName}</option>`
                  }).join("") : ""
                }
              </select>
            </div>
          </div>
          <div class="ui-form-item ui-form-item-show  ui-border-b">
            <label for="cardNumber">卡号:</label>
            <input type="text" class="cardNo" maxlength="20" placeholder="请输入就诊卡卡号" >
          </div>
          <div class="ui-form-item ui-form-item-show ui-border-b">
            <label for="phone">手机号码:</label>
            <input type="number" name="phone" class="phone"  placeholder="请输入办卡时预留的手机号码" >
          </div>
          ${

            util.is(isSendMsg,  
              `
              <div class="ui-form-item  ui-form-item-show ui-form-item-r ui-border-b">
                <label for="J_Code">验证码:</label>
                <input type="text" maxlength="6" class="J_Code"  style="margin-left:95px;width:50%;padding-right:0;"  placeholder="请输入验证码">
                <button type="button" class="ui-border-l J_SendCode" >
                  ${sendCodeMsgTime == 0 ? "发送验证码" : sendCodeMsgTime+"s"}
                </button>
              </div>
              `
            )
          }
        </div>
        <div class="hide" style="margin: 10px 15px 0 15px; font-size: 13px; color: #999" id="errTips">
          绑定信息和领卡预留信息不一致，请前往人工窗口核实卡号、手机号、身份证号
        </div>
        <div class="ui-btn-wrap">
            <button class="ui-btn-lg ui-btn-primary J_Submit">
                绑定
            </button>
        </div>
        ${util.is(msg,msg)
          // util.is( unionId == 60,
          //   `
          //     <div class="about-faq">
          //       <h2>番禺民生卡有什么好处?</h2>
          //       <p>
          //           民生卡作为番禺区政府为广东省全员信息库的番禺区民生档
          //           案人员免费发行的政府服务卡，在卫生医疗领域，持卡人可
          //           通过番禺区卫生医疗机构的银医通自助终端，实现自助发卡
          //           自助挂号、自助缴费（含医保自助结算）、自助打印检验报告
          //           等功能，在民生卡的身份认证和资金结算中完成整个就医流
          //           程，并能够在区内所有卫生医疗机构实现一卡通。
          //       </p>
          //       <h2>如何申请民生卡？</h2>
          //       <p>请拨打民生卡客服热线:400-834-116或者访问民生卡网站 http://www.xhjk.com.cn 了解详情</p>
          //     </div>
          //   `
          // )
        }
      `
    },
    submit:function(){

      var cardNumber = this.state.cardNo; //.cardNumber; //$.trim( $('#cardNumber').val() );
      var phone = this.state.phone;// $.trim( $('#J_Phone').val() );
      var cardType = this.state.cardType;// $.trim( $('#J_CardTypesList').val() );
      var validCode = this.state.validCode;//

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

      if(this.isSendMsg){
        if(validCode.length == 0){
          this.util.alert("请输入验证码");
          return ;
        }
      }

      //绑定卡片
      this.get("/user-web/restapi/card/add", {
        unionId:this.state.unionId,
        corpId:this.state.corpId,
        cardNo:cardNumber,
        cardType:cardType,
        mobile:phone,
        patientId:this.patientId,
        validCode:validCode
      });

    },

    onSuccess:function( result ){
      var self = this;
      var redirect = this.redirect;
      if( result.success ){
        this.util.alert("卡片绑定成功", function(){
          if(redirect){
            window.location.href = redirect;
          }else{
            // self.util.goBack(true);
	          window.location.href = `../add-patient.html?id=${self.patientId}&unionId=${self.unionId}&corpId=${self.corpId}&target=_blank&t=ddsduh`
          }
        });
      }else{
        this.util.alert( result.msg );
      }
    },
    onError:function(result){
      this.util.alert( result.msg );
      var dom = document.getElementById("errTips");
      if (this.unionId == 1029) {
        dom.classList.remove("hide");
      }
    }
  });

  page.init();

  module.exports = page;
});


