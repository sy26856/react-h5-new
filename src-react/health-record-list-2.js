'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'

import UserCenter from './module/UserCenter'

import hybridAPI from './lib/hybridAPI'

class HealthRecordList2 extends SmartNoBlockComponent {
	constructor(props) {
		super(props)
		let query = util.query()
		this.unionId = query.unionId
		this.state = {
			loading: false,
			success: false,
			yearValue: "0",
			monthValue: "0",
			nonData: false,
			records: null
		}
		if(!util.isLogin()) {
		  util.goLogin()
		}
	}

	componentDidMount() {

		if(util.isInYuantuApp()) {
			hybridAPI.banRefresh()
		}

		let {yearValue, monthValue} = this.state
			, startTime
			, endTime

		/**
		 * 如果yearValue或者是monthvalue其中有一个没有填，该值为'0'
		 * 发请求需要年份月份都提供，所以在这里判断是否需要的都提供了
		 * 如果有一个没有提供，则是处于用户选择年份而没有选择月份，
		 * 或者是选择月份而没有选择年份的状态，这个时候不应该发送请求去增加浏览器负担
		 */
		if((parseInt(yearValue) && !parseInt(monthValue)) || (!parseInt(yearValue) && parseInt(monthValue))) {
			return;
		}

		startTime = yearValue === '0' || monthValue === '0'
			?	null
			: `${yearValue}-${monthValue}-1`
		endTime = yearValue === '0' || monthValue === '0'
			?	null
			: this.getDate(yearValue, monthValue)

		UserCenter.healthDataList(startTime, endTime, this.unionId)
		 .subscribe(this)
		 .fetch()
	}

	/**
	 * @year String 年份
	 * @month String 月份
	 * @return String 根据参数年份，月份计算出某年某月的总天数，然后以格式`year-month-days`返回
	 */
	getDate(year, month) {
		let time = new Date(year, month, 0)
		return `${year}-${month}-${time.getDate()}`
	}

	onSuccess(result) {
		let records = result.data ? result.data.records : null
		if(!records) {
			this.setState({
				nonData: true,
				records: null,
				success: true,
				loading: false
			})
			return
		}
		this.setState({
			loading: false,
			success: true,
			records: records
		})
	}
	/**
	 * 
	 * 
	 */
	onYearChange(e) {
		// 当年份选择框改变，改变state，但是这里需要进行判断月份是否被选中
		//  -- 这里的判断转移到了componentDidMount中
		this.setState({
			yearValue: e.target.value
		}, function() {
			this.componentDidMount()
		})
	}

	onMonthChange(e) {
		/**
		 * 当月份选择框改变，改变state，但是这里需要进行判断年份是否被选中，进而决定是否发送
		 * 数据请求 -- 这里的判断转移到了componentDidMount中
		 */
		this.setState({
			monthValue: e.target.value
		}, function() {
			this.componentDidMount()
		})
	}

	render() {
		let {
			yearValue,
			monthValue,
			records
		} = this.state
		let unionId = this.unionId
		let nowYear = new Date().getFullYear()
		let yearArr = []
		for(;nowYear >= 2015; nowYear--) {
			yearArr.push(nowYear)
		}
		return (
			<div id="J_container">	
				<div className="cards">
					<div className="list-item item-input J">
						<div className="item-input-content item-select-group-wrapper">
									<div className="select-group-item">
										<select value={yearValue} onChange={this.onYearChange.bind(this)}>
											<option value="0" disabled>请选择</option>
											{
												yearArr.map((item, index) => {
													return <option key={index} value={item}>{item + ' 年'}</option>
												})
											}
										</select>
									</div>
									<div className="select-group-item">
										<select value={monthValue} onChange={this.onMonthChange.bind(this)}>
											<option value="0" disabled>请选择</option>
											<option value="1">1 月</option>
											<option value="2">2 月</option>
											<option value="3">3 月</option>
											<option value="4">4 月</option>
											<option value="5">5 月</option>
											<option value="6">6 月</option>
											<option value="7">7 月</option>
											<option value="8">8 月</option>
											<option value="9">9 月</option>
											<option value="10">10 月</option>
											<option value="11">11 月</option>
											<option value="12">12 月</option>
										</select>
									</div>
								</div>
					</div>
					{
						// 渲染records或者是无数据
						records ? records.map((item, index) => {
							if(index === records.length - 1) {
								return <Card record={item} unionId={unionId} key={index} id="last" />
							} else {
								return <Card record={item} unionId={unionId} key={index}/>
							}
						}) : <div className="notice">
									<span className="notice-icon icon-record"></span>
									<p>当前月份无健康档案记录</p>
								 </div>
					}
				</div>
				<div className="btn-wrapper g-footer">
					<a className="btn btn-block" href={`./health-record-2.html?${util.flat({
						unionId: unionId,
						target: '_blank'
					})}`}>手动添加健康数据</a>
				</div>
			</div>
		)
	}
}

class Card extends React.Component {
	constructor(props) {
		super(props)
		this.record = props.record
		this.unionId = props.unionId
		this.id = props.id ? props.id : ''
	}

	componentWillReceiveProps(props) {
		this.record = props.record
		this.unionId = props.unionId
	}

	render() {
		let {
			reportName,
			name,
			date,
			id,
			sourceType
		} = this.record
		let idC = this.id
		let timeStr = date.substring(0, 10)
		let unionId = this.unionId
		let src = 'https://image.yuantutech.com/i4/6e1cb9c74e11225caf175d842c53e74b-84-84.png'
		if(reportName === '手机健康报告') {
			src = 'https://image.yuantutech.com/i4/2d18992c74db047d3aee0c9c8106c762-84-84.png'
		}
		// https://image.yuantutech.com/i4/2d18992c74db047d3aee0c9c8106c762-84-84.png 手机端图片地址
		return (
			<a id={idC} href={'./health-record-detail-2.html?' + util.flat({
					id: id,
					sourceType: sourceType,
					unionId: unionId,
					target: '_blank'
				})
			}>
				<div className="card g-space J">
					<div className="card-header card-nowrap">
						<img src={src} className="card-icon" />
						<div className="card-content">
							<div className="card-title txt-nowrap">{reportName}</div>
							<div className="card-brief txt-nowrap">就诊人：{name}</div>
						</div>
					</div>
						<div className="card-footer">
							<div className="card-brief">{timeStr}</div>
							<div className="card-extra">查看详情<span className="icon-right"></span></div>
						</div>
				</div>
			</a>
		)
	}

}


export default HealthRecordList2