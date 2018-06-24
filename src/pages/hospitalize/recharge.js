define(function (require, exports, module) {

  var PageModule = require("component/PageModule");

  //支付模块页面UI
  var payPageModule = require("mods/pay/index");
  //支付模块网路请求
  var payModule = require("mods/pay/pay");
  //微信内获取openid
  var weixin = require("mods/wxOpenId/index");


  var page = PageModule.render({
    init: function () {

      this.corpId = this.query.corpId;
      this.unionId = this.query.unionId;
      this.patientId = this.query.patientId || null;
      this.cardNo = '';
      this.cardId = this.query.cardId || '';
      //存放url中的patientId和cardId，不可变
      this.urlPatientId = this.query.patientId || '';
      this.urlCardId = this.query.cardId || '';


      //如果在微信中，首先要获取openId
      if (this.util.isInMicroMessenger()) {
        this.openId = weixin.getOpenId(this.corpId, 1)
      }

      //初始化缴费方式
      payPageModule.onReady = function (isSupport) {
        if (isSupport) {
          $('#J_Submit').removeClass("hide")
        }
      }

      payPageModule.init(this.corpId, 4);

      this.regEvent();
    },
    isDefaultSelect: function (patientId, currentPatientId, isDefault) {
      if (patientId) {
        return patientId == currentPatientId ? "selected" : "";
      } else {
        return isDefault ? "selected" : "";
      }

    },
    regEvent: function () {
      var self = this;
      /*$('#J_PatientSelect').change(function(){
       self.cache.set("patientId", $(this).val());
       self.queryAccout($(this).val())
       })*/
      // var patientId = patient ? patient.value : null;
      var patientId = this.cache.get("patientId") || null;
      // console.log(patient)
      PageModule.render({
        init: function () {
          this.get("/user-web/restapi/patient/getList", {corpId: this.query.corpId || this.corpId})

          $('.close-container').click(function () {
            $('.patient-list-container').hide();
          });
          //弹窗点击半透明处消失
          $('.patient-list-container').click(function () {
            $('.patient-list-container').hide();
          });
          $('.patient-list-main').click(function (e) {
            e.stopPropagation();
          });
          //点击就诊人弹出框
          $('#J_PatientSelect').click(function () {
            $('#patientList').show();
          });
          //点击就诊人选择，弹窗消失并赋值给this.patientId
          $('#patientList .patient-list').on('click', '.patient-li', function () {
            self.patientId = $(this).attr('data-pid');
            $('#patientList').hide();
            $('#J_PatientSelect').text($(this).attr('data-pname'));
            $('#J_Balance').val(0 + '元');
            $('#J_CardSelect').text('请选择充值账户');
            self.cardId = '';
            self.cardNo = '';
            self.queryAccout(self.patientId);
          });

        },
        onSuccess(result){
          if (result.data) {
            var patientList = result.data;

            if (patientList.length > 0) {
              $('#patientList .patient-list').html(
                patientList.map((item) => {
                    const icon = item.idType == 1 ? 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/7fee31b86360d5ee6b19c10b4dae22c2-68-68.png'
                      : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f67f01446d90cf0613feee5389c44b36-68-68.png';
                    return `<div class="patient-li" data-pid=${item.id} data-pname=${item.patientName}>
                  <img class="patient-list-avatar" src=${icon} />
                  <div class="patient-list-item">
                    <div class="patient-list-name">
                      ${item.patientName}
                      <span>${item.idType == 1 ? "成人" : "儿童"}</span>
                    </div>
                    <div class="patient-list-brief">${item.idNo || item.guarderIdNo}</div>
                  </div>
                </div>`
                  }
                ).join(""))
            } else {
              $('#patientList .patient-list').html(
                `<div class="patient-notice">
                  <span></span>
                  <p>尚未添加就诊人</p>
                  <p>请先添加就诊人</p>
                </div>`
              );
            }

            //如果就诊人列表长度>0，默认选择默认就诊人，如果无默认就诊人，则选择第一个就诊人
            if (self.patientId) {
              let defaultPatient = patientList.filter(z => z.id == self.patientId)[0];
              $('#J_PatientSelect').text(defaultPatient ? defaultPatient.patientName : patientList[0].patientName);
            } else if (patientList.length > 0) {
              let defaultPatient = patientList.filter(z => z.default)[0];
              self.patientId = defaultPatient ? defaultPatient.id : patientList[0].id;
              $('#J_PatientSelect').text(defaultPatient ? defaultPatient.patientName : patientList[0].patientName);
              self.queryAccout(self.patientId)
            }
          }
        },
        onError(e){
          if (e.msg == '未登录') {
            self.util.goLogin();
          }
        }
      }).init();

      $('#J_Submit').click(function () {
        if (!$(this).attr("disabled")) {
          self.submit();
        }

      });
      // $('#J_AddPatient').attr("href","../patient-list.html?selectView=1&corpId="+self.query.corpId+"&target=_blank");
    },

    //查询就诊人余额
    queryAccout: function (patientId) {
      this.util.waitAlert("正在查询余额...");
      /*PageModule.render({
       init: function() {
       this.get("/user-web/restapi/patient/getallinfo", {
       corpId: self.corpId,
       unionId: self.unionId,
       patientId: patientId,
       queryBalance: true //是否查询余额
       });
       },
       onSuccess: function(result) {
       //表示就诊人能不能充值
       console.log(result);
       if (result.data.account) {
       $('#J_Tips').addClass("hide");
       $('#J_Submit').removeAttr("disabled");
       } else {
       $('#J_Tips').text("请到自助终端取卡后再充值").removeClass("hide");
       $('#J_Submit').attr("disabled", "disabled");
       }
       },
       onError: function () {
       $('#J_Tips').text("当前就诊人状态无法充值").removeClass("hide");
       $('#J_Submit').attr("disabled", "disabled");
       },
       }).init();*/

      this.get("/user-web/restapi/inhos/patientinfo", {
        unionId: this.unionId,
        corpId: this.corpId,
        patientId: patientId,
        queryInHosPatient: true,
        queryBalance: true //是否查询余额
      });

    },
    //查询余额回调
    onComplate: function (result) {

      this.util.waitHide();

      if (result.success && result.data) {
        this.onSuccess(result);
      } else {
        //失败
        $('#J_Balance').val(0 + "元");
        this.onError(result);
      }
    },

    onSuccess:function( result ){

      this.util.waitHide();

      var balance = 0;

      if( result.success && result.data.balance ){
        balance = result.data.balance;
      }

      $('#J_Balance').val( balance/100 +" 元");

      //表示就诊人能不能充值
      if(result.data.accountNo){
        //南阳医院坑爹 直接判断中文
        if(result.data.status != "入院"){
          $('#J_Tips').text("该患者状态不支持充值").removeClass("hide");
          $('#J_Submit').attr("disabled", "disabled");
        }else{
          //其他状态 可以充值
          $('#J_Tips').addClass("hide");
          $('#J_Submit').removeAttr("disabled");
        }
      }else{
        $('#J_Tips').text("请到自助终端取卡后再充值").removeClass("hide");
        $('#J_Submit').attr("disabled", "disabled");
      }

    },

    onError: function () {
      $('#J_Tips').text("住院病人不存在，不能充值").removeClass("hide");
      $('#J_Submit').attr("disabled", "disabled");
    },

    submit: function () {

      var self = this;
      var feeChannel = payPageModule.getPayType();
      var patientId = this.patientId || '';
      var fee = parseFloat($('#J_recharge_money').val());
      var corpId = this.corpId;
      var unionId = this.unionId;
      var cardId = this.cardId || '';

      var util = this.util;

      if (!patientId) {
        this.util.alert("请选择就诊人");
        return;
      }

      if (!(fee >= 0.01)) {
        this.util.alert("输入金额必须大于等于0.01");
        return;
      }

      if (feeChannel == -1) {
        this.uitl.alert("请选择支付方式");
        return;
      }

      this.feeChannel = feeChannel;
      fee = (fee * 100).toFixed(0);
      /**
       feeChannel 支付方式   //1、支付宝 2、微信 3、余额
       optType 业务类型 //1、充值 2、缴费 3、挂号 4住院充值
       optParam 业务参数
       */


      //支付完成
      payModule.onPayComplate = function (isOkay, id, result) {

        if (isOkay) {

          self.util.alert("充值成功");

          setTimeout(function () {
            window.location.reload();
          }, 1000);

        } else {

          setTimeout(function () {
            window.location.href = util.h5URL(`/pages/bill-detail.html?unionId=${unionId}&id=${id}&corpId=${corpId}`); //"https://uat.yuantutech.com/yuantu/h5-cli/1.3.32/pages/bill-detail.html?id="+id;
          }, 1500);


        }

      };
      //optType 业务类型 //1、充值 2、缴费 3、挂号 4住院充值
      payModule.pay(feeChannel, 4, {
        fee: fee,
        patientId: patientId,
        corpId: this.corpId,
        openId: this.openId,
        cardId: cardId
      });


    },

  });


  page.init();

  module.exports = page;

});
