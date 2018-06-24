import React from 'react';

const mock = {
  success: true,
  resultCode: "100",
  msg: "成功",
  data: [
    {
      alipayVersion: 2,
      corpId: 261,
      type: 0,
      name: "青岛市妇女儿童医院",
      corpTags: "三级甲等",
      corpLogo: "https://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/31a6c823d5ec4beb992a2a8375b94663.jpg",
      needPassword: 1,
      scheduleRule: 1,
      parentCorpId: 0,
      registerList: [],
      appointMode: 0,
      coordinate: "120.408837,36.102829",
      funcTagList: [
        "预约挂号",
        "挂号查询",
        "排队叫号"
      ],
      registerAMBegin: "",
      registerAMEnd: "",
      registerPMBegin: "",
      appointDays: 7,
      registerPMEnd: ""
    },
    {
      alipayVersion: 2,
      corpId: 261,
      type: 0,
      name: "青岛市妇女儿童医院",
      corpTags: "三级甲等",
      corpLogo: "https://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/31a6c823d5ec4beb992a2a8375b94663.jpg",
      needPassword: 1,
      scheduleRule: 1,
      parentCorpId: 0,
      registerList: [],
      appointMode: 0,
      coordinate: "120.408837,36.102829",
      funcTagList: [
        "预约挂号",
        "挂号查询",
        "排队叫号"
      ],
      registerAMBegin: "",
      registerAMEnd: "",
      registerPMBegin: "",
      appointDays: 7,
      registerPMEnd: ""
    },
    {
      alipayVersion: 2,
      corpId: 261,
      type: 0,
      name: "青岛市妇女儿童医院",
      corpTags: "三级甲等",
      corpLogo: "https://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/31a6c823d5ec4beb992a2a8375b94663.jpg",
      needPassword: 1,
      scheduleRule: 1,
      parentCorpId: 0,
      registerList: [],
      appointMode: 0,
      coordinate: "120.408837,36.102829",
      funcTagList: [
        "预约挂号",
        "挂号查询",
        "排队叫号"
      ],
      registerAMBegin: "",
      registerAMEnd: "",
      registerPMBegin: "",
      appointDays: 7,
      registerPMEnd: ""
    }
  ],
  startTime: 1486374115400,
  timeConsum: 0
}

export default class RegisterHospital extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false
    }
  }

  myFocus = () => {
    this.setState({
      isFocus: true,
    });
    setTimeout(() => {
      this.refs.input.focus();
    }, 0);
  };

  myBlur = (e) => {
    //阻止冒泡
    e.stopPropagation();
    this.setState({
      isFocus: false,
    });
  };

  searchBar() {
    const { isFocus } = this.state;
    return (
      <div className={`search-wrapper ${isFocus ? 'search-focus' : ''}`} onClick={this.myFocus}>
        <div className="search">
          <span className="search-icon icon-search"></span>
          <div className="search-text">搜索医院、医生</div>
          <input ref="input" type="text" className="search-input" />
          <span className="search-close"></span>
        </div>
        <button className="search-canel" onClick={this.myBlur}>取消</button>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.searchBar()}
        <ul className="list-ord">
          <li className="list-item">
            <img className="list-icon hospital-icon"
                 src="https://image.yuantutech.com/i4/cafad83e314e9fb646211d779686bf72-73-73.png"/>
            <div className="list-content">
              <div className="list-title hospital-corpname">医院名</div>
              <div className="list-brief">辅助文字内容</div>
              <div className="list-brief">
                <span className="hospital-distance">市北 3.0km</span>
                <div className="hospital-tags">
                  {['预约', '挂号'].map((z, i) => <span key={i} className="hosptail-tags2">{z}</span>)}
                </div>
              </div>
            </div>
          </li>
          <li className="list-item">
            <img className="list-icon hospital-icon"
                 src="https://image.yuantutech.com/i4/cafad83e314e9fb646211d779686bf72-73-73.png"/>
            <div className="list-content">
              <div className="list-title hospital-corpname">医院名</div>
              <div className="list-brief">辅助文字内容</div>
              <div className="list-brief">
                <span className="hospital-distance">市北 3.0km</span>
                <div className="hospital-tags">
                  {['预约', '挂号'].map((z, i) => <span key={i} className="hosptail-tags2">{z}</span>)}
                </div>
              </div>
            </div>
          </li>
          <li className="list-item">
            <img className="list-icon hospital-icon"
                 src="https://image.yuantutech.com/i4/cafad83e314e9fb646211d779686bf72-73-73.png"/>
            <div className="list-content">
              <div className="list-title hospital-corpname">医院名</div>
              <div className="list-brief">辅助文字内容</div>
              <div className="list-brief">
                <span className="hospital-distance">市北 3.0km</span>
                <div className="hospital-tags">
                  {['预约', '挂号'].map((z, i) => <span key={i} className="hosptail-tags2">{z}</span>)}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}