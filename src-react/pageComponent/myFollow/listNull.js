/*
 * @Author: saohui 
 * @Date: 2017-09-28 14:26:46 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-10-11 13:36:13
 */
import React from 'react'
import util from '../../lib/util'

export default ({ unionId }) => {
  return <div className="notice">
    <span className="notice-icon icon-record"></span>
    <p>暂无关注的医生</p>
    <div className="btn-link">
      <a className='btn ' href={'appointment-hospital.html?'+ util.flat({
        type: 1
        ,unionId
        ,target: '_blank'
      })}>去预约挂号</a>
    </div>
  </div>
}