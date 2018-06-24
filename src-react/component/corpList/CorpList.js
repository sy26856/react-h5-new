import React from 'react';
import UserCenter from '../../module/UserCenter';
import util from '../../lib/util';
import {PROTOCOL, TMS_DOMAIN} from '../../config';
import CorpItem from '../corpItem/CorpItem';
import getLocation from '../../lib/getLocation';
//引入图片懒加载组件
import LazyLoad from 'react-lazyload';
import './corpList.less';

export default class CorpList extends React.Component {

  static propTypes = {
    unionId: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      success: false,
      distanceSuccess: false,
      distanceError: false,
      result: [],
      lat: 0,
      lng: 0
    };
  }

  componentDidMount() {
    this.initMap();
    UserCenter.getCorpList('', this.props.unionId).subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      result: result.data,
      success: true,
    });
  }

  async initMap() {
    try {
      const location = await getLocation();
      this.setState({
        lat: location.lat,
        lng: location.lng,
        distanceSuccess: true,
      });
    } catch (e) {
      this.setState({
        distanceError: true,
      })
    }
    /*const geolocation = new qq.maps.Geolocation("NTEBZ-OPCRR-37WW6-WNGXI-KFHAO-P3FLZ", "myapp");
     geolocation.getLocation(this.getArea, this.getError);*/
  }

  /*
   getArea = (res) => {
   this.setState({
   lat: res.lat,
   lng: res.lng,
   distanceSuccess: true,
   });
   };
   getError = (err) => {
   this.setState({
   distanceError: true,
   });
   };
   */

  toCorpHome(data) {
    const urlInfo = {
      unionId: this.props.unionId,
      corpId: data.corpId,
      target: '_blank'
    };
    if (data.online == 1) {
      const url = `./index.html?${util.flat(urlInfo)}`;
      const tmsUrl = `${PROTOCOL}${TMS_DOMAIN}/tms/h5/transfer.php?transferKey=2&${util.flat(urlInfo)}`;
      window.location.href = util.isTMS() ? tmsUrl : url;
    }
  }

  renderItem(data, i) { 
    const {lat, lng, distanceSuccess, distanceError} = this.state;
    const distanceNum = util.getFlatternDistance(lat, lng, data.lat, data.lng);
    let distanceStr = distanceSuccess ? util.distanceFormat(distanceNum) : '';
    if (distanceError) {
      distanceStr = '';
    }
    
    return (
      <li style={{overflow: 'hidden'}} className="list-item list-nowrap" data-spm={'c' + data.corpId} key={i} onClick={() => this.toCorpHome(data)}>
      <LazyLoad offset={100} once={true}>
        <img className="list-icon hospital-icon"
              src={data.corpLogo}/>
      </LazyLoad>
        <div className="list-content">
          <div className="list-title hospital-corpname">
            <span className="txt-nowrap hospital-corpname-content" style={{ paddingRight: data.isStar ? 40 : 'auto' }}>{data.name}&nbsp;&nbsp;</span>
            { data.isStar && <span className='star-hospital' style={{ marginLeft: -40 }}>常挂号</span> }
          </div>
          <div className="list-brief hospital-brief hospital-corptag">{data.corpTags}</div>
          <div className="list-brief hospital-brief">
            <span className="hospital-distance">{data.area} {distanceStr}</span>
            <div className="hospital-tags">
              {data.funcTagList.map((z, i) => <span key={i} className="hosptail-tags2">{z}</span>)}
            </div>
          </div>
        </div>
        {data.online == 0 && <div className="off-line-tag">未开通</div> }
      </li>
    );
  }

  renderList() {
    const {result, success, distanceSuccess} = this.state;
    const starList = result.filter(z => z.isStar);
    const notStarList = result.filter(z => !z.isStar);
    const corpList = starList.concat(notStarList);
    
    if (success) {
      return <ul className="list-ord">{corpList.map((z, i) => this.renderItem(z, i))}</ul>
    }
    return <div className="render-loading-container">
      <div className="icon-h-loading render-loading-circle"></div>
    </div>;
  }

  render() {
    const {result} = this.state;
    return (
      <div data-spm="hospital" className="hospital-list-container">
        <div className="hospital-list-title">医院列表({result.length})</div>
        {this.renderList()}
      </div>
    );
  }
}