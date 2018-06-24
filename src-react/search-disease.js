/*
 * @Author: chenqiming
 * @Date: 2017-08-05 00:17:50
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-04-09 10:27:53
 */
import React from 'react'
import UserCenter from './module/UserCenter'
import SearchBar from './component/searchbar/SearchBar'
import cache from './lib/cache'
import util from './lib/util'
import Loading from './component/loading/Loading'
import HistoryList from './component/searchIndex/HistoryList'
import TipList from './component/searchIndex/TipList'
import DetailList from './component/searchIndex/DetailList'
import DiseaseList from './component/searchIndex/DiseaseList'
import DataCenter from './module/DataCenter'
import './search-disease.less'

export default class SearchIndex extends React.Component {

  constructor(props) {
    super(props)

    this.init()

    window.onpopstate = () => { // 手机后退后，页面更新
      this.init()
      this.refs.searchBar.refs.input.value = this._state.searchValue
      this.setState( this._state )
    }
 
    this.state = this._state
  }

  init () {
      let searchHistory = []
      const query = util.query()
      this.param = util.flat(query)
      this.unionId = query.unionId
      this.regMode = query.regMode;
      this.scheduleId = query.scheduleId;
      this.corpId = query.corpId,
      this.regType = query.regType,
      this.deptCode = query.deptCode,
      this.medDate = query.medDate,  
      this.doctCode = query.doctCode,
      this.unionId = query.unionId,
      this.medAmPm = query.medAmPm,
      this.regAmount = query.regAmount,
      this.preDiagnosis = query.preDiagnosis || '',
      this.patientName=query.patientName || "",
      this.sourceValue=query.sourceValue || "",
      this.appoNo=query.appoNo||'',
      this.extend=query.extend||'', 
      this.medBegTime=query.medBegTime||'', 
      this.medEndTime=query.medEndTime||'',
      this.isGraphic = query.isGraphic
      this.timer = null
      try {
          searchHistory = cache.get("searchIndex") ? JSON.parse(cache.get("searchIndex")) : []
          if (!(searchHistory instanceof Array)) {
              searchHistory = []
          }
      } catch (e) {
          console.log(e)
          searchHistory = []
      }

    // 路由区（单页应用）
    let search = query.search || ''
    , pageNum = query.page || 0
    if( search == '' && pageNum != 0 ) {
      pageNum = 0
    } if( search != '' && pageNum == 1 ) {
      pageNum = 2
    }
    window.history.replaceState( null, null, '?'+this.param+'&'+ util.flat({
      page: pageNum
      ,search
      ,target: '_blank'
    }) )
    // 路由区结束

    this._state = {
      searchValue: search,
      searchHistory: searchHistory,
      showPage: pageNum,
      showWait: false,
      tipsList: [],
      keyword: search
    }
  }

  changeValue = (z) => {
    const value = z.target.value
    , trimStr = value.replace(/(^\s*)|(\s*$)/g, "");

    this.setState({
      searchValue: trimStr
    })

    if( trimStr.length == 0 ) {
      this.clear()
    }

    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      if (value) {
        this.setState({
          showWait: true,
        })
        const self = this
        DataCenter.getTips(trimStr, this.unionId).subscribe({
          onSuccess(result) {
            // console.log(result, 1)
            self.setState({
              showPage: 1,
              tipsList: result.data,
              showWait: false
            })
          }
        }).fetch()
      }
    }, 1000)
  }

  keyDownSubmit ( keyCode ) {
    if( keyCode == 13 ) {
      const { searchValue } = this.state
      clearTimeout( this.timer );
      if(searchValue){
        this.setState({
          showWait: true,
        })
        const self = this
        DataCenter.getTips(searchValue, this.unionId).subscribe({
          onSuccess(result) {
            self.setState({
              showPage: 1,
              tipsList: result.data,
              showWait: false
            })
          }
        }).fetch()
      }else{
        this.setState({
          showPage:0,
          keyword:""
        })
      }
    }
  }
  toDetail(z) {
    this.refs.searchBar.refs.input.value = z
    this.setState({
      showPage: 2,
      keyword: z
    })
    window.history.pushState( null, null, '?'+this.param+'&'+ util.flat({
      page: 2
      ,search: z
    }) )
  }

  renderContainer() {
    const { showPage, searchHistory, tipsList, keyword, searchValue} = this.state
    if (searchValue==''){
      tipsList.push(' ');
    }
    return <DiseaseList tipsList={tipsList} toDetail={(z) => this.toDetail(z)}/>
  }

  clear = () => {
    let searchHistory = []
    try {
      searchHistory = cache.get("searchIndex") ? JSON.parse(cache.get("searchIndex")) : []
      if (!(searchHistory instanceof Array)) {
        searchHistory = []
      }
    } catch (e) {
      console.log(e)
      searchHistory = []
    }

    this.setState({
      showPage: 0,
      searchHistory
    })
  }

  render() {
    let flag = true;
    let flag1 = false;
    let href = 'patient-audio.html?'+this.param+ '&istreat=' + flag + '&color1=' + flag1 ;
    return (
    <div style={{"minHeight":"100%","background":"#fff"}}>
          <div className="search-dis-head">
            <div className="search-dis-head-left">
                <SearchBar
                onSubmit={(e)=>{ this.keyDownSubmit( e.keyCode ) }}
                onChange={this.changeValue}
                ref="searchBar"
                placeholder="搜索疾病、症状"
                defaultValue={ this.state.keyword }
                />
            </div>
            <a className="search-none" href={href}>取消</a>
          </div>
        
        <div className="search-container-list">
          {this.renderContainer()}
        </div>
        <Loading display={this.state.showWait}/>
      </div>
    )
  }
}
