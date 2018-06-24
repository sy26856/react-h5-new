import React from 'react'
import {SmartBlockComponent} from '../../BaseComponent/index'
import util from '../../lib/util'
import UserCenter from '../../module/UserCenter'
export default class Evaluate extends SmartBlockComponent {
  constructor(props) {
    super(props)
    this.state = {
      success: true,
      loading: false,
    }
  }

  componentDidMount() {
    //获取评价信息
    let query = util.query();
    UserCenter.getEvaluate(this.props.id)
      .subscribe(this)
      .fetch()
  }

  onSuccess(result) {
    if (result.success) {
      this.setState({
        doctSkill: result.data.totalEvaluate,//医生医术星级
        hospitalEnvironment: result.data.hospitalEnvironment,//医院环境星级
        serviceAttitude: result.data.serviceAttitude,//医务人员服务星级
        evaluate: result.data.evaluate//评价内容
      });
      this.props.setEvaluate(true);
    }
  }

  onError(result) {
    this.props.setEvaluate(false);
  }

  renderEvaluate() {
    let {doctSkill, hospitalEnvironment, serviceAttitude, evaluate} = this.state;
    let doctSkillStars = [];
    let serviceAttitudeStars = [];
    let hospitalEnvironmentStars = [];
    for (let i = 0; i < 5; i++) {
      if (i < doctSkill) {
        doctSkillStars[i] = "icon-star icon-star-action";
      } else {
        doctSkillStars[i] = "icon-star";
      }
    }
    for (let i = 0; i < 5; i++) {
      if (i < serviceAttitude) {
        serviceAttitudeStars[i] = "icon-star icon-star-action";
      } else {
        serviceAttitudeStars[i] = "icon-star";
      }
    }
    for (let i = 0; i < 5; i++) {
      if (i < hospitalEnvironment) {
        hospitalEnvironmentStars[i] = "icon-star icon-star-action";
      } else {
        hospitalEnvironmentStars[i] = "icon-star";
      }
    }

    if (doctSkill && hospitalEnvironment && serviceAttitude) {
      return (
        <div className="panel g-space">
          <div className="panel-title">我的评价</div>
          <ul className="list-ord">
            <li className="list-item list-item-middel">
              <div className="list-content txt-info">总体评价</div>
              <div className="list-extra">
                <span className={doctSkillStars[0]} />
                <span className={doctSkillStars[1]} />
                <span className={doctSkillStars[2]} />
                <span className={doctSkillStars[3]} />
                <span className={doctSkillStars[4]} />
              </div>
            </li>
            <li className="list-item list-item-middel">
              <div className="list-content txt-info">导医服务</div>
              <div className="list-extra">
                <span className={serviceAttitudeStars[0]} />
                <span className={serviceAttitudeStars[1]} />
                <span className={serviceAttitudeStars[2]} />
                <span className={serviceAttitudeStars[3]} />
                <span className={serviceAttitudeStars[4]} />
              </div>
            </li>
            <li className="list-item list-item-middel">
              <div className="list-content txt-info">医院环境</div>
              <div className="list-extra">
                <span className={hospitalEnvironmentStars[0]} />
                <span className={hospitalEnvironmentStars[1]} />
                <span className={hospitalEnvironmentStars[2]} />
                <span className={hospitalEnvironmentStars[3]} />
                <span className={hospitalEnvironmentStars[4]} />
              </div>
            </li>
          </ul>
          {evaluate ?
            <div className="panel-notitle">
              <div className="message-txt">{evaluate}</div>
            </div> : null
          }
        </div>
      )
    } else {
      return;
    }
  }

  render() {
    if (this.props.show) {
      return (
        <div>
          {this.renderEvaluate()}
        </div>
      )
    }
    return null;
  }
}