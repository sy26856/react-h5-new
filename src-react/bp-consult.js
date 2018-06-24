
import React from 'react'
import './bs-consult.less'

export default class BpConsult extends React.Component {
  constructor(props){
    super(props)
  }
  render () {
    let bsImg = '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/15ce489af65e32d8b19650d45be7b011-1125-1808.png'
    return ( 
      <div className="sugar-box">
        <img className="sugar-img" src={bsImg}/>
      </div>
    );  
  }
}
