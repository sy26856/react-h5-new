"use strict";

import './feedback-detail.less'
import React, {PropTypes} from 'react'
import util from './lib/util'
import Ticket from './module/Ticket'
import Alert from './component/alert/alert'
import Confirm from './component/confirm/Confirm'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import Icon from './component/icon/Icon';
import ReactSwipe from 'react-swipe';
import hybridAPI from './lib/hybridAPI';

class ImageView extends React.Component {

  static defaultProps = {
    index: 0
  };

  state = {
    height: document.body.scrollHeight + "px" || (screen.width - 60) + "px",
    imgHeight: 0
  };

  scaleRate = 1;
  lastScaleRate = 1;
  initDistance = null;
  distance = null;

  static propTypes = {
    index: PropTypes.number,
    data: PropTypes.array
  };

  componentDidMount() {
    const imgHeight = getComputedStyle(this.refs.img).height;
    this.setState({
      imgHeight: parseInt(imgHeight)
    })
  }

  touchStart(e) {
    if (e.touches.length == 2) {
      const finger1 = e.touches[0];
      const finger2 = e.touches[1];
      const dX = Math.abs(finger1.pageX - finger2.pageX);
      const dY = Math.abs(finger1.pageY - finger2.pageY);

      this.initDistance = Math.sqrt(dX * dX + dY * dY);
    }
  }

  touchEnd() {
    this.lastScaleRate = this.scaleRate;
    if (this.scaleRate < 1) {
      this.scaleRate = 1;
      this.lastScaleRate = 1;
      this.forceUpdate();
    }
  }

  scaleImg(e) {
    //console.log(e.touches);
    if (e.touches.length == 2) {
      const finger1 = e.touches[0];
      const finger2 = e.touches[1];
      const dX = Math.abs(finger1.pageX - finger2.pageX);
      const dY = Math.abs(finger1.pageY - finger2.pageY);

      this.distance = Math.sqrt(dX * dX + dY * dY);

      this.scaleRate = (this.distance / this.initDistance) * this.lastScaleRate;

      this.forceUpdate();
    }
  }

  render() {
    const {data, index} = this.props;
    const {height, imgHeight} = this.state;
    const scaleStyle = {
      width: 100 * this.scaleRate + "%",
      marginTop: `${-imgHeight / 2}px`
    };

    return (
      <div className="image-view" onClick={() => history.go(-1)}>
        <img
          ref="img"
          style={scaleStyle}
          onTouchStart={(e) => this.touchStart(e)}
          onTouchMove={(e) => this.scaleImg(e)}
          onTouchEnd={(e) => this.touchEnd(e)}
          src={data[index]}
        />
      </div>
    );
    /*
     return (
     <div className="image-view" onClick={() => history.go(-1)}>
     <ReactSwipe swipeOptions={{continuous: false, startSlide: index || 0}}>
     {data.map((z, i) => <div style={{height, backgroundImage: `url(${data[i]})`}} className="image-view-box"></div>)}
     </ReactSwipe>
     </div>
     );
     */
  }
}

//我的账单
export default class FeedbackDetail extends SmartNoBlockComponent {
  constructor(props) {
    super(props);

    this.query = util.query();
    const query = util.query();
    this.ticketId = query.ticketId || '';
    this.blackId = query.blackId || '';
    this.unionId = query.unionId || '';
    this.state.showConfirm = false
    this.state.showReply = false
    this.state.active = false
    this.state.showImg = false
    this.state.selectImgArr = []
    this.state.selectImgIndex = 0
  }

  // timer = null;
  async componentDidMount() {

    if (util.isInYuantuApp()) {
      hybridAPI.banRefresh();
    }

    window.onpopstate = () => {
      this.setState({
        showImg: false
      })
    };

    try {
      let userInfo = await Ticket.getUserInfo().fetch()
      if (userInfo.code == 100) {
        util.goLogin()
      }
    } catch (e) {
      Alert.show(e.msg || "获取用户信息失败");
    }

    Ticket.getTicketDetail(this.unionId, this.ticketId, this.blackId)
      .subscribe(this) //自动处理load状态
      .fetch();
    // window.addEventListener('scroll', this.handleScroll)
  }

  onSuccess(result) {
    let data = result.data;

    this.setState(
      {
        loading: false,
        success: true,
        ticketId: data.ticketId,
        record: data.record,
        status: data.status
      }
    )
  }

  showConfirm() {
    this.setState({
      showConfirm: true
    })
  }

  async closeTicket(confirm) {
    if (confirm) {
      try {
        var closeResult = await Ticket.closeTicket(this.state.ticketId).fetch()
      } catch (e) {
        Alert.show(e.msg || "关闭工单失败");
      }

      this.setState({
        showConfirm: false
      })

      if (!closeResult.success) {
        Alert.show(closeResult.msg || "关闭工单失败");
      } else {
        this.componentDidMount()
      }

    } else {
      this.setState({
        showConfirm: false
      })
    }
  }

  showReply() {
    this.setState({
      showReply: true
    })
  }

  async reply() {
    let text = this.refs.replyInput.value.trim()

    if (!text) {
      Alert.show("请填写回复内容", 1000);
      return;
    }

    try {
      var replyResult = await Ticket.replyTicket(this.state.ticketId, text).fetch()
    } catch (e) {
      Alert.show(e.msg || "回复工单失败");
    }

    if (!replyResult.success) {
      Alert.show(closeResult.msg || "回复工单失败");
    } else {
      this.refs.replyInput.value = ''
      this.refs.textContent.innerHTML = ''
      this.componentDidMount()
    }
  }

  textChange() {
    let textContent = this.refs.textContent
    let content = this.refs.replyInput.value

    textContent.innerHTML = content
  }

  imageView(imgArr, index) {
    history.pushState({}, "图片浏览", "#imageView")
    this.setState({
      showImg: true,
      selectImgIndex: index,
      selectImgArr: imgArr
    });
  }

  imgBox(data, imgArr, i) {
    const imgStyle = {
      width: "100%",
      height: "100%",
    };
    return (
      <div onClick={() => this.imageView(imgArr, i)} className="listview-img-box" key={"img" + i}>
        <Icon url={data} style={imgStyle}/>
      </div>
    );
  }

  render() {
    let {record, showImg, selectImgArr, selectImgIndex, active} = this.state;
    // console.log(Confirm);
    if (showImg) {
      return <ImageView data={selectImgArr} index={selectImgIndex}/>
    }
    return (
      <div className='detail-list' onClick={() => {
        this.setState({showReply: false})
      }}>
        <div className="listview">
          {
            record.map((item, index) =>
              <div className="listview-item listview-item-middel " key={index}>
                <div className={"listview-icon " + (item.type == 1 ? 'icon-default' : 'icon-hui-medical')}></div>
                <div className="listview-content">
                  <div className="listview-title txt-insign">{item.type == 1 ? '我' : '慧医客服' }</div>
                  <div className="listview-brief ">{util.dateFormat(item.createTime, 'yyyy-MM-dd hh:mm:ss')}</div>
                  <div className="listview-msg ">{item.content}</div>
                  <div className="listview-img-container">{
                    item.enclosure && item.enclosure.map((imgData, i) => this.imgBox(imgData, item.enclosure, i))
                  }</div>
                </div>
              </div>
            )
          }
        </div>
        {
          this.state.status == 4 ?

            <div className='detail-text'>
              <p className="txt-weak">工单已关闭</p>
            </div>
            :
            <div>
              <div className='detail-text'>
                <p className="txt-weak">如果您觉得问题已经解决，请点击下方按钮关闭问题</p>
              </div>
              <div className={"fixed-foot-wrapper " + (this.state.showReply ? '' : 'hide')} onClick={(e) => {
                e.stopPropagation();
              }}>
                <div className="g-footer ticket-reply">
                  <div className="expandingArea textarea">
                    <pre><span ref='textContent'></span><br/></pre>
                    <textarea placeholder="输入内容" onInput={this.textChange.bind(this)} ref='replyInput'></textarea>
                  </div>
                  <div
                    className={`send-reply ${active ? 'txt-prompt' : 'txt-info'}`}
                    onClick={this.reply.bind(this)}
                  >
                    发送
                  </div>
                </div>
              </div>
              <div className={"fixed-foot-wrapper " + (this.state.showReply ? 'hide' : '')} onClick={(e) => {
                e.stopPropagation();
              }}>
                <div className="btn-wrapper g-footer">
                  <button className="btn btn-secondary" style={{width: '47%'}} onClick={this.showConfirm.bind(this)}>
                    关闭工单
                  </button>
                  <button className="btn btn-lg" onClick={this.showReply.bind(this)}>追问</button>
                </div>
              </div>
            </div>
        }
        {
          this.state.showConfirm ?
            <Confirm display={true} title="关闭工单" des="您确认要关闭当前工单吗?" callback={this.closeTicket.bind(this)}/>
            :
            ''
        }
      </div>
    )
  }
}


// <div className="textarea" contentEditable="true" ref='replyInput'></div>