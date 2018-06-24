/*
 * @Author: saohui 
 * @Date: 2017-08-22 16:13:03 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-12 18:10:37
 */
import React, { Component, PropTypes } from 'react'
import util from '../../lib/util'
import hybridAPI from '../../lib/hybridAPI'
import './Cover.less'


/**
 * 医生主页、科室主页、医生简介封面
 * @export props = {
    children: => 内容区
          <div className="cover-title">刘治学</div>
          <div className="cover-brief ">副主任医师</div>
          <div className="cover-brief ">青岛市妇女儿童医院</div>
    ,isShare: => 是否可分享
    ,shareData: { => 分享内容（当可分享的时候，这个为必填）
      title:     => 标题
      ,text:     => 分享描述
      ,url:      => 分享链接
      ,imageUrl: => 分享的图片
    }
    ,logoImg: => logo 的链接
 * }
 * @class Cover
 * @extends {Component}
 */
export default class Cover extends Component {

  static propTypes = {
    isShare: PropTypes.bool
    ,shareData: PropTypes.object
    ,logoImg: PropTypes.string
  }


  constructor ( props ) {
    super( props )
    const { isShare, shareData } = this.props
    hybridAPI.share( util.translateHtmlToTxt( shareData.title || '' ), util.translateHtmlToTxt( shareData.text || '' ), shareData.url, shareData.imageUrl, true, false )
  }
  render () {
    const { children, isShare, shareData, logoImg } = this.props
    const isInYuantuApp = util.isInYuantuApp()
    , gtNativeVer = !util.version.lt( 3, 10, 0 )
    , isShowHeader = isInYuantuApp ? gtNativeVer : false
    
    return <div className="cover-header">
      { isShowHeader ? <div className="page-navbar">
        {/* <div className="back" onClick={() => {
            util.goBack()
          }}></div>
          <div onClick={() => {
            // ( title, text, url, imageUrl, isShowButton, isCallShare )
            hybridAPI.share( shareData.title || '', shareData.text || '', shareData.url, shareData.imageUrl, false, true )
          }} style={{ display: isShare ? '' : 'none' }} className="share"></div> */
          null}
      </div> : <div style={{ height: 30 }}></div> }
      <div className="cover-wrapper">
        <div className="cover-logo-container">
          <div className="cover-logo">
            <span style={{
              backgroundImage: 'url('+ logoImg +')'
            }}></span>
          </div>
        </div>
        <div className="cover-content">
          {/* <div className="cover-title">刘治学</div>
          <div className="cover-brief ">副主任医师</div>
          <div className="cover-brief ">青岛市妇女儿童医院</div> */
          children }
        </div>
      </div>
    </div>
  }
}