import React, {
  PropTypes
} from 'react';
import UserCenter from '../../module/UserCenter';
import util from '../../lib/util';
import SmartBlockComponent from '../../BaseComponent/SmartBlockComponent';
import Alert from '../../component/alert/alert';
import './paiban.less';


const REG_TYPE_ENUMS = {
  '1': '普通'
  , '2': '专家'
  , '3': '名医'
  , '4': '急诊'
  , '5': '便民'
  , '6': '视频'
  , '12': '特需'
  , '13': '专科'
  , '14': '义诊'
}

export default class Paiban extends SmartBlockComponent {

  static propTypes = {
    corpId: PropTypes.string,
    title: PropTypes.string,
    corpName: PropTypes.string,
    deptCode: PropTypes.string,
    deptName: PropTypes.string,
    doctCode: PropTypes.string,
    doctName: PropTypes.string,
    regMode: PropTypes.string,  //1预约 2挂号
    type: PropTypes.string,
    subRegType: PropTypes.string,
    getRegType: PropTypes.func,

    isHideTitle: PropTypes.bool // true 显示总面板并且有内边框，否则相反
  };

  constructor(props) {
    super(props);
    const query = util.query();
    this.unionId = query.unionId;
    this.state = {
      result: {},
      loading: false,
      success: true,
      error: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    const {
      corpId,
      deptCode,
      doctCode,
      type,
      subRegType,
      title
    } = this.props;
    if (title == '科室排班') {
      UserCenter.getSchedule(corpId, deptCode, doctCode, (type || ''), subRegType).subscribe(this).fetch();
    } else {
      UserCenter.getSchedule(corpId, deptCode, doctCode).subscribe(this).fetch();
    }
  }

  onSuccess(result) {
    this.setState({
      result: result.data,
      loading: false,
      success: true,
      error: false,
    });
    let regType = '', subRegType = '';
    try {
      regType = result.data.schdule[0].dataVo[0].data[0].regType;
      subRegType = result.data.schdule[0].dataVo[0].data[0].subRegType;
    } catch (e) {
      console.log(e);
    }
    this.props.getRegType && this.props.getRegType(regType || '', subRegType || '');
  }

  onError() {
    this.setState({
      error: true
    });
    Alert.show("网络超时，请刷新重试");
  }

  //未来几天的日期
  getEmptyDates(startDate, length) {
    const dates = [];
    const dayOfWeekList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const weekAlias = ["今天", "明天", "后天"];

    //startDate = startDate || new Date();
    startDate = new Date();
    length = length || 7;

    for (let i = 0; i < length; i++) {
      let date = new Date(startDate);
      let d = new Date(date.setDate(date.getDate() + i))
      dates.push({
        date: util.dateFormat(d, "MM-dd"),
        week: weekAlias[i] || dayOfWeekList[d.getDay()]
      });
    }

    return dates;
  }

  getUrl(value, date) {
    const { result } = this.state;
    const {
      corpId,
      deptCode,
      doctCode,
      corpName,
      doctName,
      deptName
    } = this.props;
    const urlInfo = doctName ? {
      corpId,
      unionId: this.unionId,
      doctCode: doctCode || '',
      medAmPm: value.medAmPm,
      scheduleId: value.scheduleId,
      type: value.type,
      regType: value.regType,
      medDate: date,
      regAmount: value.regAmount,
      regMode: value.regMode,
      doctName: doctName || '',
      deptName: value.deptName,
      corpName: corpName || result.doct.corpName,
      deptCode,
      target: "_blank"
    } : {
        corpId,
        unionId: this.unionId,
        doctCode: doctCode || '',
        medAmPm: value.medAmPm,
        scheduleId: value.scheduleId,
        type: value.type,
        regType: value.regType,
        medDate: date,
        regAmount: value.regAmount,
        regMode: value.regMode,
        //doctName: doctName || '',
        deptName: value.deptName,
        doctName: deptName,
        corpName: corpName || result.doct.corpName,
        deptCode,
        target: "_blank"
      };
    if(value.regType=='6'){
      const href = `patient-audio.html?${util.flat(urlInfo)}`;
      return href;
    }
    const href = this.unionId == 29 ? `info-confirm-29.html?${util.flat(urlInfo)}` : `info-confirm-2.html?${util.flat(urlInfo)}`;
    return href;
  }

  toReg(value, date) {
    const href = this.getUrl(value, date);
    window.location.href = href;
  }

  //判断显示哪个预约/挂号块
  getShowItem(data, date) {
    date = date.replace(/-/g, '/');
    const {
      title,
      regMode,
      subRegType
    } = this.props;
    if (title === '科室排班') {
      if (data && data.data) {
        //今天的话，显示挂号。如果不是今天，全部显示预约
        if (util.isToday(date)) {
          const resultDept = data.data.filter(z => {
            return z.subRegType == subRegType && z.regMode == 2
          });
          return resultDept[0] || null;
        }
        const resultDept = data.data.filter(z => {
          return z.subRegType == subRegType && z.regMode == 1
        });
        return resultDept[0] || null;
      }
    } else {
      if (data && data.data) {
        if (util.isToday(date)) {
          const resultDoct = data.data.filter(z => {
            return z.regMode == 2
          });
          return resultDoct[0] || null;
        }
        const resultDoct = data.data.filter(z => {
          return z.regMode == 1
        });
        return resultDoct[0] || null;
      }
    }
    return null;
  }

  item(item, i, AM_PM) {
    if (item && item.dataVo) {
      const data = item.dataVo.filter(z => z.medAmPm == AM_PM)[0];
      const itemValue = this.getShowItem(data, item.date);
      if (itemValue && itemValue.restnum > 0) {
        const money = itemValue.regAmount && (itemValue.regAmount / 100 - 0).toFixed(2);
        return (
          <td onClick={() => this.toReg(itemValue, item.date)} key={i}
            className="rostering-had">
            <div>{REG_TYPE_ENUMS[itemValue.regType]}</div>
            <div>
              <span className="txt-size-sm">¥ {money}</span>
            </div>
          </td>
        );
      } else if (itemValue && itemValue.restnum == 0) {
        return <td key={i} className="rostering-full">已满</td>;
      } else if (itemValue && itemValue.restnum < 0) {
        return <td key={i} className="rostering-full">停诊</td>;
      } else {
        return <td key={i}></td>
      }

    }
    return <td key={i}></td>;
  }

  headItem(today, len) {
    const weekList = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekAlias = ['今天', '明天', '后天'];
    const length = len || 7;
    const result = [];
    result.push(<th key={9999} className="th-head"></th>);
    //today = today || new Date();
    today = new Date();
    for (let i = 0; i < length; i++) {
      const temp = new Date(today);
      const date = new Date(temp.setDate(temp.getDate() + i));
      result.push(
        <th key={i}>
          <div>{weekAlias[i] || weekList[date.getDay()]}</div>
          <div>{util.dateFormat(date, "MM-dd")}</div>
        </th>
      );
    }
    return result;
  }

  getTitleDate() {
    const today = new Date();
    const nextDay = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 7);

    const tmonth = today.getMonth() + 1 > 9 ? today.getMonth() + 1 : '0' + (today.getMonth() + 1);
    const nmonth = nextDay.getMonth() + 1 > 9 ? nextDay.getMonth() + 1 : '0' + (nextDay.getMonth() + 1);
    const tdate = today.getDate() > 9 ? today.getDate() : '0' + today.getDate();
    const ndate = nextDay.getDate() > 9 ? nextDay.getDate() : '0' + nextDay.getDate();
    return `${tmonth}月${tdate}日 - ${nmonth}月${ndate}日`
  }

  render() {
    //const schdule = this.state.result.schdule || [];
    const DATE_LENGTH = 8;
    const {
      today,
      schdule
    } = this.state.result;

    const schduleDate = this.getEmptyDates(today, 8);
    let schduleMap = {};
    schdule && schdule.map((item) => {
      schduleMap[item.date.replace(/\d+\-/, "")] = item; //item.data;
    });

    if (this.state.error) {
      return <div>
        <div className="ui-tips center">获取排班超时，请刷新后重试</div>
        <button
          className="btn"
          style={{ margin: 'auto', display: 'block' }}
          onClick={() => this.getData()}
        >
          刷新
        </button>
      </div>
    }

    const { isHideTitle } = this.props

    return (
      <div className="panel">
        {!isHideTitle ? <div className="panel-title">{this.props.title}</div> : null}
        <div className={!isHideTitle ? 'table-rostering' : ''}>
          {/* { !isHideTitle ? <div className="table-title">{this.getTitleDate()}</div> : null } */}
          <div className="table-wrapper scheduling-scroll">
            <table className="table table-fixed">
              <tbody>
                <tr>
                  {this.headItem(today, DATE_LENGTH)}
                </tr>
                <tr>
                  <th>上午</th>
                  {schduleDate.map((item, i) => this.item(schduleMap[item.date], i, '1'))}
                </tr>
                <tr>
                  <th>下午</th>
                  {schduleDate.map((item, i) => this.item(schduleMap[item.date], i, '2'))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}