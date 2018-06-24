'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'
import BlockLoading from './component/loading/BlockLoading'
import Aolsee from './module/Aolsee'

import './qa-list.less'

export default class QaList extends SmartBlockComponent {
	constructor(props) {
		super(props)

		let query = util.query()
		this.corpId = query.corpId
		this.unionId = query.unionId
		// 往下面传递unionId,来获取问题的详情
		this.type = 8
		this.channel = "APP"
		this.timer = null;

		this.currentPage = 1;
		this.totalPage = 1;
		this.pageLoading = false;
    this.classifyId = '';
	}

	async componentDidMount() {

		window.onscroll = this.handleScroll;

		const res = await Aolsee.getQuestionList(this.unionId).fetch();
		const resId = res.data ? res.data.filter(item => item.name == '常见问题') : [];
		this.classifyId = resId[0] ? resId[0].id : '';

		const result = this.classifyId ? await Aolsee.getNewsList(this.classifyId, 1, this.unionId, 30).fetch() : null;
		/*UserCenter.getQuestionList(this.corpId, this.unionId, this.type, this.channel)
		 .subscribe(this)
		 .fetch()*/
		this.totalPage = (result && result.data && result.data.totalPageNum) || 1;
		this.setState({
			loading: false,
			success: true,
      questionData: (result && result.data) ? result.data.records : []
		})
	}

	handleScroll = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(async () => {
    	try {
        const scrollHeight = document.body.scrollHeight;
        const scrollTop = document.body.scrollTop;
        const screenHeight = window.screen.height;
        const isBottom = scrollHeight - scrollTop < screenHeight + 20;

        if (isBottom && (!this.pageLoading) && this.totalPage > this.currentPage) {
          BlockLoading.show();
          const result = await Aolsee.getNewsList(this.classifyId, this.currentPage + 1, this.unionId, 30).fetch();
          BlockLoading.hide();
          if (this.currentPage < this.totalPage) {
            const list = JSON.parse(JSON.stringify(this.state.questionData));
            const dataList = list.concat(result.data ? result.data.records : []);
            console.log(result.data, dataList);
            this.currentPage++;
            this.setState({
              questionData: dataList
            })
          }
        }
      } catch (e) {
    		console.log(e);
    		BlockLoading.hide();
			}
    }, 250);
	};

	render() {
		let {questionData} = this.state
		return(
				<div>
					{
						!questionData || (questionData.length === 0) ? <div style={{overflow: 'hidden'}}>
									<div className="notice">
										<span className="notice-icon icon-record"></span>
										<p>没有常见问题</p>
									</div>
						</div> : <div className="page qa-page">
									<div className="content">
										<ul className="ui-list ui-list-text ui-list-link ui-border-tb ui-container">
											{
												this.state.questionData.map((item, index) => {
													return(
															<li key={index} className="ui-border-t">
																<a href={"./news-detail.html?id=" + 
																		item.id + 
																		"&unionId=" + 
																		this.unionId + 
																		"&target=_blank"}>
																	<h3 className="ui-nowrap">{item.title}</h3>
																</a>
															</li>
														)
												})
											}
										</ul>
									</div>
						</div>	
					}
				</div>
			)
	}
}