import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import Swipe from './component/swipe/Swipe';
import './index-area.less';

export default class IndexArea extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.unionId = query.unionId || '';
    this.state = {
      success: false,
      loading: true,
      list: [],
      banners: [],
    };
  }

  componentDidMount() {
    UserCenter.getIndexArea(this.unionId).subscribe(this).fetch();
    const areaTitle = {
      "29": "青岛市卫生计生委",
      "60": "番禺智慧医疗"
    };
    document.title = areaTitle[this.unionId] || "慧医";
  }

  onSuccess(result) {
    console.log(result);
    this.setState({
      success: true,
      loading: false,
      list: result.data.corpList,
      banners: result.data.banners,
    });
  }

  getUrl(data) {
    const url = {};
    if (data.online == 1) {
      url.href = `pages/index.html?corpId=${data.corpId}&unionId=${this.unionId}&target=_blank`;
    }
    return url;
  }

  item(data, i) {
    const tags = data.tags || [];
    return (
      <a
        {...this.getUrl(data)}
        data-name={data.name}
        key={i}
        className={`drop-item ${data.online == 1 ? 'ui-form-item-link' : 'mask'} ui-border-tb`}
      >
        {data.online == 0 ? <div className="off-line-tag">未开通</div> : null}
        <div className={data.online == 0 ? 'item-box' : null}>
          <div className="logo" style={{backgroundImage: `url(${data.logo.replace("http://", "//")})`}}></div>
          <div className="info">
            <h1>{data.name}</h1>
            <div className="honor">
              {tags.map((z, i) => <span key={i} className="honor-tag">{z}</span>)}
            </div>
            <div className="address">{data.address}</div>
          </div>
        </div>
      </a>
    );
  }

  render() {
    const {list, banners} = this.state;
    return (
      <div>
        <Swipe
          banners={banners}
        />
        <div className="drop-list">
          {list.map((z, i) => this.item(z, i))}
        </div>
      </div>
    );
  }
}
