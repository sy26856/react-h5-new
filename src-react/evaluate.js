"use strict"

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import Alert from './component/alert/alert'
import Icon from './component/icon/Icon'
import hybridAPI from './lib/hybridAPI'
import './evaluate.less'

const iconStyle = {
  float: 'left',
  marginRight: '10px'
}

const activeLabel = {
  color: '#76ACF8',
  backgroundColor: '#F1F6FE',
  borderColor: '#76ACF8'
}

const starImg = {
  backgroundImage: 'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f1321e420ae3064ec40aa9752015310-52-50.png)'
}
const starActionImg = {
  backgroundImage: 'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/bbcf9a702d8b8914dcf2ee6bea303933-52-50.png)'
}

const evaluateLabel = {
  "1": "不满意，整体感觉差",
  "2": "一般，没达到期望",
  "3": "满意，基本解决了疑问",
  "4": "很满意，不错的就诊经历",
  "5": "非常满意，给医生点赞"
}

//评价
export default class Evaluate extends SmartBlockComponent {
  constructor(props) {
    super(props)
    let query = util.query()
    this.doctCode = query.doctCode || ''
    this.corpId = query.corpId
    this.deptCode = query.deptCode
    this.id = query.id
    this.medEndTime = util.dateFormat(query.medEndTime - 0, 'yyyy-MM-dd hh:mm:ss')

    this.loadNum = 0

    this.state = {
      loading: true,
      success: false,
      isSubmit: false,
      evaluateStar: 0,
      serviceAttitudeStar: 0,
      hospitalEnvironmentStar: 0,
      evaluateInfo: [],
      tagList: []
    }
  }

  componentWillMount() {

    let logo
    if (this.doctCode) {
      logo = "//image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png"
    } else {
      logo = "//front-images.oss-cn-hangzhou.aliyuncs.com/i4/6df445b910e7bd736c6d97e89a87a5a9-116-116.png"
    }

    this.setState({
      logo,
      corpName: '',
      date: null
    })
  }

  componentDidMount() {

    UserCenter.getEvaluateInfo(this.medEndTime).subscribe({
      onSuccess: ( result ) => {
        // alert( JSON.stringify( result.data ))
        this.setState({
          evaluateInfo: result.data
        })
        if( ++this.loadNum == 2 ) {
          this.setState({
            success: true
            ,loading: false
          })
        }
      }
      ,onError: ( result ) => {
        // alert( JSON.stringify( result.data ))
        if( result.resultCode == 202 ) {
          this.setState({
            evaluateInfo: result.data
            ,success: false
            ,loading: false
            ,msg: '未登入，请登入'
          })
          util.goLogin()
        }
      }
    }).fetch()

    if (this.doctCode) {
      UserCenter.getDoctorInfo(this.corpId, this.deptCode, this.doctCode)
        .subscribe(this)
        .fetch()
    } else {
      UserCenter.getDeptInfo(this.corpId, this.deptCode)
        .subscribe(this)
        .fetch()
    }

    onBeforeUnload.bind( this )()

  }

  onSuccess(result) {
    let data = result.data
    const {logo} = this.state
    this.setState({
      corpName: data.corpName,
      doctName: data.doctName,
      deptName: data.deptName,
      doctTech: data.doctTech,
      logo: data.doctPictureUrl ? data.doctPictureUrl : logo,
    })

    if( ++this.loadNum == 2 ) {
      this.setState({
        success: true
        ,loading: false
      })
    }
  }

  setStar(type, stars) {
    const {evaluateInfo, hospitalEnvironmentStar, serviceAttitudeStar, evaluateStar} = this.state
    // alert( JSON.stringify({evaluateInfo, hospitalEnvironmentStar, serviceAttitudeStar, evaluateStar}))
    if( evaluateInfo.length == 0 ) { return }

    const tagInfo = evaluateInfo.evaluate.filter(item => item.starNum === stars)[0]

    const tagList = tagInfo ? tagInfo.tagList : []
    tagList.forEach(item => item.active = false)

    if (type === 'hospitalEnvironment' && stars != hospitalEnvironmentStar) {
      this.setState({
        hospitalEnvironmentStar: stars
      })
    } else if (type === 'serviceAttitude' && stars != serviceAttitudeStar) {
      this.setState({
        serviceAttitudeStar: stars
      })
    } else if (type === 'totalEvaluate' && stars != evaluateStar) {
      // console.log(tagList)
      this.setState({
        evaluateStar: stars,
        tagList
      })
    }
  }

  submit() {
    const {tagList, hospitalEnvironmentStar, serviceAttitudeStar, evaluateStar} = this.state
    const tagIdArr = []
    tagList.forEach(tagItem => {
      tagItem.active && tagIdArr.push(tagItem.id)
    })

    const tagIdStr = tagIdArr.join(',')
    const noname = this.refs.noname
    const input = this.refs.input

    if (evaluateStar < 1) {
      Alert.show('请给医生评分', 2500)
      return
    } 
    if ( tagIdStr == '') {
      Alert.show('请给医生选择标签', 2500 )
      return 
    }
    if (serviceAttitudeStar < 1) {
      Alert.show('请给导医环境评分', 2500)
      return
    }
    if (hospitalEnvironmentStar < 1) {
      Alert.show('请给医院环境评分', 2500)
      return
    }

    let successText = '对您就诊不满深表歉意 \n我们会更加努力完善'
    if (evaluateStar === 3) {
      successText = '我们会不断为您提供更优质的就医服务'
    }
    if (evaluateStar > 3) {
      successText = '谢谢您的鼓励 \n我们会继续用心为您服务'
    }

    const self = this

    UserCenter.addAppointRegLogEvaluate(
      input.value,
      hospitalEnvironmentStar,
      noname.checked ? 1 : 0,
      this.id,
      serviceAttitudeStar,
      tagIdStr,
      evaluateStar
    ).subscribe({
      onSendBefore() {
        self.setState({
          isSubmit: true
        })
      },
      onSuccess() {
        Alert.show(successText, 2000)
        setTimeout(() => {
          if ( util.isInYuantuApp() ) {
            util.goBack(true)
          } else {
            window.history.go(-2) // 浏览器中，由于有返回确认所以需要返回 -2
          }
        }, 2000)
      },
      onError() {
        Alert.show('提交失败')
      }
    }).fetch()

  }

  selectLabel(item) {
    const {tagList} = this.state
    const list = JSON.parse(JSON.stringify(tagList))
    list.forEach(z => {
      if (z.id === item.id) {
        z.active = !z.active
      }
    })
    this.setState({
      tagList: list
    })
  }

  render() {
    var {isSubmit, doctName, deptName, doctTech, evaluateStar, serviceAttitudeStar, hospitalEnvironmentStar, tagList, logo, corpName} = this.state
    let data = this.state.data || ""
    let len = data.length

    return (
      <div>
        <div className="panel g-space" style={{backgroundColor: '#f8f8f8'}}>
          <div className="list-ord">
            <div className="list-item ">
              <Icon url={logo} circle={true} style={iconStyle}/>
              <div className="list-content">
                <div className="list-title" style={{fontSize: '16px'}}>{doctName || deptName}</div>
                <p className="list-brief">{corpName} <span
                  style={{marginLeft: '10px'}}>{deptName} {doctTech ? "- " + doctTech : null}</span></p>
              </div>
            </div>
          </div>

          <div className="total-evaluate-container">
            <span className={`${evaluateStar > 0 ? 'icon-star-action' : 'icon-star'}`}
                  style={evaluateStar > 0 ? starActionImg : starImg}
                  onClick={() => this.setStar('totalEvaluate', 1)} />
            <span className={`${evaluateStar > 1 ? 'icon-star-action' : 'icon-star'}`}
                  style={evaluateStar > 1 ? starActionImg : starImg}
                  onClick={() => this.setStar('totalEvaluate', 2)} />
            <span className={`${evaluateStar > 2 ? 'icon-star-action' : 'icon-star'}`}
                  style={evaluateStar > 2 ? starActionImg : starImg}
                  onClick={() => this.setStar('totalEvaluate', 3)} />
            <span className={`${evaluateStar > 3 ? 'icon-star-action' : 'icon-star'}`}
                  style={evaluateStar > 3 ? starActionImg : starImg}
                  onClick={() => this.setStar('totalEvaluate', 4)} />
            <span className={`${evaluateStar > 4 ? 'icon-star-action' : 'icon-star'}`}
                  style={evaluateStar > 4 ? starActionImg : starImg}
                  onClick={() => this.setStar('totalEvaluate', 5)}/>

            {
              evaluateStar > 0 ?
                <div className="evaluate-tips">{evaluateLabel[evaluateStar]}</div> :
                <div className="evaluate-tips" style={{color: '#999', marginBottom: '0px'}}>请对本次就诊服务进行评价</div>
            }

            {
              tagList.length > 0 && <div className="evaluate-label-container">
                {
                  tagList.map(item => <div
                    onClick={() => this.selectLabel(item)}
                    style={item.active ? activeLabel : {}}
                    key={item.id}
                    className="evaluate-label">{item.name}</div>)
                }
              </div>
            }

          </div>

          <div style={{lineHeight: 0}}>
            <textarea
              ref="input"
              className="evaluate-textarea"
              placeholder="您的就诊评价对他人帮助很大哦"
            />
          </div>

        </div>

        <div className="panel g-space">
          <div className="panel-title" style={{borderTop: 'none', lineHeight: '18px'}}>
            <span className="extra-evaluate-icon" />
            医院评价
          </div>
          <div className="panel-msg" style={{borderBottom: 'none'}}>
            <div className="extra-evaluate">
              导医环境
              <span className={`${serviceAttitudeStar > 0 ? 'icon-star-action' : 'icon-star'}`}
                    style={serviceAttitudeStar > 0 ? starActionImg : starImg}
                    onClick={() => this.setStar('serviceAttitude', 1)}/>
              <span className={`${serviceAttitudeStar > 1 ? 'icon-star-action' : 'icon-star'}`}
                    style={serviceAttitudeStar > 1 ? starActionImg : starImg}
                    onClick={() => this.setStar('serviceAttitude', 2)}/>
              <span className={`${serviceAttitudeStar > 2 ? 'icon-star-action' : 'icon-star'}`}
                    style={serviceAttitudeStar > 2 ? starActionImg : starImg}
                    onClick={() => this.setStar('serviceAttitude', 3)}/>
              <span className={`${serviceAttitudeStar > 3 ? 'icon-star-action' : 'icon-star'}`}
                    style={serviceAttitudeStar > 3 ? starActionImg : starImg}
                    onClick={() => this.setStar('serviceAttitude', 4)}/>
              <span className={`${serviceAttitudeStar > 4 ? 'icon-star-action' : 'icon-star'}`}
                    style={serviceAttitudeStar > 4 ? starActionImg : starImg}
                    onClick={() => this.setStar('serviceAttitude', 5)}/>
            </div>
            <div className="extra-evaluate">
              医院环境
              <span className={`${hospitalEnvironmentStar > 0 ? 'icon-star-action' : 'icon-star'}`}
                    style={hospitalEnvironmentStar > 0 ? starActionImg : starImg}
                    onClick={() => this.setStar('hospitalEnvironment', 1)}/>
              <span className={`${hospitalEnvironmentStar > 1 ? 'icon-star-action' : 'icon-star'}`}
                    style={hospitalEnvironmentStar > 1 ? starActionImg : starImg}
                    onClick={() => this.setStar('hospitalEnvironment', 2)}/>
              <span className={`${hospitalEnvironmentStar > 2 ? 'icon-star-action' : 'icon-star'}`}
                    style={hospitalEnvironmentStar > 2 ? starActionImg : starImg}
                    onClick={() => this.setStar('hospitalEnvironment', 3)}/>
              <span className={`${hospitalEnvironmentStar > 3 ? 'icon-star-action' : 'icon-star'}`}
                    style={hospitalEnvironmentStar > 3 ? starActionImg : starImg}
                    onClick={() => this.setStar('hospitalEnvironment', 4)}/>
              <span className={`${hospitalEnvironmentStar > 4 ? 'icon-star-action' : 'icon-star'}`}
                    style={hospitalEnvironmentStar > 4 ? starActionImg : starImg}
                    onClick={() => this.setStar('hospitalEnvironment', 5)}/>
            </div>
          </div>
        </div>

        <div className="no-name">
          <label className="checkbox-wrapper" htmlFor="checkbox">
            <input ref="noname" className="no-name-checkbox" defaultChecked={true} type="checkbox" name="checkbox"
                   id="checkbox"/>匿名评价
          </label>
        </div>

        <div className="btn-wrapper">
          <button disabled={isSubmit} className="btn btn-block" onClick={() => { !isSubmit && this.submit()}}>发表评价</button>
        </div>

      </div>
    )
  }

}



/**
 * 
 * 用户点击返回确认
 *  * 客户端中调用 hybrid
 *  * 网站中使用 history 特性：使用说 http://www.jianshu.com/p/58ba5cb8be32
 * 
 */
function onBeforeUnload () {
  if ( util.isInYuantuApp()) {
    hybridAPI.onSureBack( '你确认要关闭本页吗？', '关闭后，系统将不会保存您填写的信息，如需继续请再次点击确认' )
  } else {
    window.history.pushState( null, null, window.location.search + '#1' )
    window.onpopstate = () => {
      const { hospitalEnvironmentStar, serviceAttitudeStar, evaluateStar } = this.state
      const inputVal = this.refs.input.value
      // console.log({ hospitalEnvironmentStar, serviceAttitudeStar, evaluateStar })
      // console.log( inputVal )
  
      if( hospitalEnvironmentStar > 0 || serviceAttitudeStar > 0 || evaluateStar > 0 || inputVal != '' ) {
        Alert.show('返回后，系统将不会保存您填写的信息，如需继续请再次点击返回', 3000 )
        return
      }
      util.goBack()
    }
  }
}