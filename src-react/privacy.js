'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'

import './about.less'

export default class Privacy extends SmartBlockComponent {
	constructor(props) {
		super(props)
		let query = util.query()
		this.unionId = query.unionId
	}

	componentDidMount() {
		UserCenter.getLawInfo(this.unionId)
		 .subscribe(this)
		 .fetch()
	}

	onSuccess(result) {
		this.setState({
			loading: false,
			success: true,
			privateNotes: result.data.privateNotes,
		})
	}

	render() {
		let {privateNotes} = this.state
		return(
			<div>
				{
					!privateNotes ? <div>
						<div className="notice">
							<span className="notice-icon icon-record"></span>
							<p>没有隐私声明</p>
						</div>
					</div> : <div className="about-page privacy-page page" id="J_Page">
								<div className="content" id="J_Content" dangerouslySetInnerHTML={{__html: privateNotes}}>
					</div>
				</div>
				}
			</div>
			)
	}
}