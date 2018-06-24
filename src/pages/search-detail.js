define(function(require, exports, module) {
	var VModule = require("component/VModule");

	var page = VModule.render({
		init: function() {

			if(!this.query.corpId) {
				this.util.alert("缺少corpId");
			}

			this.corpId = this.query.corpId
			this.unionId = this.query.unionId
			this.searchContent = this.query.searchContent

			//进入该详情页，存储一下
			localStorage.setItem('isDetail',JSON.stringify({isDetail: true, corpId: this.corpId, searchContent: this.searchContent}));

			this.state = {
				loading: false,
				success: true,
				type: this.query.type,
				searchResult: []
			}

			this.module = this.initModule(this.state, "#J_Page")

			this.getCache2("/user-web/restapi/common/doct/searchDoctSch", {
				corpId:this.corpId,
				likeName: this.query.searchContent
			});
		},
		onSuccess( result ) {
			this.setState({
				searchResult: result.data
			})
		},
		onError(result) {
			this.setState({
				loading: false,
				success: false,
				msg: result.msg || "网络错误，请稍后重试！"
			})
		},
		render(state) {
			var searchResult = state.searchResult
			var searchData = state.type === 'doct' ? 'doctList' : 'deptList';
			var list = searchResult[searchData] || []
			return `
					<div class="search-result">
						<ul>
						${
							list.map((item) => {
								return `

									<a href="./${state.type === 'doct' ? 'doctor' : 'dept'}.html?corpId=${item.corpId}&${state.type === 'doct' ? `doctCode=${item.doctCode}&` : ''}deptCode=${item.deptCode}&target=_blank">
									<li class="ui-row ui-border-b">
										<div class="img img-doct ui-col ui-col-50" style="${ item.logo ? `background-image:url(${ item.logo })` : ""}">
										</div>
										<div class="content ui-col ui-col-50">
											<div class="name">
													${item.name}
											</div>
											<div class="label">
													${item.label ? item.label : "<div id='hold'>无</div>"}
											</div>
											<div class="corp-name">
													${item.corpName}
											</div>
										</div>
									</li>
									</a>
								`
							}).join("")	
						}				
						</ul>
					</div>
			`
		}
	});

	page.init()

	module.exports = page;
})