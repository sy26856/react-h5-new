
define(function(require, exports, module){

  var PageModule = require("component/PageModule");
  var ScrollHooker = require("component/ScrollHooker");
  var registerStatus = require('pages/registerStatus')


  var page = PageModule.render({
    init:function(){

      /**
          1. 读取区域医院的预约记录 unionId
          2. 读取单个医院的预约记录  corpId
          3. 读取全部的预约记录 corpId
      */

      var self = this;

      //检查登录并且弹框
      if( !this.checkLogin() ){
        return ;
      }

      var currentPage = 1;
      //下拉分页
      this.scrollHooker = new ScrollHooker();
      this.scrollHooker.onEnd = function(){
        $('#J_PullLoading').removeClass("hidden");
        setTimeout(function(){
          self.renderPageList( currentPage++ );
        }, 500)
      };

      self.renderPageList( currentPage++ );

    },
    renderPageList:function(currentPage){
      //alert( "currentPage"+currentPage )
      this.get("/user-web/restapi/reservation/reginfo", {
        unionId:this.query.unionId,
        corpId:this.query.corpId,
        currentPage:currentPage,
        pageSize:30
      });
    },
    onComplate:function(result,transitionNum){
      //$('#J_PullLoading').addClass("hide");
      //$('#J_PullLoading').addClass("load-hide");
      this.supperClass.onComplate.call(this, result );
    },
    onSuccess:function( result ){
      console.log(result)
      var self = this;
      var tmpl = '{@each data as item}'+
      '<a href="../register-details-2.html?id=${item.id}&corpId=${item.corpId}&target=_blank">'+
      '<ul class="ui-list ui-list-pure ui-border-tb">'+
        '<li class="ui-border-t">'+
          '<h4 >${item.corpName}</h4>'+
          '<p>'+
            '{@if item.type==56}<span class="tag">视频</span>{@/if}<span>${string(item.deptName)} ${regType(item.regType, item.regMode)} ${string(item.doctName)}</span>'+
            '{@if item.regMode!=1}<span class="rmb"><span class="y">￥</span>${(item.benefitRegAmount/100).toFixed(2)}</span>{@/if}'+
          '</p>'+
          '<h5 class="ui-border-tt">${dateFormat(item.medBegTime, item.medAmPm, item.regMode)}</h5>'+
          '<p>就诊人: ${item.patientName} <span class="status">${status(item.status, item.regMode, item.statusDes)}</span> </p>'+
        '</li>'+
      '</ul>'+
      '</a>'+
      '{@/each}';

      $('#J_Page').removeClass("wait");

      if(result.data && result.data.data && result.data.data.length){

        //var now = new Date();
        // var timezoneOffset = this.util.getTimezoneOffset();
        this.juicer.register("dateFormat", function(medBegTime, medAmpm, regMode){
          // medBegTime =1
          // medDate -= timezoneOffset;

          return self.util.dateFormatGMT(medBegTime, "yyyy.MM.dd") + " " + {"1":"上午","2":"下午"}[medAmpm] + " "+ (medBegTime?self.util.dateFormatGMT(medBegTime, "h:mm"):"");

        });

        // this.juicer.register("dateFormat2", function(time){
        //   //加上时间差值
        //   time -= timezoneOffset;
        //   return self.util.dateFormat(time, "h:mm");
        // });

        this.juicer.register("status", function(status,regMode,statusDes){

          return registerStatus.getRegisterStatusText(status, regMode, statusDes);

        });


        this.juicer.register("regType", function(regType, regMode){

          var regTypeStr = {
              "1":"普通",
              "2":"专家",
              "3":"名医"
          }[regType] || "";

          var regModeStr = {
            "1":"预约",
            "2":"挂号"
          }[regMode] || "";

          return  regTypeStr + regModeStr;

        });


        this.juicer.register("dateFormat", this.util.dateFormat);

        var html = this.juicer(tmpl, result.data)

        if( html ){
            result.data.currentPage == 1 ? $('#J_List').html( html ) : $('#J_List').append( html );
        }

        if( result.data.currentPage >= (result.data.totalItem / 30) ){
          this.scrollHooker.recovery();
          $('#J_PullLoading').addClass("hide");
        }

      }else{
        $('#J_Page').removeClass("wait");
        $('#J_NoData').removeClass("hide");
        $('#J_TipsFeedback').removeClass("hide");
      }
    }
  });

  page.init();

  module.exports = page;

});
