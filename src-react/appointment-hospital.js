import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import SearchBar from './component/searchbar/SearchBar';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import getLocation from './lib/getLocation';
import './appointment-hospital.less';
import LazyLoad from 'react-lazyload';

export default class AppointmentHospital extends SmartBlockComponent {

  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
      corpList: null,
      searchList: null,
      loading: true,
    };
    const query = util.query();
    this.unionId = query.unionId;

    this.type = query.type || '';
    this.timer = null;
  }

  componentDidMount() {
    this.initMap();
    //type=0时为预约，type=1时为当日挂号
    const searchType = this.type == '0' ? 1 : 2;
    UserCenter.getCorpList(searchType, this.unionId).subscribe(this).fetch(this);
  }

  onSuccess(result) {
    this.setState({
      corpList: result.data,
      searchList: result.data,
      loading: false,
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
      distanceError: false,
    });
  };
  getError = (err) => {
    this.setState({
      distanceError: true,
    });
  };
  */

  searchCorp(input) {
    const inputValue = input.target.value;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const {corpList} = this.state;
      let temp = JSON.parse(JSON.stringify(corpList));
      temp = temp.filter((z) => {
        return z.name.indexOf(inputValue) > -1
      });
      this.setState({
        searchList: temp,
      });
    }, 500);

  }

  toCorpHome(data) {
    const urlInfo = {
      type: this.type,
      unionId: this.unionId,
      corpId: data.corpId,
      target: '_blank',
    };
    const urlInfo2 = {
      regMode: this.type == 1 ? 2 : 1,
      unionId: this.unionId,
      corpId: data.corpId,
      target: '_blank',
    };
    if (data.hasLeaf) {
      window.location.href = `./leaf-corp.html?${util.flat(urlInfo)}`;
    } else {
      window.location.href = `./sections.html?${util.flat(urlInfo2)}`
    }
  }

  renderItem(data, i) {
    const {lat, lng, distanceSuccess, distanceError} = this.state;
    const distanceNum = util.getFlatternDistance(lat, lng, data.lat, data.lng);
    let distanceStr = distanceSuccess ? util.distanceFormat(distanceNum) : '';

    if (distanceError) {
      distanceStr = ''
    }
    return (
      <li className="list-item list-nowrap" key={i} onClick={() => this.toCorpHome(data)}>
        <LazyLoad offset={100} once={true}>
          <img className="list-icon hospital-icon" src={data.corpLogo}/>
        </LazyLoad>
        <div className="list-content">
          <div className="list-title txt-nowrap">{data.name}</div>
          <div className="list-brief">{data.corpTags}</div>
          <div className="list-brief">
            <span className="hospital-distance">{data.area} {distanceStr}</span>
            <div className="hospital-tags">
              {data.funcTagList.map((z, i) => <span key={i} className="hosptail-tags2">{z}</span>)}
            </div>
          </div>
        </div>
        {/* {data.isStar && <div className="star-hospital"></div>} */}
      </li>
    )
  }

  clearInput = () => {
    this.searchCorp('');
  };

  render() {
    const {searchList} = this.state;
    let corpList = [];
    if (searchList) {
      corpList = searchList.filter(item => item.isStar);
      corpList = corpList.concat(searchList.filter(item => !item.isStar))
    }
    return (
      <div>
        <SearchBar
          onChange={(z) => this.searchCorp(z)}
          clearInput={this.clearInput}
          placeholder="搜索医院"
        />
        <div className="search-container-list hospital-list-container">
          {
            corpList.length > 0 ? <ul className="list-ord">
                {corpList.map((z, i) => this.renderItem(z, i))}
              </ul>
              : <div className="non-result">
                <span className="notice-icon icon-o-search"></span>
                <p className="non-result-details">未找到符合条件的搜索结果</p>
                <p>请更换搜索词查询</p>
              </div>
          }
        </div>
      </div>
    );
  }
}