
//define(function (require, exports, module) {

define(function(require, exports, module){

	var VModule = require("component/VModule");
	var payModule = require("mods/pay/pay");

	var page = VModule.render({
		init:function(){

			this.state = {
				loading:true,
			}

			this.module = this.initModule(this.state, '#J_Page');

			this.get("/user-web/restapi/pay/query/billdetail", {
				id:this.query.id,
				corpId:this.query.corpId,
				unionId:this.query.unionId
			});

		},
		onSuccess:function( result ){
			result.loading = false;
			this.setState(result);
		},
		onError:function(result){
			result.loading = false;
			this.setState(result)
		},
		render(state){
			var data = state.data;
			var source = {"0":"人工窗口","1":"自助机","2":"诊间屏","3":"线上"}[data.orderSource] || "";// == 3 ? "线上" :"线下";
			var status = payModule.STATUS_CODE[data.status];
			var billFee = this.util.rmb(data.billFee/100);
			var id = data.id;
			var subject = data.subject +"-"+ (data.patientName || "");
			var time = this.util.dateFormat(data.gmtCreate);
			var corpName = data.corpName || "";
			var platfomFeeItemList = data.platfomFeeItemList;//付款明细
			return `
				<div>
					<div class="info ui-border-t">
						<div class="status">${status}</div>
						<div class="number"><span class="y">￥</span>${billFee}</div>
					</div>
					<ul class="ui-list ui-list-text ui-border-tb" style="margin-top:0;">
							${

								platfomFeeItemList.map((item)=>{
									return `
										<li class="ui-border-t">
								        <h4>${item.itemName}</h4>
								        <div class="ui-txt-info"><span class="y">￥</span>${this.util.rmb(item.itemFee/100)} ${item.isSelfFee?"(自费)":""}</div>
								    </li>
									`
								}).join("")

							}
					</ul>
					<ul class="ui-list ui-list-text  ui-border-tb">
							<li class="ui-border-t">
					        ${corpName}
					    </li>
					    <li class="ui-border-t">
					        <h4>交易来源</h4>
					        <div class="ui-txt-info">${source}</div>
					    </li>
					    <li class="ui-border-t">
					        <h4>流水号</h4>
					        <div class="ui-txt-info">${id}</div>
					    </li>
					    <li class="ui-border-t">
					        <h4>订单信息</h4>
					        <div class="ui-txt-info">${subject}</div>
					    </li>
					    <li class="ui-border-t">
					        <h4 class="ui-nowrap">创建时间</h4>
					        <div class="ui-txt-info">${time}</div>
					    </li>
					</ul>
					<div class="ui-tips center">对订单有疑问，请联系客服</div>
				</div>
			`
		},
		renderError(){
			return '<div class="ui-tips center" id="J_Tips">账单不存在或获取失败</div>'
		}
	});

	page.init();

	module.exports = page;
});