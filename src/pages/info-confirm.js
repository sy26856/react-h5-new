define(function(require, exports, module){

  var PageModule = require("component/PageModule");
  var registerToken = require("mods/register-token/index");
  var condition= require("mods/condition/index");
  var PageTopTip = require("mods/page-top-tip/index");

  var sourceModule = PageModule.render({
    init:function(){

        this.sid = this.util.getSID();
        //是否需要号源
        this.needSource =  true;
        this.sourceEmpty = false;
        //排班号
        this.scheduleId = this.query.scheduleId;
        //1 上午， 2 下午
        this.medAmPm = this.query.medAmPm;

        this.doctName = this.query.doctName;
        this.doctCode = this.query.doctCode;

        this.hosRegType = this.query.hosRegType;

        this.medDate = this.query.medDate;

        this.regAmount = this.query.regAmount;
        this.deptCode = this.query.deptCode;
        this.deptName = this.query.deptName;
        this.corpName = this.query.corpName;
        this.regType = this.query.regType;
        this.regMode = this.query.regMode;

        this.registerData = this.cache.getCacheModule();
        //渲染前面页面所有选择的信息
        this.render();

        //获取号原数据

        //有排班id才查号源 12月18 和晓飞的商量结果
        if( this.scheduleId ){
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
            corpId:this.corpId,
            // type:this.type,
            regType:this.regType,
            // type:this.regType,
            deptCode:this.deptCode,
            parentDeptCode:this.deptCode,
            doctCode:this.doctCode,
            regMode:this.regMode,
            medAmPm:this.medAmPm,
            medDate:this.medDate,
            // id:this.query.id,
            scheduleId:this.scheduleId,
          });
        }else{
          this.onSuccess({});
        }

        if(this.type == "56"){
        //如果是视屏预约的时候就init病情模块
          condition.init(true);
        }
        //如果是挂号，显示挂号不能退号文案
        if(this.regMode == 2){
          PageTopTip.init('#J_TopTip', 'regdetails')
        }
        //注册事件
        this.regEvent();
    },
    //是否需要选择号源
    isNeedSource:function(){
      return this.needSource;
    },
    //号源是否为空
    isSourceEmpty:function(){
      return this.sourceEmpty;
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
      var registerData = this.cache.getCacheModule();
      //删除上一次的选择记录
      //下一个界面选择的就诊人，会通过windvane传递过来
      lib.windvane.on(function(result){
        if(result.ret == "SUCCESS"){
          var data = result.data ? JSON.parse(result.data) : null;
          if( data.patientId ){
            registerData.set("patient", data.patientId, data.patientName);
            $('#J_PatientName').val( data.patientName );
          }
        }
      });
      // return ;
      var patient = registerData.get("patient");

      //查看上次就诊人 是否 未当前用户的
      this.renderPatient(patient.value);
    },
    //加载默认就诊人
    renderPatient( patientId ){
        PageModule.render({
          init:function(){
            this.get("/user-web/restapi/patient/getList", {corpId:this.query.corpId || this.corpId})
          },
          onSuccess(result){
            if(result.data){
              var patientList = result.data;
              var isSelect = false
              for(var i=0; i<patientList.length; i++){
                if(patientId == patientList[i].id){
                  isSelect = true;
                  lib.windvane.fire({
                    ret:"SUCCESS",
                    data:'{"patientId":"'+patientList[i].id+'","patientName":"'+patientList[i].patientName+'"}'
                  });
                  break;
                }
              }

              if(!isSelect && patientList[0]){
                lib.windvane.fire({
                  ret:"SUCCESS",
                  data:'{"patientId":"'+patientList[0].id+'","patientName":"'+patientList[0].patientName+'"}'
                });
              }
            }
          },
          onError(){

          }
        }).init();
    },

    render:function(){
      // var
      var registerData = this.registerData;
      //上一个页面新接口可以穿医院名字过来
      $('#J_dropName').val( this.corpName );
      $('#J_deptName').val( this.deptName );
      // console.log( this.doctCode )
      if( this.doctName ){
        $('#J_doctorName').val( this.doctName );
      }else{
        //如果是预约到科室的，就不显示医生
        $('#J_DoctorItem').addClass("hide");
      }

      $('#J_Date').val( this.medDate + " " +({"1":"上午", "2":"下午"}[this.medAmPm]));

      var type = this.registerData.get("type").value;

      // $('#J_Submit').text("确认"+ (type<=3 ? "挂号" : "预约"));
      // if(type<=3){
      $('#J_ShowRegAmount').removeClass("hide");
      $('#J_RegAmount').val("￥"+this.util.rmb(this.regAmount/100));
      // }
      //<span class="y">￥</span>

    },
    onError:function(){
      // this.util.alert("没有找到可用号源");
      $('#J_regNoList').html('<option value="">没有号源</option>');
    },
    onSuccess:function( result ){

        // result.data = {
        //   needSource: //是否需要选择号源
        //   sourceList:
        // }

        var data = result.data;

        if( data && data.needSource ){
          this.needSource = true;
          var list = data.sourceList ? data.sourceList : [];
          var html = "";
          if( list.length ){
             // var tmpl = '<option value="'+ list[i].appoNo+","+list[i].medBegTime +","+list[i].medEndTime  +'">'+ list[i].appoNo +'号 '+list[i].medBegTime  + "~"+ list[i].medEndTime+'</option>';
            html = '{@each sourceList as item}'+
            '<option value="${string(item.appoNo)},${string(item.medBegTime)},${string(item.medEndTime)}">${hao(item.appoNo)} ${string(item.medBegTime)}~${string(item.medEndTime)}</option>'+
            '{@/each}';

          }else{
            this.sourceEmpty = true;
            html = '<option value=",,,">没有号源</option>';
          }

          this.juicer.register("hao", function(value){
            if( value == null || value === undefined ){
              return "";
            }
            return value + "号";
          });
          // $('#J_regNoList').html( html );
          this.renderTo(html, data, '#J_regNoList');

        }else{
          //不需要号源
          this.needSource = false;
          $('#J_SourceSelect').addClass("hide");
        }
    }
  });


	//根据patientId,cropId判断是否要绑卡
	var isNeddBindCard = PageModule.render({
		init:function(){
			this.registerData = this.cache.getCacheModule();
			// console.log(this.registerData.get("patient").value,this.query.cropId)
			this.util.waitAlert("医院绑卡信息");
			this.get("/user-web/restapi/card/isNeddBindCard",{
				patientId:this.registerData.get("patient").value,
				corpId:this.query.corpId,
			});

		},
		onSuccess:function( result ){
			console.log(result);
			this.data = result.data;
		},
		getData:function(){
			return this.data;
		},
	});

  //点击确认按钮的交互
  var register = PageModule.render({
    init:function(){
      this.isSubmit = 0;

      this.regEvent();
    },
    regEvent:function(){
      var self = this;
      $('#J_Submit').click(function(){

          // if(self.checkLogin()){
          self.submit();
          // }

      });
    },
    submit:function(){

      var corpId = this.corpId;
        //医生页面可能改变类型
      // var type = this.query.type || this.registerData.get("type").value;
      this.registerData = this.cache.getCacheModule();
      var scheduleId = this.query.scheduleId;

      var regType  = this.query.regType;
      var regMode = this.query.regMode;
      var deptCode = this.query.deptCode;// this.registerData.get("deptCode").value;
      var doctCode = this.query.doctCode;//this.registerData.get("doctor").value;
      var medDate = this.query.medDate;//this.registerData.get("medDate").value;
      var medAmPm = this.query.medAmPm;//this.registerData.get("medAmPm").value;
      // var id = this.registerData.get("id").value;

      var noList = $('#J_regNoList').val();
      var appoNo = noList.split(',')[0];
      var medBegTime = noList.split(',')[1];
      var medEndTime = noList.split(',')[2];

      var patientId = this.registerData.get("patient").value;
      var parentDeptCode = this.registerData.get("parentDeptCode").value;
      // var hosRegType = this.registerData.get("hosRegType").value;

      // console.log(corpId, type, deptCode, doctCode,date, medAmPm, regNo, patientId)
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

      if( sourceModule.isNeedSource() ){
        if( sourceModule.isSourceEmpty() ){
          this.util.alert("号源被抢光了！");
          return ;
        }
        //需要选择号源 验证
        // if(!appoNo){
          // this.util.alert("请选择就诊号");
          // return ;
        // }
      }

      if(!patientId){
        this.util.alert("请选择就诊人");
        return ;
      }

      //重复提交
      if( this.isSubmit == 1 ){
        return ;
      }

      //视屏预约的病情描述和图片
      var conditionContent = condition.getContent();
      var conditionPhotos = condition.getPhotos()


      this.isSubmit = 1;

      this.util.waitAlert("请等待...", 100);
      
      // this.regMode = 1 预约 2挂号
      let url = "/user-web/restapi/reservation/appointCreateOrder";

      if(regMode == 2){
        url = "/user-web/restapi/reservation/regCreateOrder"
      }

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
        medEndTime:medEndTime,
        diseaseDesc:conditionContent ? conditionContent.slice(0, 300) : conditionContent,
        diseaseImageUrl:conditionPhotos
      });

    },
    getRegModeType:function(regMode){
      return {"1":"预约","2":"挂号"}[regMode] || "";
    },
    onSuccess:function(result){
      var self = this;
	    //登记设备号
	    registerToken.init();
			var data = isNeddBindCard.getData();
			if(result.data && data.needBindCard){
				var msg = data.msg || "";
				var msgs = msg.split("</br>");
				self.registerData = self.cache.getCacheModule();
				var content = msgs[0]+"</br>"+"<span style='font-size: 12px;color: rgba(31, 29, 29, 0.95);'>"+msgs[1]+"</span>";
				self.util.dialog(content, function(okay){
					if(okay){
						location.href = "bind-card.html?cardType="+data.cardType+"&unionId="+data.unionId+"&patientId="+self.registerData.get("patient").value+"&target=_blank";
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
			} else if (result.data){
          window.location.href = "register-details-2.html?corpId="+result.data.corpId+"&id="+result.data.id;
      }
      //流程修改
      return ;
    },
    onError:function( result ){

      this.isSubmit = 0;
      this.util.waitHide();
      this.errorHandle( result );
    }
  });


  //号源信息
  sourceModule.init();

  //保存按钮
  register.init();

	//判断是否绑卡
	isNeddBindCard.init();

  module.exports = sourceModule;

});
