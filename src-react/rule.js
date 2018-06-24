import React from 'react';
import './rule.less';

export default class Rule extends React.Component {

  render() {
    return (
      <div className="rule-page">
        <div className="rule-content">
          <h2>预约限制</h2>
          <p>为了防止号贩子倒号行为，满足绝大多数百姓的最大利益和公平性，统一平台采取了预约挂号限制。同一患者实名（有效证件号）在同一就诊日、同一医院、同一科室只能预约1次；</p>

          <h2>挂号</h2>
          <p>可以挂当天的号源，视医院自身规定可能只提供普通诊室挂号，挂号时段：根据医院开闭诊时段内可以在线挂号；挂号需要在线支付挂号费，不支持退号（退号需要前往线下窗口）</p>
          <h2>预约取号</h2>
          <p>可以预约当天起未来7天的号源，建议预约后在就诊开始时间提前30分钟取号</p>

          <h2 id="blackRule">黑名单规则</h2>
          <p>1、预约成功后不取消也不去就诊（包括到医院后超过最迟取号时间），记违约一次；</p>
          <p>2、连续三个月的时间跨度内累计违约满 3 次，该就诊人进黑名单，黑名单的惩罚期为 3 个月（一般黑名单从第 3 次违约的第二天开始计算)；</p>
          <p>3、列入黑名单处罚：从处罚开始时间起三个月内不能使用平台所有医院预约服务。黑名单规则是面向区域内所有接入医院，在任意一家医院违约均会计入个人爽约；</p>
          <p>4、考虑到线下看病的紧急性，黑名单只控制预约不控制挂号；</p>
          <p>5、患者凡因个人原因，屡次爽约进入黑名单后，黑名单只能等待自动释放，不支持申诉，申诉无效。其它非个人原因造成进入黑名单，可在帮助与反馈模块提交申诉或者咨询客服热线（0571-89916777）。</p>
        </div>
      </div>
    )
  }
}