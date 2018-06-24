/*
 * @Author: saohui 
 * @Date: 2017-08-10 16:05:40 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-05-08 14:13:21
 */
import React from 'react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import Alert from './component/alert/alert'
import UserCenter from './module/UserCenter'
import Aolsee from './module/Aolsee'
import TabBar from './component/tabbar/TabBar'
import { Url } from 'url'
import './index.less'


export default class Index extends SmartBlockComponent {
  constructor ( props ) {
    super( props )
    
    const query = util.query()
    this.corpId = query.corpId
    if( !this.corpId ) {
      Alert.show('缺少 corpId', 2000 )
    }
    this.unionId = query.unionId || ''
    this.corpSelected = query.selected

    this.state = {
      ...this.state
      ,success: false
      ,loading: true,
      isShowTip:false,
      tipContent:''
    }
  }

  componentDidMount () {
    const { corpId, unionId } = this
    UserCenter.getCorpHome( corpId, unionId )
      .subscribe( this )
      .fetch()
    Aolsee.getCorpIndexNotice( unionId, corpId )
      .subscribe({
        onSuccess: ( result ) => {
          if (result.data.id) {
            this.setState({
              noticeTitle: result.data.title,
              noticeId: result.data.id
            })
          }
        }
      })
      .fetch()
  }
  
  onSuccess ( result ) {
    const data = result.data
    let headerImg = null
    , corpName = null
    , tag = null

    try {
      headerImg = result.data.banners ? result.data.banners[0].img : ""
      corpName = result.data.name
      tag = result.data.tags ? result.data.tags[0] : ""
    } catch (e) {
      console.log(e)
      console.log("数据错误")
    }
    // console.log( result )
 
    
    if( util.isInYuantuApp()) {
      hybridAPI.setTitle( corpName )
    } else {
      document.title = corpName
    }

    this.setState({
      loading: false,
      success: true,
      corpId: data.corpId || this.corpId,
      unionId: this.unionId,
      leafList: data.leafList,
      headerImg,
      corpName,
      tag,
      tags: data.tags,
      address: data.address,
      funcions: data.funcions,
      corpInfo: data.corpInfo,
      phone: data.corpPhone
    })

    const leafList = data.leafList

    if( !( leafList && leafList.length > 1 && !this.corpSelected ) ) {
      //提取村文本文件
      let div = document.createElement("div")
      div.innerHTML = data.corpInfo || corpName
      let corpInfo = div.innerText
      corpInfo = corpInfo.replace(/[\n\t]/g, "")
      // console.log(corpInfo)
      //分享医院首页
      hybridAPI.share( corpName, 
                       corpInfo.slice(0, 50), 
                       window.location.href, 
                       data.logo,
                       true,
                       false )
    }
  }

  handleSearch ( e ) {
    const isInYuantuApp = util.isInYuantuApp()
    , isGtVersion244 = isInYuantuApp && util.version.gt( 2, 4, 4 )

    //在慧医app中，&& 版本号大于2.4.4 使用APP的搜索
    if ( isInYuantuApp && isGtVersion244 ) {
      window.location.href = 'yuantuhuiyi://huiyi.app/search?'+ util.flat({
        corpId: this.corpId
        ,sourceId: 0
      })
    } else {
      window.location.href = './search.html?'+ util.flat({
        corpId: this.corpId
        ,unionId: this.unionId
      })
    }
  }



  /****** render 区域开始 ******/

  renderCorpInfo () {
    const { corpName, tags, address, phone, corpId, unionId, noticeId, noticeTitle, corpInfo } = this.state
    const isInYuantuApp = util.isInYuantuApp()
    , isShowPhone = isInYuantuApp && util.version.gt( 2, 4, 4 )
    // console.log( corpInfo ? 'txt-arrowlink' : '' )
    return <div className="corp-info">
        <ul>
          <li className="list-item">
            <a className={( corpInfo ? 'txt-arrowlink ' : '') +'list-link-wrapper'} href={ corpInfo ? ('./corp-info.html?'+ util.flat({
              corpId, unionId, target: '_blank'
            })) : 'javascript:;'}>
              <div className="list-content">
                <div className="list-title">
                  <h1>{ corpName }</h1>
                </div>
                <div className="list-brief ">{
                  tags ? tags.map(( tag, key ) => {
                    return <span key={ key } style={{ marginRight: 10 }}>{ tag }</span>
                  }) : null
                }</div>
              </div>
            </a>
          </li>
          {
            address || ( phone && isShowPhone ) ? <li className="list-item">
              <a className="list-link-wrapper" href={'./navigation.html?'+ util.flat({ 
                corpId, 
                target: '_blank'
              })}>
                <img src="//image.yuantutech.com/user/34ea1ac71867c8d9f947e4e86933c3db-44-60.png"  className="list-icon-sm address-icon"  />
                { address ? <div className="list-content">
                  <div className="list-title">{ address }</div>
                </div> : null }
                {( phone && isShowPhone ) ? <a href={'tel:'+ phone } className="tel-icon"></a> : null }
              </a>
            </li> : null
          }
          { noticeId ? <li className="list-item gonggao-list">
            <a className="list-link-wrapper gonggao-link-wrapper" href={'./news-detail.html?'+ util.flat({
              target: "_blank"
              ,unionId: unionId
              ,id: noticeId
            })}>
              <img src="//image.yuantutech.com/user/a30c6508046efb2d73a2ddd977b1f6b4-112-30.png" className="list-icon-sm gonggao-icon" />
              <div className="list-content gonggao-content">
                <div className="list-title">
                  <p className="gonggao-text">{ noticeTitle }</p>
                </div>
              </div>
            </a>
          </li> : null }
        </ul>
      </div>
  }
  renderCard () {
    let funcions = this.state.funcions || []

    return <div className="card-row2-wrapper">
      { funcions.map(( item, key ) => {
        let nativeScheme = util.isInYuantuApp() && item.nativeScheme
        , href =  nativeScheme || item.href || null
        let url = new Url()
        if( href ) {
          url.parse( href )
          url.search = ( url.query ? url.query +'&': '') + util.flat({
              corpId: this.corpId
              ,unionId: this.unionId
              ,title: 'none'
              ,target: '_blank'
            })
        }
        return <a key={ key } className="card-row2-item"
          onClick={ (e) => {
            if( !href && item.nativeScheme ) {
              Alert.show('H5 暂未开通，请到 App 中使用')
            } else if ( !href ) {
              Alert.show('未开通，尽情期待')
            }else if(item.isShowTip){
               this.setState({
                 isShowTip:true,
                 tipContent:item.tipContent,
                 href:href ? url.format() : null
               })
            }else{
              window.location.href = href ? url.format() : null
            }
          }}
        >
            <span className="card-row2-icon" style={{ backgroundImage: 'url("'+ item.icon +'")'}}></span>
            <div className="card-row2-inner">
              <span className="card-row2-title">{ item.title }</span>
              <span className="card-row2-des">{ item.subTitle }</span>
            </div>
            { !href ? <span className="card-row2-tag card-row2-tag--off-line"></span> : null }
            { item.newLand ? <span className="card-row2-tag card-row2-tag--new"></span> : null }
          </a>
      })}
      {
        funcions.length % 2 == 1 ? <a className="card-row2-item" >
            <div style={{ height: 44 }}></div>
          </a> : null
      }
    </div>
  }

  renderHeader () {
    return <header className="main-header search-wrapper">
        <div onClick={ this.handleSearch.bind( this )} className="search" style={{ borderRadius: 5 }}>
          <span className="search-icon icon-search"></span>
          <div className="search-text">搜索科室/医生快速预约挂号</div>
          <input type="text" className="search-input" />
          <span className="search-close"></span>
        </div>
      </header>
  }
  renderBody () {
    const { headerImg } = this.state
    
    return <section className="main-body">
        <div className="banner" style={{ backgroundImage: 'url("'+ headerImg +'")' }}></div>
        { this.renderCorpInfo() }
        <div className=" g-space"></div>
        { this.renderCard() }
        <div className=" g-space"></div>
        <div className=" g-space"></div>
      </section>
  }
  renderFooter () {
    return <TabBar />
  }

  renderCorpIndex () {
    return <div>
      { this.renderHeader() }
      { this.renderBody() }
      { this.renderFooter() }
    </div>
  }

  renderCorpSecect () {
    const { leafList, corpName, unionId } = this.state
    return <div>
      <p className="list-header">选择{ corpName }下属院区（机构）</p>
      <ul className="list-ord">
       { leafList.map(( item, key ) => {
            return <li className="list-item ">
              <a href={'?'+ util.flat({
                unionId
                ,corpId: item.corpId
                ,selected: 1
                ,target: '_blank'
              })} className="txt-arrowlink list-link-wrapper">
                <div className="list-content">
                  <div className="list-title">{ item.corpName }</div>
                  <div className="list-brief ">{ item.address }</div>
                </div>
              </a>
            </li>
        })}
      </ul>
    </div>
  }

  closeTip(){
    let {href} = this.state;
    this.setState({
      isShowTip:false
    })
    window.location.href = href
  }
  render () {
    const { leafList,isShowTip,tipContent } = this.state
    return <div className="index">
      { ( leafList && leafList.length > 1 && !this.corpSelected ) ? 
        this.renderCorpSecect() :
       this.renderCorpIndex() }
       <div style={{ height: 52 }}></div>
       {isShowTip?
          <div className="modal-mask ">
            <div className="modal-wrapper">
              <div className="modal">
                <div className="modal-title">温馨提示</div>
                <div className="modal-body ">
                  <div className="txt-insign">{tipContent}</div> 	
                </div>
                <div className="modal-footer">
                  <div className="modal-button-group-v">
                    <a  className="modal-button" onClick={this.closeTip.bind(this)} >确定</a>
                  </div>
                </div>
              </div>
            </div>
          </div>:''
        }
    </div>
  }
}
