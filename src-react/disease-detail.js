import React, {PropTypes} from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import DataCenter from './module/DataCenter';
import util from './lib/util';
import './disease-detail.less';

class SlideBar extends React.Component {

  static propTypes = {
    close: PropTypes.func,
    select: PropTypes.func,
  };

  right = -240;

  animated = () => {
    if (this.right < 0) {
      this.right = this.right + 15;
      requestAnimationFrame(this.animated);
      this.forceUpdate();
    }
  };

  componentDidMount() {
    requestAnimationFrame(this.animated);
  }

  render() {
    const {close} = this.props;
    return (
      <div className="slide-bar" onClick={() => close()}>
        <div className="slide-content" style={{right: `${this.right}px`}}>
          <a href="#c1">1.简介</a>
          <a href="#c2">2.病因</a>
          <a href="#c3">3.症状</a>
          <a href="#c4">4.检查</a>
          <a href="#c5">5.诊断鉴别</a>
          <a href="#c6">6.治疗</a>
          <a href="#c7">7.预防</a>
          <a href="#c8">8.护理</a>
          <a href="#c9">9.饮食保健</a>
        </div>
      </div>
    );
  }
}


export default class DiseaseDetail extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();

    this.code = query.code || '';
    this.type = query.type || '';

    this.state = {
      loading: true,
      success: false,
      data: null,
      showSlide: false
    }
  }

  componentDidMount() {
    const self = this;
    DataCenter.detail(this.code, this.type).subscribe({
      onSuccess(result) {

        const data = result.data;
        const description = data.description || data.jieshao;
        const cause = data.cause || data.yuanyin;
        const symptom = data.symptom || '';
        const inspect = data.inspect || data.jiancha;
        const diagnosis = data.diagnosis || data.zhenduan;
        const treat = data.treat || '';
        const prevent = data.prevent || data.yufang;
        const nursing = data.nursing || '';
        const food = data.food || '';

        self.setState({
          description,
          cause,
          symptom,
          inspect,
          diagnosis,
          treat,
          prevent,
          nursing,
          food,
          success: true,
          loading: false,
        });
      }
    }).fetch();
  }

  scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  showCatalog = () => {
    this.setState({
      showSlide: true,
    });
  };

  closeCatalog = () => {
    this.setState({
      showSlide: false
    });
  };

  renderItem(text, title, id) {
    return (
      <div className="disease-detail-block" id={`c${id}`}>
        <h2>{id}.{title}</h2>
        <div dangerouslySetInnerHTML={{__html: text || '<p>无</p>'}}></div>
      </div>
    )
  }

  render() {
    const {description, cause, symptom, inspect, diagnosis, treat, prevent, nursing, food, showSlide} = this.state;

    return (
      <div>
        <div className="disease-detail-container">
          {this.renderItem(description, '简介', 1)}
          {this.renderItem(cause, '病因', 2)}
          {this.renderItem(symptom, '症状', 3)}
          {this.renderItem(inspect, '检查', 4)}
          {this.renderItem(diagnosis, '诊断鉴别', 5)}
          {this.renderItem(treat, '治疗', 6)}
          {this.renderItem(prevent, '预防', 7)}
          {this.renderItem(nursing, '护理', 8)}
          {this.renderItem(food, '饮食保健', 9)}
        </div>

        <div className="disease-up-block" onClick={this.scrollToTop}>
          <img
            src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/ef2aab0cadcc2b6ae1863a3c65285ad9-128-128.png"/>
        </div>

        <div className="disease-catalog" onClick={this.showCatalog}>目录</div>

        {showSlide ? <SlideBar close={() => this.closeCatalog()}/> : null}
      </div>
    );
  }
}