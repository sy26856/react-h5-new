import React from 'react'
import util from '../../lib/util'
import './ReservationItem.less'
import config from '../../config'


export default class ReservationItem extends React.Component {
  reAppointment(e, data, regMode) {
    e.stopPropagation()
    e.preventDefault()
    if (data.doctCode && data.doctCode != '0000') {
      window.location.href = `./doctor.html?${util.flat({
        corpId: data.corpId,
        deptCode: data.deptCode,
        doctCode: data.doctCode,
        doctName: data.doctName || '',
        unionId: this.props.unionId,
        target: '_blank'
      })}`
    } else {
      window.location.href = `./appointment-select.html?${util.flat({
        corpId: data.corpId,
        deptCode: data.deptCode,
        regType: data.regType,
        regMode,
        deptName: data.deptName,
        unionId: this.props.unionId,
        target: '_blank'
      })}`
    }
  }

  cancel(e, data) {
    const {store} = this.props
    e.stopPropagation()
    e.preventDefault()
    if( data.regMode == 1 ) {
      store.setState({
        showAppointDialog: true
      })
    } else {
      store.setState({
        showRegisterDialog: true
      })
    }
    store.setState({
      cancelId: data.idStr
    })
  }

  toQueue(e, data) {
    e.stopPropagation()
    e.preventDefault()
    const newQueue = specialConfig.newQueue.corpIds.indexOf(data.corpId.toString()) > -1
    
    const queueUrl = newQueue ?
      `${config.TMS_DOMAIN}/tms/h5/transfer.php?transferKey=28&` :
      `${config.TMS_DOMAIN}/tms/h5/queuing.php?`
    
    window.location.href = `${queueUrl}${util.flat({
      corpId: data.corpId,
      unionId: this.props.unionId,
      target: '_blank'
    })}`
  }

  toPay(e, data) {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = `register-details-2.html?${util.flat({
      id: data.idStr,
      corpId: data.corpId,
      unionId: this.props.unionId,
      pay: 1,
      target: '_blank'
    })}`
  }

  toEvaluate(e, data) {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = `./evaluate.html?${util.flat({
      corpId: data.corpId,
      unionId: this.props.unionId,
      id: data.idStr,
      doctCode: data.doctCode,
      deptCode: data.deptCode,
     medEndTime: data.medEndTime,
      target: '_blank'
    })}`
  }

  toAppendEvaluate(e, data) {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = `./evaluate-extra.html?${util.flat({
      corpId: data.corpId,
      unionId: this.props.unionId,
      id: data.idStr,
      doctCode: data.doctCode,
      deptCode: data.deptCode,
      medEndTime: data.medEndTime,
      target: '_blank'
    })}`
  }


  toCorpHome(e, data) {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = `./pages/index.html?${util.flat({
      corpId: data.corpId,
      unionId: this.props.unionId,
      target: '_blank'
    })}`
  }

  statusDesStyle(statusDes) {
    if (statusDes == '已取号' || statusDes == '挂号成功') {
      return <span className="panel-extra txt-prompt" style={{lineHeight: '20px'}}>{statusDes}</span>
    } else if (statusDes == '待取号' || statusDes == '待付款') {
      return <span className="panel-extra txt-highlight" style={{lineHeight: '20px'}}>{statusDes}</span>
    }
    return <span className="panel-extra txt-info" style={{lineHeight: '20px'}}>{statusDes}</span>
  }

  render() {
    const {data, store, unionId} = this.props

    let canCancel = false
    let statusDes = data.statusDes
    let cancelRegAppointment = false
    //canCancel且不等于401，且比当前更早，可以取消。
    if (data.regMode == 1) {
      canCancel = data.canCancel && data.status != 401 && (new Date()).getTime() < data.medDateEnd

      ;(statusDes == '待取号' && !canCancel) ? statusDes = '未取号' : '待取号'
      //如果可取消，那么不显示可以重新预约
      canCancel ? cancelRegAppointment = false : cancelRegAppointment = true
    } else {
      canCancel = data.canCancel
    }

    return (
      <a
        href={`register-details-2.html?${util.flat({id: data.idStr, corpId: data.corpId, unionId, target: '_blank'})}`}>
        <div className="panel g-space">
          <div className="panel-title" style={{border: 'none'}}>
            <span className="reservation-item-corp-info" onClick={(e) => this.toCorpHome(e, data)}>
              <span className="reg-text">{data.regMode == 1 ? '约' : '挂'}</span>
              <span className="corp-name">
                {data.corpName}
                <span />
              </span>
            </span>
            {this.statusDesStyle(statusDes)}
          </div>
          <div className="panel-msg" style={{backgroundColor: '#f9f9f9', lineHeight: '1.7', border: 'none'}}>
            <p className="reservation-pannel-no-letter">
              <span>就诊人:</span>{data.patientName}
            </p>
            <p className="reservation-panel-item">
              <span>科室:</span>{data.deptName}
            </p>
            <p className="reservation-panel-item">
              <span>医生:</span>{ utilReservationItem.regType(data.type)} {data.doctName}
              ￥{(data.benefitRegAmount / 100).toFixed(2)}
            </p>
            <p className="reservation-panel-item">
              <span>时间:</span>
              { utilReservationItem.dateFormat(data.medBegTime, data.medAmPm, data.regMode)}
              {data.statusDesInfo && <span className="suspend-txt">医院停诊</span>}
            </p>
          </div>
          {(data.canEvaluate || data.canAppointRegAgain || data.canAppointRegSecondTime || canCancel || data.canQueue || data.canRegAgain || data.canPay || cancelRegAppointment) ?
            <div className="reservation-item-foot">
              {
                data.canEvaluate &&
                <button className="btn btn-sm btn-secondary" onClick={(e) => this.toEvaluate(e, data)}>就诊评价</button>
              }
              {
                data.canAppendEvaluate &&
                <button className="btn btn-sm btn-secondary" onClick={(e) => this.toAppendEvaluate(e, data)}>追加评价</button>
              }
              {
                data.canAppointRegAgain &&
                <button className="btn btn-sm btn-secondary" onClick={(e) => this.reAppointment(e, data, 1)}>
                  重新预约</button>
              }
              {
                data.canAppointRegSecondTime &&
                <button className="btn btn-sm btn-secondary" onClick={(e) => this.reAppointment(e, data, 1)}>
                  再次预约</button>
              }
              {
                canCancel &&
                <button className="btn btn-sm btn-secondary"
                        onClick={(e) => this.cancel(e, data)}>{data.regMode == 1 ? '取消预约' : '取消订单'}</button>
              }
              {
                data.canQueue &&
                <button className="btn btn-sm btn-secondary" onClick={(e) => this.toQueue(e, data)}>排队叫号</button>
              }
              {
                data.canRegAgain &&
                <button className="btn btn-sm btn-secondary" onClick={(e) => this.reAppointment(e, data, 2)}>
                  重新挂号</button>
              }
              {
                data.canPay &&
                <button className="btn btn-sm btn-secondary btn-highlight" onClick={(e) => this.toPay(e, data)}>
                  去支付</button>
              }
              {statusDes == '待取号' && <div className="get-order-number">请提前30分钟到院取号</div>}
            </div> : null
          }
        </div>
      </a>
    )
  }
}


const utilReservationItem = {
  regType (type) {
    /*const regTypeStr = {
        "1": "普通",
        "2": "专家",
        "3": "名医"
      }[regType] || ""
    const regModeStr = {
        "1": "预约",
        "2": "挂号"
      }[regMode] || ""*/
    const typeStr = {
      "1": "普通挂号",
      "2": "专家挂号",
      "3": "名医挂号",
      "14": "急诊挂号",
      "15": "便民挂号",
      "16": "视频问诊挂号",
      "4": "普通预约",
      "5": "专家预约",
      "6": "名医预约",
      "54": "急诊预约",
      "55": "便民预约",
      "56": "视频问诊预约"
    }[type]

    return typeStr
  }
  ,dateFormat (medBegTime, medAmpm, regMode) {
    return util.dateFormatGMT(medBegTime, "yyyy-MM-dd") + " " + {
        "1": "上午",
        "2": "下午"
      }[medAmpm] + "" + (medBegTime ? util.dateFormatGMT(medBegTime, "h:mm") : "")
  }
}