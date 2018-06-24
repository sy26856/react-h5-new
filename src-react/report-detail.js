'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'

import './report-detail.less'

const allStatusList = [
  {
    status: 0,
    statusDes: "待采集"
  },
  {
    status: 1,
    statusDes: "已送检"
  },
  {
    status: 2,
    statusDes: "正在检验"
  },
  {
    status: 3,
    statusDes: "检验完成"
  }
];

const mockData = [
  {
    time: 1482681600000,
    status: 0,
    statusDes: "待采集",
    msg: "王磊蕾已审核,您可在自助机设备打印报告"
  },
  {
    time: 1482681600000,
    status: 1,
    statusDes: "已送检",
    msg: "测试mock数据"
  },
  {
    time: 1482681600000,
    status: 2,
    statusDes: "2333",
    msg: "测试mock数据"
  },
  {
    time: 1482681600000,
    status: 3,
    statusDes: "432",
    msg: "测试mock数据"
  }
];

export default class ReportDetail extends SmartNoBlockComponent {
  constructor(props) {
    super(props)
    this.query = util.query()
    this.repId = this.query.repId // 检查报告单专有字段
    this.checkNo = this.query.checkNo // 影像报告专有字段
    this.corpId = this.query.corpId
    this.state = {
      loading: true
    }

    if (!util.isLogin()) {
      util.goLogin()  
    }
    if(this.unionId == 29){
      location.replace(util.flatStr('./report-29-detail.html?',{
      ...query
      }))
    }
  }

  componentDidMount() {
    if (this.repId) {
      UserCenter.getMyInspectDetail(this.repId, this.corpId)
        .subscribe(this)
        .fetch()
    } else if (this.checkNo) {
      UserCenter.getPacsDetail(this.checkNo, this.corpId)
        .subscribe(this)
        .fetch()
    } else {
      this.setState({
        loading: true,
        success: false
      })
    }
  }

  renderError() {
    return (
      <div className="notice">
        <span className="notice-icon icon-record"></span>
        <p>没有查询到报告单</p>
      </div>
    )
  }

  onSuccess(result) {
    let {
      patientName,
      inspectTypeName,
      checkItem,
      corpName,
      checkUpDept,// 检查科室
      inspectDate, // 送检时间
      checkUpDoctor, // 检查医生
      checkUpDate, // 结果时间
      checkUpDetailList,
      checkResult,
      checkDesc,
      auditDoctName, // 检查医生
      checkNo,
      inspecDeptName,
      canUnfoldedStatusList,
      statusList,
      reportDate,
      inspecDate
    } = result.data

    const statusListLength = statusList ? statusList.length : 0;
    if (statusList) {
      statusList.forEach((item, index) => {
        if (item) {
          item.iconStatus = 1;  //展示空心勾
        }
        if (item.status != 3 && index == statusListLength - 1) {
          item.iconStatus = 2;  //展示实心数字
        }
        if (item.status == 3) {
          item.iconStatus = 3;  //展示实心勾
        }
      });
    }

    this.setState(util.vis({
      loading: false,
      success: true,
      patientName,
      inspectTypeName: inspectTypeName || checkItem,
      canUnfoldedStatusList,
      corpName,
      checkUpDept: checkUpDept || inspecDeptName,
      inspectDate: inspectDate || inspecDate,
      checkUpDate: checkUpDate || reportDate,
      checkUpDoctor: checkUpDoctor || auditDoctName,
      checkUpDetailList,
      checkResult: checkResult || "无",
      checkDesc: checkDesc || "无",
      statusList,
      auditDoctName,
      checkNo
    }))

  }

  render() {
    let {repId, checkNo} = this
    return (
      <div className="report-detail">
        {
          repId ? <div className="check-report">
              {/* 这里渲染检查报告单 */}
              <CheckReport state={this.state}/>
            </div> : ""

        }
        {
          checkNo ? <div>
              {/* 这里渲染影像报告单 */}
              <ImageReport state={this.state}/>
            </div> : ""
        }
        {
          !repId && !checkNo ? <div>
              {/* 如果两种报告单的id都没有传进来 */}
              <div className="notice">
                <span className="notice-icon icon-record"></span>
                <p>没有查询到报告单</p>
              </div>
            </div> : ""
        }
      </div>
    )
  }
}
// 两种报告单能通用的头部
class Header extends React.Component {
  constructor(props) {
    super(props)
    this.data = props.state
    this.state = {
      open: false
    }
  }

  statusItem(item) {
    let iconUrl = "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f658b26f3d81f53019b21d827e682dec-24-24.png";
    let iconNum = 1;

    if (item.iconStatus == 1) {
      iconUrl = "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f658b26f3d81f53019b21d827e682dec-24-24.png";
    }
    if (item.iconStatus == 2) {
      iconUrl = "";
      console.log(item.status)
      switch (item.status) {
        case 0:
          iconNum = 1;
          break;
        case 1:
          iconNum = 2;
          break;
        case 2:
          iconNum = 3;
          break;
        default:
          iconNum = 1;
          break;
      }
    }
    if (item.iconStatus == 3) {
      iconUrl = "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/9a9c4288fd8e3bf6fccdec8cafb0ef89-24-24.png"
    }

    const numStyle = {
      backgroundColor: '#76acf8',
      color: '#fff',
      fontSize: "12px"
    };

    return (
      <div className="report-info-item" key={"a" + item.status}>
        <div className="report-info-item-time">
          <div style={{fontSize: '13px', color: '#666'}}>{util.dateFormat(item.time, "hh:mm")}</div>
          <div>{util.dateFormat(item.time, "yyyy-MM-dd")}</div>
        </div>
        <div className="report-info-item-main">
          <div className="status-item-title">
            {
              iconUrl ?
                <span className="status-item-icon" style={{backgroundImage: `url(${iconUrl})`}}/> :
                <span className="status-item-icon" style={numStyle}>{iconNum}</span>
            }
            {item.statusDes}
          </div>
          <div className="status-item-main">{item.msg}</div>
        </div>
      </div>
    );
  }

  notFinshedItem(item, index) {
    return (
      <div className="report-info-item" key={"b" + index}>
        <div className="report-info-item-time">
          <div style={{fontSize: '13px', color: '#666'}}>-</div>
          <div>-</div>
        </div>
        <div className="report-info-item-main">
          <div className="status-item-title-off">
            <span
              className="status-item-icon"
              style={{backgroundImage: "url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/26b3c43f475b736bd5217cdc3b8eaf3f-24-24.png)"}}
            />
            {item.statusDes}
          </div>
        </div>
      </div>
    );
  }

  statusList(statusList, canUnfoldedStatusList) {
    if (statusList) {
      const {open} = this.state;

      const statusListLast = statusList[statusList.length - 1];


      let notFinshedList = JSON.parse(JSON.stringify(allStatusList));

      for (let i = 0; i < statusList.length; i++) {
        for (let j = 0; j < allStatusList.length; j++) {
          if (statusList[i].status == allStatusList[j].status) {
            notFinshedList[j] = null;
          }
        }
      }
      notFinshedList = notFinshedList.filter(z => z && z);

      //如果允许展开，默认显示statusList最后一条
      if (canUnfoldedStatusList) {
        if (open) {
          //展开后，上半部分显示已完成的，下半部分显示未完成的
          return (
            <div className="report-info-panel">
              {
                statusList.map(item => this.statusItem(item))
              }
              {
                notFinshedList.map((item, index) => this.notFinshedItem(item, index))
              }
              <div className="report-info-panel-on" onClick={() => this.setState({open: false})}>
                <img
                  src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/955a035d8d0497f57453f153b0812805-21-12.png"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="report-info-panel">
            {
              statusListLast && this.statusItem(statusListLast)
            }
            <div className="report-info-panel-off" onClick={() => this.setState({open: true})}>
              <img
                src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/955a035d8d0497f57453f153b0812805-21-12.png"/>
            </div>
          </div>
        )
      }
      return (
        <div className="report-info-panel">
          {statusList.map((z) => this.statusItem(z))}
        </div>
      );
    }
    return null;
  }

  render() {
    let {
      patientName,
      inspectTypeName,
      corpName,
      checkUpDept,
      inspectDate,
      canUnfoldedStatusList,
      statusList,
      checkUpDoctor,
      checkUpDate,
      checkUpDetailList
    } = this.data

    return (
      <div>
        <div className="header">
          <h1>{inspectTypeName}</h1>
          <p>
            就诊人: {patientName}
          </p>
          <p>
            {corpName + "  " + checkUpDept}
          </p>
        </div>

        {this.statusList(statusList, canUnfoldedStatusList)}

        {/*
         <div className="sub-info">
         <div className="info-block">
         <div className="title">送检时间</div>
         <div className="text">{util.dateFormat(inspectDate, "yy.MM.dd hh:mm")}</div>
         </div>
         <div className="info-block">
         <div className="title">检查医生</div>
         <div className="text">{checkUpDoctor}</div>
         </div>
         <div className="info-block">
         <div className="title">结果时间</div>
         <div className="text">{util.dateFormat(checkUpDate, "yy.MM.dd hh:mm")}</div>
         </div>
         <div className="clear"></div>
         </div>
         */}
      </div>
    )
  }
}

// 影像报告单
class ImageReport extends React.Component {
  constructor(props) {
    super(props)
    this.data = props.state
  }

  render() {
    let data = this.data
    let checkDesc = data.checkDesc.split("；").join("；<br />")
    let checkResult = data.checkResult.split("；").join("；<br />")
    let checkNo = data.checkNo
    let corpName = data.corpName
    let auditDoctName = data.auditDoctName
    return (
      <div className="image-report">
        <Header state={data}/>
        <div className="image-report-info-block">
          <ul className="list-ord">
            <li className="list-item ">
              <div className="list-content">
                <div className="list-title">检查所见</div>
                <div className="list-brief" dangerouslySetInnerHTML={{__html: checkDesc}}></div>
              </div>
            </li>
          </ul>
        </div>
        <div className="image-report-info-block">
          <ul className="list-ord">
            <li className="list-item ">
              <div className="list-content">
                <div className="list-title">检查结果</div>
                <div className="list-brief" dangerouslySetInnerHTML={{__html: checkResult}}></div>
              </div>
            </li>
          </ul>
        </div>
        <div className="image-report-info-block">
          <div className="content">
            <ul className="list-ord">
              <li className="list-item  list-item-noborder">
                <div className="list-brief-title">检查号：</div>
                <div className="list-content txt-nowrap">{checkNo}</div>
              </li>
              <li className="list-item  list-item-noborder">
                <div className="list-brief-title">来源：</div>
                <div className="list-content txt-nowrap">{corpName}</div>
              </li>
              <li className="list-item  list-item-noborder">
                <div className="list-brief-title">审核医生：</div>
                <div className="list-content txt-nowrap">{auditDoctName}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

// 检查报告单
class CheckReport extends React.Component {
  constructor(props) {
    super(props)
    this.data = props.state
  }

  main(checkUpDetailList) {
    return (
      <div>
        <div className="tag-tips">
          <span className="high-icon">↑</span>
          高于参考值
          <span className="low-icon">↓</span>
          低于参考值
        </div>
        <div className="report-item-container">
          <table className="report-items">
            <tbody>
            <tr className="item head">
              <td className="firest">检查项目</td>
              <td className="second">结果</td>
              <td className="last">参考值</td>
            </tr>
            {
              checkUpDetailList.map((item, index) => {
                item = util.vis({
                  viewItemMark: item.viewItemMark,
                  itemName: item.itemName,
                  itemAbbr: item.itemAbbr,
                  itemRealValue: item.itemRealValue,
                  itemUnit: item.itemUnit,
                  itemRefRange: item.itemRefRange || "无"
                })
                let viewItemMark = parseInt(item.viewItemMark)
                let highClass = viewItemMark == 1 ? "high" : ""
                let lowClass = viewItemMark == -1 ? "low" : ""
                return <tr key={index} className={"item " + highClass + " " + lowClass}>
                  <td>{item.itemName}</td>
                  <td>{item.itemRealValue + item.itemUnit}
                    {
                      viewItemMark == 1 ?
                        <span className="high-icon">↑</span> : ""
                    }
                    {
                      viewItemMark == -1 ? <span className="low.icon">↓</span> : ""
                    }
                  </td>
                  <td>
                    {item.itemRefRange}
                  </td>

                </tr>
              })
            }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  noData() {
    return <div className="notice" style={{marginTop: '80px'}}>
      <span className="notice-icon icon-record" style={{backgroundImage: 'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/daf49447398df64ad8e08bbddaffca8d-120-120.png)'}} />
      <p>检查报告将在</p>
      <p>检验完成后显示</p>
    </div>
  }

  render() {
    let data = this.data
    let checkUpDetailList = data.checkUpDetailList || []
    return (
      <div>
        <Header state={data}/>
        {checkUpDetailList.length > 0 ? this.main(checkUpDetailList) : this.noData()}
      </div>
    )
  }
}

