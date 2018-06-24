/*
 * @Author: chenqiming
 * @Date: 2017-08-05 00:17:50
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-02-01 14:49:58
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
import DataCenter from './module/DataCenter'
import './search-index.less'

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

    this.unionId = query.unionId

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
    window.history.replaceState( null, null, '?'+ util.flat({
      page: pageNum
      ,search
      ,unionId: this.unionId
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
        /*
         const {searchHistory} = this.state
         searchHistory.indexOf(value) == -1 && searchHistory.push(value)
         searchHistory.length > 30 && searchHistory.shift()

         const str = JSON.stringify(searchHistory)
         const trimStr = value.replace(/(^\s*)|(\s*$)/g, "")

         cache.set("searchIndex", str)
         */
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
        this.toDetail( searchValue )
        this.setHistorySerch( searchValue )
      }else{
        this.setState({
          showPage:0,
          keyword:""
        })
      }
    }
  }

  setHistorySerch ( words ) {
    try {
      let searchIndex = localStorage.getItem('searchIndex') || '[]'
      searchIndex = JSON.parse(searchIndex)
      searchIndex.indexOf(words) == -1 && searchIndex.push(words)
      searchIndex.length > 30 && searchIndex.shift()
      const result = JSON.stringify(searchIndex)
      localStorage.setItem('searchIndex', result)
    } catch ( e ) {
      console.log( e )
    }
  }

  toDetail(z) {
    this.refs.searchBar.refs.input.value = z
    this.setState({
      showPage: 2,
      keyword: z
    })
    window.history.pushState( null, null, '?'+ util.flat({
      page: 2
      ,search: z
      ,unionId: this.unionId
      ,target: '_blank'
    }) )
  }

  clearHistory = () => {
    cache.remove("searchIndex")
    this.setState({
      searchHistory: [],
    })
  }

  renderContainer() {
    const {showPage, searchHistory, tipsList, keyword} = this.state
    if (showPage == 1) {
      return <TipList tipsList={tipsList} toDetail={(z) => this.toDetail(z)}/>
    } else if (showPage == 2) {
      return <DetailList keyword={keyword}/>
    }
    return (
      <HistoryList
        searchHistory={searchHistory}
        clearHistory={this.clearHistory}
        toDetail={(z) => this.toDetail(z)}
      />
    )
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
    return (
      <div>
        <SearchBar
          onSubmit={(e)=>{ this.keyDownSubmit( e.keyCode ) }}
          onChange={this.changeValue}
          ref="searchBar"
          placeholder="搜索疾病、症状、医生、科室"
          defaultValue={ this.state.keyword }
        />
        <div className="search-container-list">
          {this.renderContainer()}
        </div>
        <Loading display={this.state.showWait}/>
      </div>
    )
  }
}
