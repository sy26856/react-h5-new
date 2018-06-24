import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import Swipe from './component/swipe/Swipe';
import UserCenter from './module/UserCenter';
import Aolsee from './module/Aolsee';
import util from './lib/util';
import CorpList from './component/corpList/CorpList';
import HistoryDoctor from './component/historyDoctor/HistoryDoctor';
import Attention from './component/attention/Attention';
import './index-area2.less';

export default class IndexArea2 extends SmartBlockComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      result: null,
      bannerReady: false,

      searchBgColorOpacity: 0
    };
    const query = util.query();
    this.unionId = query.unionId || '';
  }

  componentDidMount() {
    UserCenter.getAppIndexNew(this.unionId, 'H5')
      .subscribe(this)
      .fetch();
    this.getBanner()

    windowScrollTopChange( scrollTop => {
      let searchBgColor = null
      this.setState({
        searchBgColorOpacity: Math.min( scrollTop / 150, 1 )
      })
    })
  }

  onSuccess(result) {
    this.setState({
      success: true,
      loading: false,
      result: result.data,
      bannerReady: true
    });
  }

  getBanner() {
    const _this = this;
    let bannerThis = {
      onSuccess(result){
        _this.setState({
          resultBanner: result.data
        })
        window.localStorage.uuid = result.data[0] ? result.data[0].uuid : ''
      },
      onError() {
        _this.setState({
          bannerReady: true
        })
      }
    }
      , uuid = window.localStorage.uuid || ''

    Aolsee.getAppIndexBanner(this.unionId, uuid)
      .subscribe(bannerThis)
      .fetch();
  }

  getUrl(data, urlInfo) {
    const url = {};
    let urlStr = data.href || '';

    if (urlStr.indexOf('?') > -1) {
      urlStr += '&';
    } else {
      urlStr += '?';
    }
    if (data.status != 1) {
      url.href = `${urlStr}${util.flat(urlInfo)}`;
    }
    return url;
  }

  topBox(data, i) {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank',
    };

    if (data.code == "-1000") {
      return <div className="grid-top-box" key="-1000"></div>
    }
    return (
      <a className="grid-top-box" key={i} {...this.getUrl(data, urlInfo)} data-spm={data.code}>
        <div className="grid-top-logo">
          <img src={data.windowImage}/>
        </div>
        <div className="grid-top-box-word">
          <p className="grid-container-title">{data.windowName}</p>
          <p className="grid-container-value">{data.windowDes}</p>
        </div>
        {data.status == 1 ? <div className="not-online"></div> : null}
        {data.status == 2 ? <div className="new-online"></div> : null}
      </a>
    );
  }

  bottomBox(data, i) {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank',
    };

    return (
      <a className="grid-bottom-box" key={i} {...this.getUrl(data, urlInfo)} data-spm={data.code}>
        <div className="grid-bottom-logo">
          <img src={data.windowImage}/>
        </div>
        <p>{data.windowName}</p>
        {data.status == 1 ? <div className="not-online"></div> : null}
        {data.status == 2 ? <div className="new-online"></div> : null}
      </a>
    );
  }

  renderGrid() {
    const {result} = this.state;

    if (result.serviceWindows) {
      const topView = result.serviceWindows.topWindowList;
      const bottomView = result.serviceWindows.bottomWindowList;
      const bottomWindowNum = result.serviceWindows.bottomWindowNum;
      const more = result.serviceWindows.more;
      let showNum = bottomView.length > bottomWindowNum ? bottomWindowNum : bottomView.length;
      const bottomResult = [];

      for (let i = 0; i < showNum; i++) {
        bottomResult.push(bottomView[i]);
      }

      if (showNum < bottomView.length) {
        bottomResult[showNum - 1] = {
          code: "-999",
          href: "./application-list.html",
          status: 0,
          windowName: '全部',
          windowImage: '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/daaee720b81de5a956c806cbf9996366-40-40.png'
        };
      } else if (showNum == bottomView.length && more) {
        bottomResult[showNum - 1] = {
          code: "-999",
          href: "./application-list.html",
          status: 0,
          windowName: '全部',
          windowImage: '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/daaee720b81de5a956c806cbf9996366-40-40.png'
        };
      } else if (showNum > bottomView.length && more) {
        bottomResult.push({
          code: "-999",
          href: "./application-list.html",
          status: 0,
          windowName: '全部',
          windowImage: '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/daaee720b81de5a956c806cbf9996366-40-40.png'
        });
      }

      if (topView.length % 2 != 0) {
        topView.push({code: "-1000"});
      }

      return (
        <div className="grid-container">
          <div className="grid-top-container" style={{borderBottom: '1px solid #eee'}} data-spm="top">
            {topView.map((z, i) => this.topBox(z, i))}
          </div>
          <div className="grid-bottom-container" data-spm="bottom">
            {bottomResult.map((z, i) => this.bottomBox(z, i))}
          </div>    
        </div>
      );
    }
    return null;
  }

  toSearch = () => {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank',
    };
    window.location.href = `./search-index.html?${util.flat(urlInfo)}`;
  };

  renderEmptyBanner() {
    return (
      <div className="swiper-empty-box">
        <img src="https://image.yuantutech.com/i4/b2bfb00af68aa5566ae3de988bd8b454-750-388.png"/>
      </div>
    );
  }

  render() {
    const result = this.state.resultBanner
    const banner = result || []

    const { searchBgColorOpacity } = this.state

    const barBgStyle = {
      backgroundColor: 'rgba( 255, 255, 255,'+ searchBgColorOpacity +')'
      ,borderBottom: searchBgColorOpacity > 0.8 ? '1px solid #d8d8d8' : ''
    }
    , searchBgStyle = {
      backgroundColor: searchBgColorOpacity > 0.8 ? '#E7E7E8' : ''
    }
    return (
      <div>
        <div className="index-top-bar" style={ barBgStyle } onClick={this.toSearch}>
          <div className="search-top-bar" style={ searchBgStyle }>输入疾病、症状、医生、科室</div>
        </div>
        <div className="banner-container" data-spm="banner">
          {this.state.bannerReady ? <Swipe banners={banner}/> : this.renderEmptyBanner()}
        </div>
        {this.renderGrid()}
        {/* <Attention unionId={this.unionId}/> 产品说 h5 取消该功能*/}
        {/* <HistoryDoctor unionId={this.unionId}/> */}
        <CorpList unionId={this.unionId}/>
      </div>
    );
  }
}


function windowScrollTopChange ( callBack ) {
  window.onscroll = function () {
    callBack( window.scrollY )
  }
}