'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'

import './about.less'

export default class Law extends SmartBlockComponent {
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
			legalNotes: result.data.legalNotes,
		})
	}

	render() {
		let {legalNotes} = this.state
		return(
			<div>
				{
					!legalNotes ? <div>
						<div className="notice">
							<span className="notice-icon icon-record"></span>
							<p>没有法律须知</p>
						</div>
					</div> : <div className="about-page law-page page" id="J_Page">
							<div className="content" id="J_Content" dangerouslySetInnerHTML={{__html: legalNotes}}>
					</div>
				</div>
				}
			</div>
				
			)
	}
}