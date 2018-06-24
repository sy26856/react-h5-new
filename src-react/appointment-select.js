import React from 'react';
import './appointment-select.less';
import SelectByDoctor from './component/selectByDoctor/SelectByDoctor';
import SelectByDate from './component/selectByDate/SelectByDate';
import Registration from './component/registration/Registration';
import hybridAPI from './lib/hybridAPI';
import util from './lib/util';

export default class AppointmentSelect extends React.Component {

  constructor(props) {
    super(props);
    const query = util.query();
    this.corpId = query.corpId;
    this.regMode = query.regMode;
    this.deptCode = query.deptCode;
    this.unionId = query.unionId;
    this.deptName = query.deptName || '';

    this.state = {
      active: 0,  //0按医生，1按日期
      panyu: true,
    };
  }

  componentDidMount() {
    const title = document.getElementsByTagName("title")[0];
    title.innerText = decodeURIComponent(this.deptName);
    if (util.isInYuantuApp()) {
      hybridAPI.setTitle(decodeURIComponent(this.deptName));
    }
  }

  selectByDoctor = () => {
    this.setState({
      active: 0
    });
  };

  selectByDate = () => {
    this.setState({
      active: 1
    })
  };

  isPanyu = (panyu) => {
    this.setState({
      panyu,
    });
  };

  selectBar() {
    const {active, panyu} = this.state;
    if (!panyu) {
      return (
        <div className="select-type-bar">
          <div className="select-type-item" onClick={this.selectByDoctor}>
            <span className={active == 0 ? 'select-type-active' : ''}>按医生预约</span>
          </div>
          <div className="select-type-item" onClick={this.selectByDate}>
            <span className={active == 1 ? 'select-type-active' : ''}>按日期预约</span>
          </div>
        </div>
      );
    }
    return null;
  }

  renderContainer() {
    const {active} = this.state;
    if (active == 0) {
      return <SelectByDoctor isPanyu = {this.isPanyu} />
    }
    return <SelectByDate />
  }

  render() {
    if (this.regMode == 1) {
      return (
        <div>
          {this.selectBar()}
          {this.renderContainer()}
        </div>
      );
    }
    return <Registration isPanyu = {this.isPanyu} />
  }
}
