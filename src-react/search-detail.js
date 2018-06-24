'use strict'

import React from 'react'
import util from './lib/util'
import {SmartNoBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'

import './search-detail.less'

export default class SearchDetail extends SmartNoBlockComponent {
  constructor(props) {
    super(props)

    let query = util.query()
    this.corpId = query.corpId
    this.likeName = query.searchContent
    this.type = query.type

    localStorage.setItem('isDetail', JSON.stringify({
      isDetail: true,
      corpId: this.corpId,
      searchContent: this.likeName
    }));
  }

  componentDidMount() {
    UserCenter.getSearchResult(this.corpId, this.likeName)
      .subscribe(this)
      .fetch()
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      searchResult: result.data[this.type]
    })
  }

  render() {
    let {searchResult} = this.state || []
    let isDoctPage = this.type === 'doctList'
    let detailPage = isDoctPage ? './pages/doctor.html?corpId=' : './doctor-list.html?corpId='
    return (
      <div className="search-result">
        <ul>
          {
            searchResult.map((item, index) => {
              return (
                <a href={
                  `${detailPage}
										${item.corpId}&
										${isDoctPage ? `doctCode=${item.doctCode}&` : ''}
										deptCode=${item.deptCode}
										&target=_blank
										`
                } key={index}>
                  <li className="ui-row ui-border-b">
                    <div className={`img ${isDoctPage ? 'img-doct' : 'img-dept'} ui-col ui-col-50`}>
                    </div>
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
            })
          }
        </ul>
      </div>
    )
  }
}