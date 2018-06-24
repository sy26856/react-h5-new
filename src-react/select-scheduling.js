import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import './select-scheduling.less';

export default class SelectScheduling extends SmartBlockComponent {

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			success: false,
			result: {},
		};
		// type, deptCode, parentDeptCode, doctCode, id
		const query = util.query();
		this.corpId = query.corpId;
		this.type = query.type;
		this.deptCode = query.deptCode;
		this.parentDeptCode = query.parentDeptCode;
		this.doctCode = query.doctCode;
		this.regMode = query.regMode;
		this.id = query.id;
	}

	componentDidMount() {
		UserCenter.getScheduleInfoNew(this.corpId, this.type, this.deptCode, this.parentDeptCode, this.doctCode, this.id)
			.subscribe(this).fetch();
	}

	onSuccess(result) {
		console.log(result);
		this.setState({
			loading: false,
			success: true,
			result: result.data,
		});
	}

	doctorList(data, i) {
		return (
			<div key={i} className="doctor-list">
        <div className="rili-tag">{data.date}</div>
        {data.data.map((z, i) => this.doctorItem(z, i))}
      </div>
		);
	}

	detailUrl(data) {
		const url = data.asDoc ? `doctor.html?${util.flat({
        corpId: this.corpId,
        doctCode: data.doctCode,
        deptCode: data.deptCode,
        regMode: this.regMode,
        target: "_blank"
      })}` : `dept.html?${util.flat({
        corpId: this.corpId, 
        deptCode: data.deptCode,
        deptName: data.deptName || '',
        regMode: this.regMode,
        type: this.type || '',
        subRegType: data.subRegType,
        target: "_blank"
      })}`;
		return url;
	}

	doctorItem(data, i) {
		return (
			<div key={i} className="ui-form">
        <div className="reservation-item ui-border-radius">
          <a
            style={{overflow: 'hidden'}}
            href={this.detailUrl(data)}
            className="ui-form-item ui-form-item-show ui-border-b ui-form-item-link"
          >

            <div className="doctor-dept-name">
              <span className="doctor-dept-value">{data.doctName || data.deptName}</span> <span className="doct-Tech"></span>
            </div>
            <div className="item-text"></div>
            <div className="ui-list-action">{data.asDoc ? '医生详情' : '科室详情'}</div>
          </a>
          {data.listSchedule && data.listSchedule.map((z, i) => this.listSchedule(z, i, data, data.listSchedule.length))}
        </div>
      </div>
		);
	}

	getInfoUrl(data, parentData) {
		const {
			corpInfo
		} = this.state.result;
		const area = query.unionId == 29?'info-confirm-29.html':'info-confirm-2.html';
		const href = data.restnum > 0 ? `${area}?${util.flat({
        corpId: this.corpId,
        doctCode: parentData.doctCode,
        deptCode: parentData.deptCode,
        medAmPm: data.medAmPm,
        scheduleId: data.scheduleId,
        regType: data.regType,
        medDate: parentData.medDate,
        regAmount: data.regAmount,
        regMode: data.regMode,
        doctName: parentData.doctName,
        deptName: parentData.deptName,
        corpName: corpInfo.corpName,
        target: "_blank"
      })}` : null;
		const obj = {
			href,
		};
		return href ? obj : {};
	}

	listSchedule(data, i, parentData, length) {
		return (
			<a
        key={i}
        className={`ui-form-item  ui-form-item-show ${length - 1 > i ? 'ui-border-b' : null} ${data.restnum > 0 ? 'ui-form-item-link' : ''}`}
        {...this.getInfoUrl(data, parentData)}
      >
        <label htmlFor="#">
          {data.medAmPm == 1 ? '上午' : '下午'}
        </label>
        <div className="item-text">{data.regAmount / 100}元</div>
        <div className="ui-txt-info">
          {data.restnum > 0 ? "有号" : data.restnum == 0 ? "约满" : "停诊"}
        </div>
      </a>
		);
	}

	noData() {
		return (
			<section className="ui-notice">
        <i></i>
        <p>没有排班信息</p>
      </section>
		)
	}

	render() {
		const {
			schedules
		} = this.state.result;
		return (
			<div className="page-select-doctor page wait select-scheduling">
        {
          schedules.length > 0
            ? <div>
              {schedules.map((z, i) => this.doctorList(z, i))}
            </div>
            : this.noData()
        }
      </div>
		);
	}
}