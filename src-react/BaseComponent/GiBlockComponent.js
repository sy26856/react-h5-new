/*
 * @Author: saohui 
 * @Date: 2017-09-26 16:55:58 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-29 14:17:56
 */

import React from 'react'
import SmartBlockComponent from './SmartBlockComponent'

export default class GiBlockComponent extends SmartBlockComponent {
  constructor ( props ) {
    super( props )
    this.state = {
      ...this.state
      ,loading: props.loading
      ,loadingMsg: props.loadingMsg
      ,success: props.success
      ,msg: props.errorMsg
    }
    this.__componentWillReceiveProps = this.componentWillReceiveProps
    this.componentWillReceiveProps = this.toComponentWillReceiveProps
  }

  toComponentWillReceiveProps ( nextProps ) {
    const { loading, loadingMsg, success, errorMsg } = nextProps
    this.__componentWillReceiveProps && this.__componentWillReceiveProps( nextProps )
    this.setState({
      loading
      ,loadingMsg
      ,success
      ,msg: errorMsg
    })
  }
}