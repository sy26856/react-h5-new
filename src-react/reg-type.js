import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import './reg-type.less';

const list = [
  {
    type: "1",
    regMode: "2",
    icon: "//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
    name: "普通挂号"
  },
  {
    type: "2",
    regMode: "2",
    icon: "//s.yuantutech.com/i4/6798ebaf71d1e63307dd0213b5dabc08-102-102.png",
    name: "专家挂号"
  },
  {
    type: "3",
    regMode: "2",
    icon: "//s.yuantutech.com/i4/f9ff46f0206efe237323010f5899b571-102-102.png",
    name: "名医挂号"
  },
  {
    type: "14",
    regMode: "2",
    icon: "//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
    name: "急诊挂号"
  },
  {
    type: "15",
    regMode: "2",
    icon: "//image.yuantutech.com/user/0cd106c75a78112004971edf8d296c49-102-102.png",
    name: "便民挂号"
  },
  {
    type: "16",
    regMode: "2",
    icon: "//image.yuantutech.com/user/f80b09e238ebd33dae3068f546f38e4f-80-80.png",
    name: "视频问诊挂号"
  },

  //预约
  {
    type: "4",
    regMode: "1",
    icon: "//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
    name: "普通预约"
  },
  {
    type: "5",
    regMode: "1",
    icon: "//s.yuantutech.com/i4/6798ebaf71d1e63307dd0213b5dabc08-102-102.png",
    name: "专家预约"
  },
  {
    type: "6",
    regMode: "1",
    icon: "//s.yuantutech.com/i4/f9ff46f0206efe237323010f5899b571-102-102.png",
    name: "名医预约"
  },
  {
    type: "54",
    regMode: "1",
    icon: "//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
    name: "急诊预约"
  },
  {
    type: "55",
    regMode: "1",
    icon: "//image.yuantutech.com/user/0cd106c75a78112004971edf8d296c49-102-102.png",
    name: "便民预约"
  },
  {
    type: "56",
    regMode: "1",
    icon: "//image.yuantutech.com/user/f80b09e238ebd33dae3068f546f38e4f-80-80.png",
    name: "视频问诊预约"
  }
];

export default class RegType extends SmartBlockComponent {

  constructor(props) {
    super(props);
    let query = util.query();
    this.id = query.id || "";
    this.corpId = query.corpId;
    this.unionId = query.unionId;
    this.type = query.type || "11"; //0只显示预约，1只显示挂号，否则全显示
    this.state = {
      loading: true,
      success: false,
      result: {},
      guahaoList: [],
      yuyueList: [],
    }
  }

  componentDidMount() {
    UserCenter.getHospitalInfo(this.corpId, this.id).subscribe(this).fetch();
  }

  onSuccess(result) {
    try {
      const allList = [];
      for (let i = 0; i < list.length; i++) {
        if (result.data.corpRegister.indexOf((list[i].type - 0)) > -1) {
          allList.push(list[i]);
        }
      }
      const guahaoList = allList.filter(z => z.regMode == 2);
      const yuyueList = allList.filter(z => z.regMode == 1);
      console.log(result);
      this.setState({
        loading: false,
        success: true,
        result: result.data,
        guahaoList,
        yuyueList,
      });
    } catch (e) {
      console.log(e);
    }
  }

  item(z, i) {
    return (
      <li key={i} className="list-item">
        <a
          className="txt-arrowlink list-link-wrapper"
          href={`./sections.html?${util.flat({
            type: z.type,
            corpId: this.corpId,
            regMode: z.regMode,
            unionId: this.unionId,
            target: "_blank"
          })}`}
        >
          <img src={z.icon} className="list-icon" />
          <div className="list-content">
            <div className="list-title" style={{lineHeight: '42px'}}>{z.name}</div>
          </div>
        </a>
      </li>
    );
  }

  render() {
    const {yuyueList, guahaoList} = this.state;
    const {corpLogo, corpName, registerTimeCopy, appointmentTimeCopy} = this.state.result;
    return (
      <div className="reg-type-page">
        <div className="hos-info">
          <div className="hos-img" style={{backgroundImage: `url(${corpLogo})`}}></div>
          <p>{corpName}</p>
        </div>
        {
          (guahaoList.length > 0 && this.type !== '0') ?
            <div className="reg-module">
              <div className="title"><strong>实时挂号</strong> 无需取号 直接就诊</div>
              <ul className="list-ord">
                {guahaoList.map((z, i) => this.item(z, i))}
              </ul>
              <div className="ui-tips">{registerTimeCopy}</div>
            </div> : null
        }
        {
          (yuyueList.length > 0 && this.type !== '1') ? <div className="reg-module">
            <div className="title"><strong>预约挂号</strong> 超长预约 先取号后就诊</div>
            <ul className="list-ord">
              {yuyueList.map((z, i) => this.item(z, i))}
            </ul>
            <div className="ui-tips">{appointmentTimeCopy}</div>
          </div> : null
        }
      </div>
    )
  }
}
