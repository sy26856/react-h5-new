'use strict'

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import CountDown from './component/CountDown'
import "./pay-status.less"
/**
	web支付中间页
	中间页负责处理查询支付状态
	1. 支付成功跳转到业务页面
	2. 支付失败跳转到账单页面
*/
export default class PayStatus extends React.Component {
	constructor(props) {
		super(props)
		let query = util.query();

		this.state = {
			loading:true,
			success:true,
			time:0,
		};

		this.corpId = query.corpId;
		this.unionId = query.unionId;
		this.successUrl = query.successUrl;
		this.errorUrl = query.successUrl;
		this.isGraphic = query.isGraphic;
		this.out_trade_no = query.out_trade_no;
		this.billUrl = util.flatStr(util.h5URL("/bill.html?"), {corpId:this.corpId,unionId:this.unionId});
	}

	componentDidMount() {
		this.getPayStatus();
	}

	async getPayStatus(){
		try{
			let result = await UserCenter.getPayStatusByOutId(this.out_trade_no, this.corpId, this.unionId).fetch();
			let data = result.data;
			// 101 支付中  200 医院处理中
			if(data && (data.status != "101" && data.status != "200")){
				if(data.status == "300"){
					this.onPayComplete(data);
				}else{
					this.onPayError(data);
				}
			}else{
				setTimeout(()=>{
					this.getPayStatus();
				}, 2000);
			}
		}catch(e){
			this.onPayIOError(e);
		}
	}  
	//支付轮训完成
	onPayComplete( data ){
		this.setState({
			loading:false,
			success:true,
			time:3
		});
		let jumpUrl = this.billUrl;

		if(this.successUrl){
			if(this.isGraphic=="true"){
				jumpUrl = this.successUrl+'&isGraphic='+this.isGraphic
			}else{
				jumpUrl = this.successUrl
			}
			;//this.getBillDetailUrl(data.id)
		}

		this.jumpToUrl(jumpUrl, 3000);

	}

	//支付结果失败
	onPayError(data){
		this.setState({
			loading:false,
			success:false,
			time:3
		});
		if(data.id){
			this.jumpToUrl(this.getBillDetailUrl(data.id), 3000);
		}else{
			this.jumpToUrl(this.billUrl, 3000);
		}
	}

	//io 异常
	onPayIOError(){
		this.setState({
			loading:false,
			ioError:true,
		})
	}

	getBillDetailUrl(id){
		return util.flatStr(util.h5URL("/bill-detail.html?"), {id, corpId:this.corpId, unionId:this.unionId})
	}
	//倒计时跳转
	jumpToUrl(url, time){
		new CountDown(time, (c,s,f,m)=>{
			this.setState({
				time:m
			});
			if(c <= 0){
				window.location.replace(url);// = ;
				// console.log(url)
			}
		}).start();

	}

	render() {

		let {loading, success, ioError, time} = this.state;
		//result-loading result-success result-warning
		let className = "";
		let text = "";
		let des = "";

		if(loading){
			className = "result-loading";
			text = "正在处理";
			des = "正在查询支付结果...";
		}else if(success){
			className = "result-success";
			text = "支付成功";
			des = time+"秒后跳转，未正确跳转点击下方链接";
		}else{
			className = "result-warning";
			text = "支付失败";
			des = time+"秒后跳转到账单详情，未正确跳转点击下方链接";
		}

		if(ioError){
			className = "result-warning"
			text = "支付异常"
			des = "无法正确获得支付结果，请稍后再试";
		}

		return(
			<div className="pay-status">
				<div className={"result-wrapper "+className }>
					<div className="result">
						<div className="result-icon"></div>
						<div className="result-title">{text}</div>
						<div className="result-msg">{des}</div>
					</div>
				</div>
				<div style={{marginTop:20, textAlign:"center"}}>
					<a href={this.billUrl}>点击查看账单</a>
				</div>
			</div>
			)
	}
}
