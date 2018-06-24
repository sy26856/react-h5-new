import React, {PropTypes} from 'react';
import util from '../../lib/util';

import UserCenter from '../../module/UserCenter';
import SmartBlockComponent from '../../BaseComponent/SmartBlockComponent';
import Icon from '../icon/Icon';

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

export default class Registration extends SmartBlockComponent {

  static propTypes = {
    isPanyu: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.timer = null;
    const query = util.query();
    this.corpId = query.corpId;
    this.deptCode = query.deptCode || '';
    this.deptName = query.deptName || '';
    this.regMode = query.regMode;
    this.regType = query.regType;
    this.unionId = query.unionId;

    this.state = {
      loading: true,
      data: '',
      corpName: '',
      panyu: false,
      error: false,
      timeout: false,
    }
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    const dateStr = util.dateFormat(new Date(), 'yyyy-MM-dd');
    if (this.unionId == 60) {
      UserCenter.listScheduleinfoByDoct(
        this.corpId,
        this.deptCode,
        this.regMode,
        this.regType
      ).subscribe(this).fetch();
    } else {
      UserCenter.listScheduleinfoByDate(
        this.corpId,
        this.deptCode,
        this.regMode,
        dateStr,
        dateStr
      ).subscribe(this).fetch();
    }
  }

  onError(e) {
    if (e.resultCode == -100) {
      this.setState({
        success: true,
        timeout: true,
        error: true
      });
    } else {
      this.setState({
        success: true,
        error: true
      })
    }
  }

  onSuccess(result) {
    const data = this.unionId == 60 ? result.data : result.data[0];
    this.props.isPanyu && data && this.props.isPanyu(data.panYuMode);
    this.setState({
      loading: false,
      success: true,
      data,
      error: false,
      timeout: false,
      panyu: data ? data.panYuMode : '',
      corpName: data ? data.corpName : '',
    });
  }

  doctFlag(data) {
    if (data.medStatusDesc === '可挂号') {
      return <div className="select-doctor-flag">可挂号</div>
    } else {
      return data.medStatusDesc ? <div className="select-doctor-flag-offline">{data.medStatusDesc}</div> : null;
    }
  }

  toInfo(e, data, name, ampm, corpName) {
    let scheduleId;
    if(this.unionId == 29){//青岛需要上下午分开的排班
      if(ampm == 1){
        scheduleId = data.amScheduleId
      }else{
        scheduleId = data.pmScheduleId
      }
    }else{
      scheduleId = data.scheduleId
    }
    e.stopPropagation();
    const urlInfo = {
      corpId: this.corpId,
      doctCode: data.doctCode,
      medAmPm: ampm,
      unionId: this.unionId,
      scheduleId,//新增
      type: list[name],
      regType: data.regType,  //新增
      medDate: data.medDate,
      regAmount: data.regAmount,
      regMode: this.regMode,
      doctName: data.name || data.deptName,
      deptName: data.deptName || this.deptName,
      corpName,  //新增
      deptCode: data.deptCode || this.deptCode,
      target: '_blank'
    };
    if(this.unionId == 29){
      window.location.href = `./info-confirm-29.html?${util.flat(urlInfo)}`
    }else{
      window.location.href = `./info-confirm-2.html?${util.flat(urlInfo)}`
    }
  }

  toDoctOrDept(data, name) {
    if (data.name) {
      const urlInfo1 = {
        corpId: this.corpId,
        doctCode: data.doctCode,
        doctName: data.name,
        corpName: this.state.corpName,
        deptCode: data.deptCode || this.deptCode,
        regMode: this.regMode,
        unionId: this.unionId,
        target: '_blank'
      };
      window.location.href = `./doctor.html?${util.flat(urlInfo1)}`;
    } else {
      const urlInfo2 = {
        corpId: this.corpId,
        deptCode: data.deptCode || this.deptCode,
        deptName: data.deptName || this.deptName,
        corpName: this.state.corpName,
        regMode: this.regMode,
        type: list[name] || '',
        subRegType: data.subRegType,  //目前还没，要新增
        unionId: this.unionId,
        target: "_blank"
      };
      window.location.href = `./dept.html?${util.flat(urlInfo2)}`;
    }
  }

  dateAMBtn(data, name, corpName) {
    if (!isNaN(data.medAmNum)) {
      if (data.medAmNum > 0) {
        return <a onClick={(e) => this.toInfo(e, data, name, 1, corpName)}
                  className="btn-ampm">上午</a>
      } else if (data.medAmNum < 0) {
        return <a onClick={(e) => {
          e.stopPropagation()
        }} className="btn-ampm-offline">上午(停诊)</a>
      } else {
        return <a onClick={(e) => {
          e.stopPropagation()
        }} className="btn-ampm-offline">上午(已满)</a>
      }
    }
    return null;
  }

  datePMBtn(data, name, corpName) {
    if (!isNaN(data.medPmNum)) {
      if (data.medPmNum > 0) {
        return <a onClick={(e) => this.toInfo(e, data, name, 2, corpName)}
                  className="btn-ampm">下午</a>
      } else if (data.medPmNum < 0) {
        return <a onClick={(e) => {
          e.stopPropagation()
        }} className="btn-ampm-offline">下午(停诊)</a>
      } else {
        return <a onClick={(e) => {
          e.stopPropagation()
        }} className="btn-ampm-offline">下午(已满)</a>
      }
    }
    return null;
  }

  doctAvatar(data) {
    const avatarStyle = {
      float: "left",
      marginRight: "10px",
    };

    //医生姓名不存在时，显示科室图片
    if (!data.name) {
      /*return <img src="https://image.yuantutech.com/i4/063b002cdc3d530d2d4c8cedbbb50c50-116-116.png"
       className="date-list-icon doctor-img-radius"/>*/

      return <Icon url="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/6df445b910e7bd736c6d97e89a87a5a9-116-116.png"
                   style={avatarStyle} circle={true}/>
    }
    if (data.doctLogo) {
      //return <img src={data.doctLogo} className="date-list-icon doctor-img-radius" />
      return <Icon url={data.doctLogo} style={avatarStyle} circle={true}/>
    } else if (data.sex == '女') {
      //return <img src="https://image.yuantutech.com/i4/6734ebcc6fff0a02046b6f858b8174d1-116-116.png" className="date-list-icon doctor-img-radius" />
      return <Icon url="https://image.yuantutech.com/i4/6734ebcc6fff0a02046b6f858b8174d1-116-116.png"
                   style={avatarStyle}
                   circle={true}/>
    } else {
      //return <img src="https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png" className="date-list-icon doctor-img-radius" />
      return <Icon url="https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png"
                   style={avatarStyle}
                   circle={true}/>
    }
  }

  doctItem(data, i, name, corpName) {
    const {panyu} = this.state;
    const amount = data.regAmount ? ((data.regAmount - 0) / 100).toFixed(2) : 0;
    return (
      <li className="date-list-item list-nowrap list-relative" key={i}>
        <div className="date-list-content" onClick={() => this.toDoctOrDept(data, name)}>
          {this.doctAvatar(data)}
          <div>
            <div className="date-list-title txt-nowrap">{data.name || data.deptName}</div>
            <div className="date-list-value txt-nowrap">
              {!panyu && <span className="appoint-price">¥ {amount || 0}</span>}
              <div className="date-list-doctTech txt-nowrap">{data.doctTech}</div>
            </div>
          </div>
        </div>
        {
          !panyu && <div className="date-btn-group">
            {this.datePMBtn(data, name, corpName)}
            {this.dateAMBtn(data, name, corpName)}
          </div>
        }
        {this.doctFlag(data)}
      </li>
    )
  }

  render() {
    const {data, error, timeout} = this.state;

    if (error && timeout) {
      return (
        <div className="notice">
          <span className="notice-icon icon-load-error"></span>
          <p>获取医生列表超时，请刷新重试 </p>
          <button
            className="btn"
            style={{marginTop: '10px'}}
            onClick={() => this.getData()}
          >
            刷新
          </button>
        </div>
      );
    }

    if (error) {
      return <div className="ui-tips center">网络错误，请稍后再试</div>
    }

    if (data) {
      const list = data.scheduleTypeVOList || [];
      if (list.length > 0) {
        return (
          <div>
            {list.map((item, i) => <div key={i}>
              <p className="select-appointment-title">{item.name}</p>
              <ul className="list-ord">
                {item.doctorVOList.map((z, i) => this.doctItem(z, i, item.name, data.corpName))}
              </ul>
            </div>)}
          </div>
        );
      }
      return <div style={{overflow: 'hidden'}}>
        <div className="notice">
          <span className="notice-icon icon-no-appointment"></span>
          <p>抱歉，当前暂无排班</p>
        </div>
      </div>
    }
    return <div style={{overflow: 'hidden'}}>
      <div className="notice">
        <span className="notice-icon icon-no-appointment"></span>
        <p>抱歉，当前暂无排班</p>
      </div>
    </div>
  }
}