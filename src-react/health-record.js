
'use strict'

import React from 'react'
import {findDOMNode} from 'react-dom'
import util from './lib/util'
import {SmartNoBlockComponent, SmartBlockComponent, SmartComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'

import alert from './component/alert/alert'

class Select extends SmartComponent {
  constructor(props) {
    super(props)
    this.unionId = util.query()["unionId"]
    this.state = {
      patientList: [],
      success: false,
      loading: true
    }

    if(!util.isLogin()) {
      util.goLogin()
    }
  }

  componentDidMount() {

    UserCenter.getPatientList(null, this.unionId)
     .subscribe(this)
     .fetch()
  }

  renderLoading() {
    return <option disabled>加载中</option>
  }

  renderError(){
    let {msg} = this.state;
    return <option>{msg}</option>;
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      patientList: result.data
    })
  }

  render() {
    let {patientList, success,loading} = this.state
    return(
        <select>
          {
            patientList.map((item, index) => {
              return(
                <option value={item.idNo} key={index}>{item.patientName}</option>
              )
            })
          }
        </select>
    )
  }

}

export default class HealthRecord extends SmartNoBlockComponent {
  constructor(props) {
    super(props)
    this.checkInput = this.checkInput.bind(this)
    this.unionId = util.query()["unionId"]
    this.state = {
      loading: false,
      success: true
    }
  }

  componentDidMount() {
  }

  checkInput() {
    let data = {}
    data.patient = findDOMNode(this.select).value.trim()
    data.weight = parseFloat(this.weight.value)
    data.pressure = parseFloat(this.pressure.value)
    data.diastole = parseFloat(this.diastole.value)
    data.bloodSuger = parseFloat(this.bloodSuger.value)
    data.bloodFit = parseFloat(this.bloodFit.value)
    if(!data.patient) {
      alert.show('请选择就诊人', 1000)
      return
    }
    if(!data.weight || data.weight < 0) {
      alert.show('请输入体重或输入有误', 1000)
      return
    }
    if(!data.pressure || data.pressure < 0) {
      alert.show('请输入收缩压或收缩压输入有误', 1000)
      return
    }
    if(!data.diastole || data.diastole < 0) {
      alert.show('请输入舒张压或舒张压输入有误', 1000)
      return
    }
    if(!data.bloodSuger || data.bloodSuger < 0) {
      alert.show('请输入血糖或血糖输入有误', 1000)
      return
    }
    if(!data.bloodFit || data.bloodFit < 0) {
      alert.show('请输入血脂或血脂输入有误', 1000)
      return
    }

    UserCenter.saveMyHealthyData(
      data.weight,
      data.diastole,
      data.pressure,
      data.bloodSuger,
      data.bloodFit,
      data.patient,
      this.unionId
    )
     .subscribe(this)
     .fetch()

  }

  onSuccess(result) {

    this.setState({
      loading:false,
      success:true
    })

    alert.show("健康数据记录成功")

    setTimeout(() => {
      util.goBack(true)
    }, 1500)
  }

  render() {
    return(
      <div>
        <div className="ui-tip center">
          记录健康数据
        </div>
        <div className="list-ord">
          <div className="list-item item-input">
            <div className="item-input-title">
              就诊人
            </div>
            <div className="item-input-content item-select-wrapper">
              <Select ref={(dom) => this.select=dom} />
            </div>
          </div>
          <div className="list-item item-input">
            <div className="item-input-title">
              体重:
            </div>
            <div className="item-input-content">
              <input type="number" placeholder='体重(kg)' ref={(dom) => this.weight=dom} />
            </div>
          </div>
          <div className="list-item item-input">
            <div className="item-input-title">
              收缩压:
            </div>
            <div className="item-input-content">
              <input type="number" placeholder='收缩压(mmHg)' ref={(dom) => this.pressure=dom} />
            </div>
          </div>
          <div className="list-item item-input">
            <div className="item-input-title">
              舒张压:
            </div>
            <div className="item-input-content">
              <input type="number" placeholder='舒张压(mmHg)' ref={(dom) => this.diastole=dom} />
            </div>
          </div>
          <div className="list-item item-input">
            <div className="item-input-title">
              血糖:
            </div>
            <div className="item-input-content">
              <input type="number" placeholder='血糖(mmol)' ref={(dom) => this.bloodSuger=dom} />
            </div>
          </div>
          <div className="list-item item-input">
            <div className="item-input-title">
              血脂:
            </div>
            <div className="item-input-content">
              <input type="number" placeholder='血脂(mmol/L)' ref={(dom) => this.bloodFit=dom} />
            </div>
          </div>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.checkInput}>保存健康数据</button>
        </div>
      </div>
    )
  }
}