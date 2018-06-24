'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'

import UserCenter from './module/UserCenter'

class HealRecordDetail2 extends SmartNoBlockComponent {
  constructor(props) {
    super(props)
    this.query = util.query()
    this.id = this.query.id
    this.sourceType = this.query.sourceType
    this.unionId = this.query.unionId
    this.key = this.query.key || ''
    this.state = {
      data: null
    }
  }

  onError(result) {
    this.setState({
      success: false,
      msg: result.msg || '网络错误，请稍后再试'
    })
  }

  componentDidMount() {
    if(this.id){
      UserCenter.healthDataDetail(this.id, this.sourceType, this.unionId)
        .subscribe(this)
        .fetch()
    }
    //通过健康终端上传的，扫码查看接口
    if(this.key){
      UserCenter.healthDataDetailQrCode(this.key, this.sourceType, this.unionId)
      .subscribe(this)
      .fetch()
    }
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      data: result.data
    })
  }

  render() {
    let {
      data
    } = this.state
    // console.log(data)
    let {
      icpCode,
      date,
      reportName,
      name,
      groupList
    } = data
    return (
      <div>
        <ul className="list-ord">
          <li className="list-item list-nowrap">
            <img src="https://image.yuantutech.com/i4/6e1cb9c74e11225caf175d842c53e74b-84-84.png"
                 className="list-icon"/>
            <div className="list-content">
              <div className="list-title txt-nowrap">{reportName}</div>
              <div className="list-brief txt-nowrap">就诊人：{name}</div>
            </div>
          </li>
          <li className="list-item ">
            <div className="list-content">
              <div className="list-brief txt-line-sm">上传于：{icpCode}</div>
              <div className="list-brief txt-line-sm">更新时间：{date}</div>
            </div>
          </li>
        </ul>
        <div className='J'>
          {/*main数据渲染区域*/}
          {
            groupList.map((item, index) => {
              return <Card key={index} data={item}/>
            })
          }
          {/*main数据渲染区域 End */}
        </div>
      </div>
    )
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props)
    this.data = props.data
    this.keyMap = {
      '身高': 'cm',
      '体重': 'kg',
      '收缩压': 'mmHg',
      '舒张压': 'mmHg',
      '血糖': 'mmol',
      '血脂': 'mmol/L',
      '脉搏(PR)': 'bpm',
      '血氧': 'mmHg',
      '胎心': '次/分钟',
      '胆固醇': 'mmol/L',
      '尿酸': 'umol/L',
      '脂肪含量': '%',
      '代谢': 'g/kg',
      '水分': 'ppm',
      'bmi值': 'bmi',
      '腰围': 'cm',
      '臀围': 'cm',
      '臀围比': '',
      '骨密度': 'BMD',
      '基础代谢': 'KCal'
    }
  }

  /**
   * @childList 每一个大的块-比如<身高体重>数据块里面包含着标题身高体重
   *            和更小的数据<身高>?<体重>?<bmi>?，这些数据也是放在一个数组之中
   * @return
   */

  render() {
    let {
      groupName,
      childList
    } = this.data
    let keyMap = this.keyMap
    // 过滤<正常还是肥胖，体制正常还是体质健壮>*类的数据
    // 因为有可能有多个结果，这些结果以</.*结果$/>正则式存在，并且后端返回的数据和<身高>?<体重>?数据同级
    // 但是显示不同级，所以这里过滤出来单独处理
    let resultArr = childList.filter((item) => {
      if (/.*结果$/.test(item.childName)) {
        return true
      }
    })
    // 这个字符串显示 一个大数据块的健康状态 比如正常还是肥胖，体制正常还是体质健壮
    var tip = []
    resultArr.map((item) => {
      tip.push(item.dataStr)
    })
    tip = tip.join('/')
    // 排除tip的内容
    childList = childList.filter((item) => {
      if (/.*结果$/.test(item.childName)) {
        return false
      }
      return true
    })
    return (
      <ul className="list-ord" style={{borderBottom: 'none'}}>
        <li className="list-item ">
          <div className="list-content txt-nowrap ">
            <div className="list-title txt-nowrap">{groupName}</div>
          </div>
          <div className="list-extra">{tip}</div>
        </li>
        <ul className="list-ord">
          {
            childList.map((item, index) => {
              return <li key={index} className="list-item  list-item-noborder">
                <div className="list-brief-title">
                  {item.childName}
                </div>
                <div className="list-content txt-nowrap">
                  {/* 如果传过来的unit有数据，说明后端传过来了单位，以后端传过来的单位为准，如果后端没有传过来，那么就用本地的map */}

                  &nbsp;&nbsp;{item.dataStr} {item.unit ? item.unit : keyMap[item.childName]}
                </div>
              </li>
            })
          }
        </ul>
      </ul>
    )
  }
}

export default HealRecordDetail2
