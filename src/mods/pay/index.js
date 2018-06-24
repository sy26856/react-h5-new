/**
	初始化缴费方式

	属性当前支持的业务支付方式
	.payTypes:['aliPay','accountPay','wxPay']

	事件支付方式准备好回调的函数
	.onReady
	.getStatus(code, );

*/
define("mods/pay/index", function(require, exports, module) {


    //支付宝 1
    var PAY_TYPE_ALI = "aliPay";
    //微信 2
    var PAY_TYPE_WX = "wxPay";
    //余额 3
    var PAY_TYPE_ACCOUNT = "accountPay";
    //到院支付  4
    var PAY_TYPE_HOSPITAL = "hospitalPay";
    //公众号支付 5
    var PAY_TYPE_GZH = "gzh";
    //支付宝网页支付 7
    var PAY_TYPE_ALI_WEB = "aliPayWeb";

    //医保支付
    var PAY_TYPE_MEDICARE = "medicare";//edicarePay

    var VModule = require("component/VModule");

    var payModule = VModule.render({

        PAY_TYPE_ALI: PAY_TYPE_ALI,
        PAY_TYPE_WX: PAY_TYPE_WX,
        PAY_TYPE_ACCOUNT: PAY_TYPE_ACCOUNT,
        PAY_TYPE_HOSPITAL: PAY_TYPE_HOSPITAL,
        PAY_TYPE_GZH:PAY_TYPE_GZH,
        PAY_TYPE_MEDICARE:PAY_TYPE_MEDICARE,
        PAY_TYPE_ALI_WEB:PAY_TYPE_ALI_WEB,
        /**
        	corpId : 医院id
        	optType: 业务场景  1 充值 ， 2 缴费, 3 挂号, 6预约
          amount: 订单金额
        */
        init: function(corpId, optType, patientId, amount) {

            //test
            // optType = 2;

            this.corpId = corpId;
            // this.corpId = 549;//todo需要删除
            this.optType = optType;
            this.patientId = patientId;
            this.amount = amount || 0;

            this.state = {
              loading:true
            }
            // $('#J_PayTypeListWrap').removeClass("hide");

            this.module = this.initModule(this.state, '#J_PayTypeList');

            //初始化当前环境所支持的支付方式
            this.supportPayTypes = this.initLocalSupportPayType();
            //根据环境和医院的配置最终计算出所支持的缴费方式
            this.payTypes = [];


            //在远图app中查询支付方式
            if (this.supportPayTypes.length) {
                this.get("/user-web/restapi/pay/type", {
                    corpId: this.corpId,//todo 需要回来
                    optType: this.optType, //1、充值 2、缴费 3、挂号
                    patientId: this.patientId
                });
            } else {
                this.onError({ msg: '当前环境不支持支付功能，<a href="about/download.html">下载慧医</a>' })
            }
        },
        initLocalSupportPayType: function() {

            // 默认所有环境都支持 余额 支付
            var types = [PAY_TYPE_ACCOUNT, PAY_TYPE_HOSPITAL, PAY_TYPE_MEDICARE];

            // if( !this.util.isInIOS() ){
              //医保不能在ios中运行
              // types.push(PAY_TYPE_MEDICARE)
            // }

            if (this.util.isInYuantuApp()) {
                //如果是远图 app内 支持 所有支付宝和微信缴费
                // types.push( PAY_TYPE_ACCOUNT );
                // ios客户端小于 2.0.6 不能使用支付宝支付
                // alert( !(this.util.getPlatform() == "ios" && this.util.version.lt(2,0,7)) )
                // alert( navigator.userAgent )
                // if (!(this.util.getPlatform() == "ios" && this.util.version.lt(2, 0, 7))) {
                types.push(PAY_TYPE_WX);
                // }
                types.push(PAY_TYPE_ALI);
            }


            //如果是微信中支持微信缴费
            if(this.util.isInMicroMessenger()){
            	types.push( PAY_TYPE_GZH );
            }

            //如果在支付宝webview中，可以使用支付宝网页支付，调起支付宝app支付
            if(this.util.isInZhifubao()){
              types.push( PAY_TYPE_ALI_WEB );
            }

                  /**
                  if(this.util.isInAliPay()){
                  	//支付宝中支持支持微信支付
                  	this.supportPayTypes.push( PAY_TYPE_ALI );
                  }
             */
            return types;

          },
        //根据当前环境判断当前是否支持某种方式
        isLocalSupportPayType: function (type) {
          return this.supportPayTypes.indexOf(type) != -1;
        },
        onComplate: function (result) {
          if (result && result.success) {
            this.onSuccess(result);
          } else {
            this.onError(result)
          }
        },

        //
        onSuccess: function(result) {

            // result.data = {
            //   hospitalPay:{
            //     status:false
            //   },
            //   aliPay:{
            //     status:true,
            //   },
            //   accoutPay:{
            //     cardNo:"1111",
            //     balance: -1,
            //     status: false,
            //     name:1111 || "余额",
            //     isTiedCard: false,
            //     cardType: 1111
            //   },
            //   wxPay:{
            //     status:true
            //   }
            // }
            let {accoutPay, hospitalPay, wxPay, aliPay, wxGzhPay, pyMedicarePay, aliFwcPay } = result.data;
            // pyMedicarePay.status = true;// = {status:true}
            // pyMedicarePay.isTiedCard = true;
            //支付红网页支付
            let aliPayWeb = aliFwcPay || {};
            // wxGzhPay = wxGzhPay || {};
            //把支付方式添加到 this.payTypes 中
            accoutPay.cardNo && accoutPay.status && this.isLocalSupportPayType(this.PAY_TYPE_ACCOUNT) && this.payTypes.push(this.PAY_TYPE_ACCOUNT)
            aliPay.status && this.isLocalSupportPayType(this.PAY_TYPE_ALI) && this.payTypes.push(this.PAY_TYPE_ALI)
            aliPayWeb.status && this.isLocalSupportPayType(this.PAY_TYPE_ALI_WEB) && this.payTypes.push(this.PAY_TYPE_ALI_WEB)
            wxPay.status && this.isLocalSupportPayType(this.PAY_TYPE_WX) && this.payTypes.push(this.PAY_TYPE_WX)
            hospitalPay.status && this.isLocalSupportPayType(this.PAY_TYPE_HOSPITAL) && this.payTypes.push(this.PAY_TYPE_HOSPITAL)
            wxGzhPay.status && this.isLocalSupportPayType(this.PAY_TYPE_GZH) && this.payTypes.push(PAY_TYPE_GZH)
            pyMedicarePay.status && this.isLocalSupportPayType(this.PAY_TYPE_MEDICARE) && this.payTypes.push(PAY_TYPE_MEDICARE);

            this.setState({
              loading:false,
              success:true,
              hospitalPay:{
                status:hospitalPay.status
              },
              aliPay:{
                status:aliPay.status,
              },
              //与App支付显示保持一致逻辑，后端未增加独立的支付方式
              aliPayWeb:{
                status:aliPayWeb.status
              },
              accoutPay:{
                cardNo:accoutPay.cardNo,
                balance: accoutPay.balance || 0,
                status: accoutPay.status,
                name:accoutPay.name || "余额",
                isTiedCard: accoutPay.isTiedCard,
                cardType: accoutPay.cardType
              },
              wxPay:{
                status:wxPay.status
              },
              wxGzhPay:{
                status:wxGzhPay.status
              },
              pyMedicarePay:{
                status:pyMedicarePay.status,
                cardNo:pyMedicarePay.cardNo,
                name:pyMedicarePay.name,
                ResponseUrl: pyMedicarePay.ResponseUrl, //"http://test.yuantutech.com/user-web/restapi/common/medicare/pyBindNotify",
                MerReserved: pyMedicarePay.MerReserved,//"{"patientId":1000008544,"unionId":60,"userId":206}",
                Merchant: pyMedicarePay.Merchant,//"102440153110004",
                postUrl: pyMedicarePay.postUrl,//"http://120.26.110.228:8082/MedicarePay/CardBinding",
                isTiedCard: pyMedicarePay.isTiedCard,//false,
                Version: pyMedicarePay.Version,//"1.0.0",
                Signature: pyMedicarePay.Signature,//"4vtmK5qz3bypJaFhTjTqC2zj9RvXcG/hNdzoBEG1WWhKYZIIh+Vw3kZjGyRCRvCu",
                TerminalCode: pyMedicarePay.TerminalCode//"10000124"
              }
            }, ()=>{
              this.onReady(this.payTypes.length > 0);
              this.setAccoutBalance();
            });
        },
        onError: function(result) {

            $('#J_PayTips').html(result.msg || "获取支付方式失败");
            this.onReady(false);

        },
        getAccoutPayBalance: function() {
            //如果 -1 为正确获取就诊人余额，就默认是无穷大
            try{
              let balance = this.state.accoutPay.balance;
              return balance == -1 ? Infinity : balance;
            }catch(e){
              return Infinity;
            }
        },
        setAccoutBalance: function() {
            //优先选中设置
          if (this.payTypes.length) {
            //余额
            if (this.payTypes.indexOf(PAY_TYPE_ACCOUNT) != -1 && this.amount <= this.state.accoutPay.balance) {
              $(this.refs["accoutPay"]).attr("checked", true);
              return;
            }
            //支付宝
            if (this.payTypes.indexOf(PAY_TYPE_ALI) != -1) {
              $(this.refs["aliPay"]).attr("checked", true);
              return;
            }

            //微信
            if (this.payTypes.indexOf(PAY_TYPE_WX) != -1) {
              $(this.refs["wxPay"]).attr("checked", true);
              return;
            }

            //到院支付
            if (this.payTypes.indexOf(PAY_TYPE_HOSPITAL) != -1) {
              $(this.refs["hospitalPay"]).attr("checked", true);
              return;
            }
            //医保支付
            if (this.payTypes.indexOf(PAY_TYPE_MEDICARE) != -1) {
              $(this.refs["yibaoPay"]).attr("checked", true);
              return;
            }

            //公众号内支付
            if (this.payTypes.indexOf(PAY_TYPE_GZH) != -1) {
              $(this.refs["wxGZHPay"]).attr("checked", true);
              return;
            }

            //支付宝服务窗支付
            if (this.payTypes.indexOf(PAY_TYPE_ALI_WEB) != -1) {
              $(this.refs["aliPayWeb"]).attr("checked", true);
              return;
            }
          }
        },
        getPayType: function() {

            let {accoutPay, aliPay, wxPay, hospitalPay, wxGZHPay,aliPayWeb, yibaoPay} = this.refs;
            var feeChannel1 = accoutPay && accoutPay.checked; //String($(accoutPay).attr("checked")) == "checked" ? 1 : 0;
            var feeChannel2 = aliPay && aliPay.checked; //String($(aliPay).attr("checked")) == "checked" ? 1 : 0;
            var feeChannel3 = wxPay && wxPay.checked; //String($(wxPay).attr("checked")) == "checked" ? 1 : 0;
            var feeChannel4 = hospitalPay && hospitalPay.checked;// String($(hospitalPay).attr("checked")) == "checked" ? 1 : 0;
            var feeChannel5 = wxGZHPay && wxGZHPay.checked;
            var feeChannel6 = aliPayWeb && aliPayWeb.checked;
            var feeChannel7 = yibaoPay && yibaoPay.checked;

            var feeChannel = -1;

            //这里的判断顺序不能变，信不信由你
            if ( feeChannel4 ) {
                //到院支付
                feeChannel = 4;
                return feeChannel;
            }

            if ( feeChannel5 ) {
                //公众号
                feeChannel = 5;
                return feeChannel;
            }

            if ( feeChannel3 ) {
                //微信
                feeChannel = 2;
                return feeChannel;
            }

            if ( feeChannel2 ) {
                //支付宝
                feeChannel = 1;
                return feeChannel;
            }

            if( feeChannel7 ){
                //医保支付
                feeChannel = 7;
                return feeChannel;
            }

            if ( feeChannel1 ) {
                //余额
                feeChannel = 3;
                return feeChannel;
            }


        },
        renderError(state){
          return `<div class="ui-tips center">${state.msg || "获取支付方式错误，请稍后再试"}</div>`;
        },
        renderLoading(){
          return `<div class="ui-tips center">正在查询支付方式...</div>`;
        },
        render( state ){

          let {hospitalPay, aliPay, accoutPay, wxPay, wxGzhPay, aliPayWeb, pyMedicarePay} = state;
          console.log(pyMedicarePay);

          let util = this.util;
          let payTypes = this.payTypes;
          // 是否显示绑卡 显示绑定就诊卡 没有卡号  有卡 能支持绑卡
          let isTiedCard = !accoutPay.cardNo && accoutPay.cardType && accoutPay.isTiedCard && accoutPay.status;
          //余额支付
          let isAccoutPay = accoutPay.cardNo && accoutPay.status && this.isLocalSupportPayType(this.PAY_TYPE_ACCOUNT);
          //支付宝支付
          let isAliPay = aliPay.status && this.isLocalSupportPayType(this.PAY_TYPE_ALI);
          //微信支付
          let isWXPay = wxPay.status && this.isLocalSupportPayType(this.PAY_TYPE_WX);
          //到院支付
          let isHospitalPay = hospitalPay.status && this.isLocalSupportPayType(this.PAY_TYPE_HOSPITAL);
          //医保支付
          let isMedicarePay = pyMedicarePay.status && this.isLocalSupportPayType(this.PAY_TYPE_MEDICARE);
          //是否需要绑定 医保支付卡
          let isBindMedicarePay = pyMedicarePay.status && pyMedicarePay.isTiedCard && !pyMedicarePay.cardNo;
          //支付宝服务窗
          let isAliPayWeb = aliPayWeb.status && this.isLocalSupportPayType(this.PAY_TYPE_ALI_WEB);
          //微信公众号支付
          let isGZHPay = wxGzhPay.status && this.isLocalSupportPayType(this.PAY_TYPE_GZH);

          let tips = payTypes.length > 0 ?  "请选择一种支付方式" : isTiedCard ? "请选择一种支付方式" : "该医院不支持网上支付";
          let amount = this.amount;

          return `
            <div class="ui-tips center">${tips}</div>
            <div class="ui-form ui-pay-form">
            	<ul class="ui-list ui-list-text ui-border-tb">
                ${
                  isAccoutPay ?
                    `
                              <li class="ui-border-t recharge-label">
                          			<label class="label" for="J_FeeChannel1"></label>
                          			<div class="ui-radio">
                          				<div class="ui-medical-info">
                          					<i class="medical-icon icon-card"></i>
                          					<div class="info">
                          						<h2><span>${accoutPay.name}</span> <span class="card-number">(${accoutPay.cardNo.slice(-4)})</span></h2>
                          						<p class="yu-e" >
                          							<span>卡内余额: <span class="number">${Math.max(accoutPay.balance / 100, 0)}元</span></span>
                          						</p>
                          					</div>
                          					<input type="radio" ref="accoutPay"  ${amount > accoutPay.balance ? 'disabled="disabled"' : ""}   name="feechaeel" id="J_FeeChannel1" />
                          				</div>
                          			</div>
                          		</li>
                            ` : ""
                  }
                ${

                  isTiedCard ?
                    `
                              <li class="ui-border-t recharge-label ui-arrowlink">
                          			<div class="ui-radio">
                          				<a class="ui-medical-info" href="${"../bind-card.html?" + util.flat({
                      patientId: this.patientId,
                      corpId: this.corpId,
                      unionId: this.unionId,
                      target: "_blank",
                      description: accoutPay.name
                    })}">
                					<i class="medical-icon icon-card"></i>
                					<div class="info no">
                						<h2><span>绑定${accoutPay.name}</span></h2>
                					</div>
                				</a>
                			</div>
                		</li>
                  ` : ""
                }
                ${

                  isHospitalPay ?
                  `
                    <li class="ui-border-t recharge-label">
                      <label class="label" for="J_FeeChannel4"></label>
                      <div class="ui-radio">
                        <i class="icon-daoyuan"></i>到院支付
                        <input type="radio" ref="hospitalPay" name="feechaeel" id="J_FeeChannel4" />
                      </div>
                    </li>
                  ` : ""
                }
                ${
                  isAliPay ?
                  `
                    <li class="ui-border-t recharge-label">
                      <label class="label" for="J_FeeChannel2"></label>
                      <div class="ui-radio">
                        <i class="icon-zhi"></i>支付宝支付
                        <input type="radio" ref="aliPay" name="feechaeel" id="J_FeeChannel2" />
                      </div>
                    </li>
                  ` : ""
                }
                ${
                  isGZHPay ? `<li class="ui-border-t recharge-label" >
                      <label class="label" for="J_FeeChannel3"></label>
                      <div class="ui-radio">
                        <i class="icon-wx"></i>微信支付
                        <input type="radio" ref="wxGZHPay" name="feechaeel" id="J_FeeChannel5" />
                      </div>
                    </li>` : ""
                  }
                ${
                  isWXPay ?
                  `
                    <li class="ui-border-t recharge-label">
                      <label class="label" for="J_FeeChannel3"></label>
                      <div class="ui-radio">
                        <i class="icon-wx"></i>微信支付
                        <input type="radio" ref="wxPay" name="feechaeel" id="J_FeeChannel3" />
                      </div>
                    </li>
                  ` : ""
                }
                ${
                  //使用医保个人账户支付
                  isMedicarePay ? `
                    <li class="ui-border-t recharge-label">
                      <label class="label" for="J_FeeChannel6"></label>
                      <div class="ui-radio">
                        <i class="icon-yibao"></i>${pyMedicarePay.name}
                        <input type="radio" ref="yibaoPay" name="feechaeel" id="J_FeeChannel6" />
                      </div>
                    </li> ` : ""
                }
                ${
                  isAliPayWeb ?
                  `
                    <li class="ui-border-t recharge-label" id="J_AliPayType">
                      <label class="label" for="J_FeeChannel7"></label>
                      <div class="ui-radio">
                        <i class="icon-zhi"></i>支付宝支付
                        <input type="radio" ref="aliPayWeb" name="feechaeel" id="J_FeeChannel7" />
                      </div>
                    </li>
                  ` : ""
                }
                ${
                  //绑定医保个人账户
                  isBindMedicarePay ? this.renderBindCardType6(pyMedicarePay) : ""
                }
            	</ul>
            </div>
          `
        },
        //个人医保账户绑卡
        renderBindCardType6(pyMedicarePay){

          let medicarePayParams = Object.assign({}, pyMedicarePay);
          medicarePayParams.RedirectUrl = window.location.href;
          let medicarePayParamsKeys = this.util.keys(medicarePayParams);

          //远图android中有bug不能用新开窗口打开
          // if(this.util.getPlatform() == "ios"){
          //   medicarePayParams.target="_blank"
          // }

          return `
              <li class="ui-border-t ui-arrowlink"  >
                  <form method="post"  action="${medicarePayParams["postUrl"]}" ref="form" >
                    ${
                      medicarePayParamsKeys.map((key)=>{
                        return `<input type="hidden" name="${key}"  value=${medicarePayParams[key]} />`
                      }).join("")
                    }
                    <a class="ui-medical-info" ref="card6" >
                        <i class="medical-icon icon-yibao"></i>
                        <div class="info no">
                            <h2>绑定${pyMedicarePay.name}</h2>
                        </div>
                    </a>
                    <input type="submit" style="position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;" value="提交" />
                  </form>
              </li>
            `

        }
    });

  module.exports = payModule;
});
