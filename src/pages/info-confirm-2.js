define(function(require, exports, module){

  var VModule = require("component/VModule");
  var PageModule = require("component/PageModule");
  var registerToken = require("mods/register-token/index");
  var condition= require("mods/condition/index");
  var PageTopTip = require("mods/page-top-tip/index");


  var sourceModule = VModule.render({
    init:function(){
        this.sid = this.util.getSID();

        var corpId = this.query.corpId;

        var scheduleId = this.query.scheduleId;
        var medAmPm = this.query.medAmPm;
        var doctName = this.query.doctName;
        var doctCode = this.query.doctCode;
        var hosRegType = this.query.hosRegType;
        var medDate = this.query.medDate;
        var regAmount = this.query.regAmount;
        var deptCode = this.query.deptCode;
        var deptName = this.query.deptName;
        var corpName = this.query.corpName;
        var regType = this.query.regType;
        var regMode = this.query.regMode;

        this.state = this.util.vis({
          corpId:corpId,
          needSource:true,
          sourceEmpty:false,
          loading:false,
          success:true,
          scheduleId:scheduleId,
          medAmPm:medAmPm,
          doctName:doctName,
          doctCode:doctCode,
          hosRegType:hosRegType,
          medDate:medDate,
          regAmount:regAmount,
          discountFee:regAmount, //优惠后金额
          deptCode:deptCode,
          deptName:deptName,
          corpName:corpName,
          regType:regType,
          regMode:regMode,
          patientId:"",
          patientName:"",
          sourceList:[]
        });
        
        this.module = this.initModule(this.state, '#root');

        //获取号原数据
        //有排班id才查号源 12月18 和晓飞的商量结果

        this.util.waitAlert("正在获取号源...");

        /*
         corpId:261
         type:4
         deptCode:0028
         parentDeptCode:0028
         regMode:1
         medAmPm:2
         medDate:2016-11-18
         doctCode:001568
         scheduleId:1199347
        */

        this.get("/user-web/restapi/common/reservation/numbersource", {
          corpId:corpId,
          // type:type,
          regType:regType,
          // type:regType,
          deptCode:deptCode,
          parentDeptCode:deptCode,
          doctCode:doctCode,
          regMode:regMode,
          medAmPm:medAmPm,
          medDate:medDate,
          scheduleId:scheduleId,
        });

        //如果是挂号，显示挂号不能退号文案
        if(regMode == 2){
          PageTopTip.init('#J_TopTip', 'regdetails')
        }
        //注册事件
        this.regEvent();
    },
    //是否需要选择号源
    isNeedSource:function(){
      return this.state.needSource;
    },
    //号源是否为空
    isSourceEmpty:function(){
      return this.state.sourceEmpty;
    },
    // 如果用户切换账户重新登录
    onActivation:function(){
      if(this.sid != this.util.getSID()){
        this.sid = this.util.getSID();
        //删除之前选择的就诊人
        //this.registerData.remove("patient");
        //重新载入页面
        location.reload();
      }
    },
    //绑定页面事件
    regEvent:function(){
      var self = this;
      
      //删除上一次的选择记录
      //下一个界面选择的就诊人，会通过windvane传递过来
      lib.windvane.on(function(result){
        if(result.ret == "SUCCESS"){
          var data = result.data ? JSON.parse(result.data) : null;
	        var registerData = self.cache.getCacheModule();
	        var needDefault = registerData.get("needDefault").value;
          if( data.patientId && !needDefault){
            //设置就诊人
            self.updateSelectPatient(data.patientId, data.patientName);
          }
        }
      });

      $('#root').delegate(".J_Submit", 'click', function(){
				self.checkBindCard();//先查看是否需要绑卡 再提交预约请求
        // self.submit();
      });
    },
    updateSelectPatient(patientId, patientName){
      
      this.setState({
        patientId:patientId,
        patientName:patientName,
      })
      var state = this.state;
      var self = this;
	    var registerData = this.cache.getCacheModule();
	    registerData.set("needDefault",true);

      this.util.waitAlert("请稍等...");
      this.io.get("/user-web/restapi/reservation/getAppointRegBenefit", {
        scheduleId:state.scheduleId,
        corpId:state.corpId,
        regType:state.regType,
        regMode:state.regMode,
        deptCode:state.deptCode,
        doctCode:state.doctCode,
        parentDeptCode:state.parentDeptCode,
        medDate:state.medDate,
        patientId:patientId,
        regAmount:state.regAmount,
        // appoNo:state.appoNo,
        medAmPm:state.medAmPm,
        patientId:state.patientId,
        medBegTime:state.medBegTime,
        medEndTime:state.medEndTime
      }, function(result){
        self.util.waitHide();
        if(result.data && result.data){
          self.setState({discountFee:result.data.discountFee})
        }
      }, function(){
        self.util.waitHide();
      });

      var registerData = this.cache.getCacheModule();
      registerData.set("patient", patientId, patientName);
    },
    //加载默认就诊人
    renderPatient( patientId ){
      var self = this;
      var corpId = this.state.corpId;
      var registerData = this.cache.getCacheModule();
	    var needDefault = registerData.get("needDefault").value;
      PageModule.render({
        init:function(){
          this.util.waitAlert("正在获取就诊人...");
          this.get("/user-web/restapi/patient/getList", {corpId:corpId})
        },
        onSuccess(result){

          if(result.data){
            var patientList = result.data;
            var isSelect = false;
            //选择上次选择的就诊人
            for(var i=0; i<patientList.length; i++){
              if(patientId == patientList[i].id && !needDefault){
                isSelect = true;
                self.updateSelectPatient(patientList[i].id, patientList[i].patientName);
                break;
              }
            }
            //选择第一个就诊人
            if(!isSelect ){
            	for(var i=0; i<patientList.length; i++) {
		            if(patientList[i].default) {
			            self.updateSelectPatient(patientList[i].id, patientList[i].patientName);
		            }
	            }
            }
          }

        },
        onError(){

        }
      }).init();
    },

    render:function(state){

      var {scheduleId,medAmPm,doctName,medDate,regAmount,deptName,corpName, needSource, patientName, discountFee} = state;
      var ampm = {"1":"上午", "2":"下午"};
      var dayOfWeekList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
      var time = [medDate, dayOfWeekList[new Date(medDate).getDay()] ,ampm[medAmPm]].join(" ");
      return `
        <ul class="list g-space">
            <li>
                <span class="item">医院</span>
                <span class="item-inner">${corpName}</span>
            </li>
            <li>
                <span class="item">科室</span>
                <span class="item-inner">${deptName}</span>
            </li>
            ${
              doctName ? `
                <li>
                    <span class="item">医生</span>
                    <span class="item-inner">${doctName}</span>
                </li>
              ` : ``
            }
            <li>
                <span class="item">就诊时间</span>
                <span class="item-inner txt-prompt">${time}</span>
            </li>
        </ul>
        <ul class="list list-link">
            ${
              needSource ? `
                <li class="txt-arrowlink">
                  <span class="item">选择号源</span>
                  <span class="item-inner item-right">${this.renderSourceList(state)}</span>
                </li>
              ` : ``
            }
            <li>
                <a href="patient-list.html?selectView=1&target=_blank&corpId=${this.query.corpId}" class="txt-arrowlink">
                    <span class="item">就诊人</span>
                    <span class="item-inner item-right">${patientName}</span>
                </a>
            </li>
        </ul>
        <div class="list-pay-msg clearfix">
          <span class="txt-info">应付</span>
          <span>￥ ${this.util.rmb(regAmount/100)}</span>
          ${
            regAmount - discountFee != 0 ? `
              <span class="txt-info">- 优惠</span>
              <span>￥${this.util.rmb((regAmount - discountFee)/100)}</span>
            ` : ``
          }
          <div class="item-right">
            <span class="txt-info">实付</span>
            <span class="txt-highlight">￥ ${this.util.rmb(discountFee/100)}</span>
          </div>
        </div>
        <div class="msg-rules">
            <a href="../rule.html?target=_blank" >请遵守平台预约挂号规则</a>
        </div>
        <a class="btn btn-block g-footer J_Submit">确认</a>
      `
    },
    //号源
    renderSourceList(state){
      let sourceList = state.sourceList;
      let util = this.util;
      let sourceItem = null;
      if(sourceList.length == 0){
        return ""
      }
      return `
        <select ref="regNoList">
          ${
            sourceList.map((item)=>{
              sourceItem = util.vis({
                appoNo:item.appoNo ? item.appoNo+"号" : "",
                medBegTime:item.medBegTime,
                medEndTime:item.medEndTime,
              });
              return `<option value="${item.appoNo || ""},${sourceItem.medBegTime},${sourceItem.medEndTime}">${sourceItem.appoNo} ${sourceItem.medBegTime}~${sourceItem.medEndTime}</option>`
            }).join("")
          }
        </select>
      `
    },
    onSuccess:function( result ){

      // result.data = {
      //   needSource: //是否需要选择号源
      //   sourceList:
      // }

      var data = result.data;

      if(data && data.needSource){
        this.setState({
          //需要选择号源
          needSource:true,
          sourceList:data.sourceList
        })
      }else{
        this.setState({
          //不需要选择号源
          needSource:false
        })
      }

      // return ;
      var registerData = this.cache.getCacheModule();
      var patient = registerData.get("patient");

      //查看上次就诊人 是否 未当前用户的
      this.renderPatient(patient.value);

    
  },

  submit(){

      var {corpId,scheduleId,regType,medDate,medAmPm, regMode,deptCode,doctCode, patientId, parentDeptCode} = this.state;

      var self = this;
      var regNoList = this.refs['regNoList'];
      var noList = regNoList ? $(regNoList).val() : ",,,";

      var appoNo = noList.split(',')[0] || "";
      var medBegTime = noList.split(',')[1]  || "";
      var medEndTime = noList.split(',')[2]  || "";

      if(!corpId){
        this.util.alert("没有选择医院");
        return ;
      }

      if(!deptCode){
        this.util.alert("没有选择科室");
        return ;
      }

      if(!medDate){
        this.util.alert("没有选择就诊时间");
        return ;
      }

      if(!medAmPm){
        this.util.alert("没有选择就诊时间");
        return ;
      }

      if( this.isNeedSource() ){
        if( this.isSourceEmpty() ){
          this.util.alert("号源被抢光了！");
          return ;
        }
      }

      if(!patientId){
        this.util.alert("请选择就诊人");
        return ;
      }

      //重复提交
      if( this.isSubmit == 1 ){
        return ;
      }

      this.isSubmit = 1;

      this.util.waitAlert("请等待...", 100);
      
      // this.regMode = 1 预约 2挂号
      let url = "/user-web/restapi/reservation/appointCreateOrder";

      if(regMode == 2){
        url = "/user-web/restapi/reservation/regCreateOrder"
      }

      PageModule.render({
        init:function(){
          this.get(url, {
            scheduleId:scheduleId,
            corpId:corpId,
            regType:regType,
            regMode:regMode,
            deptCode:deptCode,
            doctCode:doctCode,
            parentDeptCode:parentDeptCode,
            medDate:medDate,
            appoNo:appoNo,
            medAmPm:medAmPm,
            patientId:patientId,
            medBegTime:medBegTime,
            medEndTime:medEndTime
          });
        },
        onSuccess:function(result){

            self.isSubmit = 0;
            if(result.data){

              var _this = this;
              //预约成功登记设备号， 然后跳转
              registerToken.onComplate = function(){
                //标记为根
                _this.util.brige("popToRootViewController");

                window.location.href = "register-details-2.html?corpId="+result.data.corpId+"&id="+result.data.id;
              }

              registerToken.init();
            }
            //流程修改
            return ;
        },
        onError:function( result ){

          self.isSubmit = 0;
          this.util.waitHide();
          this.errorHandle( result );
        }

      }).init();
  },
  checkBindCard(){
	  //根据patientId,cropId判断是否要绑卡
		  var state = this.state;
		  var self = this;
		  this.registerData = this.cache.getCacheModule();
		  // console.log(this.registerData.get("patient").value,this.query.cropId)
		  this.util.waitAlert("请稍等...");
		  this.io.get("/user-web/restapi/card/isNeddBindCard", {
			  patientId:this.registerData.get("patient").value,
			  corpId:this.query.corpId,
		  }, function(result){
			  self.util.waitHide();
			  if(result.data && result.data.needBindCard){
				  var msg = result.data.msg || "";
				  var msgs = msg.split("</br>");
				  // console.log(result.data);
				  self.registerData = self.cache.getCacheModule();
				  var content = msgs[0];
				  if(msgs.length>1){content += "</br>"+"<span style='font-size: 12px;color: rgba(31, 29, 29, 0.95);'>"+msgs[1]+"</span>";}
				  self.util.dialog(content, function(okay){
					  if(okay){
						  location.href = "bind-card.html?cardType="+result.data.cardType+"&unionId="+result.data.unionId+"&patientId="+self.registerData.get("patient").value+"&target=_blank";
						  // bind-card.html?cardType=${cardType}&description=${description}&unionId=' + this.unionId + '&patientId=' + this.patientId + '&target=_blank"
					  } else {
						  // self.util.brige("popToRootViewController");
						  // window.location.href = "register-details-2.html?corpId="+result.data.corpId+"&id="+result.data.id;

					  }
				  },{
					  cancel:true,
					  cancelText:"暂不绑卡",
					  ok:true,
					  okText:"绑定就诊卡"});
			  }else if(result.data && !result.data.needBindCard){
			  	self.submit();
			  }
		  }, function(){
			  self.util.waitHide();
			  self.util.alert("网络访问失败！")
		  });
  }
});
  //号源信息
  sourceModule.init();


  module.exports = sourceModule;

});
