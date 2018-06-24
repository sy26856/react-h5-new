
//define(function (require, exports, module) {

define(function(require, exports, module){

	var slide = require("mods/slide/index");
	var VModule = require("component/VModule");
	var STATE = {
		100:"待支付",
		101:"支付成功-医院处理失败",
		200:"支付成功",
		401:"已过期",
		402:"已作废"
	}; // 状态(100 待支付，101 支付成功-His失败，200 成功，401 已过期，402 已作废)
	var page = VModule.render({
		init:function(){

			//检查登录并且弹框
	    if( !this.checkLogin() ){
	       return ;
	    }


			this.state = {
				loading:true
			}

			this.module = this.initModule(this.state, '#J_List');
			this.loadPageData();
		},
		//页面被再次激活
		onActivation:function(){
			this.loadPageData();
		},
		loadPageData:function(){

			this.get("/user-web/restapi/pay/getpaymentlist", {
				corpId:this.query.corpId,
				corpUnionId:this.query.unionId
			});

		},
		onSuccess:function(result){

			this.setState({
				loading:false,
				success:true,
				items:result.data
			});

		},
		render(){

			let {items} = this.state;

			if(items.length == 0){
				return this.renderError();
			}

			return items.map((item)=>{

				let {corpId, billNo,takeMedWin,patientId,patientName,billType,corpName,deptName,doctName,billFee,status } = this.util.vis(item);

				return `
					<a href="pay.html?${this.util.flat({corpId:corpId,billNo:billNo,patientId:patientId, target:"_blank" })}">
		          <ul class="ui-list ui-list-pure ui-border-tb">
		              <li class="ui-border-t">
		                  <h4>${billType || "缴费单"}</h4>
		                  <p>就诊人: ${patientName}<span class="rmb"><span class="y">￥</span>${(billFee/100).toFixed(2)}</span></p>
		                  <h5 class="ui-border-tt">${corpName}</h5>
		                  <p>发药窗口：${takeMedWin || "未获得"} <span class="status">${STATE[status] || status}</span> </p>
		              </li>
		          </ul>
		      </a>
				`
			}).join("")

		},
		renderError(){
			return `<section class="ui-notice" id="J_NoData">
          <i></i>
          <p>没有需要缴费的单据</p>
      </section>`
		}
	});

	page.init();

	module.exports = page;
});
