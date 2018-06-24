
//define(function (require, exports, module) {

define(function(require, exports, module){

	var VModule = require("component/VModule");


	var page = VModule.render({
		init:function(){


			if( !this.query.corpId ){
				this.util.alert("缺少corpId");
			}

			this.id = this.query.id || "";
			this.corpSelected = this.query.selected
			this.state = {
				loading:true
			}

			this.module = this.initModule(this.state ,'#J_Page');

			this.get("/user-web/restapi/common/corp/corpHome", {
				corpId:this.corpId
			});

		},

		onSuccess:function( result ){

			var data = result.data;
			var corpId = this.corpId;
			var headerImage = null;
			var corpName = null;
			var tag = null;
			try{
				headerImage = result.data.banners ? result.data.banners[0].img : "";
				//"http://s.yuantutech.com/i4/8fb394296c4b1959665c3bf4c2be2370-480-296.png"
				corpName = result.data.name;
				tag = result.data.tags ? result.data.tags[0]  : "";
			}catch(e){
				console.log(e)
				console.log("数据错误")
			}

			this.setState({
				loading:false,
				success:true,
				logo:data.logo,
				corpId:data.corpId || this.corpId,
				leafList:data.leafList,
				headerImage:headerImage,
				corpName:corpName,
				tag:tag,
				tags:data.tags,
				address:data.address,
				funcions:data.funcions,
				noticeTitle:data.noticeTitle,
				noticeId:data.noticeId,
				corpInfo:data.corpInfo,
				phone:data.corpPhone
			});

		},
		render( state ){


			let {corpName, tags, address, logo,  corpId, noticeTitle, noticeId, phone, corpInfo} =  state;

			return `
				<div class="corp-info ui-border-tb">
		      <div class="logo" style="background-image:url(${logo})"></div>
		      <h1>${corpName}</h1>
		      <div class="tags">
						${tags.map((tag)=>{ return `<span>${tag}</span>` }).join("")}
					</div>
		      <div class="address">${address}</div>
		    </div>
		    <div class="corp-des module ui-border-tb">${corpInfo}</div>
			`
		},
		renderError(state){
			return `
				<section class="ui-notice">
					<i></i>
					<div class="ui-tips">${state.msg || "无法获取医院数据，请稍后再试"}</div>
				</section>
			`
		}
	});

	page.init();

	module.exports = page;
});
