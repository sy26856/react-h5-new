//取货方式
define("mailType", function (require, exports, module) {

  var PageModule = require("component/PageModule")

  var page = PageModule.render({

    init: function (mailType, supperTypes, disabled) {

      this.supperTypes = supperTypes || [1];

      this.disabled = disabled;
      this.prevSelectAddressId = null;

      this.module = this.component({
        //支持的取货方式
        loading: true,
        supperType: [
          {
            value: 1,
            text: "到院自取",
          },
          {
            value: 2,
            text: "快递到家",
          }
        ],
        //当前选择的搜获方式
        mailType: mailType || 1,
        //以前使用的搜索地址ID
        prevSelectAddressId: null,
        addressList: []
      });


      $('#J_MailType').append(this.module.dom);

      // alert(localStorage.getItem("yuantu-address"))
      var registerData = this.cache.getCacheModule("yuantu-address");
      this.prevSelectAddressId = registerData.get("addressid").value;

      this.module.setData({prevSelectAddressId: this.prevSelectAddressId})

      // this.regEvent();
      this.getAllAddress();

    },
    component(defaultData){
      var self = this;
      return this.vTemplate((data) => {
        return this.render(data)
      }, defaultData);

    },
    getSelectAddressId: function () {
      return this.prevSelectAddressId || this.module.data.prevSelectAddressId;
    },
    getAllAddress: function () {
      this.module.setData({loading: true})
      this.get("/user-web/restapi/video/getAllAddress", {corpId: this.query.corpId, unionId: this.query.unionId});
    },

    //页面重新激活，判断是否选择新的地址
    onActivation: function () {

      var self = this;
      // alert(localStorage.getItem("yuantu-address"))
      //this.util.alert(localStorage.getItem("yuantu-address"))
      var registerData = self.cache.getCacheModule("yuantu-address");
      var prevSelectAddressId = registerData.get("addressid").value;
      // this.state.prevSelectAddressId = prevSelectAddressId;
      // alert(prevSelectAddressId)
      // alert(this.module.data.prevSelectAddressId)
      if (prevSelectAddressId != this.module.data.prevSelectAddressId) {
        this.module.setData({prevSelectAddressId: prevSelectAddressId})
        self.getAllAddress();
      }
    },
    //变更了取货方式 fire时间
    onChange: function (mailType) {

    },
    onSuccess: function (result) {

      if (result && result.data && result.data.length) {

        this.module.setData({addressList: result.data, loading: false})

      } else {
        this.module.setData({address: null, loading: false})
      }

    },
    onError: function () {
    },
    stringify: function (address) {
      return address ? [address.address, address.recipient, address.phone].join(" ") : "请选择收获地址";
    },
    changeMailType: function (target) {
      var mailType = $(target).val();
      this.module.setData({mailType: mailType})
      this.onChange(mailType)
    },
    //这种方式不太好，我只是玩一下而已
    addEventLister: function (fn, context) {

      var callback = "fn" + parseInt(Math.random() * 100000000)
      window[callback] = function (e) {
        fn.call(context, e)
      }
      return callback + "(this)";
    },
    render: function (data) {

      var prevSelectAddressId = data.prevSelectAddressId;
      var addressList = data.addressList;
      var address = [];

      //默认使用上次使用过的地址
      if (prevSelectAddressId) {
        address = addressList.filter((item) => {
          //默认收获地址
          return item.id == prevSelectAddressId;
        });
      } else {
        //选择默认的收获地址
        address = addressList.filter((item) => {
          //默认收获地址
          return item.def == 1;
        });
      }

      address = address.length ? address[0] : addressList[0];
      this.prevSelectAddressId = address ? address.id : null;
      return `<div class="ui-form-item ui-border-b">
                <label>收药方式</label>
                <div class="ui-select">
                    <select ${this.disabled ? "disabled" : ""} onChange="${this.addEventLister(this.changeMailType, this)}">
                        ${
        data.supperType.map((item) => {
          if (this.supperTypes.indexOf(item.value) != -1) {
            return `<option value="${item.value}" ${item.value == data.mailType ? `selected="selected"` : ""} >${item.text}</option>`
          } else {
            return ""
          }
        }).join("")
        }
                    </select>
                </div>
            </div>
            <div class="ui-form-item ui-form-item-show ui-form-item-address ui-border-b transition ${data.mailType == 2 ? "" : " hidden"}" id="J_ShowAddress">
                <label for="">收药地址:</label>
                <div class="address">
                    <a class="text ui-arrowlink" href="address/address-list.html?selectView=1&target=_blank">
                        ${
        data.loading ? `正在获取...` :
          this.stringify(address)
        }
                    </a>
                </div>
            </div>
            `
    }
  })

  module.exports = page;
});

//快递费
define("getExpressCost", function (require, exports, module) {

  var PageModule = require("component/PageModule");

  var getExpressCost = PageModule.render({
    init: function () {
      this.cost = 0;
      this.get("/user-web/restapi/common/express/getExpressCost", {
        corpId: this.query.corpId,
        unionId: this.query.unionId
      })
    },
    onExpressCost: function (cost) {
      //获取正确
    },
    onExpressCostError: function (cost) {
      //获取错误
    },
    onError: function () {
      this.cost = -1;
      this.onExpressCostError(this.cost)
    },
    onSuccess(result){
      if (result && result.data && result.data.expressCost) {
        this.cost = result.data.expressCost || 0;
        this.onExpressCost(this.cost);
      }
    }
  });

  module.exports = getExpressCost;
});

//主逻辑
define(function (require, exports, module) {


  var VModule = require("component/VModule");
  var payPageModule = require("mods/pay/index");
  var cache = require("libs/cache");
  var payModule = require("mods/pay/pay");
  var mailTypeModule = require("mailType");
  var getExpressCost = require("getExpressCost");

  var statusMsg = {
    "100": "待支付",
    "101": "你已支付，医院正在处理",
    "200": '支付成功',
    "401": "已过期",
    "402": "已作废"
  };

  var page = VModule.render({

    init: function () {

      var self = this;

      this.billNo = this.query.billNo;
      this.unionId = this.query.unionId;
      this.patientId = this.query.patientId;
      this.delivery = 0;//0 是否支持 邮寄

      this.addressCache = this.cache.getCacheModule("yuantu-address");
      //上次使用的收获方式
      this.mailType = this.addressCache.get("mailType").value;
      //快递费
      this.cost = 0;
      //费用总计
      this.billFee = 0;
      //自费金额
      this.selfFee = 0;
      //提交金额  有可能是 自费金额加上运费
      this.totalFee = 0;

      this.get("/user-web/restapi/pay/getpaymentdetail", {
        corpId: this.corpId,
        billNo: this.billNo,
        unionId: this.unionId,
        patientId: this.patientId
      });

      //获取快递费
      //突然发现这样的模块是单例
      // getExpressCost.onExpressCost = function(cost){
      //     self.cost = cost;
      //     self.render()
      // }

      // getExpressCost.onExpressCostError = function(cost){
      //     self.cost = cost;
      //     self.render()
      // }

      // getExpressCost.init();

    },


    regEvent: function () {

      var self = this;

      $('#J_Submit').click(function () {
        self.submit();
      });

      $('#J_SelectMailType').change(function () {
        var val = $(this).val()
        // 1 到院自取
        // 2 快递到家
      })
    },
    //
    onSuccess: function (result) {

      $('#J_Page').removeClass("wait");

      var data = result.data;
      // data.status = 100;
          // data.mic = true;
          // data.insurFee = 1239
      var self = this;
      // data.status = 100;
    	this.corpId = data.corpId;
      this.billFee = data.preSettlement.billFee;
      this.selfFee = data.preSettlement.selfFee;
      this.patientId = data.patientId;
      this.delivery = data.delivery;
      this.billNo = data.billNo || this.query.billNo;

      $('#J_PatientName').text(data.patientName);
      $('#J_PatientNumber').text(data.idNo || data.guarderIdNo);

      // this.renderTo( tmpl, result.data, '#J_InfoList');
      $('#J_InfoList').html(this.renderList(data.items))

      $('#J_InsurFee').text(data.preSettlement.insurFee / 100);
      $('#J_Status').text(statusMsg[data.status] || data.status);

      if (data.preSettlement.mic) {
        //显示医保支付
        $('#J_InsurFeeBox').removeClass("hide")
      }


      this.initPayModule(data.status);

      let {oppatNo, cardNo, transNo, payDate, billDate} = data;
      //已支付的订单显示订单信息
      if (data.status != 100 && (oppatNo || cardNo || transNo || billDate || payDate)) {
        $('#J_PayInfo').html(
          `
              <div class="module ui-border-tb">
                <div class="ui-txt-info">
                  ${cardNo ? `<p>就诊卡卡号: ${cardNo}</p>` : ``}
                  ${oppatNo ? `<p>门诊号: ${oppatNo}</p>` : ``}
                  ${transNo ? `<p>流水号: ${transNo}</p>` : ``}
                  ${billDate ? `<p>开单时间: ${billDate}</p>` : ``}
                  ${payDate ? `<p>支付时间: ${payDate}</p>` : ``}
                </div>
              </div>
            `
        )
        $('#J_TakeMedWinWarp').removeClass("hide");
        $('#J_TakeMedWin').text(data.takeMedWin || "未获得");
      }

      this.regEvent();

      //默认使用快递到家的收获方式
      //delivery == 1 才支持邮寄
      // this.delivery = 1;
      if (this.delivery == 0) {
        this.mailType = 1;
      }

      //
      // mailTypeModule.init(this.mailType, this.delivery == 1 ? [1,2]:[1], data.status != 100);
      // //收获方式改变需要重新计算总价
      // mailTypeModule.onChange = function(mailType){
      //     //缓存搜获方式
      //     self.addressCache.set("mailType", mailType)
      //     //2 有快递  1 无快递
      //     self.mailType = mailType;
      //     self.render();

      // }

      this.render();
    },


    render: function () {

      //有快递  就把快递费加上去
      var isMailType = this.mailType == "2";
      var util = this.util;
      var selfFee = isMailType ? this.selfFee + this.cost : this.selfFee || 0;
      var billFee = isMailType ? this.billFee + this.cost : this.billFee || 0;
      this.totalFee = selfFee;
      this.mailType == "2" ? $('#J_ShowMailPrice').removeClass("hidden") : $('#J_ShowMailPrice').addClass("hidden");
      $('#J_MailPrice').text(util.rmb(this.cost / 100));
      //总费用 加上快递费
      $('#J_TotalFee').text(util.rmb((billFee / 100)));
      if (isMailType) {
        $('#J_ShowMailPriceTip').removeClass("hide")
      } else {
        $('#J_ShowMailPriceTip').addClass("hide")
      }

      $('#J_SelfFee').text(util.rmb(selfFee / 100));

    },

    renderList: function (list) {
      var util = this.util;
      return list.map((item) => {
        return `<li class="ui-border-t active">
                <div class="ui-list-info">
                    <h4 class="ui-nowrap">${item.itemName} <small class="ui-txt-info">x${item.itemQty}</small> <span class="price"><span class="y">￥</span>${util.rmb(item.cost / 100, 4)}</span></h4>
                    <p class="ui-nowrap">规格 ${item.itemSpecs} 单价: <span class="y">￥</span>${util.rmb(item.itemPrice / 100, 4)}</p>
                </div>
            </li>`
      }).join("");
    },

    //根据账单状态 显示支付 组件

    initPayModule: function (status) {
      /**
       case 100:
       resPaymentDO.setStatusMsg("待支付");
       break;
       case 101:
       resPaymentDO.setStatusMsg("支付成功-His失败");
       break;
       case 200:
       resPaymentDO.setStatusMsg("已支付");
       break;
       case 401:
       resPaymentDO.setStatusMsg("已过期");
       break;
       case 402:
       resPaymentDO.setStatusMsg("已作废");
       */

      var statusMsg = {
        "100": "待支付",
        "101": "你已支付，医院正在处理",
        "200": '已支付，详情可在“我的-->账单”中查看',
        "401": "已过期",
        "402": "已作废"
      };

      if (status == 100) {
        //临时设置缴费的时候不需要微信支付
        // payPageModule.initLocalSupportPayType = function(){
        //     return this.PAY_TYPE_ACCOUNT;
        // }

        //支付方式准备完成，显示支付按钮
        payPageModule.onReady = function (isPay) {
          if (isPay) {
            $('#J_Submit').removeClass("hide");
          }
        }
        //初始化支付组件
        payPageModule.init(this.corpId, 2, this.patientId);
      } else {
        $('#J_PayTips').hide();
      }
    },

    submit: function () {

      var self = this;


      var feeChannel = payPageModule.getPayType();

      if (this.mailType == 2) {
        if (!addressId) {
          this.util.alert("请选择快递地址");
          return
        }
      }


      if (!this.corpId || !this.totalFee || !this.patientId || !this.billNo) {
        //详情数据未加载完毕，不能支付
        this.util.alert("等待详情数据");
        return;
      }

      //余额支付先判断钱够不够
      if (feeChannel == 3 && payPageModule.getAccoutPayBalance() < this.totalFee) {
        this.util.alert("余额不足");
        return;
      }

      /**
       feeChannel 支付方式   //1、支付宝 2、微信 3、余额
       optType 业务类型 //1、充值 2、缴费 3、挂号
       optParam 业务参数
       */
      payModule.onPayComplate = function (isOkay, id, result, msg) {

        //缴费无论成功失败，都跳转到结果页面
        if (isOkay) {
          self.util.alert("缴费成功");
          window.location.reload();
        } else {
          self.util.alert(msg || "无法获得支付结果")
          setTimeout(function () {
            window.location.href = "../bill-detail.html?id=" + id + "&corpId=" + self.corpId + "&unionId=" + self.unionId;
          }, 1500);

        }
      }

      if(feeChannel == 7){
        //医保个账支付，需要弹出输入卡号的input
        $('#showInputCardNoDialog').show();
        $('#cardNoInput').val(cache.get('yibaokahao'));
        $('#cardNoSubmit').click(function(){

          let cardNo = $('#cardNoInput').val();
          if(cardNo.length != 19){
            self.util.alert("请输入19位正确的医保卡号");
            return ;
          };

          payModule.pay(feeChannel, 2, {
            corpId: self.corpId,
            patientId: self.patientId,
            billNo: self.billNo,
            fee: self.selfFee,//提交的时候不加快递价格
            getType: 1,//2快递 1自取
            cardNo: cardNo
          });
          $('#showInputCardNoDialog').hide();
          cache.set("yibaokahao", cardNo);
        });
      }else{
        payModule.pay(feeChannel, 2, {
          corpId: this.corpId,
          patientId: this.patientId,
          billNo: this.billNo,
          fee: this.selfFee,//提交的时候不加快递价格
          getType: 1,//2快递 1自取
          // cardNo: cardId
          // addressId:addressId,
        });
      }
    }
  });

  //页面
  page.init();

  module.exports = page;

});
