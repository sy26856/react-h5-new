'use strict'

import React from 'react'
import util from './lib/util'
import {SmartNoBlockComponent, SmartBlockComponent, SmartComponent} from './BaseComponent/index'
import Alert from './component/alert/alert'

import UserCenter from './module/UserCenter'

export default class HealthRecordDetail extends SmartNoBlockComponent {
  constructor(props) {
    super(props)
    this.query = util.query()
    this.id = this.query.id
    this.unionId = this.query.unionId
    this.keyMap = {
        weight:{text:"体重", unit:"kg"},
        bloodPressureSystolic:{text:"收缩压", unit:"mmHg"},
        bloodPressureDiastolic:{text:"舒张压", unit:"mmHg"},
        bloodGlucose:{text:"血糖", unit:"mmol"},
        bloodLipid:{text:"血脂", unit:"mmol/L"},
        pulse:{text:"脉搏", unit:"bpm"},
        bo:{text:"血氧", unit:"mmHg"},
        fetalheart:{text:"胎心", unit:"次/分钟"},
        chol:{text:"胆固醇", unit:"mmol/L"},
        ua:{text:"尿酸", unit:"umol/L"},
        fat:{text:"脂肪", unit:"CAL"},
        bmr:{text:"代谢", unit:"g/kg"},
        water:{text:"水分", unit:"ppm"},
        height:{text:"身高", unit:"cm"},
        bmi:{text:"bmi值", unit:"bmi"},
        waistline:{text:"腰围", unit:"cm"},
        hipline:{text:"臀围", unit:"cm"},
        whr:{text:"臀围比", unit:""},
        bmdT:{text:"骨密度", unit:"BMD"},
        bmdZ:{text:"骨密度", unit:"BMD"}
      }

      if(!util.isLogin()) {
        util.goLogin()
      }
    }

    componentDidMount() {
      UserCenter.getMyHealthyDataDetail(this.id, this.unionId)
       .subscribe(this)
       .fetch()
    }

    onSuccess(result) {
      this.setState({
        loading: false,
        success: true,
        data: result.data
      })
    }

    renderError() {
      let {msg} = this.state
      Alert.show(msg)
      return (
          <div className="notice">
            <span className="notice-icon icon-record"></span>
            <p>还没有健康数据</p>
          </div>
      )
    }

    handleData(data) {
      var items = {}
      for(var key in data) {
        if(this.keyMap[key] && data[key]) {
          items[key] = data[key]
        }
      }
      return items
    }

    render() {
      let {
        healthReportName,
        patientUserName,
        hospitalName,
        icpcode,
        gmtModify,
      } = this.state.data
      let keyMap = this.keyMap
      // 对数据进行稍适处理
      var finalData = this.handleData(this.state.data)
      return (
        <div className="report">
          <h1>{healthReportName}</h1>
          <div className="ui-tips">
            就诊人：{patientUserName}，上传于：{hospitalName || icpcode}
          </div>
          <ul className="list-ord">
            {
              Object.entries(finalData).map((item, index) => {
                return <li key={index} className="list-item list-nowrap">
                  <div className="list-content">
                    <div className="list-left">{keyMap[item[0]]["text"]}</div>
                    <div className="list-right">{item[1]} {keyMap[item[0]]["unit"]}</div>
                    <div className="clear"></div>
                  </div>
                </li>
              })
            }
          </ul>
          <div className="ui-tips center">更新于：{util.dateFormat(gmtModify, "yyyy-MM-dd hh:mm:ss")}</div>
        </div>
      )
    }
}














