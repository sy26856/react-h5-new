
'use strict'

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartNoBlockComponent} from './BaseComponent/index'

export default class HealthRecordList extends React.Component {
  constructor(props) {
    super(props)
    this.query = util.query()
    this.unionId = this.query.unionId

    if(!util.isLogin()) {
      util.goLogin()
    }
  }

  render() {
    let unionId = this.unionId
    return(
      <div>
        <div className="manual">
          <a href={"health-record.html?target=_blank&unionId=" + unionId}>
            手动添加健康数据
          </a>
        </div>
        <SubHealthRecordList unionId={this.unionId} />
      </div>
    )
  }
}
class SubHealthRecordList extends SmartNoBlockComponent {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      success: true,
      list: []
    },
    this.currentPage = 1
    this.pageSize = 100
    this.unionId = props.unionId
  }

  componentDidMount() {
    UserCenter.getMyHealthyData(this.currentPage, this.pageSize, this.unionId)
     .subscribe(this)
     .fetch()
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      list: result.data.map((item) => {
        return {
          time: item.gmtCreate,
          healthReportName: item.healthReportName,
          hospitalName: item.hospitalName,
          patientUserName: item.patientUserName,
          id: item.id
        }
      })
    })
  }

  render() {
    let {unionId} = this
    let {list} = this.state
    return (
      <div>
        {
          list.map((item, index) => {
            return (
            <div key={index} className="panel g-space">
              <div className="panel-title">{util.dateFormat(item.time, 'yyyy-MM-dd')}</div>
              <ul className="list-ord">
                <li className="list-item" key={index}>
                    <a className="txt-arrowlink list-link-wrapper" href={
                      `./health-record-detail.html?id=${item.id}&unionId=${unionId}&target=_blank`
                    }>
                    <div className="list-content" >
                      <div className="list-title ">{item.healthReportName}</div>
                      <div className="list-brief txt-nowrap">
                        就诊人：{item.patientUserName}
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            )
          })
        }
        {
          list.length === 0 ? <div className="notice">
              <span className="notice-icon icon-record"></span>
              <p>还没有健康纪录</p>
          </div> : ''
        }
      </div>
    )
  }
}


