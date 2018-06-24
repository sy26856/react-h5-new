/*
 * @Author: saohui 
 * @Date: 2017-08-21 16:20:53 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-29 11:17:14
 */
import React from 'react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import Cover from './component/cover/Cover'
import UserCenter from './module/UserCenter'
import util from './lib/util'

import './doctor-profile.less'

export default class DoctorProfile extends SmartBlockComponent {
  constructor ( props ) {
    super( props )

    const query = util.query()
    this.unionId = query.unionId
    this.corpId = query.corpId
    this.doctCode = query.doctCode
    this.deptCode = query.deptCode
    this.corpName = query.corpName
    this.doctName = query.doctName

    this.state = {
      ...this.state
      ,loading: true
      ,success: false
      ,doctorData: {
        doctName: this.doctName || ''
        ,doctLogo: ''
        ,doctSpec: ''
        ,doctProfe: ''
        ,rate: 0
        ,corpName: this.corpName || ''
      }
    }
  }

  componentDidMount () {
    const { unionId, corpId, doctCode, deptCode } = this
    
    // 获取医生信息
    UserCenter.getDoctorInfoAndDept( corpId, doctCode, deptCode )
      .subscribe({
        onSuccess: result => {
          const { data } = result
          // console.log( data )
          if ( result.success ) {
            this.setState({
              loading: false
              ,success: true
              ,doctorData: data.doctInfo
            })
          }
        }
        ,onError: result => this.setState({
          loading: false
          ,success: true
        })
      })
      .fetch()
  }


  /***** render 区开始 *****/

  renderHeader () {
    const { doctName, doctProfe, corpName, doctSpec, doctPictureUrl, sex } = this.state.doctorData
    const doctLogo = doctPictureUrl || (sex == '女' ? 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/fe22e264886052a69a3fffabbebaace9-174-174.png' : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/90e5757435f5c21c4cfc9d3483b7132a-174-174.png')

    return <Cover isShare={ true }
                  shareData={{
                    title: doctName +': '+ ( corpName || '') + ( doctProfe || '')
                    ,text: doctSpec
                    ,url: location.href
                    ,imageUrl: doctLogo
                  }}
                  logoImg={ doctLogo }
                  >
      <div className="cover-title">{ doctName }</div>
      <div className="cover-brief ">{ doctProfe }</div>
      <div className="cover-brief ">{ corpName }</div>
    </Cover>
  }
  renderBody () {
    const { doctorData } = this.state
    return <div className="main-body">
      <div className="be-good-at">
        <header className="title">
          <h2>专业擅长</h2>
        </header>
        <section className="content" >
          <p className="content-text">{ doctorData.doctSpec || '无'}</p>
        </section>
      </div>
      <div className=" g-space"></div>
      <div className="introduction">
        <header className="title">
          <h2>医生介绍</h2>
        </header>
        <section className="content" >
          <p className="content-text">{ doctorData.doctIntro || '无'}</p>
        </section>
      </div>
    </div>
  }

  render () {
    return <div className="doctor-profile">
      { this.renderHeader() }
      { this.renderBody() }
    </div>
  }
}