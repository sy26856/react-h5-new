import React from 'react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
import util from './lib/util'
import Icon from './component/icon/Icon';
import hybridAPI from './lib/hybridAPI';

export default class DoctorList extends SmartBlockComponent {

  constructor(props) {
    super(props)
    let query = util.query()
    this.corpId = query.corpId || ''
    this.deptCode = query.deptCode
    this.deptName = query.deptName || '医生列表'
    this.unionId = query.unionId || ''

    this.state = {
      loading: true
      , data: []
    }
  }

  componentDidMount() {
    if (util.isInYuantuApp()) {
      hybridAPI.setTitle(this.deptName);
    } else {
      document.getElementsByTagName("title")[0].innerText = this.deptName;
    }
    UserCenter.getDoctorListFromDept(this.corpId, this.deptCode, this.unionId)
      .subscribe(this) //自动处理load状态
      .fetch()
  }

  onSuccess(result) {
    this.setState({
      loading: false
      , success: true
      , data: result.data
    })
  }

  toDoctor(item) {
    // click doct localtion -> doctor.html
    // corpId，doctCode，deptCode，doctName，corpName
    const urlInfo = {
      corpId: this.corpId
      , doctCode: item.doctCode
      , deptCode: item.deptCode
      , doctName: item.doctName
      , corpName: item.corpName
      , target: "_blank"
      , unionId: this.unionId
    }
    const href = `./doctor.html?${util.flat(urlInfo)}`
    window.location.href = href
  }

  render() {
    let {data} = this.state
      , len = data.length
    const iconStyle = {
      width: '58px',
      height: '58px',
      marginRight: '10px'
    };
    if (data && data.length > 0) {
      return (
        <div>
          <ul className="list-ord">
            {
              data.map(function (item, key) {
                  let {doctName, sex, doctProfe} = item
                    , doctPictureUrl = item.doctPictureUrl || (sex == '女' ? 'https://image.yuantutech.com/i4/6734ebcc6fff0a02046b6f858b8174d1-116-116.png' : 'https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png' )
                    , doctSpec = item.doctSpec || '无'

                  return <li key={key} onClick={this.toDoctor.bind(this, item)} className="list-item list-nowrap">
                    <Icon url={doctPictureUrl} circle={true} style={iconStyle} />
                    <div className="list-content">
                      <div className="list-title">{doctName}</div>
                      <div className="list-brief txt-nowrap">{doctProfe}</div>
                      <div className="list-brief txt-nowrap">擅长：{doctSpec}</div>
                    </div>
                  </li>
                }.bind(this)
              )
            }
          </ul>
        </div>
      )
    }
    return (
      <div style={{overflow: 'hidden'}}>
        <div className="notice">
          <span
            className="notice-icon icon-o-search"
            style={{backgroundImage: "url(//front-images.oss-cn-hangzhou.aliyuncs.com/i4/9c6b00a766c5b33dbf0f272bb566567e-120-120.png)"}} />
          <p>科室搜索无排班医生</p>
        </div>
      </div>
    )
  }
}