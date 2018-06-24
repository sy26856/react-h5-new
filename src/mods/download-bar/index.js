
/**
	渲染容器ID必须为 J_DownloadBar 
	手动在页面引入 mods/download-bar/index.less.css
*/

define("mods/download-bar/index", function(require, exports, module){

	var VModule = require("component/VModule");

	var page = VModule.render({
		init:function(wrap){

			if(this.util.isInYuantuApp()){
				//在原图 App中不显示
				$('#J_DownloadBar').remove();
				return 
			}

			this.state = {
				loading:false,
				success:true,
				display:true
			};

			this.h5Domain = this.config.h5Domain;

			this.module = this.initModule(this.state, '#J_DownloadBar');
			this.regEvent();
		},
		regEvent(){
			$('#J_DownloadBar').delegate('.ui-icon-close-page', "click", ()=>{
				this.setState({
					display:false
				})
			})
		},
		render(state){
			if(state.display){
				return `
					<div class="download-bar" data-spm="download">
						<a class="logo" href="//${this.h5Domain}/tms/fb/app-download.html"></a>
						<a class="info" href="//${this.h5Domain}/tms/fb/app-download.html">
							<h1>慧医</h1>
							<p>居民健康信息服务平台</p>
						</a>
						<a class="ui-btn-lg ui-btn-primary" href="//${this.h5Domain}/tms/fb/app-download.html" >查看更多</a>
						 <i class="ui-icon-close-page"></i>
					</div>
				`
			}else{
				return "";
			}
		}
	});

	page.init();

	module.exports = page;
});
