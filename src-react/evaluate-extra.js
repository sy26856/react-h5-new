"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import Alert from './component/alert/alert';
import Icon from './component/icon/Icon'
import './evaluate-extra.less'

const iconStyle = {
  float: 'left',
  marginRight: '10px'
};

const starImg = {
  backgroundImage: 'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f1321e420ae3064ec40aa9752015310-52-50.png)'
};
const starActionImg = {
  backgroundImage: 'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/bbcf9a702d8b8914dcf2ee6bea303933-52-50.png)'
};

//评价
export default class Evaluate extends SmartBlockComponent {
  constructor(props) {
    super(props);
    let query = util.query();
    this.doctCode = query.doctCode || '';
    this.corpId = query.corpId;
    this.deptCode = query.deptCode;
    this.id = query.id || '';
    this.medEndTime = util.dateFormat(query.medEndTime - 0, 'yyyy-MM-dd hh:mm:ss');

    this.state = {
      isSubmit: false,
      evaluateInfo: {},
      evaluate: {},
      tagList: []
    }
  }

  componentWillMount() {
    let logo;
    if (this.doctCode) {
      logo = "//image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png";
    } else {
      logo = "//front-images.oss-cn-hangzhou.aliyuncs.com/i4/6df445b910e7bd736c6d97e89a87a5a9-116-116.png";
    }

    this.setState({
      logo,
      corpName: '',
      date: null
    });
  }

  componentDidMount() {
    if (this.doctCode) {
      UserCenter.getDoctorInfo(this.corpId, this.deptCode, this.doctCode)
        .subscribe(this)
        .fetch()
    } else {
      UserCenter.getDeptInfo(this.corpId, this.deptCode)
        .subscribe(this)
        .fetch()
    }

    const self = this;

    UserCenter.getEvaluateInfo(this.medEndTime).subscribe({
      onSuccess(result) {
        const tagList = result.data.appendEvaluate ? result.data.appendEvaluate[0].tagList : [];
        tagList.forEach(item => {
          item.active = false
        });
        self.setState({
          tagList,
          success: true,
          loading: false,
        });
      },
      onError: () => {
        util.goLogin();
      }
    }).fetch();

    UserCenter.getEvaluate(this.id).subscribe({
      onSuccess(result) {
        self.setState({
          evaluate: result.data
        });
      },
      onError: () => {
        util.goLogin();
      }
    }).fetch();
  }

  onSuccess(result) {
    let data = result.data;
    const {logo} = this.state;
    this.setState({
      corpName: data.corpName,
      doctName: data.doctName,
      deptName: data.deptName,
      doctTech: data.doctTech,
      logo: data.doctPictureUrl ? data.doctPictureUrl : logo,
    })
  }

  selectLabel(item) {
    const tagList = JSON.parse(JSON.stringify(this.state.tagList));
    tagList.forEach(listItem => {
      if (listItem.id === item.id) {
        listItem.active = true
      } else {
        listItem.active = false
      }
    });
    this.setState({
      tagList,
    });
  }

  submit() {
    const tagStr = this.state.tagList.filter(item => item.active).map(item => item.id).join(',');

    if (!tagStr) {
      Alert.show('请选择追加评论标签', 2000);
      return;
    }
    if (!this.refs.input.value) {
      Alert.show('评论不得为空', 2000);
      return;
    }

    UserCenter.addAppendEvaluate(this.refs.input.value, this.id, tagStr).subscribe({
      onSendBefore: () => {
        this.setState({
          isSubmit: true
        })
      },
      onSuccess() {
        Alert.show('提交成功', 2000);
        setTimeout(() => {
          util.goBack(true)
        }, 2000)
      },
      onError() {
        Alert.show('提交失败', 2000);
      }
    }).fetch();
  }

  render() {
    const { doctName, deptName, doctTech, logo, corpName, tagList, evaluate, isSubmit } = this.state;

    const starArr = [];
    for (let i = 0; i < 5; i++) {
      evaluate.totalEvaluate > i ? starArr.push(1) : starArr.push(0);
    }

    return (
      <div>
        <div className="panel g-space" style={{backgroundColor: '#f8f8f8'}}>
          <div className="list-ord" style={{border: 'none'}}>
            <div className="list-item ">
              <Icon url={logo} circle={true} style={iconStyle}/>
              <div className="list-content">
                <div className="list-title" style={{fontSize: '16px'}}>{doctName || deptName}</div>
                <p className="list-brief">{corpName} <span style={{marginLeft: '10px'}}>{deptName} {doctTech ? "- " + doctTech : null}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="panel g-space">
          <div className="panel-title extra-evaluate-stars" style={{border: 'none'}}>
            已评价
            {
              starArr.map((item, index) => item === 1 ?
                <span key={`star${index}`} style={starActionImg} className="icon-star-action"/>
                : <span key={`star${index}`} style={starImg} className="icon-star"/>)
            }
            <span className="panel-extra"
                  style={{color: '#999'}}>{util.dateFormat(evaluate.createTime, 'yyyy-MM-dd')}</span>
          </div>
          {
            evaluate.evaluate && <div className="panel-msg" style={{borderBottom: 'none'}}>
              <p className="evaluate-extra-value">{evaluate.evaluate}</p>
            </div>
          }
        </div>

        <div className="panel g-space">
          <div className="panel-title" style={{borderTop: 'none'}}>追加评价</div>
          <div className="panel-msg" style={{margin: 'auto', borderBottom: 'none'}}>
            <div className={`${tagList.length > 0 ? 'extra-label-container' : ''}`}>
              {tagList.map(item =>
                <div
                  className={`evaluate-label ${item.active ? 'evaluate-label-active' : ''}`}
                  key={item.id}
                  onClick={() => this.selectLabel(item)}
                >
                  {item.name}
                </div>
              )}
            </div>
            <div className="evaluate-extra-container">
              <textarea
                className="evaluate-extra-input"
                placeholder="您可对诊疗效果追加评价"
                ref="input"
              />
            </div>
          </div>
        </div>

        <div className="btn-wrapper">
          <button disabled={ isSubmit } className="btn btn-block" onClick={() => !isSubmit && this.submit()}>发表评价</button>
        </div>
      </div>
    );
  }

}