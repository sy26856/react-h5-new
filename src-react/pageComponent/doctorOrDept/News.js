/*
 * @Author: saohui 
 * @Date: 2017-09-19 11:05:48 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-19 11:52:02
 */
import React, { Component, PropTypes } from 'react'

export default class News extends Component {
  static propTypes = {
    nextDoctorNewsPage: PropTypes.func
  }

  constructor ( props ) {
    super( props )

    this.state = {
      pageSize: 6
      ,currentPage: 0
      ,loading: false
      ,fold: true
      ,list: []
      ,isFinished: false
    }
  
    this._componentDidMount = this.componentDidMount
    this.componentDidMount = this.toComponentDidMount
  }
  toComponentDidMount () {
    setTimeout(() => { // 让首屏先去加载
      this.init && this.init()
    }, 30 )
    this._componentDidMount
  }

  handleNewsMore ( type ) {
    const CLASSIFYIDS = {
      doctorArtical: null
      ,listenDoctorData: 3
    }

    const obj = this.state
    if ( obj.fold && obj.currentPage == 1 ) {
      obj.fold = false
      this.setState({})
      return
    }
    this.props.nextDoctorNewsPage && this.props.nextDoctorNewsPage( obj, CLASSIFYIDS[ type ])
  }
}