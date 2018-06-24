define(function (require, exports, module) {

  var PageModule = require("component/PageModule");

  //支付模块页面UI
  var payPageModule = require("mods/pay/index");
  //支付模块网路请求
  var payModule = require("mods/pay/pay");

  var weixin = require("mods/wxOpenId/index");

  var page = PageModule.render({
    init: function () {
      let rechargeInfo = {};
      try {
        rechargeInfo = JSON.parse(sessionStorage.rechargeInfo);
      } catch (e) {
        console.log(e);
      }

      this.corpId = this.query.corpId;
      this.unionId = this.query.unionId || '';
      this.patientId = rechargeInfo.patientId || '';
      //this.isCorpCard = this.query.isCorpCard || '';
      this.cardNo = '';
      this.cardId = rechargeInfo.cardId || '';
      this.hasDetail = false;
      //存放url中的patientId和cardId，不可变。。。因为微信支付中转只能带一个参数，所以这些没用了……
      //this.urlPatientId = this.query.patientId || '';
      //this.urlCardId = this.query.cardId || '';

      //如果在微信中，首先要获取 openId
      if (this.util.isInMicroMessenger()) {
        this.openId = weixin.getOpenId(this.corpId, 1)
      }


      //支付宝网页支付完成后会跳转会到当前页面
      //需要轮训支付状态，并在成功的时候刷新页面
      // if(this.query.out_trade_no){
      // 	payModule.roundGetStatusByOutId(this.query.out_trade_no);
      // 	return ;
      // }

      //初始化缴费方式
      payPageModule.onReady = function (isSupport) {
        if (isSupport) {
          $('#J_Submit').removeClass("hide")
        }
      }

      payPageModule.init(this.corpId, 1);

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
      /*$('#J_PatientSelect').change(function () {
       self.cache.set("patientId", $(this).val());
       self.queryAccout($(this).val())
       self.getCard()
       })*/
      // var patientId = patient ? patient.value : null;
      var patientId = this.cache.get("patientId") || null;
      // console.log(patient)

      PageModule.render({
        init: function () {
          this.get("/user-web/restapi/patient/getList", {
            corpId: this.query.corpId || this.corpId,
            unionId: self.unionId
          });

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
            //if (!self.urlPatientId) {
            $('#patientList').show();
            //}
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
            self.hasDetail = false;
            self.getCard();
          });
          $('#cardList .patient-list').on('click', '.card-li', function () {
            self.cardNo = $(this).attr('data-cardNo') !== 'undefined' ? $(this).attr('data-cardNo') : '';
            self.cardId = $(this).attr('data-cardId') !== 'undefined' ? $(this).attr('data-cardId') : '';
            var balance = $(this).attr('data-balance') !== 'undefined' ? $(this).attr('data-balance') : '';
            self.hasDetail = $(this).attr('data-hasDetail');
            $('#J_CardSelect').text($(this).attr('data-cardName'));
            $('#cardList').hide();
            if (self.unionId == 29) {
              $('#J_Balance').val(balance > 0 ? balance / 100 : 0 + '元')
            } else {
              self.hasDetail == 'true' ? self.queryAccout(patientId) : $('#J_Balance').val(balance > 0 ? balance / 100 : 0 + '元');
            }
          });
        },
        onSuccess(result){
          if (result.data) {
            var patientList = result.data;

            /*$('#J_PatientSelect').html(
             patientList.map((item) => {
             return `<option value="${item.id}" ${self.isDefaultSelect(patientId, item.id, item.default)} >${item.patientName}</option>`
             }).join("")
             );*/
            //$('#patientList').show();
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

            //如果是从就诊卡详情跳转过来，则直接指定url中的patientId为就诊人。如果就诊人列表长度>0，默认选择默认就诊人，如果无默认就诊人，则选择第一个就诊人
            if (self.patientId) {
              let patientInfo = patientList.filter(z => z.id == self.patientId)[0];
              $('#J_PatientSelect').text(patientInfo ? patientInfo.patientName : patientInfo[0].patientName);
            } else if (patientList.length > 0) {
              let defaultPatient = patientList.filter(z => z.default)[0];
              self.patientId = defaultPatient ? defaultPatient.id : patientList[0].id;
              $('#J_PatientSelect').text(defaultPatient ? defaultPatient.patientName : patientList[0].patientName);
            }
            self.getCard();
          }
        },
        onError(e){
          if (e.msg == '未登录') {
            self.util.goLogin();
          }
          //self.util.goLogin();
        }
      }).init();

      $('#J_Submit').click(function () {
        if (!$(this).attr("disabled")) {
          self.submit();
        }

      });
      // $('#J_AddPatient').attr("href","../patient-list.html?selectView=1&corpId="+self.query.corpId+"&target=_blank");
    },

    //获得卡列表
    getCard: function () {
      var self = this;
      var patientId = this.patientId || ''

      PageModule.render({
        init: function () {
          this.get("/user-web/restapi/card/noBalanceList", {
            unionId: self.unionId,
            patientId: patientId,
            corpId: self.unionId == 60 ? '' : self.corpId,
            balance: true,
            category: self.unionId == 29 ? 1 : ''
          });
          self.util.waitAlert("正在查询卡列表...");
          $('#J_CardSelect').click(function () {
            //if (!self.urlCardId) {
            $('#cardList').show();
            //}
          });

          //如果url中有cardId和patientId
          if (self.patientId && self.cardId && self.unionId != 29) {
            self.queryAccout(patientId);
          }
        },
        onError(e) {
          self.util.waitHide();
          if (e.msg == '未登录') {
            self.util.goLogin();
          }
        },
        onSuccess(result) {
          self.util.waitHide();
          var data = result.data || [];

          self.cardId = data[0] ? data[0].id : '';
          data[0] && $('#J_CardSelect').text(data[0].cardName);

          if (data[0]) {
            self.hasDetail = data[0].hasDetail;
          }

          data[0] && data[0].hasDetail ? self.queryAccout() : $('#J_Balance').val(data[0] ? data[0].balance / 100 : 0 + '元');


          if (data.length > 0) {
            $('#J_Tips').addClass("hide");
            $('#J_Submit').removeAttr("disabled");
          } else {
            $('#J_Tips').text("请到自助终端取卡后再充值").removeClass("hide");
            $('#J_Submit').attr("disabled", "disabled");
          }

          if (self.cardId) {
            let cardInfo = data.filter(z => z.id == self.cardId)[0];
            $('#J_CardSelect').text(cardInfo ? cardInfo.cardName : '请选择充值账户');

            if (self.unionId == 29) {
              $('#J_Balance').val(cardInfo ? cardInfo.balance / 100 : 0 + '元')
            }
          }

          if (data.length > 0) {
            $('#cardList .patient-list').html(
              data.map((item) => {
                return `<div class="card-li" data-cardId=${item.id} data-balance=${item.balance} data-cardNo=${item.cardNo} data-cardName=${item.cardName} data-hasDetail=${item.hasDetail}>
                  <img class="patient-list-avatar" src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/200ebefe79377f63f8be85a66a830f2b-68-68.png" />
                  <div class="patient-list-item">
                    <div class="patient-list-name">
                      ${item.cardName}
                    </div>
                    ${item.cardNo ? `<div class="patient-list-brief">(${item.cardNo.slice(-4)})</div>` : ''}
                  </div>
              </div>`
              }).join("")
            );
          } else {
            $(`#cardList .patient-list`).html(
              `<div class="bind-notice">
                  <span></span>
                  <p>当前就诊人尚未绑定就诊卡</p>
                  <p>请先绑定就诊卡</p>
                </div>`
            )
          }
        }
      }).init()
    },

    //查询卡余额
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
      this.get("/user-web/restapi/card/get", {
        unionId: this.unionId,
        corpId: this.corpId,
        id: this.cardId
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
    onSuccess: function (result) {
      this.util.waitHide();

      var balance = 0;

      if (result.success && result.data.balance) {
        balance = result.data.balance;
      }

      $('#J_Balance').val(balance > 0 ? balance / 100 : 0 + " 元");

    },

    onError: function () {
      $('#J_Tips').text("当前就诊人状态无法充值").removeClass("hide");
      $('#J_Submit').attr("disabled", "disabled");
    },

    submit: function () {

      var self = this;
      var feeChannel = payPageModule.getPayType();
      var patientId = this.patientId || '';
      var fee = parseFloat($('#J_recharge_money').val());
      var corpId = this.corpId;
      var unionId = this.unionId || '';
      var cardId = this.cardId || '';

      var util = this.util;

      if (!patientId) {
        this.util.alert("请选择就诊人");
        return;
      }
      //卡id不存在，且hasDetail不为true或'true'时，才是没选择充值账户
      if ((!cardId) && (self.hasDetail === true || self.hasDetail === 'true')) {
        this.util.alert("请选择充值账户");
        return;
      }

      if (!(fee >= 0.01)) { //分为单位
        this.util.alert("输入金额必须大于等于0.01");
        return;
      }

      if (feeChannel == -1) {
        this.uitl.alert("请选择支付方式");
        return;
      }

      this.feeChannel = feeChannel;

      fee = (fee * 100).toFixed(0);

      //支付完成
      payModule.onPayComplate = function (isOkay, id, result) {

        if (isOkay) {

          self.util.alert("充值成功");

          setTimeout(function () {
            window.location.reload();
          }, 1000);

        } else {

          setTimeout(function () {
            window.location.href = util.h5URL("/bill-detail.html?id=" + id + "&unionId" + unionId + "&corpId=" + corpId); //"https://uat.yuantutech.com/yuantu/h5-cli/1.3.32/pages/bill-detail.html?id="+id;
          }, 1500);

        }

      };

      /**
       feeChannel 支付方式   //1、支付宝 2、微信 3、余额
       optType 业务类型 //1、充值 2、缴费 3、挂号
       optParam 业务参数
       */

      payModule.pay(feeChannel, 1, {
        fee: fee,
        patientId: patientId,
        corpId: this.corpId,
        openId: this.openId,
        cardId: cardId
      });
    }

  });


  page.init();


  module.exports = page;

});
