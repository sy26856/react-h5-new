import React from 'react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import './my-reservation.less'
import ReservationItem from './component/reservation-item/ReservationItem'
import Modal from './component/modal/Modal'
import Alert from './component/alert/alert'
import BackRefresh from './hoc/backRefresh'

class MyReservation extends SmartBlockComponent {

  constructor(props) {
    super(props)
    const query = util.query()
    this.corpId = query.corpId || ''
    this.unionId = query.unionId || ''
    this.pageSize = '30'
    this.timer = null
    this.totalPage = 0
    this.pendingEvaluateNum = 0

    this.state = {
      loading: true
      ,success: false

      ,currentPage: 1
      ,data: null
      ,cancelId: ''
      ,list: []
      ,isLoading: false
      ,statusNum: ''
      ,noData: false
      ,showAppointDialog: false
      ,showRegisterDialog: false
      ,appointReason: ''
      ,registerReason: ''
    }
  }

  componentDidMount() {
    window.onscroll = this.myScroll
    this.changeStatus( this.state.statusNum )
    this.getPendingEvaluateNum()
  }

  getPendingEvaluateNum () {
    UserCenter.getRegPagesByStatus( this.unionId, this.corpId, 3, 1, 1 )
      .subscribe({
        onSendBefore () {},
        onComplete () {},
        onSuccess: ( result ) => {
          this.pendingEvaluateNum = result.data.regPages ? ( result.data.regPages.totalRecordNum || 0 ) : 0
          this.setState({})
        }
      }).fetch()
  }

  myScroll = () => {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      const scrollHeight = document.body.scrollHeight
      const scrollTop = window.scrollY
      const screenHeight = window.screen.height
      if ( this.state.currentPage == 1 ) {
        // 第一页会默认加载这边不用加载
        return
      }
      if (scrollHeight - scrollTop < screenHeight + 20 && !this.state.isLoading && this.totalPage >= this.state.currentPage) {
        this.setState({
          isLoading: true
        })
        UserCenter.getRegPagesByStatus(this.unionId, this.corpId, this.state.statusNum, this.state.currentPage, this.pageSize)
          .subscribe(this).fetch()
      }
    }, 250)
  }

  onSuccess(result) {
    this.totalPage = result.data.regPages ? (result.data.regPages.totalPageNum || 1) : 1
    try {
      if (result.data.regPages && result.data.regPages.records) {
        this.setState({
          isLoading: false
          ,currentPage: this.state.currentPage + 1
          ,list: this.state.list.concat( result.data.regPages.records || [] )
        })
      } else {
        this.setState({
          list: []
          ,noData: true
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  renderNoData() {
    const href = `./appointment-hospital.html?${util.flat({
      type: 0,
      unionId: this.unionId || '',
      target: '_blank',
    })}`
    return (
      <div className="notice " style={{margin: 0, paddingTop: '150px'}}>
        <span className="notice-icon icon-record"></span>
        <p style={{marginBottom: '10px'}}>您还没有过相关记录</p>
        <a className="btn" href={href}>立即预约</a>
      </div>
    )
  }

  renderListContainer() {
    return (
      <div style={{paddingTop: '55px', backgroundColor: '#f0f0f0'}}>
        {
          this.state.list.map((z, i) =>
            <ReservationItem
              data={z}
              store={ this }
              key={i}
              unionId={this.unionId}
            />
          )
        }
        {this.totalPage > this.state.currentPage && this.renderLoading()}
      </div>
    )
  }

  renderLoading() {
    return (
      <div className="render-loading-container">
        <div className="icon-h-loading render-loading-circle"></div>
      </div>
    )
  }

  changeStatus(status) {
    window.scrollTo(0, 0)
    this.setState({
      noData: false
      ,statusNum: status
      ,currentPage: 1
    })
    
    UserCenter.getRegPagesByStatus(this.unionId, this.corpId, status, 1, this.pageSize)
      .subscribe({
        onSendBefore: () => this.onSendBefore(),
        onComplete: () => this.onComplete(),
        onSuccess: (result) => {
          this.totalPage = result.data.regPages ? (result.data.regPages.totalPageNum || 1) : 1
          this.setState({
            success: true
          })
          try {
            this.setState({
              data: result.data
            })
            if (result.data.regPages && result.data.regPages.records.length > 0) {
              this.setState({
                isLoading: false
                ,currentPage: this.state.currentPage + 1
                ,list: result.data.regPages.records || []
              })
            } else {
              this.setState({
                list: []
                ,noData: true
              })
            }
          } catch (e) {
            console.log(e)
          }
        },
        onError: result => this.onError( result )
      })
      .fetch()
  }

  statusList() {
    const activeStyle = {
      borderBottom: '2px solid #76acf8',
      color: '#76acf8'
    }
    const pendingEvaluateNum = this.pendingEvaluateNum;
    const { statusNum } = this.state
    return (
      <div className="status-list">
        <div className="status-item" onClick={() => this.changeStatus('')}>
          <span style={ statusNum ? {} : activeStyle }>全部</span>
        </div>
        <div className="status-item" onClick={() => this.changeStatus(1)}>
          <span style={ statusNum == 1 ? activeStyle : {}}>待取号</span>
        </div>
        <div className="status-item" onClick={() => this.changeStatus(2)}>
          <span style={ statusNum == 2 ? activeStyle : {}}>待就诊</span>
        </div>
        <div className="status-item" onClick={() => this.changeStatus(3)}>
          <span style={ statusNum == 3 ? activeStyle : {}}>待评价</span>
          {
            pendingEvaluateNum ? (
              <div className="unread-num" style={{ padding: pendingEvaluateNum > 9 ? '0 4px' : ''}}>
                { pendingEvaluateNum > 10 ? '10+' : pendingEvaluateNum }
              </div>
            ):null
          }
        </div>
      </div>
    )
  }

  async cancelAppoint() {
    this.setState({
      showAppointDialog: false
    })
    const domArr = Array.prototype.slice.call(document.getElementsByName('appoint'))
    const selectDom = domArr.filter(z => z.checked)[0]
    if (selectDom) {
      try {
        const result = await UserCenter.cancelAppointReg( this.state.cancelId, selectDom.value, this.unionId).fetch()
        if (result.success) {
          window.location.reload()
        } else {
          Alert.show(result.msg, 1500)
        }
      } catch (e) {
        Alert.show(e.msg, 1500)
      }
    }
  }

  async cancelRegister() {
    this.setState({
      showRegisterDialog: false
    })
    const domArr = Array.prototype.slice.call(document.getElementsByName('register'))
    const selectDom = domArr.filter(z => z.checked)[0]
    if (selectDom) {
      try {
        const result = await UserCenter.cancelAppointReg( this.state.cancelId, selectDom.value, this.unionId).fetch()
        if (result.success) {
          window.location.reload()
        } else {
          Alert.show(result.msg, 1500)
        }
      } catch (e) {
        console.log(e)
        Alert.show(e.msg, 1500)
      }
    }
  }

  appointModal() {
    const appointRegCancelReasonList = this.state.data ? this.state.data.appointRegCancelReasonList.slice() : []
    return (
      <Modal
        show={ this.state.showAppointDialog }
        onCancel={() => {
          this.setState({
            showAppointDialog: false
          })
        }}
        position="bottom"
        header={
          <div className="reservation-modal-header">
            <div className="reservation-modal-header-cancel" onClick={() => {
                this.setState({
                  showAppointDialog: false
                })
              }}>取消</div>
            <div className="reservation-modal-header-confirm" onClick={() => this.cancelAppoint()}>确认</div>
            <div>取消原因</div>
          </div>
        }
      >
        <div className="list-ord list-radio" style={{fontSize: '14px'}}>
          {appointRegCancelReasonList.map((item, index) =>
            <label className="list-item list-nowrap" htmlFor={'label' + item.type} key={"a" + index}>
              <div className="list-content">
                {item.name}
              </div>
              <div className="list-extra ">
                <span className="radio-wrapper">
                  <input defaultChecked={index === 0} type="radio" name="appoint" id={'label' + item.type}
                         value={item.type}/>
                </span>
              </div>
            </label>
          )}
        </div>
      </Modal>
    )
  }

  registerModal() {
    const regCancelReasonList = this.state.data ? this.state.data.regCancelReasonList.slice() : []
    return (
      <Modal
        show={ this.state.showRegisterDialog }
        onCancel={() => {
          this.setState({
            showRegisterDialog: false
          })
        }}
        position="bottom"
        header={
          <div className="reservation-modal-header">
            <div className="reservation-modal-header-cancel" onClick={() => {
                this.setState({
                  showRegisterDialog: false
                })
              }}>取消</div>
            <div className="reservation-modal-header-confirm" onClick={() => this.cancelRegister(false)}>确认</div>
            <div>取消原因</div>
          </div>
        }
      >
        <div className="list-ord list-radio" style={{fontSize: '14px'}}>
          {regCancelReasonList.map((item, index) =>
            <label className="list-item list-nowrap" htmlFor={'label' + item.type} key={"r" + index}>
              <div className="list-content">
                {item.name}
              </div>
              <div className="list-extra ">
                <span className="radio-wrapper">
                  <input defaultChecked={index === 0} type="radio" name="register" id={'label' + item.type}
                         value={item.type}/>
                </span>
              </div>
            </label>
          )}
        </div>
      </Modal>
    )
  }

  render() {
    return (
      <div className="my-reservation">
        {this.statusList()}
        {
          this.state.list && this.state.list.length > 0 ?
            this.renderListContainer()
            : this.renderNoData()
        }
        {this.appointModal()}
        {this.registerModal()}
      </div>
    )
  }
}


export default BackRefresh( MyReservation )