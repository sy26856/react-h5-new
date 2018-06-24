
define(function(require, exports, module) {
	var VModule = require("component/VModule");

	var page = VModule.render({
		init: function() {
			if(!this.query.corpId) {
				this.util.alert("缺少corpId");
			}

			this.corpId = this.query.corpId
			this.unionId = this.query.unionId

			var searchHis = localStorage.getItem('searchHistory') || ""
			// 判断是否是从详情页过来的
			var isDetailPage = JSON.parse(localStorage.getItem('isDetail')) || {}
			var DetailPageSearchContent = ""
			var DetailPageLoading = false
			if(isDetailPage.isDetail) {
				isDetailPage.isDetail = false
				DetailPageSearchContent = isDetailPage.searchContent
				DetailPageLoading = true
				this.getResult(isDetailPage.corpId, isDetailPage.searchContent)
				localStorage.setItem('isDetail', JSON.stringify(isDetailPage))
			}
			// --- end
			this.state = {
				loading: DetailPageLoading,
				success: true,
				history: searchHis,
				searchResult: [],
				searchContent: DetailPageSearchContent
			}

			this.module = this.initModule(this.state, "#J_Page")

			this.regEvent()
		},
		getResult(corpId, keyWord) {
			this.getCache2("/user-web/restapi/common/doct/searchDoctSch", {
				corpId:corpId,
				likeName: keyWord
			});
		},
		regEvent: function() {
			var self = this;
			//在页面加载完成之后让input获取到焦点
			$(document).ready(function() { 
				$('#J_formInput').val(self.state.searchContent)
			})
			$(document).delegate('#cancle', 'click', () => {
				this.util.goBack()
			})

			$('#search-label').click(function() {
				$('#J_formInput').focus()
			})

			$(document).delegate('#J_formInput', 'input', (event) => {
				if(event.target.value === "") {
					this.setState({
						success: true,
						searchResult: [],	
					})
				}
			})

			$(document).delegate('.ui-searchbar', 'click', (event) => {
				$('#J_formInput').focus()
			})

			$('#J_form').submit((event) => {
				event.preventDefault();
				this.setState({
					loading:true,
				})
				var searchContent = $('#J_formInput').val().trim()
				this.setState({
					searchContent: searchContent
				})
				// 本地存储
				if(localStorage.getItem('searchHistory')) {
					var haved = localStorage.getItem(('searchHistory'));
					if(haved.indexOf(searchContent) === -1) {
						haved += '@' + searchContent
						localStorage.setItem('searchHistory', haved)
						this.setState({
							history: haved
						})
					}
				} else {
					localStorage.setItem('searchHistory', searchContent)
					this.setState({
						history: localStorage.getItem('searchHistory')
					})
				}
				// 发起请求
				this.getResult(this.corpId, searchContent)
			})
			$('#J_Page').delegate('.delete-btn', 'click', () => {
				localStorage.setItem('searchHistory', "")
				this.setState({
					history: ""
				})
			})
			//快速搜索
			$('#J_Page').delegate('.fast-search', 'click', (event) => {
				var fastSearchContent = $(event.target)
				
				this.setState({
					loading: true,
					searchContent: fastSearchContent.text()
				})
				
				$('#J_formInput').val(fastSearchContent.text())
				
				this.getResult(this.corpId, fastSearchContent.text())
			})
			$('#J_Page').delegate('#moreDoct', 'click', () => {

				window.location.href = `./search-detail.html?corpId=${this.corpId}&id=${this.query.unionId}&searchContent=${this.state.searchContent}&type=doct`
			})
			$('#J_Page').delegate('#moreDept', 'click', () => {
				window.location.href = `./search-detail.html?corpId=${this.corpId}&id=${this.query.unionId}&searchContent=${this.state.searchContent}&type=dept`
			})
		},
		onSuccess( result ) {
			this.setState({
				loading: false,
				success: true,
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
			var searchResult = state.searchResult;
			var searchHistory;
			var self = this;
			if(state.history === "") {
				searchHistory = [];
			} else {
				searchHistory = state.history.split('@').reverse();
			}
			searchHistory = searchHistory.filter((item) => {
				return item !== ""
			})
			return `
				<div class="container">
					${
						searchResult.length === 0 ? `
						${
						searchHistory.length !== 0  ? 
									`
										<div class="search-history">
											<div class="search-history-title">
												<div class="search-history-title-left">
													<h2>搜索历史</h2>
												</div>
												<div class="search-history-title-right">
													<div class="delete-btn">
														<i class="ui-icon-delete"></i>
														<span>清空记录</span>
													</div>
												</div>
											</div>
														<div class="search-history-content">
															<ul class="ui-list ui-list-text ui-list-active ui-list-cover ui-border-tb">
																${
																	searchHistory.map((item) => {
																		return `
																				<li class="ui-border-t fast-search" data-history="${item}">
																				    <i class="ui-icon-history"></i><p>${item}</p>
																				</li>
																		`
																	}).join("")
																}
															</ul>
														</div>
										</div>
									` : `
										<div class="non-history">
											<div class="non-history-title">在这里可以搜索到</div>
											<div class="non-history-line"></div>
											<div class="non-history-content">
													<div >
														<div class="non-history-content-dept"></div>
														<span>科室</span>
													</div>
													<div >
														<div class="non-history-content-doct"></div>
														<span>医生</span>
													</div>
											</div>
										</div>
									`
						}` : `
								<div class="search-result">
								${
									searchResult.doctList.length > 0 ? `
											<div class="related related-doctor">
												<div class="related-title ui-border-tb">相关医生</div>
												<ul>
												${
													searchResult.doctList.slice(0, 3).map((item) => {
														return `
															<a href="./doctor.html?corpId=${item.corpId}&unionId=${self.unionId}&doctCode=${item.doctCode}&deptCode=${item.deptCode}&target=_blank&searchContent=${state.searchContent}"><li class="ui-row ui-border-b">
																<div class="img img-doct ui-col ui-col-50" style="${ item.logo ? `background-image:url(${ item.logo })` : ""}">
																</div>
																<div class="content ui-col ui-col-50">
																	<div class="name">
																			${item.name}
																	</div>
																	<div class="label">
																			${item.label}
																	</div>
																	<div class="corp-name">
																			${item.corpName}
																	</div>
																</div>
															</li></a>
														`
													}).join("")
												}			
												${
													searchResult.doctList.length > 3 ? `
																			<div id='moreDoct' class='more'>点击显示更多</div>
													` : ''
												}
												</ul>
											</div>
									` : ""
								}
									${
										searchResult.deptList.length > 0 ? `
												<div class="related related-depart">
													<div class="related-title ui-border-tb">相关科室</div>
													<ul> 
													${									
														searchResult.deptList.slice(0, 3).map((item) => {
															return `
																<a href="./dept.html?corpId=${item.corpId}&deptCode=${item.deptCode}&target=_blank&searchContent=${state.searchContent}"><li class="ui-row ui-border-b">
																	<div class="img img-dept ui-col ui-col-50" style="${item.logo ? `background-image: url(${item.logo})` : ""}">
																	</div>
																	<div class="content ui-col ui-col-50">
																		<div>
																				${item.name}
																		</div>
																		<div>
																				${item.label ? item.label : "<div id='hold'>无</div>"}
																		</div>
																		<div>
																				${item.corpName}
																		</div>
																	</div>
																</li></a>
															`
														}).join("")											
													}
													${
														searchResult.deptList.length > 3 ? `
																<div class='more' id='moreDept'>点击显示更多</div>
														` : ''
													}
													</ul>
												</div>
										` : ""
									}								
								</div>
								${
									searchResult.doctList.length === 0 && searchResult.deptList.length === 0 ? `
											<div class="non-result">
												<div class="non-result-img"></div>
												<p class="non-result-details">未找到符合条件的搜索结果</p>
												<p>请更换搜索词查询</p>
											</div>
									` : ""
								}
						`	
					}
				</div>
			`
		}
	});

	page.init()

	module.exports = page;
})