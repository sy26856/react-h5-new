import React, {PropTypes} from 'react'
import DataCenter from '../../module/DataCenter'
import util from '../../lib/util'
import './search.less'

export default class HistoryList extends React.Component {

  constructor(props) {
    super(props)
    const query = util.query()
    this.unionId = query.unionId || ''
    this.state = {
      hotWords: [],
    }
  }

  componentDidMount() {
    const self = this
    DataCenter.queryHotWords(this.unionId).subscribe({
      onSuccess(result) {
        // console.log(result)
        self.setState({
          hotWords: result.data || []
        })
      }
    }).fetch()
  }

  renderHistoryInfo() {
    const {searchHistory, toDetail, clearHistory} = this.props

    const history = [...searchHistory].reverse()

    if (history.length > 0) {
      return (
        <div>
          <div className="list-ord">
            <div className="list-item ">
              <div className="list-content txt-nowrap ">
                <div className="list-title txt-nowrap">历史搜索</div>
              </div>
              <div className="list-extra" onClick={clearHistory}>
                <span className="clear-history">清空搜索记录</span>
              </div>
            </div>
          </div>
          <div className="search-history-container">
            {
              history.map((z, i) =>
                <div className="search-history-item" key={'b' + i} onClick={() => toDetail(z)}>{z}</div>
              )
            }
          </div>
        </div>
      )
    }
    return null
  }

  toDetail(words) {
    const {toDetail} = this.props
    try {
      let searchIndex = localStorage.getItem('searchIndex') || '[]'
      searchIndex = JSON.parse(searchIndex)
      searchIndex.indexOf(words) == -1 && searchIndex.push(words)
      searchIndex.length > 30 && searchIndex.shift()
      const result = JSON.stringify(searchIndex)
      localStorage.setItem('searchIndex', result)
      toDetail(words)
    } catch (e) {
      console.log(e)
    }
  }

  renderHotInfo() {
    const {hotWords} = this.state

    if (hotWords.length > 0) {
      return (
        <div className="hotwords-container">
          <div className="list-ord">
            <div className="list-item ">
              <div className="list-content txt-nowrap ">
                <div className="list-title txt-nowrap">热门搜索</div>
              </div>
            </div>
          </div>
          <div className="search-history-container">
            {
              hotWords.map((z, i) =>
                <div
                  className="search-history-item"
                  key={'a' + i}
                  onClick={() => {
                    switch( z.type ) {
                      case 1: 
                        this.toDetail(z.wordName)
                        break;
                      case 2: 
                        window.location.href = z.url
                        break;
                    } 
                  }}
                >
                  {z.wordName}
                </div>
              )
            }
          </div>
        </div>
      )
    }
    return null
  }

  render() {

    return (
      <div style={{backgroundColor: '#fff'}}>
        {this.renderHistoryInfo()}
        {this.renderHotInfo()}
      </div>
    )
  }
}