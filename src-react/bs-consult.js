
import React from 'react'
import './bs-consult.less'

export default class BsConsult extends React.Component {
  constructor(props){
    super(props)
  }
  render () {
    let bsImg = '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f32822bde006aace372424f26c713a6a-1125-3509.png'
    return (    
      <div className="sugar-box">
        <img className="sugar-img" src={bsImg}/>
        {/* <div className="sugar-text">
          <span className="tag-circle"></span>
          <span className="sugar-tag">低血糖：</span>
          <p>对非糖尿病患者来说，血糖&lt;2.8mmol/L即达到低血糖的标准；</p>
          <p>对接受药物治疗的糖尿病患者而言，血糖≤3.9mmol／L就属于低血糖范畴；</p>
        </div>
        <div className="sugar-text">
          <span className="tag-circle"></span>
          <span className="sugar-tag">正常血糖：</span>
          <p>空腹&lt;6.1mmol／L，餐后两小时&lt;7.8mmol/L</p>
        </div>
        <div className="sugar-text">
          <span className="tag-circle"></span>
          <span className="sugar-tag">空腹血糖受损：</span>
          <p>空腹血糖为6.1mmol/L~7.0mmol/L，且糖负荷后两小时血糖&lt;7.8mmol/L</p>
        </div>
        <div className="sugar-text">
          <span className="tag-circle"></span>
          <span className="sugar-tag">糖耐量受损：</span>
          <p>空腹血糖&lt;7.0mmol/L,且糖负荷后两小时血糖为7.8mmol/L~11.1mmol/L</p>
        </div>
        <div className="sugar-state">
          <h3>糖代谢状态分类(WHO1999)</h3>
          <div className="sugar-state-box">
            <div className="state-left">糖代谢状态</div>
            <div className="state-right">
              <p className="state-right-putaot">静脉血浆葡萄糖（mmol/L)</p>
              <p className="state-right-kf">
                <span className="fasting-bs">空腹血糖</span>
                <span className="twohour-bs">糖负荷后两小时血糖</span>
              </p>
            </div>
            <div className="sugar-table">
              <p>
                <span>正常血糖</span>
                <span>&lt;6.1</span>
                <span>&lt;7.8</span>
              </p>
              <p>
                <span>空腹血糖受损</span>
                <span>6.1～&lt;7.0</span>
                <span>&lt;7.8</span>
              </p>
              <p>
                <span>糖耐量受损</span>
                <span>&lt;7.0</span>
                <span>7.8～&lt;11.1</span>
              </p>
              <p>
                <span>糖尿病</span>
                <span>≥7.0</span>
                <span>≥11.1</span>
              </p>
            </div>
          </div>
          
          <div className="explain">
            注：空腹血糖受损（IFG）和耐量糖受损（IGT）统成为糖调节受损，也称糖尿病前期
          </div>
        </div>
        <div className="sugar-standard">
          <h3>糖尿病诊断标准</h3>
          <div className="sugar-state-box">
            <p className="stand-title">
              <span>诊断标准</span>
              <span>静脉血浆葡萄糖水平（mmol/L）</span>
            </p>
            <p className="stand-text">
              <span className="stand-text-left">（1）典型糖尿病症状(多饮，多尿，多食，体重下降)加上随机血糖检测</span>
              <span className="stand-text-right">≥11.1</span>
            </p>
            <p className="stand-text" className="stand-text">
              <span className="stand-text-left">（2）空腹血糖检测</span>
              <span className="stand-text-right">≥7.0</span>
            </p>
            <p className="stand-text">
              <span className="stand-text-left">（3）葡萄糖负荷后两小时血糖检测无糖尿病症状者，需改日重复检查</span>
              <span className="stand-text-right">≥11.1</span>
            </p>
          </div>
          <div className="explain">
            注：空腹状态指至少8小时没有进食热量；随机血糖指不考虑上次用餐时间，一天中任意时间的血糖，不能用来诊断空腹血糖受损或耐糖量异常
          </div>
        </div> */}
      </div>
    );
  }
}
