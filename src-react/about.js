'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'

import './about.less'

export default class About extends SmartBlockComponent {
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
			aboutNotes: result.data.aboutNotes
		})
	}

	render() {
		let {aboutNotes} = this.state
		return(
			<div>
				{
					!aboutNotes ? <div>
						<div className="notice">
							<span className="notice-icon icon-record"></span>
							<p>没有关于我们</p>
						</div>
					</div> : <div className="about-page about-page page" id="J_Page">
								<div className="content" dangerouslySetInnerHTML={{__html: this.state.aboutNotes}}>
								</div>
					</div>
				}
			</div>
			)
	}
}