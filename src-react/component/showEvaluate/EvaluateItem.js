/*
 * @Author: saohui 
 * @Date: 2017-08-17 13:46:15 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-05 09:05:32
 */
import React, { Component, PropTypes } from 'react'
import './EvaluateItem.less'
import util from '../../lib/util'

/**
 * 
 * 
 * @export props = {
 *   data: {
        "userName":"王XX",
        "point":"4.5",
        "content":"医生的厉害啊，当代华佗啊！",
        "date":"1499841651000",
        "append":"药效好到没朋友！",
        "appendDate":"1499844960000"
      }
 *   ,isShowAppend: true / false => 是否显示追加
 *   ,isEvalDataLineLt2: true / false => 评价内容是否折叠两行
 * }
 * @class EvaluateItem
 * @extends {React.Component}
 */
export default class EvaluateItem extends Component {

  static propTypes = {
    data: PropTypes.object
    ,isShowAppend: PropTypes.bool
    ,isEvalDataLineLt2: PropTypes.bool
  }

  renderStar ( val ) {
    const lightVal = Math.round( val )
    const stars = [1,2,3,4,5]

    return <div className="show-evaluate-stars">
      {
        stars.map(( item, key ) => {
          const starClassName = item <= lightVal ? 'evaluate-star-light' 
                                              : ''
          return <span key={ key } className={'evaluate-star-item '+ starClassName }></span>
        })
      }
    </div>
  }

  renderHeader () {
    const { userName, date, point } = this.props.data
    return <header className="show-evaluate-information">
      <div className="show-evaluate-person">{ userName }</div>
      { this.renderStar( point )}
      <div className="show-evaluate-time">{ util.dateFormatGMT( date, 'yyyy-MM-dd' )}</div>
    </header>
  }
  renderBody () {
    const { isShowAppend, isEvalDataLineLt2 } = this.props
    const { content, append, appendDate } = this.props.data
    return <section className="show-evaluate-content">
      <p className={'show-evaluate-text '+ ( isEvalDataLineLt2 ? 'txt-overflow-two' : '')}>{ content }</p>
      { isShowAppend && append ? <div className="show-evaluate-extra">
        <header className="title txt-info txt-line-wrapper">
          <span className="txt-line">追加评价</span>
        </header>
        <section>
          <p className="show-evaluate-text">{ append }</p>
          <div className="show-evaluate-time">{ util.dateFormatGMT( appendDate, 'yyyy-MM-dd' )}</div>
        </section>
      </div> : null }
    </section>
  }

  render () {
    return <div className="show-evaluate-item">
      { this.renderHeader()}
      { this.renderBody()}
    </div>
  }
}