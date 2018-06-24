import React, {PropTypes} from 'react';
import './selectbydoctor.less';
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

export default class SelectByDoctor extends SmartBlockComponent {

  static propTypes = {
    data: PropTypes.object,
    isPanyu: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const query = util.query();
    this.corpId = query.corpId;
    this.regMode = query.regMode;
    this.regType = query.regType || '';
    this.deptCode = query.deptCode || '';
    this.deptName = query.deptName || '';
    this.unionId = query.unionId || '';
    this.timer = null;

    this.mount = true;
    this.state = {
      loading: true,
      data: null,
      corpName: '',
      error: false,
      timeout: false
    }
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    UserCenter.listScheduleinfoByDoct(this.corpId, this.deptCode, this.regMode, this.regType).subscribe(this).fetch();
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

  initData = (result) => {
    this.props.isPanyu && result.data && this.props.isPanyu(result.data.panYuMode);
    this.setState({
      success: true,
      loading: false,
      data: result.data,
      corpName: result.data ? result.data.corpName : '',
      error: false,
      timeout: false,
    });
  };

  onComplete() {
    this.mount && super.onComplete();
  }

  onSuccess(result) {
    this.mount && this.initData(result)
  }

  doctAvatar(data) {
    const avatarStyle = {
      display: "block",
      marginRight: "12px"
    };

    //医生姓名不存在时，显示科室图片
    if (!data.name) {
      /*return <img src="https://image.yuantutech.com/i4/063b002cdc3d530d2d4c8cedbbb50c50-116-116.png"
       className="list-icon-lg doctor-img-radius"/>*/
      return <Icon url="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/6df445b910e7bd736c6d97e89a87a5a9-116-116.png"
                   width="58px"
                   height="58px"
                   style={avatarStyle}
                   circle={true}/>
    }
    if (data.doctLogo) {
      //return <img src={data.doctLogo} className="list-icon-lg doctor-img-radius"/>
      return <Icon url={data.doctLogo} width="58px" height="58px" style={avatarStyle} circle={true}/>
    } else if (data.sex == '女') {
      /*return <img src="https://image.yuantutech.com/i4/6734ebcc6fff0a02046b6f858b8174d1-116-116.png"
       className="list-icon-lg doctor-img-radius"/>*/
      return <Icon url="https://image.yuantutech.com/i4/6734ebcc6fff0a02046b6f858b8174d1-116-116.png"
                   width="58px"
                   height="58px"
                   circle={true}
                   style={avatarStyle}/>
    } else {
      /*return <img src="https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png"
       className="list-icon-lg doctor-img-radius"/>*/
      return <Icon url="https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png"
                   width="58px"
                   height="58px"
                   circle={true}
                   style={avatarStyle}/>
    }
  }

  doctFlag(data) {
    if (data.medStatusDesc === '可预约') {
      return <div className="select-doctor-flag">可预约</div>
    } else {
      return data.medStatusDesc ? <div className="select-doctor-flag-offline">{data.medStatusDesc}</div> : null;
    }
  }

  toDoctOrDept(data, name) {
    if (data.name) {
      const urlInfo1 = {
        corpName: this.state.corpName || '',
        unionId: this.unionId,
        doctName: data.name,
        corpId: this.corpId,
        doctCode: data.doctCode,
        deptCode: data.deptCode || this.deptCode,
        regMode: this.regMode,
        target: '_blank'
      };
      window.location.href = `./doctor.html?${util.flat(urlInfo1)}`;
    } else {
      const urlInfo2 = {
        corpName: this.state.corpName || '',
        corpId: this.corpId,
        unionId: this.unionId,
        deptCode: data.deptCode || this.deptCode,
        deptName: data.deptName || this.deptName,
        regMode: this.regMode,
        type: list[name] || '',
        subRegType: data.subRegType,  //目前还没，要新增
        target: "_blank"
      };
      window.location.href = `./dept.html?${util.flat(urlInfo2)}`;
    }
  }

  doctItem(data, i, name) {
    return (
      <li className="list-item list-nowrap list-relative" onClick={() => this.toDoctOrDept(data, name)} key={i}>
        {this.doctAvatar(data)}
        <div className="list-content">
          <div className="list-title txt-nowrap" style={{marginRight: '50px'}}>{data.name || data.deptName}</div>
          <div className="list-brief txt-nowrap">{data.doctTech}</div>
          <div className="list-brief txt-nowrap">擅长：{data.doctSpec || '无'}</div>
        </div>
        {this.doctFlag(data)}
      </li>
    );
  }

  noMsg() {
    return (
      <div className="notice">
        <span className="notice-icon icon-no-appointment"/>
        <p>抱歉，当前暂无排班</p>
      </div>
    );
  }

  doctList() {
    const {data} = this.state;
    const list = data.scheduleTypeVOList || [];
    if (list.length > 0) {
      return (
        <div>
          {list.map((item, i) => <div key={i}>
            <p className="select-appointment-title">{item.name}</p>
            <ul className="list-ord">
              {item.doctorVOList.map((z, i) => this.doctItem(z, i, item.name))}
            </ul>
          </div>)}
        </div>
      );
    }
    return this.noMsg();
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
      return (
        <div>
          {this.doctList()}
        </div>
      );
    }
    return <div style={{overflow: 'hidden'}}>
      {this.noMsg()}
    </div>;
  }
}