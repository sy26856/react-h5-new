import React, {PropTypes} from 'react';
import util from './lib/util';

import UserCenter from './module/UserCenter';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';

const list = {
  "普通挂号": 1,
  "专家挂号": 2,
  "名医挂号": 3,
  "急诊挂号": 14,
  "便民挂号": 15,
  "视频问诊挂号": 16,
  "普通预约": 4,
  "专家预约": 5,
  "名医预约": 6,
  "急诊预约": 54,
  "便民预约": 55,
  "视频问诊预约": 56
};

export default class SelectByDate extends SmartBlockComponent {

  static propTypes = {
    data: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.timer = null;
    const query = util.query();
    this.corpId = query.corpId;
    this.deptCode = query.deptCode;
    this.regMode = query.regMode;


    this.state = {
      loading: true,
      data: '',
    }
  }

  componentDidMount() {
    UserCenter.listScheduleinfoByDate(this.corpId, this.deptCode, this.regMode).subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      data: result.data,
    });
  }

  doctFlag(data) {
    if (data.medAmNum > 0 || data.medPmNum > 0) {
      return <div className="select-doctor-flag">可预约</div>
    } else if (data.medAmNum < 0 && data.medPmNum < 0) {
      return <div className="select-doctor-flag-offline">停诊</div>
    } else {
      return <div className="select-doctor-flag-offline">已满</div>
    }
  }

  toInfo(e, data, name, ampm, corpName) {
    e.stopPropagation();
    const urlInfo = {
      corpId: this.corpId,
      doctCode: data.doctCode,
      medAmPm: ampm,
      scheduleId: data.scheduleId,  //新增
      type: list[name],
      regType: data.regType,  //新增
      medDate: data.medDate,
      regAmount: data.regAmount,
      regMode: this.regMode,
      doctName: data.name || data.deptName,
      deptName: data.deptName,
      corpName,  //新增
      deptCode: data.deptCode,
      target: '_blank'
    };
    if(query.unionId == 29){
      window.location.href = `./info-confirm-29.html?${util.flat(urlInfo)}`
    }else{
      window.location.href = `./info-confirm-2.html?${util.flat(urlInfo)}`
    }
  }

  dateAMBtn(data, name, corpName) {
    if (data.medAmNum > 0) {
      return <a onClick={(e) => this.toInfo(e, data, name, 1, corpName)}
                className="btn-ampm">上午</a>
    } else if (data.medAmNum == 0) {
      return <a onClick={(e) => {
        e.stopPropagation()
      }} className="btn-ampm-offline">上午(已满)</a>
    } else {
      return <a onClick={(e) => {
        e.stopPropagation()
      }} className="btn-ampm-offline">上午(停诊)</a>
    }
  }

  datePMBtn(data, name, corpName) {
    if (data.medPmNum > 0) {
      return <a onClick={(e) => this.toInfo(e, data, name, 2, corpName)}
                className="btn-ampm">下午</a>
    } else if (data.medPmNum == 0) {
      return <a onClick={(e) => {
        e.stopPropagation()
      }} className="btn-ampm-offline">下午(已满)</a>
    } else {
      return <a onClick={(e) => {
        e.stopPropagation()
      }} className="btn-ampm-offline">下午(停诊)</a>
    }
  }

  doctItem(data, i, name, corpName) {
    const amount = ((data.regAmount - 0) / 100).toFixed(2);
    return (
      <li className="date-list-item list-nowrap list-relative" key={i}>
        <div className="date-list-content">
          <img src="https://image.yuantutech.com/i4/cafad83e314e9fb646211d779686bf72-73-73.png"
               className="date-list-icon doctor-img-radius"/>
          <div>
            <div className="date-list-title txt-nowrap">{data.name || data.deptName}</div>
            <div className="date-list-value txt-nowrap">
              <span className="appoint-price">¥ {amount}</span>
              <div className="date-list-doctTech txt-nowrap">{data.doctTech}</div>
            </div>
          </div>
        </div>
        <div className="date-btn-group">
          {this.datePMBtn(data, name, corpName)}
          {this.dateAMBtn(data, name, corpName)}
        </div>
        {this.doctFlag(data)}
      </li>
    )
  }

  render() {
    const {data} = this.state;

    if (data) {
      const list = data[0].scheduleTypeVOList || [];
      return (
        <div>
          {list.map((item, i) => <div key={i}>
            <p className="select-appointment-title">{item.name}</p>
            <ul className="list-ord">
              {item.doctorVOList.map((z, i) => this.doctItem(z, i, item.name, data[0].corpName))}
            </ul>
          </div>)}
        </div>
      );
    }
    return <div className="notice">
      <span className="notice-icon icon-record"></span>
      <p>暂无排班</p>
    </div>
  }
}