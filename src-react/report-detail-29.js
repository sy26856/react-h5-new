'use strict'

import React from 'react'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'
//导入第三方图片预览组件
import WxImageViewer from 'react-wx-images-viewer'
import './report-detail-29.less'
export default class ReportDetailQD extends SmartNoBlockComponent {
  constructor(props) {
    super(props)
    this.query = util.query()
    console.log('从record列表带过来的参数',this.query)
    this.repId = this.query.repId // 检查报告单专有字段
    this.checkNo = this.query.checkNo // 影像报告专有字段
    this.corpId = this.query.corpId
    this.state = {
      loading: true,
    }
    if (!util.isLogin()) {
      util.goLogin()
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
    if(this.repId){
      //新需求,去除待采集状态
      let newStatusList = result.data.statusList
      let index = newStatusList.forEach((v,index)=>{
        if(v.status == 0){
          newStatusList.splice(index,1)
        }
      })
      result.data.statusList = newStatusList
      let {
        patientName,//患者名字
        inspectTypeName,//检查名称
        checkItem,
        corpName,
        checkUpDept,// 检查科室
        inspectDate, // 送检时间
        checkUpDoctor, // 检查医生
        checkUpDate, // 检查日期
        checkUpDetailList,
        checkResult,
        checkDesc,
        auditDoctName, // 检查医生
        checkNo,
        inspecDeptName,
        reportPictureUrl,//图片附件src
        resultTip,//检查结果提示
        canUnfoldedStatusList,
        statusList,
        reportDate,
        inspecDate
      } = result.data
      console.log('报告单详情',result.data)
      //新的产品要求去掉待采集状态
      const statusListLength = statusList ? statusList.length : 0;
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
        reportPictureUrl,//图片附件src
        resultTip,
        auditDoctName,
        checkNo,
      })) 
    }else if(this.checkNo){
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
  }

  render() {
    let {repId, checkNo} = this
    let bgcolor
    if(checkNo){
      bgcolor = {}
    }else{
      bgcolor = {backgroundColor:'#fff'}
    }
    return (
      <div className="report-detail-29" id="wrap_container" style={bgcolor}>
        {
          repId ? <div className="check-report">
              {/* 这里渲染检查报告单 */}
              <CheckReport state={this.state}/>
            </div> : ""

        }
        {
          checkNo ? <div className="image-report">
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
// 检查报告单头部
class CheckHeader extends React.Component {
  constructor(props) {
    super(props)
    this.data = props.state
    this.data.statusList = this.data.statusList.reverse()//翻转数组
    this.state = {
      open: false
    }
  }

  statusItem(item,index,statusList) {
    let iconUrl = "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f658b26f3d81f53019b21d827e682dec-24-24.png";
    return (
      <div className="report-info-item" key={"a" + item.status}>
        <div className="report-info-item-time">
          <div style={{fontSize: '13px', color: '#666',fontFamily:'Helvetica'}}>{util.dateFormat(item.time, "hh:mm")}</div>
          <div style={{fontSize: '12px', color: '#999',fontFamily:'Helvetica'}}>{util.dateFormat(item.time, "MM-dd")}</div>
        </div>
        <div style={{position:'relative',top:"12px"}}>
          <img className="status-item-icon" src={iconUrl}/>
        {index != statusList.length-1 || index=='openFalse' || statusList.length == 1?
          <div style={{width:'1px',height:'40px',backgroundColor:'#429fff',margin:'0 auto'}}></div>
            :<div style={{width:'1px',height:'40px',visibility:'hidden'}}></div>
        }
        </div>
        <div className="report-info-item-main">
          <div className="status-item-title">
            {item.statusDes}
          </div>
          <div className="status-item-main">{item.msg}</div>
        </div>
      </div>
    );
  }

  statusList(statusList, canUnfoldedStatusList) {
    if (statusList) {
      const {open} = this.state;
      const statusListFirst = statusList[0];
      //如果允许展开，默认显示statusFirst第一条
      if (canUnfoldedStatusList) {//是否允许展开
        if (open) {
          //展开后，按顺序显示
          return (
            <div className="report-info-panel">
              {
                statusList.map((item,index) => this.statusItem(item,index,statusList))
              }
              <div className="report-info-panel-on" onClick={() => this.setState({open: false})}>
                <img
                  src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/ac8ccd3b4f6464903c4452456c668b7e-32-18.png"
                />
              </div>
            </div>
          );
        }
        //open为false
        return (
          <div className="report-info-panel">
            {
              statusListFirst && this.statusItem(statusListFirst,'openFalse',statusList)
            }
            <div className="report-info-panel-off" onClick={() => this.setState({open: true})}>
              <img
                src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/ac8ccd3b4f6464903c4452456c668b7e-32-18.png"/>
            </div>
          </div>
        )
      }
      //全部显示
      return (
        <div className="report-info-panel" style={{marginBottom:'15px'}}>
          {statusList.map((z,index) => this.statusItem(z,index,statusList))}
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
      <div id="header">
        <div className="header">
          <div className="topLogo">
            <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/5ee7cb9009ea4e9b6cdf4f23c2d834fc-144-128.png" />
          </div>
          <div>
            <h1 className="inspectTypeName">{inspectTypeName}</h1>
            <p>
              就诊人: {patientName}
            </p>
            <p>
              {corpName + "  " + checkUpDept}
            </p>
          </div>
        </div>
        {this.statusList(statusList, canUnfoldedStatusList)}
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
    console.log('从父组件传过来的数据2',this.data)
  }
  main(checkUpDetailList) {
    //表格高度超过一屏,表头滚动吸顶
    let table = this.refs.table||null;
    let isFixe = table && table.scrollHeight > window.screen.height?'isFixe':'isStaic';
    let isShowRefRangeTd = checkUpDetailList.some(function(item){//是否显示参考值列
          return item.itemRefRange 
    })
    let isShowItemUnit = checkUpDetailList.some(function(item){//是否显示参考值列
          return item.itemUnit
    })
    return (
      <div>
        <div className="report-item-container">
          <table className="report-items" ref="table">
            <tbody>
            <tr className={`item head ${isFixe}`}>
              <td style={{fontSize:'14px'}}>检验项</td>
              <td style={{fontSize:'14px'}}>结果值</td>
              {isShowRefRangeTd?<td style={{fontSize:'14px'}}>参考值</td>:null}
              {isShowItemUnit?<td style={{fontSize:'14px'}}>单位</td>:null}
            </tr>
            {
              checkUpDetailList.map((item, index) => {
                item = util.vis({
                  viewItemMark: item.viewItemMark,//=1该项指标高于参考值;=-1低于参考值
                  itemName: item.itemName,//检查项目
                  itemAbbr: item.itemAbbr,
                  itemRealValue: item.itemRealValue,//检查结果
                  itemUnit: item.itemUnit||'/',
                  itemRefRange: item.itemRefRange || "无"//参考范围
                })
                let viewItemMark = parseInt(item.viewItemMark)
                return <tr key={index} className="item">
                  <td style={{paddingLeft:'8px'}}>{item.itemName}</td>
                  <td style={{fontFamily:'Helvetica'}}>{item.itemRealValue}
                    {
                      viewItemMark == 1 ?
                        <span className="high-icon">↑</span> : ""
                    }
                    {
                      viewItemMark == -1 ? <span className="low-icon">↓</span> : ""
                    }
                  </td>
                  {isShowRefRangeTd?<td style={{fontFamily:'Helvetica'}}>{item.itemRefRange}</td>:null}
                  {isShowItemUnit?<td style={{fontFamily:'Helvetica'}}>{item.itemUnit}</td>:null}
                </tr>
              })
            }
            </tbody>
          </table>
          <div className="tag-tips">
          注：高于参考值
          <span className="high-icon"> ↑</span>
          低于参考值
          <span className="low-icon">↓</span>
        </div>
        {this.data.resultTip?
          <div className="result-tips">
              <p>结果提示:</p>
              <p>{this.data.resultTip}</p>
          </div>:null
        }
        </div>
      </div>
    )
  }

  noData() {
    return <div className="notice report-detail-29" style={{marginTop: '80px'}}>
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
        <CheckHeader state={data}/>
        {checkUpDetailList.length > 0 ? this.main(checkUpDetailList) : this.noData()}
        {/* <OtherTypeReport/> */}
        {data.reportPictureUrl?<ReportAnnex data={data}/> :null}
      </div>
    )
  }
}
//影像报告单头部
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
        <div className="image-header">
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

//报告附件
class ReportAnnex extends React.Component {
  constructor(props) {
    super(props)
    this.pictureSrc = props.data.reportPictureUrl
    this.annexPicList = []
    this.annexPicList.push(this.pictureSrc)

    this.state = {
        index: 0,
        isOpen: false
    }
  }

  //点击回到图片列表页
  onClose = () =>{
    this.setState({
      isOpen: false
    })
  }

  //点击预览图片
  openViewer (index){
    this.setState({
      index,
      isOpen: true
    })
  }

  //渲染报告单附件列表
  renderAnnexPic(annexPicList){
      return(
        <div className="picList">          
            {annexPicList.map((item,index)=>{
                return <img key={index} src={item} onClick={()=>this.openViewer(index,annexPicList)}/>
              })
            }
      </div>)
  }

  render(){
    const {isOpen,index} = this.state
    return(
      <div>
          <div style={{width:'100%',height:'10px',backgroundColor:'#f0f0f0'}}></div>
          <div className="annexContent">
              <h2>报告附件:</h2>
              {this.renderAnnexPic(this.annexPicList)}
          </div>
          {isOpen?<WxImageViewer onClose={this.onClose} urls={this.annexPicList} index={index}/> : null}
      </div> 
    )
  }
}


//其他类型报告单(产品说先不加,后期再加)
// class OtherTypeReport extends React.Component {
//   constructor(props) {
//     super(props)
//   }

//   main(data) {
//     return (
//       <div>
//         <div className="report-item-container">
//           <table className="report-items">
//             <tbody>
//             <tr className="item head">
//               <td>突变点位(基因名称)</td>
//               <td>结果值</td>
//             </tr>
//             {
//               data.map((item,index) => {
//                 return <tr key={index} className="item">
//                   <td>{item.itemName}</td>
//                   <td>{item.itemRealValue}</td>
//                 </tr>
//               })
//             }
//             </tbody>
//           </table>
//         <div className="result-tips">
//             <p>结果提示:</p>
//             <p>未见明显异常(这里根据接口数据写活)。</p>
//         </div>
//         </div>
//       </div>
//     )
//   }
//   noData(){}
//   render() {
//     let data = this.data
//     return (
//       <div>
//         {data.length > 0 ? this.main(data) : this.noData()}
//       </div>
//     )
//   }
// }