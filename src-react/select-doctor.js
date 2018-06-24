import React from 'react';
import UserCenter from './module/UserCenter';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import util from './lib/util';
import './select-doctor.less';

export default class SelectDoctor extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.corpId = query.corpId || '';
    this.type = query.type || '';
    this.deptCode = query.deptCode || '';
    this.deptName = query.deptName || '';
    this.parentDeptCode = query.parentDeptCode || '';
    this.id = query.id;
    this.state = {
      loading: false,
      data: null,
    };
  }

  componentDidMount() {
    UserCenter.getDoctorList(this.corpId, this.deptCode, this.type, this.id).subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      success: true,
      loading: false,
      data: result.data,
    });
    console.log(result);
  }

  getScheduleUrl(data) {
    const params = {
      doctCode: data.doctCode,
      type: this.type,
      corpId: this.corpId,
      deptCode: this.deptCode,
      deptName: this.deptName,
      parentDeptCode: this.parentDeptCode,
      id: this.id,
      target: '_blank'
    };
    return `select-scheduling.html?${util.flat(params)}`;
  }

  doctorItem(data, i) {
    return (
      <li className="list-item select-doctor-item" key={i}>
        <a href={ this.getScheduleUrl(data) } className="txt-arrowlink list-link-wrapper">
          <div className="list-content">
            <div className="list-title">{data.doctName}</div>
            <div className="list-brief ">{data.doctTech}</div>
          </div>
        </a>
      </li>
    );
  }

  renderNoData() {
    return (
      <div className="no-data-container">
        <i></i>
        <p className="no-data-msg">暂无排班医生</p>
      </div>
    );
  }

  render() {
    const {data} = this.state;
    return (
      <div>
        {
          data.length > 0 ? <ul className="list-ord">
            {data.map((z, i) => this.doctorItem(z, i))}
          </ul> : this.renderNoData()
        }
      </div>
    );
  }
}