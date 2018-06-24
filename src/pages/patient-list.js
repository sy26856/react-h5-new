"use strict";

define(function(require, exports, module){

  var VModule = require("component/VModule");
  var patientTypeTips = {
    "1":"点击就诊人可以管理就诊人和查看余额",
    "2":"当前页面仅显示成人就诊人",
    "3":"当前页面仅显示0-7岁儿童就诊人"
  };
  var patientTypeText = {
    "1":"",
    "2":"成人",
    "3":"儿童"
  };
  

  var page = VModule.render({
    init:function(){
    	// alert("新加载")
	    this.cache.set("needDefault", false);
      this.type = this.query.type;
      this.unionId = this.query.unionId;
      this.selectView = this.query.selectView;
      this.referrer = this.query.referrer;
      this.saveKey = this.query.saveKey;//缓存的保存位置，默认会保存到 yuantu-cache
      this.patientType = this.query.patientType || 1; //1全部  2成人  3儿童
      this.countPatient = 0;
	    $('#J_AddPatient').attr("href","add-patient.html?target=_blank&unionId="+this.query.unionId+"&corpId="+this.query.corpId);
      //检查登录
      if( !this.checkLogin() ){
        return ;
      };
      
      this.state = {
        loading:true
      }

      this.module = this.initModule(this.state, '#J_PatientList')

      this.moduleDidMount();     

      this.regEvent();

    },
    moduleDidMount(){
      this.get("/user-web/restapi/patient/getList", {
        corpId:this.query.corpId || this.corpId,
        patientType:this.patientType
      });

    },
	  onActivation:function () {
		  if (this.util.isLogin()) {
			  this.moduleDidMount();
		  }
	  },
    regEvent:function(){

      var self = this;

      $('#J_AddPatient').click(function(){
        if(self.countPatient >= 5){
          self.util.alert("最多添加5位就诊人");
          return false;
        }
      });

      var selectView = this.selectView;
      if(this.selectView){
        $('#J_PatientList').delegate('.J_Item', 'click', function(e){
          
          e.preventDefault();

          var patientId = $(this).data("patientid");
          var patientName = $(this).data("patientname");
          var patientIdNo = $(this).data("patientidno") || "";
          //处理有0开头的身份证
          if ( patientIdNo.indexOf("_") > -1){
            patientIdNo = patientIdNo.replace("_","");
          }
          var registerData = self.cache.getCacheModule(self.saveKey);
          registerData.set("patient", patientId, patientName);

          registerData.set("patientIdNo", patientIdNo);
          // self.util.goBack();
          self.cache.set("patientIdNo", patientIdNo);
          self.cache.set("patientId", patientId);
          self.cache.set("patientName", patientName);
	        self.cache.set("needDefault", false);
	        // self.cache.set("patientIdNo", patientIdNo);

          if( self.util.isInYuantuApp() ){
            //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
            self.util.brige("pushDataToParent",{
              autoBack:true,
              data:JSON.stringify({
                patientId:patientId,
                patientName:patientName,
                patientIdNo:patientIdNo,
                origin:"patient-list"
              })
            });
          }else{
            if(self.referrer){
              //如果当前页面没有登录，这里 referrer 会是登录页面
              //safari浏览器back回去上一个页面不会刷新 12.19
              window.location.replace(self.referrer)
            }else{
              window.history.back(-1);
            }
          }
        });
      }

    },

    onSuccess:function( result ){
      result.loading = false;
      this.setState(result)
      
    },

    render(state){

      this.countPatient = state.data.length;

      if(this.countPatient == 0){
        return `
        <div id="J_List">
            <section class="ui-notice" >
                <i></i>
                <p>还没有${patientTypeText[this.patientType]}就诊人</p>
            </section>
        </div>
        `
      }

      return `
      <ul class="ui-list ui-list-text ui-list-link ui-border-tb">
          ${
            state.data.map((item)=>{
              return `
                <li class="ui-border-t">                
                    <a href="add-patient.html?id=${item.id}&unionId=${this.unionId}&target=_blank" data-patientid="${item.id}" data-patientIdNo="${item.idNo?"_"+item.idNo:"_"+item.guarderIdNo}"data-patientname="${item.patientName}" class="J_Item">
                        <h4>${item.patientName}<small style="color: rgb(224, 196, 0);margin-left: 7px;">${item.default?"默认":""}</small></h4>
                        <div class="ui-txt-info">${item.idNo?"身份证:"+item.idNo:"监护人身份证:"+item.guarderIdNo}</div>
                    </a>
                </li>
              `
            }).join("")
          }
      </ul>
      <div class="ui-tips center">${patientTypeTips[this.patientType]}</div>
      `
    },

    renderError(state){
      return `
        <div id="J_List">
            <section class="ui-notice" >
                <i></i>
                <p>没有就诊人</p>
            </section>
        </div>
        `
    }

  });

  page.init();

  module.exports = page;

});
