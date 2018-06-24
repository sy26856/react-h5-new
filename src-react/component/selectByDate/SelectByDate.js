import React, {PropTypes} from 'react';
import util from '../../lib/util';
import './selectbydate.less';
import UserCenter from '../../module/UserCenter';
import SmartBlockComponent from '../../BaseComponent/SmartBlockComponent';
import Icon from '../icon/Icon';

const dateArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
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
    this.unionId = query.unionId || '';
    this.deptCode = query.deptCode || '';
    this.deptName = query.deptName || '';
    this.regMode = query.regMode;
    this.unionId = query.unionId || '';

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 1000 * 60 * 60 * 24);

    const defaultDayStr = util.dateFormat(tomorrow, 'yyyy-MM-dd');

    this.mount = true;
    this.state = {
      error: false,
      timeout: false,
      loading: true,
      selectDay: defaultDayStr,
      selectData: null,
      corpName: '',
    }
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentDidMount() {
    this.getData();
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

  getData() {
    UserCenter.listScheduleinfoByDate(this.corpId, this.deptCode, this.regMode).subscribe(this).fetch();
  }

  initData = (result) => {
    const selectData = result.data ? result.data.filter(z => z.date === this.state.selectDay)[0] : null;
    this.setState({
      loading: false,
      success: true,
      result: result.data,
      selectData,
      error: false,
      timeout: false,
    });
  };

  onComplete() {
    this.mount && super.onComplete();
  }

  onSuccess(result) {
    this.mount && this.initData(result);
  }

  selectDay(day) {
    const dateStr = util.dateFormat(day, 'yyyy-MM-dd');
    const {result} = this.state;
    const selectData = result ? result.filter(z => z.date === dateStr)[0] : null;

    this.setState({
      selectDay: dateStr,
      selectData,
    });
  }

  datePicker() {
    const {selectDay} = this.state;
    const date = new Date();
    const days = [];

    for (let i = 1; i < 8; i++) {
      //未来七天的某一天
      const theDay = new Date(date.getTime() + 1000 * 60 * 60 * 24 * i);
      const dateStr = util.dateFormat(theDay, 'yyyy-MM-dd');

      days.push(
        <div key={i} className="select-date-item" onClick={() => this.selectDay(theDay)}>
          <div className="select-date-item-container">
            <div className="select-date-item-title">{i == 1 ? '明天' : dateArr[theDay.getDay()]}</div>
            <div className={`select-date-item-value ${selectDay === dateStr ? 'select-date-item-active' : ''}`}>
              {theDay.getDate()}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="select-date-bar">
        {days.map(z => z)}
      </div>
    );
  }

  doctFlag(data) {
    if (data.medStatusDesc === '可预约') {
      return <div className="select-doctor-flag">可预约</div>
    } else {
      return data.medStatusDesc ? <div className="select-doctor-flag-offline">{data.medStatusDesc}</div> : null;
    }
  }

  toInfo(e, data, name, ampm, corpName) {
    e.stopPropagation();
    const urlInfo = {
      corpId: this.corpId,
      doctCode: data.doctCode,
      unionId: this.unionId,
      medAmPm: ampm,
      scheduleId: data.scheduleId,  //新增
      type: list[name],
      regType: data.regType,  //新增
      medDate: data.medDate,
      regAmount: data.regAmount,
      regMode: this.regMode,
      doctName: data.name || data.deptName,
      deptName: data.deptName || this.deptName,
      corpName,  //新增
      deptCode: data.deptCode,
      target: '_blank'
    };
    if(this.unionId == 29){
      window.location.href = `./info-confirm-29.html?${util.flat(urlInfo)}`
    }else{
      window.location.href = `./info-confirm-2.html?${util.flat(urlInfo)}`
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

  toDoctOrDept(data, name) {
    if (data.name) {
      const urlInfo1 = {
        corpId: this.corpId,
        doctCode: data.doctCode,
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
        regMode: this.regMode,
        type: list[name] || '',
        unionId: this.unionId,
        subRegType: data.subRegType,  //目前还没，要新增
        target: "_blank"
      };
      window.location.href = `./dept.html?${util.flat(urlInfo2)}`;
    }
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
      return <Icon url="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/6df445b910e7bd736c6d97e89a87a5a9-116-116.png" style={avatarStyle} circle={true} />
    }
    if (data.doctLogo) {
      //return <img src={data.doctLogo} className="date-list-icon doctor-img-radius"/>
      return <Icon url={data.doctLogo} style={avatarStyle} circle={true} />
    } else if (data.sex == '女') {
      /*return <img src="https://image.yuantutech.com/i4/6734ebcc6fff0a02046b6f858b8174d1-116-116.png"
                  className="date-list-icon doctor-img-radius"/>*/
      return <Icon url="https://image.yuantutech.com/i4/6734ebcc6fff0a02046b6f858b8174d1-116-116.png" style={avatarStyle} circle={true} />
    } else {
      /*return <img src="https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png"
                  className="date-list-icon doctor-img-radius"/>*/
      return <Icon url="https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png" style={avatarStyle} circle={true} />
    }
  }

  doctItem(data, i, name, corpName) {
    const amount = ((data.regAmount - 0) / 100).toFixed(2);
    return (
      <li className="date-list-item list-nowrap list-relative" key={i}>
        <div className="date-list-content" onClick={() => this.toDoctOrDept(data, name)}>
          {this.doctAvatar(data)}
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

  doctList() {
    const {selectData} = this.state;
    if (selectData) {
      const list = selectData.scheduleTypeVOList || [];
      if (list.length > 0) {
        return (
          <div>
            {list.map((item, i) => <div key={i}>
              <p className="select-appointment-title">{item.name}</p>
              <ul className="list-ord">
                {item.doctorVOList.map((z, i) => this.doctItem(z, i, item.name, selectData.corpName))}
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
    return <div className="notice">
      <span className="notice-icon icon-record"></span>
      <p>暂无排班</p>
    </div>
  }

  render() {
    const {error, timeout} = this.state;

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

    return (
      <div>
        {this.datePicker()}
        {this.doctList()}
      </div>
    );
  }
}