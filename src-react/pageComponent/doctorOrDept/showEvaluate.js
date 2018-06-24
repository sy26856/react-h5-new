/*
 * @Author: saohui 
 * @Date: 2017-09-19 10:03:05 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-19 10:34:42
 */
import React, { Component, PropTypes } from 'react'
import util from '../../lib/util'

import TagList from '../../component/showEvaluate/TagList'
import EvaluateItem from '../../component/showEvaluate/EvaluateItem'

export default class ShowEvaluate extends Component {

  static propType = {
    evaluateData: PropTypes.object
    
    ,unionId: PropTypes.string
    ,corpId: PropTypes.string
    ,code: PropTypes.string

    ,isDoct: PropTypes.bool // 是医生的时候 code 为医生，否则是科室
  }

  constructor ( props ) {
    super( props )
  }

  render () {
    const { unionId, corpId, code, isDoct } = this.props
    const { tagList, totalTag, evaluateList, totalEvaluate } = this.props.evaluateData

    // 没有评价时候，隐藏
    if ( evaluateList.length == 0 ) {
      return null
    }

    let tCode = isDoct ? 'doctCode' : 'deptCode'
    
    return <div onClick={() => {
      location.href = './show-evaluate.html?'+ util.flat({
        unionId
        ,corpId
        ,[tCode]: code
        ,target: '_blank'
      })}} className="panel g-space">

      <div className="list-item">
        <a className="txt-arrowlink list-link-wrapper" >
          <div className="list-content">
            <div className="list-title txt-nowrap">就诊评价({ totalEvaluate })</div>
          </div>
          <div className="list-extra" style={{ lineHeight: 1.5 }} >查看更多</div>
        </a>
      </div>
      
      <TagList showMore={ false }>
        { tagList.map(( item, key) => {
          return <div key={ key } checked={ item.color == 0 } disabled={ item.color == 2 }>{ item.name +'('+ item.tagNum +')'}</div>
        })}
      </TagList>

      <div className="show-evaluate-container">
        { evaluateList.slice( 0, 1 ).map(( item, key ) => {
          return <EvaluateItem
                key={ key }
                data={{
                  userName: item.patientName.slice( 0, 1 ) + '**'
                  ,point: item.totalEvaluate
                  ,content: item.evaluate
                  ,date: item.updateTime
                  ,append: item.appendEvaluate
                  ,appendDate: item.appendTime
                }}
                isShowAppend={ false }
                isEvalDataLineLt2={ true } />
        })}
      </div>
      
    </div>
  }
}