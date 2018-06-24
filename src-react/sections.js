import React from 'react';
import util from './lib/util';
import Alert from './component/alert/alert'
import UserCenter from './module/UserCenter';
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index';
import HybridAPI from './lib/hybridAPI';
import './sections.less';
import TopTips from './component/TopTips/TopTips';
import SearchBar from './component/searchbar/SearchBar';

export default class Sections extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.type = query.type || '';
    this.corpId = query.corpId;
    this.regMode = query.regMode;
    this.unionId = query.unionId;

    this.timer1 = null;
    this.timer2 = null;
    this.state = {
      error: false,
      timeout: false,
      regType: 1,
      loading: true,
      success: false,
      multiDept: null,
      deptOutParams: [],
      focus: false,
      active: '',
      rightRow: [],
      lastClick: '',
      corp: {},
      toptipsHeight: '21px',
      isConfig:true,//是否配置 预约和挂号功能  当两者都无配置时才为 false
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

  componentDidMount() {
    if (util.isInYuantuApp() && util.getPlatform() === 'android') {
      HybridAPI.banRefresh();
    }
    util.isInYuantuApp() && HybridAPI.setTitle('选择科室');

    this.getData();
  }

  getData() {
    UserCenter.getMultiDeptsList2(
      this.corpId,
      this.regMode,
      this.unionId == 60 ? this.state.regType : ''
    ).subscribe(this).fetch();
  }

  componentWillUnmount() {
    clearTimeout(this.timer1);
    clearTimeout(this.timer2);
  }

  onSuccess(result) {
    const data = result.data;
    const deptParams = data.multiDeptOutParams.deptOutParams || [];
    //支付宝城市服务特殊处理,该医院未配置预约以及挂号,不展示科室;否则往下走流程
    //'[1,2,3]'
    let corpFunction_arr,isConfig=true,arr=[];
    if(data.corp.corpFunction){
      corpFunction_arr = data.corp.corpFunction.substr(1,data.corp.corpFunction.length-2).split(',');//字符串格式数组转换成数组
      for(let i =0,length = corpFunction_arr.length-1;i<=length;i++){
        let val = corpFunction_arr[i].trim()
        if( val==1 || val==2){
          arr.push(val)
        }
      } 
      arr.length==0?isConfig=false:isConfig=true;
    }

    const deptOutParams = data.multiDeptOutParams.multiDept == 1 ? deptParams.filter(z => z.children && z.children.length > 0) : deptParams;
    // const deptOutParams = data.multiDeptOutParams.deptOutParams;
    let rightRow = (data.multiDeptOutParams.multiDept == 1 && deptOutParams.length > 0) ? deptOutParams[0].children : [];
    rightRow = rightRow.filter(z => z.deptName);

    this.setState({
      active: deptOutParams && deptOutParams.length > 0 ? deptOutParams[0].deptCode : '',
      loading: false,
      success: true,
      multiDept: data.multiDeptOutParams.multiDept,
      deptOutParams,  //获取到的全部数据
      result: deptOutParams, //根据搜索结果改变的数据
      rightRow,
      corp: data.corp,
      error: false,
      isConfig,
      timeout: false
    });
  }

  myFocus = () => {
    this.setState({
      focus: true,
    });
    this.timer1 = setTimeout(() => {
      this.refs.input.focus();
    }, 0);
  };

  myBlur = (e) => {
    //阻止冒泡
    e.stopPropagation();
    this.setState({
      focus: false,
    });
    this.refs.input.value = '';
    this.timer2 = setTimeout(() => {
      if (this.refs.list) {
        this.refs.list.scrollTop = 0;
      }
    }, 0);
    this.searchText('');
  };

  searchText(value) {
    const {deptOutParams, multiDept} = this.state;
    const inputValue = value, resultRow = [];

    //不是很好的深拷贝办法。
    const temp = JSON.parse(JSON.stringify(deptOutParams));

    let deptType = '';
    multiDept == 0 ? deptType = 'deptName' : deptType = 'bigDeptName';

    temp.forEach((data, i) => {
      if (data[deptType].indexOf(inputValue) > -1 || data.deptPY.indexOf(inputValue) > -1 || data.deptSimplePY.indexOf(inputValue) > -1) {
        resultRow.push(data);
      } else {
        if (data.children) {
          data.children = data.children.filter(item =>
            (item.deptName && (item.deptName.indexOf(inputValue) > -1 || item.deptPY.indexOf(inputValue) > -1 || item.deptSimplePY.indexOf(inputValue) > -1))
          );
          data.children.length > 0 && resultRow.push(data);
        } else {
          data.children = [];
        }
      }

    });
    const rightRow = resultRow.length > 0 && resultRow[0].children ? resultRow[0].children.filter(z => z.deptName) : [];
    const active = resultRow[0] && resultRow[0].deptCode;
    this.setState({
      result: resultRow,
      rightRow: rightRow,
      active,
    });
  }

  search() {
    const {focus} = this.state;
    return (
      <div className="search-container">
        <TopTips
          corpId={this.corpId}
          tipsKey={this.regMode == 1 ? 'multiDeptsList1' : 'multiDeptsList2'}
          getHeight={(height) => this.setTopTipsHeight(height)}
        />
        <SearchBar
          placeholder="搜索科室，支持中文/拼音/首字母检索"
          onChange={(z) => this.searchText(z.target.value)}
          throttle={1000}
        />
      </div>
    );
  }

  selectDept(item) {
    const {result} = this.state;
    let rightRow = [];
    for (let i = 0; i < result.length; i++) {
      if (item.deptCode == result[i].deptCode) {
        rightRow = result[i].children || [];
        break;
      }
    }
    rightRow = rightRow.filter(z => z.deptName);
    this.setState({
      active: item.deptCode,
      rightRow,
    });
  }


  mainItem(z, i) {
    const {lastClick} = this.state;
    return (
      <a key={i}
         className={`list-item ${lastClick == z.deptCode ? 'menu-item-action' : ''}`}
         onClick={(e) => this.lastClick(e, z)}>
        <div className="list-content">{z.deptName}</div>
      </a>
    );
  }

  leftItem(z, i) {
    const {active} = this.state;
    return (
      <a onClick={() => this.selectDept(z, i)} key={i}
         className={`list-item ${active == z.deptCode ? 'menu-item-action' : ''}`}>
        <div className="list-content">{z.bigDeptName}</div>
      </a>
    )
  }

  lastClick(e, data) {
    e.preventDefault();
    const urlInfo = {
      deptCode: data.deptCode,
      //type: this.type,  新预约挂号流程后修改
      corpId: this.corpId,
      deptName: data.deptName,
      parentDeptCode: data.parentDeptCode,
      regMode: this.regMode,
      regType: this.state.regType,
      unionId: this.unionId,
      target: '_blank',
    };
    const {corp} = this.state;
    this.setState({
      lastClick: data.deptCode,
    });

    // const nextPage = corp.scheduleRule == 2 ? './select-doctor.html' : './select-scheduling.html';
    // const nextPage = this.regMode == 1 ? 'appointment-select.html' : 'reg-select.html';
    window.location.href = `./appointment-select.html?${util.flat(urlInfo)}`;
  }

  rightItem(z, i) {
    const {lastClick} = this.state;
    return (
      <a key={i}
         className={`list-item ${lastClick == z.deptCode ? 'menu-item-action' : ''}`}
         onClick={(e) => this.lastClick(e, z)}>
        <div className="list-content">{z.deptName}</div>
      </a>
    );
  }

  noDataItem() {
    return (
      <div className="list-item">
        <div className="list-content no-data-text">暂无科室排班</div>
      </div>
    );
  }

  renderContainer() {
    const {multiDept, result, rightRow} = this.state;

    if (multiDept == 0) {
      return (
        <div className="touch-overflow">
          {this.renderTab()}
          <div className="menu-item menu-item-only" ref="list">
            <div className="list-ord">
              {result.map((z, i) => this.mainItem(z, i))}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{height: '100%'}}>
          {this.renderTab()}
          <div className="menu touch-overflow">
            <div className="menu-item menu-item-senior" ref="list">
              <div className="list-ord">
                {result.map((z, i) => this.leftItem(z, i))}
              </div>
            </div>
            <div className="menu-item menu-item-junior">
              <div className="list-ord">
                {rightRow.length > 0 ? rightRow.map((z, i) => this.rightItem(z, i)) : this.noDataItem()}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  renderTab() {
    const {regType} = this.state;
    if (this.unionId == 60) {
      return (
        <div
          className="tabs-wrapper"
          style={{
            borderBottom: 'none',
          }}
        >
          <div className="tabs">
            <div className={`tabs-item ${regType == 1 ? 'tabs-item-action' : ''}`} onClick={this.normalAppointment}>
              <a className="tabs-item-inner" style={{padding: '10px 0'}}>普通科室</a>
            </div>
            <div className={`tabs-item ${regType == 2 ? 'tabs-item-action' : ''}` } onClick={this.expertAppointment}>
              <a className="tabs-item-inner" style={{padding: '10px 0'}}>专家科室</a>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  normalAppointment = () => {
    //普通预约挂号
    UserCenter.getMultiDeptsList2(this.corpId, this.regMode, 1).subscribe(this).fetch();
    this.setState({
      regType: 1,
    });
  };

  expertAppointment = () => {
    //专家预约挂号
    UserCenter.getMultiDeptsList2(this.corpId, this.regMode, 2).subscribe(this).fetch();
    this.setState({
      regType: 2,
    });
  };

  render() {
    const {multiDept, result, rightRow, error, timeout,isConfig} = this.state;

    if(!isConfig){
      return (
        <div className="notice" style={{marginTop:'160px'}}>
          <span className="notice-icon icon-record"></span>
          <p>该医院暂未配置预约和挂号功能</p>
        </div>
      )
    }

    if (error && timeout) {
      return <div className="notice">
        <span className="notice-icon icon-load-error"></span>
        <p>获取科室列表超时，请刷新重试</p>
        <button
          className="btn"
          style={{marginTop: '10px'}}
          onClick={() => this.getData()}
        >
          刷新
        </button>
      </div>
    }

    if (error) {
      return <div className="ui-tips center">网络错误，请稍后再试</div>
    }

    if (result.length > 0) {
      if (multiDept == 0) {
        return (
          <div>
            {this.search()}
            {this.renderContainer()}
          </div>
        );
      } else {
        return (
          <div className="menu-wrapper sections-page">
            {this.search()}
            {this.renderContainer()}
          </div>
        );
      }
    }
    return (
      <div className="menu-wrapper sections-page">
        {this.search()}
        {this.renderTab()}
        <div className="notice">
          <span className="notice-icon icon-o-search"></span>
          <p>抱歉，没有找到相关排班科室</p>
          <p>请改变搜索条件重新搜索</p>
        </div>
      </div>
    );
  }
  
}
