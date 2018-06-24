'use strict'

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import TopMessage from './component/TopTips/TopMessage'
import {SmartNoBlockComponent, SmartBlockComponent} from './BaseComponent/index'
import Alert from './component/alert/alert'
import Modal from './component/modal/Modal'
import './report-29.less'
export default class Report29 extends SmartBlockComponent {
  constructor(props) {
    super(props)
    this.query = util.query();
    this.unionId = this.query.unionId || '';
    this.corpId = this.query.corpId || '';

    this.isShowPromptMsg = specialConfig.hideReportPromptMsg.unionIds.indexOf( this.unionId ) == -1
    this.isShowPromptMsgNoClick = specialConfig.showReportPromptMsgNoClick.unionIds.indexOf( this.unionId ) != -1
    if ( this.isShowPromptMsgNoClick ) {
      this.showPromptMsgNoClickTxt = specialConfig.showReportPromptMsgNoClick.msgUnionIds[ this.unionId ]
    }

    // this.title = this.query.title || '',
  
    this.state = {
      tabIndex: this.getTabIndex(),
      corpList:[],//可供选择的医院列表
      selectedCorp:'',//选中的医院
      isShow:false,//是否展开医院选择列表,默认不展开
      data:[],//报告单列表
      corpId:this.corpId?this.corpId:'',
      loading:true
    }
  
  }

  componentDidMount(){
    this.init()
  }

  init(){
    let {selectedCorp,tabIndex,corpId} = this.state
    let functionId
    //获取支持报告单的医院列表
    tabIndex == 0?functionId = 10:functionId = 11;
    UserCenter.getCorpList(functionId,this.unionId)
    .subscribe({
      onSuccess:result=>{ 
        if(result.success){
          let data = result.data.concat({name:'全部医院',corpId:'9999'})
            if(this.corpId){
              let corp={};
              corp = data.find((value,key)=>{
                  return value.corpId == this.corpId
              })

              //线上环境不会出现corp为undefined情况,uat放开了报告单配置
              if(!corp){
                let index = data.findIndex((value)=>{
                  return value.isStar === true
                })
                if(index != -1){
                  corp = data[index]
                }else{
                  corp = data[0]
                  }
                }
              this.setState({
                selectedCorp:corp.name,
                corpList:data,
                corpId:corp.corpId
              },()=>{
                this.sendReq(this.unionId,this.state.corpId,tabIndex)
              })
          }else{
            data.forEach((item)=>{
              if(item.isStar){
                selectedCorp = item.name
                corpId = item.corpId
              }else{
                selectedCorp = data[0].name
                corpId = data[0].corpId
              }
            })
            this.setState({
              corpList:data,
              selectedCorp,
              corpId,
            },()=>{
              this.sendReq(this.unionId,this.state.corpId,tabIndex)
            })
          }
      }
    },
      onError:result=>{
        Alert.show(result.msg)
      }
    })
    .fetch()
  }

  //点击展下拉列表选择医院
  select(){
    let {isShow} = this.state
    this.setState({
      isShow:!isShow,
    })
  }

  //选中医院
  isSelected(item){
    let {tabIndex,corpId} = this.state
    if(item.corpId != corpId){//说明选中另外一个
      this.setState({
        selectedCorp:item.name,
        corpId:item.corpId,
        isShow:false,
      },()=>{
        //选中医院后,重置刷新url
        delete this.query.corpId
        window.location.replace(util.flatStr('./report-29.html?',{
          ...this.query,
          corpId:item.corpId
        }))
      })
    }
  }

  getTabIndex() {
    var a
    try {
      a = +localStorage.getItem('tabIndex') // 前面用加号来将取出来的字符串转换成数字
    } catch (e) {
      a = 0;
    }
    return a ? a : 0; // 如果a是0，那么为否，返回值依旧是0。如果a是1，那么为真，返回值是a的原值
  }

  checkReport(event) {
    let {tabIndex} = this.state
    try {
      localStorage.setItem('tabIndex', '0')
    } catch (e) {}
    if(tabIndex != 0){//说明切换了报告单类型
      this.setState({
        tabIndex: 0,
        isShow:false
      },()=>{
        this.init()
      })
    }
  }

  imageReport(event) {
    let {tabIndex}=this.state
    try {
      localStorage.setItem('tabIndex', '1')
    } catch (e) {
    }
    if(tabIndex != 1){//说明切换了报告单类型
      this.setState({
        tabIndex: 1,
        isShow:false,
      },()=>{
        this.init()
      })
    }
  }

  toBind() {
    const urlInfo = {
      target: '_blank',
      unionId: this.unionId,
    };
    window.location.href = `./patient-list.html?${util.flat(urlInfo)}`;
  }

  sendReq(unionId,corpId,tabIndex) {
    // 判断当前的tab来选择是加载检查报告单数据还是影像报告单数据
    if(corpId == 9999){
      corpId = ''
    }
    if (!tabIndex) {
        UserCenter.getInspect(unionId, corpId).subscribe(this).fetch()
    } else {
        UserCenter.getPacs(unionId, corpId).subscribe(this).fetch()
    }
  }

  onSuccess(result) {
    let data = result.data.list;

    this.setState({
      success:true,
      loading:false,
      title:result.data.title,
      data: data.map((item) => {
        return {
          checkUpDate: item.checkUpDate || item.reportDate,
          corpId: item.corpId,
          corpName:item.corpName,
          patientName: item.patientName,
          repId: item.repId,
          inspectTypeName: item.inspectTypeName || item.checkItem,
          checkNo: item.checkNo,
          status: item.status,
          statusDes: item.statusDes,
          read: item.read
        }
      })
    })
  }

  sort(data) {
    var reportList = data;
    var reportMap = {}

    reportList.map((item) => {
      // 兼容检验报告和影像报告两种格式
      var checkUpDate = item.checkUpDate || item.reportDate
      var date = new Date(checkUpDate)
      var month = date.getMonth() + 1

      if (!reportMap[month]) {
        reportMap[month] = {
          checkUpDate: checkUpDate,
          date: checkUpDate ? util.dateFormat(date, "yyyy年MM月") : "无日期",
          checkItems: []
        }
      }

      reportMap[month].checkItems.push(
        util.vis({
          checkUpDate: checkUpDate,
          corpId: item.corpId,
          corpName:item.corpName,
          inspectTypeName: item.inspectTypeName || item.checkItem,
          patientName: item.patientName || "",
          read: item.read,
          status: item.status,
          statusDes: item.statusDes,
          repId: item.repId,// 检查报告单
          checkNo: item.checkNo// 影像报告单
        })
      )

    })

    reportList = util.forEach(
      reportMap, (item, key) => {
        return item
      }).sort((a, b) => {
      return b.checkUpDate - a.checkUpDate
    })

    return reportList;
  }

  renderTitle() {
    const {title} = this.state;
    return <div className="report-list-title">{this.state.title}</div>
  }

  notRead() {
    return (
      <div className="not-read"></div>
    );
  }

  reportStatus(item) {
    let {tabIndex,data} = this.state
    const statusColor = {
      "1": "#fd8f01",
      "2": "#429fff",
      "3": "#999"
    }
    return (
      <span style={{color: statusColor[item.status],position:'relative'}}>
            {item.statusDes}
             {!item.read ?
              <i className="isRead"></i>:null}
      </span>
    );
  }

  toReport(item) {
    let report = './report-detail-29.html?'

    window.location.href = `${report}${util.flat({
      corpId: item.corpId,
      unionId: this.unionId,
      repId: item.repId,
      checkNo: item.checkNo,
      target: "_blank"
    })}`;
  }
  
  //报告单内容渲染
  renderContent(){
    let {data} = this.state
    let finalData = this.sort(data)
    if (finalData.length == 0) {
      return <div>
        {this.renderTitle()}
        <div className="notice">
          <span className="notice-icon icon-record"></span>
          <p>未查找到该医院3个月内到报告单,可</p><p style={{textIndent:'2em'}}>筛选医院查看其它医院报告单</p>
        </div>
      </div>
    }
    return (
      <div>
        {this.renderTitle()}
        {
          finalData.map((item, index) => {
            return <div key={index}>
              <div>
                {
                  item.checkItems.map((item, index) => {
                    return <div key={index} className="panel" style={panelstyle} onClick={() => this.toReport(item)}>
                      <div className="left">{item.patientName}</div>
                      <div className="content">
                        <div className="inspectTypeName">{item.inspectTypeName}</div>
                        <div className="corpName">{item.corpName}</div>
                        <div className="checkUpDate">{item.checkUpDate ? util.dateFormat(new Date(item.checkUpDate), "yyyy/MM/dd hh:mm") : '无日期'}</div>
                      </div>
                      <div className="right">{this.reportStatus(item)}</div>
                    </div>
                  })
                }
              </div>
            </div>
          })
        }
      </div>
      )
  }

  render() {
    let {tabIndex,selectedCorp,corpList,isShow,corpId} = this.state
    return (
      <div className="report-29">
        {/* 头部tab导航 */}
        <div className="tab-nav">
          <div className="tab-nav-in">
            <ul>
              <li className={tabIndex == 0 ? "on" : ""}><a onClick={this.checkReport.bind(this)}>检验报告</a></li>
              <li className={tabIndex == 1 ? "on" : ""}><a onClick={this.imageReport.bind(this)}>影像报告</a></li>
            </ul>
            {/* 导航滚动条 */}
            <div className={`nav-roll-bar tab-index-${tabIndex}`}></div>
          </div>
        </div>
        {/* 选择医院nav */}
        <div className="corp-nav">
            <div onClick={()=>this.select()} className="selectedCorp">
              {selectedCorp}
            </div>
        </div>
        <Modal
            show={this.state.isShow}
            onCancel={() => this.setState({isShow: false})}
            position="bottom">
          <ul id="ul-corplist" ref="ul" style={ulstyle}>
              {corpList.map((item,key)=>{
                  return <li key={key} onClick={()=>this.isSelected(item)} style={listyle}>
                            {item.name}
                          </li>
                      })}
          </ul>
        </Modal>
        {selectedCorp == '全部医院'?
          <div className="all-tips" style={{margin: '5px 0px'}}>
            <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/3014deb745a04e169f64e4f08c9c808c-34-34.png"/>
            <span>若无您的报告单数据，请先筛选对应医院</span>
          </div>:null}
        {/* 内容区 */}
        <div>
          { this.isShowPromptMsgNoClick ? <TopMessage text={ this.showPromptMsgNoClickTxt } /> : null}
          { this.isShowPromptMsg ? <TopMessage onClick={() => this.toBind()} text="不显示未绑卡就诊人报告单，前往绑卡"/> : null}
          {this.renderContent()}
        </div>
      </div>
    )
  }
}

var ulstyle ={
  height:'200px',
  padding:'15px 0',
  overflowY:'scroll',
  WebkitOverflowScrolling: 'touch'
}
var listyle = {
  lineHeight:'35px',
  textAlign:'center',
  color:'#999'
}
var panelstyle={
  width: '90%',
  height: '107px',
  display:'flex',
	boxShadow: '-6px 0px 16px 0px rgba(159, 159, 159, 0.2)',
  borderRadius: '5px',
  margin:'15px auto',
}