import React, { PropTypes } from 'react';
import util from '../../lib/util';
import UserCenter from '../../module/UserCenter';
import SmartNoBlockComponent from '../../BaseComponent/SmartNoBlockComponent';
import './history-doctor.less';
import Icon from '../icon/Icon';
import {TMS_DOMAIN, PROTOCOL} from '../../config';

export default class HistoryDoctor extends SmartNoBlockComponent {

  static defaultProps = {
    unionId: '29',
  };

  static propTypes = {
    unionId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      result: []
    };
  }

  componentDidMount() {
    if (util.isLogin()) {
      UserCenter.getHistoryDoct(this.props.unionId).subscribe(this).fetch();
    }
  }

  onSuccess(result) {
    console.log(result);
    this.setState({
      loading: false,
      success: true,
      result: result.data
    });
  }

  onError() {
    return null;
  }
  renderError() {
    return null;
  }

  toDoct(data) {
    const urlInfo = {
      corpId: data.corpId,
      deptCode: data.deptCode,
      doctCode: data.doctCode,
      doctName: data.name,
      unionId: this.props.unionId,
      target: '_blank'
    };
    const url = `./doctor.html?${util.flat(urlInfo)}`;
    const tmsUrl = `${PROTOCOL}${TMS_DOMAIN}/tms/h5/transfer.php?transferKey=29&${util.flat(urlInfo)}`;
    window.location.href = util.isTMS() ? tmsUrl : url;

  };

  renderItem(data, i) {
    return (
      <div onClick={() => this.toDoct(data)} key={i} className="history-doctor-item" data-spm={i}>
        <div className="history-doctor-image">
          <Icon
            url={data.doctLogo ? data.doctLogo : 'https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png'}
            width="50px"
            height="50px"
          />
        </div>
        <div className="history-doctor-name">{data.name}</div>
        <div className="history-dept-name">{data.deptName}</div>
      </div>
    );
  }

  render() {
    const { result } = this.state;
    if (util.isLogin() && result.length > 0) {
      return (
        <div data-spm="history" className="panel g-space" style={{marginTop: '10px'}}>
          <div className="panel-title">曾挂号医生</div>
          <div className="history-doctor-container">
            {result.map((z, i) => this.renderItem(z, i))}
          </div>
        </div>
      );
    }
    return null;
  }
}