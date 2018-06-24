import React from 'react'
import SmartBlockComponent from '../../BaseComponent/SmartBlockComponent'
import ReactSwipe from 'react-swipe'
import Icon from '../../component/icon/Icon'
import util from '../../lib/util'
import Aolsee from '../../module/Aolsee'
import DataCenter from '../../module/DataCenter'
//import 'isomorphic-fetch'
import './search.less'

const labelStyle = {
  marginLeft: '0',
  paddingLeft: '15px',
  borderBottom: '1px solid #eee',
  position: 'relative',
  top: '1px'  //解决重叠的边框
}

const imgStyle = {
  width: '58px',
  height: '58px',
  marginRight: '10px'
}

const typeList = [
  {name: '推荐', id: 'all'},
  {name: '医院', id: 'corps'},
  {name: '医生', id: 'docts'},
  {name: '科室', id: 'depts'},
  {name: '疾病', id: 'jib'},
  {name: '症状', id: 'zzk'},
  {name: '文章', id: 'news'},
]

// function getServiceAPIUri(path) {
//   return SERVICE_DOMAIN.indexOf("http") == 0 ? SERVICE_DOMAIN + path : PROTOCOL + SERVICE_DOMAIN + path
// }

function markKeyword ( str ) {
  str = str || "";
  return str.replace( /<em>/g, '<em style=\"color: #F15A4A\">' )
}

const NoData = ({type}) => (
  type == 'all' ? <div className="notice" style={{backgroundColor: '#f8f8f8', paddingTop: '101px', marginTop: '0'}}>
      <span className="notice-icon icon-record"/>
      <p>未找到相关内容</p>
    </div> : <div className="notice" style={{backgroundColor: '#f8f8f8', paddingTop: '101px', marginTop: '0'}}>
      <span className="notice-icon icon-record"/>
      <p>该分类下未找到相关内容</p>
    </div>
)
// keyword, resultType, resultId, resultName, unionId
const JbItem = ({ keyword, data, unionId }) => (
  <a className="search-detail-overflow-item"
     onClick={()=>{ DataCenter.clickItem( keyword, 'jib', data.id, data.name, unionId )}}
     href={`./disease-detail.html?type=jib&code=${data.code || ''}&unionId=${unionId}&target=_blank`}>
    <h3 dangerouslySetInnerHTML={{__html: markKeyword( data.name )}}/>
    <div dangerouslySetInnerHTML={{__html: markKeyword( data.search_summary )}}/>
  </a>
)

const ZzItem = ({ keyword, data, unionId }) => (
  <a className="search-detail-overflow-item"
     onClick={()=>{ DataCenter.clickItem( keyword, 'zzk', data.id, data.name, unionId )}}
     href={`./disease-detail.html?type=zzk&code=${data.code || ''}&unionId=${unionId}&target=_blank`}>
    <h3 dangerouslySetInnerHTML={{__html: markKeyword( data.name )}}/>
    <div dangerouslySetInnerHTML={{__html: markKeyword( data.search_summary )}}/>
  </a>
)

const DoctorItem = ({ keyword, data, unionId }) => (
  <a className="list-item list-nowrap"
     onClick={()=>{ DataCenter.clickItem( keyword, 'docts', data.id, data.doct_name, unionId )}}
     href={`./doctor.html?doctCode=${data.doct_code}&doctName=${data.doct_name}&corpId=${data.corp_id}&deptCode=${data.dept_code}&unionId=${unionId}&regMode=1&target=_blank`}>
    <Icon
      url={data.doct_logo || 'https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png'}
      style={imgStyle}
      circle={true}
    />
    <div className="list-content">
      <div className="list-title txt-nowrap" dangerouslySetInnerHTML={{__html: markKeyword( data.doct_name )}}/>
      <div className="list-brief txt-nowrap" style={{ marginTop: '2px', color: '#898989' }} dangerouslySetInnerHTML={{ __html: markKeyword( data.corp_name ) +' '+ markKeyword( data.dept_name ) }}></div>
      <div className="list-brief txt-nowrap" style={{ marginTop: '2px'}} dangerouslySetInnerHTML={{ __html: '擅长：'+ ( data.doct_spec ? markKeyword( data.doct_spec ) : '无' )}}></div>
    </div>
  </a>
)

const CorpItem = ({ keyword, data, unionId }) => (
  <a style={{overflow: 'hidden'}} className="list-item list-nowrap"
     onClick={()=>{ DataCenter.clickItem( keyword, 'corps', data.id, data.name, unionId )}}
     href={`./pages/index.html?corpId=${data.corp_id}&unionId=${unionId}&target=_blank`}>

    <Icon
      url={data.corp_logo}
      style={{...imgStyle, borderRadius: '4px'}}
    />
    <div className="list-content">
      <div className="list-title txt-nowrap" dangerouslySetInnerHTML={{ __html: markKeyword( data.name )}}/>
      <div className="list-brief txt-nowrap" dangerouslySetInnerHTML={{ __html: markKeyword( data.corp_tags )}}></div>
      <div className="list-brief txt-nowrap">
        {
          data.corp_function ? data.corp_function.split(' ').map((item, index) =>
              item ? <span className="hosptail-tags2" key={`tag${index}`} dangerouslySetInnerHTML={{ __html: markKeyword( item )}}></span> : null
            ) : ''
        }
      </div>
    </div>
  </a>
)

const DeptItem = ({ keyword, data, unionId }) => (
  <a className="list-item "
     onClick={()=>{ DataCenter.clickItem( keyword, 'depts', data.id, data.dept_name, unionId )}}
     href={`./dept.html?deptCode=${data.dept_code}&corpId=${data.corp_id}&unionId=${unionId}&regMode=1&target=_blank`}>
    <Icon
      url='https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/6df445b910e7bd736c6d97e89a87a5a9-116-116.png'
      style={imgStyle}
      circle={true}
    />
    <div className="list-content">
      <div className="list-title" dangerouslySetInnerHTML={{__html: markKeyword( data.corp_name )}}/>
      <div className="list-brief" dangerouslySetInnerHTML={{__html: markKeyword( data.dept_name )}} style={{marginTop: '2px'}}/>
    </div>
  </a>
)

const NewsItem = ({ keyword, data, unionId }) => (
  <a className="search-detail-overflow-item"
    onClick={()=>{ DataCenter.clickItem( keyword, 'news', data.id, data.title, unionId )}}
    href={`./news-detail.html?id=${data.id}&unionId=${unionId}&target=_blank`}>
    <h3 dangerouslySetInnerHTML={{__html: markKeyword( data.title )}}/>
    <div dangerouslySetInnerHTML={{__html: markKeyword( data.summary )}}/>
  </a>
)


const CorpContainer = ({ keyword, data, unionId}) => (
  <div>
    {
      data.items && data.items.length > 0 ?
        data.items.map(item => <CorpItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
        : <NoData type="corps"/>
    }
    {
      data.items && data.items.length > 0 ? <div className="search-all-msg">已经是全部了</div> : null
    }
  </div>
)

const DoctorContainer = ({ keyword, data, unionId}) => (
  <div>
    {
      data.items && data.items.length > 0 ?
        <div>
          {
            data.items.map(item => <DoctorItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
          }
        </div>
        : <NoData type="docts"/>
    }
    {
      data.items && data.items.length > 0 ? <div className="search-all-msg">已经是全部了</div> : null
    }
  </div>
)

const DeptContainer = ({ keyword, data, unionId}) => (
  <div>
    {
      data.items && data.items.length > 0 ?
        <div>
          {
            data.items.map(item => <DeptItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
          }
        </div>
        : <NoData type="depts"/>
    }
    {
      data.items && data.items.length > 0 ? <div className="search-all-msg">已经是全部了</div> : null
    }
  </div>
)

const DiseaseContainer = ({ keyword, data, unionId }) => (
  <div>
    {
      data.items && data.items.length > 0 ?
        <div>
          {
            data.items.map(item => <JbItem keyword={ keyword }  data={item} key={item.id} unionId={unionId}/>)
          }
        </div>
        : <NoData type="jib"/>
    }
    {
      data.items && data.items.length > 0 ? <div className="search-all-msg">已经是全部了</div> : null
    }
  </div>
)

//症状
const SymptomContainer = ({ keyword, data, unionId }) => (
  <div>
    {
      data.items && data.items.length > 0 ?
        <div>
          {
            data.items.map(item => <ZzItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
          }
        </div>
        : <NoData type="zzk"/>
    }
    {
      data.items && data.items.length > 0 ? <div className="search-all-msg">已经是全部了</div> : null
    }
  </div>
)

const NewsContainer = ({ keyword, data, unionId }) => (
  <div>
    {
      data.items && data.items.length > 0 ?
        <div>
          {
            data.items.map(item => <NewsItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
          }
        </div>
        : <NoData type="news"/>
    }
    {
      data.items && data.items.length > 0 ? <div className="search-all-msg">已经是全部了</div> : null
    }
  </div>
)

class AllContainer extends React.Component{
  render(){
    let {keyword, data, changeActive, unionId, adList} = this.props;
    // console.log(data)
    let isResult = false;
    try{
      //有搜索结果才显示广告
      isResult = data.jibBean.total || data.doctsBean.total || data.corpBean.total || data.deptsBean.total || data.newsBean.total;
    }catch(e){

    }

    if(!isResult){
      return <NoData type="all"/>
    }

    return <div style={{backgroundColor: '#f8f8f8'}}>
      {
        data.jibBean.items && data.jibBean.items.length > 0 ?
          <div className="search-block">
            <div className="list-item list-item-middel " style={labelStyle}>
              <a className="txt-arrowlink list-link-wrapper">
                <div className="list-content">
                  <div className="list-title txt-nowrap">相关疾病</div>
                </div>
                <div className="list-extra" onClick={() => changeActive('jib')}>查看更多</div>
              </a>
            </div>
            {
              data.jibBean.items.slice(0, 2).map(item => <JbItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
            }
          </div>
          : null
      }
      {
        isResult && adList && adList.length > 0 ?
          <div className="search-block">
            <ReactSwipe className="ad-banner" swipeOptions={{continuous: false}}>
              {adList.map((item, index) => <a className="ad-img" key={`ad${index}`} href={item.redirectUrl}
                                              style={{backgroundImage: `url(${item.url})`}}/>)}
            </ReactSwipe>
          </div>
          : null
      }
      {
        data.doctsBean.items && data.doctsBean.items.length > 0 ?
          <div className="search-block">
            <div className="list-item list-item-middel " style={labelStyle}>
              <a className="txt-arrowlink list-link-wrapper">
                <div className="list-content">
                  <div className="list-title txt-nowrap">相关医生</div>
                </div>
                <div className="list-extra" onClick={() => changeActive('docts')}>查看更多</div>
              </a>
            </div>
            {
              data.doctsBean.items.slice(0, 2).map(item => <DoctorItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
            }
          </div>
          : null
      }
      {
        data.corpBean.items && data.corpBean.items.length > 0 ?
          <div className="search-block">
            <div className="list-item list-item-middel " style={labelStyle}>
              <a className="txt-arrowlink list-link-wrapper">
                <div className="list-content">
                  <div className="list-title txt-nowrap">相关医院</div>
                </div>
                <div className="list-extra" onClick={() => changeActive('corps')}>查看更多</div>
              </a>
            </div>
            {
              data.corpBean.items.slice(0, 2).map(item => <CorpItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
            }
          </div>
          : null
      }
      {
        data.deptsBean.items && data.deptsBean.items.length > 0 ?
          <div className="search-block">
            <div className="list-item list-item-middel " style={labelStyle}>
              <a className="txt-arrowlink list-link-wrapper">
                <div className="list-content">
                  <div className="list-title txt-nowrap">相关科室</div>
                </div>
                <div className="list-extra" onClick={() => changeActive('depts')}>查看更多</div>
              </a>
            </div>
            {
              data.deptsBean.items.slice(0, 2).map(item => <DeptItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
            }
          </div>
          : null
      }
      {
        data.newsBean.items && data.newsBean.items.length > 0 ?
          <div className="search-block">
            <div className="list-item list-item-middel " style={labelStyle}>
              <a className="txt-arrowlink list-link-wrapper">
                <div className="list-content">
                  <div className="list-title txt-nowrap">相关文章</div>
                </div>
                <div className="list-extra" onClick={() => changeActive('news')}>查看更多</div>
              </a>
            </div>
            {
              data.newsBean.items.slice(0, 2).map(item => <NewsItem keyword={ keyword } data={item} key={item.id} unionId={unionId}/>)
            }
          </div>
          : null
      }
    </div>
  }
}



export default class DetailList extends React.Component {

  static propTypes = {
    keyword: React.PropTypes.string
  }

  constructor(props) {
    super(props)

    const query = util.query()
    this.unionId = query.unionId || ''

    this.keyword = this.props.keyword

    this.state = {
      active: 'all',
      data: null,
      ok: false,
      adList: []
    }
  }

  componentDidMount() {
    this.getData('all')
    const self = this
    Aolsee.findAppAd( this.unionId, 42 ).subscribe({
      onSuccess(result) {
        self.setState({
          adList: result.data.adList[0] ? result.data.adList[0].contentList : []
        })
      }
    }).fetch()
  }

  componentWillReceiveProps ( nextProps ) {
    const { active } = this.state
    this.keyword = nextProps.keyword
    this.getData( active )
  }

  getData(type) {

    let keyword = this.keyword;

    DataCenter.newSearch(keyword, type, this.unionId).subscribe({
      onSuccess:(result)=>{
        this.setState({
          data:result,
          ok:true
        })
      },
      onError:(result)=>{
        console.log("error")
      }
    }).fetch();

    // const {keyword} = this
    // const urlInfo = {
    //   keyword,
    //   type
    // }
    // const result = await fetch(getServiceAPIUri(`/spider/api/newSearch?${util.flat(urlInfo)}`))
    // const resultJson = await result.json()
    // this.setState({
    //   data: resultJson,
    //   ok: true
    // })
  }

  changeActive(type) {
    this.getData(type)
    this.setState({
      active: type,
      ok: false
    })
  }

  renderTab() {
    const {active} = this.state
    return (
      <ul className="search-type-list">
        {typeList.map(item =>
          <li
            key={item.id}
            onClick={() => this.changeActive(item.id)}
          >
            <span style={active == item.id ? {borderBottom: '2px solid #76acf8', color: '#76acf8'} : {}}>
              {item.name}
            </span>
          </li>
        )}
      </ul>
    )
  }

  renderContainer() {
    const { active, data, adList } = this.state
    const { keyword } = this.props

    switch (active) {
      case 'all':
        return <AllContainer keyword={ keyword } data={data} changeActive={(z) => this.changeActive(z)} adList={adList}
                             unionId={this.unionId}/>
      case 'corps':
        return <CorpContainer keyword={ keyword } data={data} unionId={this.unionId}/>
      case 'docts':
        return <DoctorContainer keyword={ keyword } data={data} unionId={this.unionId}/>
      case 'depts':
        return <DeptContainer keyword={ keyword } data={data} unionId={this.unionId}/>
      case 'jib':
        return <DiseaseContainer keyword={ keyword } data={data} unionId={this.unionId}/>
      case 'zzk':
        return <SymptomContainer keyword={ keyword } data={data} unionId={this.unionId}/>
      case 'news':
        return <NewsContainer keyword={ keyword } data={data} unionId={this.unionId}/>
      default:
        return <AllContainer keyword={ keyword } data={data} unionId={this.unionId}/>
    }
  }

  render() {
    const {ok} = this.state
    return (
      <div style={{backgroundColor: '#fff'}}>
        {this.renderTab()}
        {ok ? this.renderContainer() : null}
      </div>
    )
  }
}
