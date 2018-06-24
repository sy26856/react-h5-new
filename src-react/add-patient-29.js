"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import './add-patient-29.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard'

export default class AddPatient extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.query = util.query();
    this.regMode = this.query.regMode
    this.unionId = this.query.unionId;
  }

  componentDidMount() {
    if (!util.isLogin()) {
      util.goLogin();
    }else{
      this.setState({
        success: true,
        loading: false,
      });
  }
}

  handleClick(k) {
    let param = util.flat({ 
      unionId: this.unionId,
      target: '_blank',
      selectView:this.query.selectView,
      regMode:this.regMode
     })
    if (k === 1) {
      window.location.href = "./add-patientByCard-29.html?" + param
    }else if ( k===2 ) {
      window.location.href = "./add-patientById-29.html?" + param
    }
  }
  

  render() {
    return (
      <div className="add-patient" style={{   "padding":" 5px 12px "  }}>
       <div className="type-add-patient" onClick={this.handleClick.bind(this, 1)}>
        <div className="type-add-patient-image">
          <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/c8e2bab53f6303c9fd4001e876af8add-126-126.png" alt=""/>
        </div>
        <div className="type-add-patient-info">
          <div>通过就诊卡添加</div>
          <div className="add-patient-info-2">添加后直接绑定就诊卡</div>
        </div>
        <div className="patient-select-icon">
        </div>

       </div>
       <div className="type-add-patient" onClick={this.handleClick.bind(this, 2)}>
        <div className="type-add-patient-image">
          <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/336f551f727fe94e755f98fadc14eaab-150-150.png" alt=""/>
        </div>
        <div className="type-add-patient-info">
          <div>通过身份证添加</div>
          <div className="add-patient-info-2">未在医院办理就诊卡用户添加</div>
        </div>
        
       </div>
    </div>
    )
  }
}
