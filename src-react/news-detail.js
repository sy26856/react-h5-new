'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import UserCenter from './module/UserCenter'
import Aolsee from './module/Aolsee'
import config from './config'
import hybridAPI from './lib/hybridAPI'
import Alert from './component/alert/alert'

import './news-detail.less'

export default class NewsDetail extends SmartNoBlockComponent {
  constructor(props) {
    super(props);
    let query = util.query();
    this.unionId = query.unionId || '';

    this.hideDownloadBar = specialConfig.hideDownloadBar.unionIds.indexOf(this.unionId) > -1;

    this.state = {
      unionId: query.unionId,
      id: query.id,
      isInYuantuApp: util.isInYuantuApp(),
      H5_DOMAIN: config.H5_DOMAIN,
      protocol: config.PROTOCOL,
      noDisplay: true,
      doctWraperFixed: false
    }
  }

  componentDidMount() {
    Aolsee.getNewsDetail(this.state.unionId, this.state.id)
      .subscribe(this)
      .fetch()
    this.initWindowScroll()
  }

  closeDownloadBar() {
    this.setState({
      noDisplay: true
    })
  }

  onSuccess(result) {
    this.initData(result);
  }

  onError() {
    UserCenter.getOldNewsDetail(this.state.unionId, this.state.id)
      .subscribe({
        onSuccess: (result) => this.initData(result),
        onError: (msg) => super.onError(msg)
      })
      .fetch()
  }

  initData(result) {
    this.setState({
      loading: false,
      success: true,
      title: result.data.title,
      time: result.data.publishTime,
      category: result.data.classifyName,
      doct: result.data.doct || null,
      content: result.data.content || "",
      noDisplay: result.data.unionId == 1029,
    })

    const titleDom = document.getElementsByTagName("title")[0];
    titleDom.innerText = result.data.title || "资讯详情";

    if (util.isInYuantuApp()) {
      hybridAPI.setTitle(result.data.title);
    }

    let title = result.data.title,
      text = result.data.summary,
      url = window.location.href,
      imageUrl = "https://image.yuantutech.com/user/0c306d9a190c1bcde2d8f9ad31e29810-300-300.jpg",
      isShowButton = true,
      isCallShare = false

    if ((result.success || result.success === "true") && util.isInYuantuApp()) {
      hybridAPI.share(title, text, url, imageUrl, isShowButton, isCallShare)
    } else {
      //Alert.show(result.msg)
    }
    // return new Hybrid("share", {title, text, url, imageUrl, isShowButton, isCallShare}).send()
    // if(result.success || result.success == "true"){
    //   // this.render(result.data);
    //   this.util.brige("share",{
    //     "isShowButton":true,
    //     "isCallShare":false , //是否立即唤醒分享
    //     "title": result.data.title,
    //     "text": result.data.summary,
    //     "url":window.location.href,
    //     "imageUrl": "https://image.yuantutech.com/user/0c306d9a190c1bcde2d8f9ad31e29810-300-300.jpg"
    //   }, function(e){
    //     // alert(JSON.stringify(e))
    //   }, function(e){
    //     // alert(JSON.stringify(e))
    //   }, 600000);
    // }else{
    //   this.util.alert(result.msg);
    // }
  }

  componentDidUpdate () {
    if( !this.doctWraperOffsetTop ) {
      const doctWraper = this.refs.doctWraper
      this.doctWraperOffsetTop = ( doctWraper && doctWraper.offsetTop ) || null
      this.doctWraperOffsetHeight = ( doctWraper && doctWraper.offsetHeight ) || null
    }
  }

  initWindowScroll () {
    window.onscroll = (e)=>{
      let elementScrollTop = 0
      , doctWraperOffsetTop = this.doctWraperOffsetTop
      elementScrollTop = document.body.scrollTop

      // console.log( doctWraperOffsetTop, elementScrollTop )
      if( !doctWraperOffsetTop ) return
      
      const { doctWraperFixed } = this.state

      if( elementScrollTop > ( doctWraperOffsetTop ) && !doctWraperFixed ) { // 两个判断是为了 防止多次 render 防抖
        this.setState({
          doctWraperFixed: true
        })
      } else if( elementScrollTop < ( doctWraperOffsetTop ) && doctWraperFixed ) {
        this.setState({
          doctWraperFixed: false
        })
      }
    }
  }

  render() {
    let { title, time, category, content, isInYuantuApp, protocol, H5_DOMAIN, noDisplay, doct, doctWraperFixed } = this.state;

    return (
      <div className="page">
        <div className="page-news-detail" id="J_NewsList" >
          <h1 id="J_Title" dangerouslySetInnerHTML={{__html: title}}></h1>

          <div className="sub">
            <span id="J_Time">{time}</span>
            <span className="category" id="J_Category">{category}</span>
          </div>
          {
          doct ? 
            <div>
              <div ref="doctWraper" className={ 'news-detail-doct_wraper' } >
                <div className="list-item ">
                  <span  className="icon-pic list-icon" style={{ backgroundImage: 'url('+ ( doct.doctLogo || 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/90e5757435f5c21c4cfc9d3483b7132a-174-174.png' ) +')' }}></span>
                  <div className="list-content">
                    <div className="list-title">{ doct.doctName }</div>
                    <div className="list-brief ">{ doct.deptName + ' ' + doct.doctProfe } </div>
                    <div className="list-brief ">{ doct.corpName }</div>
                  </div>
                  <div className="list-extra" >
                    <a href={ doct.doctUrl } className="news-detail-doct_link_detail btn btn-sm">医生详情</a>
                  </div>
                </div>
                {
                  doct.doctIntro ? 
                  <div>
                    <div className="news-detail-parting_line"></div>
                    <div className="news-detail-doct_detail">{ doct.doctIntro }</div>
                  </div>
                  : null
                }
              </div>
              <div onClick={()=>{ doctWraperFixed && ( window.location.href = doct.doctUrl ) }} className={ 'news-detail-doct_wraper_fixed '+ ( doctWraperFixed ?  'news-detail-doct_wraper_fixed_show' : '' ) } >
                <div className="list-item ">
                  <span  className="icon-pic list-icon" style={{ backgroundImage: 'url('+ ( doct.doctLogo || 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/90e5757435f5c21c4cfc9d3483b7132a-174-174.png' ) +')' }}></span>
                  <div className="list-content txt-arrowlink">
                    <div className="list-title">{ doct.doctName }</div>
                    <div className="list-brief ">{ doct.deptName + ' ' + doct.doctProfe } </div>
                    <div className="list-brief ">{ doct.corpName }</div>
                  </div>
                </div>
              </div>
            </div> : null
          }

          <div id="J_Content" className="content" dangerouslySetInnerHTML={{__html: content}}>

          </div>
        </div>
        <div id="J_DownloadBar" style={{display: isInYuantuApp || this.hideDownloadBar ? 'none' : 'block'}}>
          {
            <div>
              <div className="download-bar" data-spm="download">
                <a className="logo" href={protocol + H5_DOMAIN + "/tms/fb/app-download.html"}></a>
                <a className="info" href={protocol + H5_DOMAIN + "/tms/fb/app-download.html"}>
                  <h1>慧医</h1>
                  <p>居民健康信息服务平台</p>
                </a>
                <a className="ui-btn-lg ui-btn-primary"
                   href={protocol + H5_DOMAIN + "/tms/fb/app-download.html"}>查看更多</a>
                <i className="ui-icon-close-page" onClick={this.closeDownloadBar.bind(this)}></i>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}