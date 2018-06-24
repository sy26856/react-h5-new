'use strict'

import React from 'react'
import util from './lib/util'
import {SmartNoBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'

import './search.less'

// 搜索Banner组件
/*
	该组件应该处理的问题
	1. 点击取消按钮的时候进行返回上一个页面
	2. form 表单提交的时候需要本地存储并且修改父组件的state来进行触发SearchContent组件的更新
	3. 监听input框input事件来处理历史记录是否显示
 */
class SearchBanner extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			searchContent: '',
			modifiedSearchInputContent: ''
		}
	}

	// 处理onSubmit事件
	onSubmit(event) {
		event.preventDefault()

		// 先存储一下搜索的内容
		let sercon = this.refs.searchInput.value.trim()

			// 如果查询字符串是一个纯空的字符串，就不需要存进localStorage了
		if(sercon !== '') {
			if(localStorage.getItem('searchHistory')) {
				var haved = JSON.parse(localStorage.getItem(('searchHistory')))
				if(haved.indexOf(sercon) === -1) {
					haved.push(sercon)
					localStorage.setItem('searchHistory', JSON.stringify(haved))
				}
				this.setState({
					history: haved
				})
			} else {
				localStorage.setItem('searchHistory', JSON.stringify([sercon]))
				this.setState({
					history: [sercon]
				})
			}
		}
		// 先存储一下搜索的内容 End
		// 将搜索的内容依赖父组件传递给搜索内容组件
		this.props.modifiedSearchContent(sercon);
	}

	componentWillReceiveProps(props) {

		this.refs.searchInput.value = props.modifiedSearchInputContent
	}

	// 处理input框的输入事件
	onInput(event) {
		this.props.modifiedInpputContent(event.target.value)
	}

	// 处理后退事件
	back() { 
		util.goBack()
	}

	render() {
		return(
				<div className="search-input">
			      <div className="ui-searchbar-wrap ui-border-b">
			          <div className="ui-searchbar ui-border-radius">
			              <i className="ui-icon-search"></i>
			              <div className="ui-searchbar-input">
			                <form autoComplete="off"
			                			id="J_form"
			                			name="auto"
			                			action=""
			                			onSubmit={this.onSubmit.bind(this)}>
			                  <input type="search" placeholder="搜索医生、科室" id="J_formInput" autoCapitalize="off" required ref='searchInput' onInput={this.onInput.bind(this)}/>
			                </form>
			              </div>
			          </div>
			          <button className="ui-searchbar-cancel" id="cancle" onClick={this.back.bind(this)}>取消</button>
			      </div>
			    </div>
			)
	}
}
// 搜索Banner组件 End

// 搜索组件   SearchBanner和SearchContent的父组件
export default class Search extends React.Component {
	constructor(props) {
		super(props)
		// 用父组件来处理搜索历史的问题 需要往SearchContent组件传递的参数有
		// searchHistory 搜索的历史记录
		// detailPageSearchContent 从详情页退回来的时候的搜索的内容
		let query = util.query()
		this.corpId = query.corpId
		this.unionId = query.unionId
		// 获取本地存储的搜索历史
		try { // 如果parse出错，清空本地存储
			JSON.parse(localStorage.getItem('searchHistory'))
		} catch(e) {
			localStorage.clear()
		}
		var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []
		// 获取本地存储的搜索历史 End
		// 判断是否是从详情页过来的
		var isFromDetailPage = JSON.parse(localStorage.getItem('isDetail')) || {}

		var detailPageSearchContent = ""
		var detailPageLoading = false
		var fromDetail = false
		if(isFromDetailPage.isDetail) {
			isFromDetailPage.isDetail = false
			detailPageSearchContent = isFromDetailPage.searchContent
			detailPageLoading = true
			fromDetail = true
			localStorage.setItem('isDetail', JSON.stringify(isFromDetailPage))
		}
		// 用父组件来处理搜索历史的问题 End
		this.state = {
			searchContent: '',
			searchHistory: searchHistory,
			detailPageSearchContent: detailPageSearchContent,
			detailPageLoading: detailPageLoading,
			SearchInputContent: '',
			fromDetail: fromDetail
		}

	}

	modifiedSearchContent(con) {
		this.setState({
			searchContent: con,
			SearchInputContent: con
		})
	}

	modifiedInpputContent(con) {
		if(con === "") {
			this.setState({
				searchContent: '',
				SearchInputContent: ''
			})
		}
	}

	modifiedSearchInputContent(con) {
		this.setState({
			SearchInputContent: con,
			searchContent: con,
		})
	}

	// modofiedSearchContent 将搜索的内容依赖父组件传递给搜索内容组件 由搜索内容组件进行发请求
	// modifiedInpputContent 当搜索框内的内容发生变化的时候触发该组件的render然后引发搜索内容组件进行render来决定是否渲染历史记录
	// modifiedSearchInputContent 该方法在搜索内容组件里面的快速搜索被触发的时候和搜索Banner进行通讯，来修改input框的内容

	render() {
		return(
				<div>
					<SearchBanner modifiedSearchContent={(con) => this.modifiedSearchContent(con)}
												modifiedInpputContent={(con) => this.modifiedInpputContent(con)}
												modifiedSearchInputContent = {this.state.SearchInputContent} />
					<SearchContent searchContent={this.state.searchContent}
												 searchHistory={this.state.searchHistory}
												 detailPageSearchContent={this.state.detailPageSearchContent}
												 detailPageLoading={this.state.detailPageLoading}
												 corpId={this.corpId}
												 unionId={this.unionId}
												 modifiedSearchInputContent={(con) => this.modifiedSearchInputContent(con)}
												 fromDetail={this.state.fromDetail}/>
				</div>
			)
	}
}
// 搜索组件 End

class SearchContent extends SmartNoBlockComponent {
	constructor(props) {
		super(props)
		this.corpId = props.corpId
		this.unionId = props.unionId
		this.modifiedSearchInputContent = props.modifiedSearchInputContent

		this.state = {
			loading: props.detailPageLoading,
			success: true,
			history: props.searchHistory,
			searchResult: [],
			searchContent: props.detailPageSearchContent,
			fromDetail: props.fromDetail
		}
	}

	componentDidMount() {
		if(this.state.fromDetail) {
			this.getData(this.state.searchContent)
			this.modifiedSearchInputContent(this.state.searchContent)
		}
	}

	componentWillReceiveProps(props) {
		if(props.searchContent === '') {
			try { // 如果parse出错，清空本地存储
				JSON.parse(localStorage.getItem('searchHistory'))
			} catch(e) {
				localStorage.clear()
			}
			var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []
			this.setState({
				searchContent: '',
				searchResult: [],
				history: searchHistory
			})
		} else {
			this.setState({
				searchContent: props.searchContent
			})
			this.getData(props.searchContent)
		}
	}

	onSuccess(result) {
		this.setState({
			loading: false,
			success: true,
			searchResult: result.data
		})
	}

	onError(result) {
		this.setState({
			loading: false,
			success: false,
			msg: result.msg || '网络错误，请稍后重试！'
		})
	}

	getData(value) {
		this.setState({
			loading: true,
			success: false,
		})

		UserCenter.getSearchResult(this.corpId, value)
		 .subscribe(this)
		 .fetch()
	}

	clearSearchHistory() {
		localStorage.removeItem('searchHistory')
		this.setState({
			history: []
		})
	}

	fastSearch(event) {
		var content = event.target.textContent
		this.setState({
			searchContent: content
		})
		this.modifiedSearchInputContent(content)
		this.getData(content)
	}

	goMoreDoct() {
		let {corpId, unionId} = this
		let {searchContent} = this.state
		window.location.href = `./search-detail.html?corpId=${corpId}&id=${unionId}&searchContent=${searchContent}&type=doctList`
	}

	goMoreDept() {
		let {corpId, unionId} = this
		let {searchContent} = this.state
		window.location.href = `./search-detail.html?corpId=${corpId}&id=${unionId}&searchContent=${searchContent}&type=deptList`	
	}

	render(){
		let {searchResult, history, searchContent} = this.state

		let history_new = history.concat()
		history_new.reverse()
		return(
				<div className="container">
					{// 判断搜索结果是不是为0
						searchResult.length === 0 ? <div>
							{// 是否显示历史记录
								history_new.length !== 0 ? <div>
									<div className="search-history">
										<div className="search-history-title">
											<div className="search-history-title-left">
												<h2>搜索历史</h2>
											</div>
											<div className="search-history-title-right">
												<div className="delete-btn" onClick={this.clearSearchHistory.bind(this)}>
													<span>清空记录</span>
												</div>
											</div>
										</div>
													<div className="search-history-content">
														<ul className="ui-list ui-list-text ui-list-active ui-list-cover ui-border-tb">
															{
																history_new.map((item, index) => {
																	return (
																			<li className="ui-border-t fast-search"
																					key={index}
																					onClick={this.fastSearch.bind(this)}>
																					<span className="icon-history"></span>
																					<p>{item}</p>
																			</li>
																	)
																})
															}
														</ul>
													</div>
									</div>
								</div> : <div>
									<div className="non-history">
										<div className="non-history-title">在这里可以搜索到</div>
										<div className="non-history-line"></div>
										<div className="non-history-content">
												<div >
													<div className="non-history-content-dept"></div>
													<span>科室</span>
												</div>
												<div >
													<div className="non-history-content-doct"></div>
													<span>医生</span>
												</div>
										</div>
									</div>
								</div>
							// 是否显示历史记录 End
							}
						</div> : <div className="search-result">
							{// 显示搜索出来的医生列表
								searchResult.doctList.length > 0 ? <div>
									<div className="related related-doctor">
										<div className="related-title ui-border-tb">相关医生</div>
										<ul>
										{
											searchResult.doctList.slice(0, 3).map((item, index) =>  {
												let logo = item.logo ? "url(" + item.logo + ")" : ""
												return(
														<a href={"./doctor.html?corpId=" + 
																item.corpId + 
																"&unionId=" + 
																this.unionId +
																"&doctCode=" + 
																item.doctCode + 
																"&deptCode=" + 
																item.deptCode + 
																"&target=_blank&searchContent=" + 
																searchContent} 
																key={index}
																>
															<li className="ui-row ui-border-b">
																<div className="img img-doct ui-col ui-col-50"

																style={{
																	backgroundImage: logo
																}}>
																</div>
																<div className="content ui-col ui-col-50">
																	<div className="name">
																			{item.name}
																	</div>
																	<div className="label">
																			{item.label}
																	</div>
																	<div className="corp-name">
																			{item.corpName}
																	</div>
																</div>
															</li>
														</a>
													)
												}
											)
										}
										</ul>
										{
											searchResult.doctList.length > 3 ? <div 
																													id='moreDoct' 
																													className='more'
																													onClick={this.goMoreDoct.bind(this)}>
												点击显示更多
										</div> : ""
										}
									</div>
								</div> : ""
							}
							{// 显示搜索出来的科室列表
								searchResult.deptList.length > 0 ? <div>
									<div className="related related-doctor">
										<div className="related-title ui-border-tb">相关科室</div>
										<ul>
										{
											searchResult.deptList.slice(0, 3).map((item, index) =>  {
												let logo = item.logo ? "url(" + item.logo + ")" : ""
												return(
														<a href={"./doctor-list.html?corpId=" +
																item.corpId + 
																"&deptCode=" +
																item.deptCode + 
																"&target=_blank&searchContent=" + 
																searchContent} 
																key={index}
																>
															<li className="ui-row ui-border-b">
																<div className="img img-dept ui-col ui-col-50"></div>
																<div className="content ui-col ui-col-50">
																	<div className="name">
																			{item.name}
																	</div>
																	<div className="label">
																			{item.label ? item.label : <div id='hold'>无</div>}
																	</div>
																	<div className="corp-name">
																			{item.corpName}
																	</div>
																</div>
															</li>
														</a>
													)
												}
											)
										}
										</ul>
										{
											searchResult.deptList.length > 3 ? <div 
																													id="moreDept" 
																													className="more"
																													onClick={this.goMoreDept.bind(this)}>
													点击显示更多
											</div> : ""
										}
									</div>
								</div> : ""
								
							}

							{
								searchResult.doctList.length === 0 && searchResult.deptList.length === 0 ? <div>
									<div className="non-result">
											<div className="non-result-img"></div>
											<p className="non-result-details">未找到符合条件的搜索结果</p>
											<p>请更换搜索词查询</p>
									</div>
								</div> : ''
							}
						</div>
					/* 判断搜索结果是不是为0 End */
					}
				</div>
			)
	}
}