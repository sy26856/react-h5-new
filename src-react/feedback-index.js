import React from 'react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import {Swiper, Slide} from 'react-dynamic-swiper'
import 'react-dynamic-swiper/lib/styles.css'
import Aolsee from './module/Aolsee'
import Ticket from './module/Ticket'
import util from './lib/util'
import Alert from './component/alert/alert'
import './feedback-index.less'
import UserCenter from './module/UserCenter'
import './component/swipe/swiper.less'
import { setTimeout } from 'core-js/library/web/timers';

class Swipe extends React.Component {

  static propTypes = {
    banners: React.PropTypes.array,
  }

  item(data, i) {
    const url = data.imgUrl + (data.imgUrl.indexOf('?') > -1 ? '&' : '?') + 'target=_blank'
    return (
      <Slide key={i} className="swiper-img-box">
        <a>
          <img src={data.imgUrl}/>
        </a>
      </Slide>
    )
  }

  render() {
    const {banners} = this.props
    const result = banners.filter(z => z)
    if (banners.length > 0) {
      return (
        <Swiper
          swiperOptions={{slidesPerView: 'auto', loop: true, autoplay: 5000, autoplayDisableOnInteraction: false}}
          pagination={true}
          navigation={false}
        >
          {
            result.map((z, i) => this.item(z, i))
          }
        </Swiper>
      )
    }
    return (
      <div className="swiper-empty-box">
        <img src="https://image.yuantutech.com/i4/b2bfb00af68aa5566ae3de988bd8b454-750-388.png"/>
      </div>
    )
  }
}

export default class FeedBackIndex extends SmartBlockComponent {

  constructor(props) {
    super(props)
    const query = util.query()
    this.unionId = query.unionId || ''

    this.state = {
      productList: null,
      issueList: null,
      banners: [],
      active: null,
      loading: true,
      id:''
    }
  }
  componentDidMount () {
    const _this = this
    //获取用户userId
      if( util.isLogin() ) {
        Ticket.getUserInfo()
          .subscribe({
            onSuccess(result){
                  _this.init(result.data.id)
                },
                onError(result){
                  Alert.show(result.msg)
                }
                
          })
          .fetch()
      }else{
          util.goLogin()
      }
  }
  async init(id) {    
    try {
      const feedBackUid = localStorage.getItem("feedBackUid")
      console.log(id)
      Aolsee.findAppFeedbackAd(this.unionId, feedBackUid || '',id).subscribe(this).fetch()
      //localStorage.setItem("feedBackUid", "0")
      const productList = await Ticket.getIssueProductList(this.unionId).fetch()
      const group = productList.data.groups ? productList.data.groups.filter(item => item.groupName == "业务咨询")[0].products : null

      const issueList = (group && group[0]) ? await Ticket.getIssueList(group[0].productId, this.unionId).fetch() : null
      this.setState({
        productList: group,
        issueList: issueList ? issueList.data.issues : null,
        active: group[0] ? group[0].productId : null,
        activeWord: group[0] ? group[0].productName : null,
        success: true,
      })
    } catch (e) {
      // try {

      //   /**
      //    * 如果获取失败，首先检查是否为慧医用户未同步至工单（尝试同步请求 -> 工单内获取用户信息接口会进行自动同步））
      //    * 如果返回 code 为 100 则说明是慧医用户未登入，故让其进行登入，如果同步成功，则回调 componentDidMount 再次获取
      //    */
      //   let userInfo = await Ticket.getUserInfo().fetch()
      //   if (userInfo.code == 100) {
      //     util.goLogin()
      //   } else if ( success in userInfo ) {
      //     this.init()
      //   }
      // } catch (e) {
      //   util.goLogin()
      // }
    }
    
    this.setState({
      loading: false
    })
  }

  onSuccess(result) {
    result.data[0] && (!localStorage.getItem("feedBackUid")) && localStorage.setItem("feedBackUid", result.data[0].uuid)
    this.setState({
      banners: result.data
    })
  }

  async changeProduct(item) {
    this.onSendBefore()
    try {
      this.setState({
        active: item.productId,
        activeWord: item.productName,
      })
      const issueList = item.productId ? await Ticket.getIssueList(item.productId, this.unionId).fetch() : null
      this.setState({
        issueList: issueList ? issueList.data.issues : null
      })
    } catch (e) {
      console.log(e)
    }
    this.onComplete()
  }

  topBar() {
    const {productList, active} = this.state
    if (productList && productList.length > 0) {
      return (
        <div className="feedback-top-bar">
          <ul className="feedback-top-list">
            {
              productList.map(item =>
                <li
                  key={item.productId}
                  onClick={() => this.changeProduct(item)}
                >
                  <span style={active == item.productId ? {borderBottom: '3px solid #76acf8', color: '#76acf8'} : {}}>
                    {item.productName}
                  </span>
                </li>
              )
            }
          </ul>
        </div>
      )
    }
    return null
  }

  mainList() {
    const {issueList} = this.state
    if (issueList && issueList.length > 0) {
      return (
        <div style={{paddingBottom: "70px"}}>
          <ul className="list-ord" style={{borderTop: 'none'}}>
            {
              issueList.map(item => <li className="list-item" key={item.issueId}>
                  <a
                    className="txt-arrowlink list-link-wrapper"
                    href={`./feedback-issue.html?${util.flat({
                      issueId: item.issueId,
                      unionId: this.unionId,
                      feedbackType: this.state.activeWord || '',
                      target: '_blank'
                    })}`}
                  >
                    <div className="list-content">
                      <div className="list-title">{item.issueName}</div>
                    </div>
                  </a>
                </li>
              )
            }
          </ul>
        </div>
      )
    }

    return (
      <div className="notice" style={{marginTop: '45px'}}>
        <span className="notice-icon icon-record"></span>
        <p>该分类下暂无问题 </p>
      </div>
    )
  }

  toFeedback() {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank'
    }
    window.location.href = `./feedback.html?${util.flat(urlInfo)}`
  }

  toFeedQuery() {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank'
    }
    window.location.href = `./feedback-query.html?${util.flat(urlInfo)}`
  }

  bottomBar() {
    return (
      <div className="feedback-bottom-bar">
        <div className="feedback-bottom-item" onClick={() => this.toFeedback()}>
          <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/68c0ba2d435940d67fb8ac33bd4fa04d-40-40.png"/>
          我要反馈
        </div>
        <div className="feedback-bottom-item" onClick={() => this.toFeedQuery()}>
          <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/5bbc361e2679a91af304843a8189566a-40-38.png"/>
          反馈记录
        </div>
      </div>
    )
  }

  render() {
    const {banners} = this.state
    return (
      <div>
        <Swipe banners={banners}/>
        {this.topBar()}
        {this.mainList()}
        {this.bottomBar()}
      </div>
    )
  }
}