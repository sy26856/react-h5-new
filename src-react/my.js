import React from 'react'
import UserCenter from './module/UserCenter'
import util from './lib/util'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import Alert from './component/alert/alert'
import Icon from './component/icon/Icon'
import TabBar from './component/tabbar/TabBar'
import cache from './lib/cache'
import './my.less'

export default class My extends SmartBlockComponent {
  constructor ( props ) {
    super( props )
    const query = util.query()
    this.unionId = query.unionId
    this.corpId = query.corpId
    
    if( !this.unionId && !this.corpId ) {
      Alert.show( '缺少corpId or unionId', 1000 )
    }
    this.state = {
      ...this.state
      ,tabList: myTabList
      ,isLogin: util.isLogin()
      ,userName: ''
      ,userLogoImg: 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8404404ecf111ff4c3a2235505bc1516-120-120.png'
    }
  }
  componentWillMount () {
    this.setState({
      loading: false
      ,success: true
    })
  }
  componentDidMount () {
    const { isLogin } = this.state
    if( isLogin ) {
      UserCenter.getUserInfo()
        .subscribe( this )
        .fetch()
    }
  }
  onSuccess ( result ) {
    if( result.success ) {
      this.setState({
        userName: result.data.userNick || result.data.phoneNum
        ,userLogoImg: result.data.logoImg || this.state.userLogoImg
      })
    }
  }
  onError ( result ) {}

  renderTopTabList () {
    const { tabList, isLogin } = this.state
    , param = util.flat({ 
      unionId: this.unionId
      ,corpId: this.corpId
      ,target: '_blank'
     })
    return <div className="grid-wrapper grid-no-border">
        <div className="grid-row">
        {
          tabList[0].column.map(( item )=>{
            let { needLogin, key, imageUrl, title, show, url, unionIds } = item
            let isUnionId = true
            if( unionIds ) {
              isUnionId = unionIds.some(( val )=>{
                return val == this.unionId
              })
            }
            return show && isUnionId ?
              <a href={ needLogin && !isLogin ? 'javascript:;' : `${ url }?${ param }` } onClick={ ()=>{ needLogin && !isLogin && util.goLogin() } } key={ key } className="grid-item" >
                <div className="grid-item-inner" >
                  <div style={{ backgroundImage: 'url('+ imageUrl +')' }} className="grid-icon icon-pic"></div>
                  <div className="grid-txt">{ title }</div>
                </div>
              </a> : null
          })
        }
        </div>
      </div>
  }
  renderBodyTabList () {
    const { tabList, isLogin } = this.state
    , param = util.flat({ 
      unionId: this.unionId
      ,corpId: this.corpId
      ,target: '_blank'
     })
    let result = []
    for( let i = 1; i < 4; i++ ) {
      result.push( <div key={ 'g' + i } className=" g-space"></div> )
      result.push( 
        <ul key={ i } className="list-ord">
        {
          tabList[i].column.map(( item )=>{
            let { needLogin, key, imageUrl, title, show, url, extra, unionIds } = item
            let isUnionId = true
            if( unionIds ) {
              isUnionId = unionIds.some(( val )=>{
                return val == this.unionId
              })
            }
            return show && isUnionId ? <li key={ '' + i + key } className="list-item ">
                <a href={ needLogin && !isLogin ? 'javascript:;' : `${ url }?${ param }` } onClick={ ()=>{ needLogin && !isLogin && util.goLogin() } } className="txt-arrowlink list-link-wrapper">
                  <img src={ imageUrl }  className="list-icon-sm " />
                  <div className="list-content txt-nowrap" >
                    <div className="list-title ">{ title }</div>
                  </div>
                  { extra ? <div className="list-extra txt-nowrap" >{ extra }</div> : null }
                </a>
              </li> : null
          }) 
        }
        </ul>
       )
    }
    return result
  }
  render () {
    const { userName, userLogoImg } = this.state
    return <div className="my-wraper">
      <header className="my-main_header">
        {
        util.isLogin() ?
        <div className="logged_in">
          <Icon url={ (userLogoImg || '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/79a058b05c133d9f307be025662fd535-128-128.png') } width={ '65px' } height={ '65px' } circle={ true }/>
          <p>{ userName }</p>
        </div>
        : <div className="logged_in" onClick={() => { util.goLogin()}}>
            <Icon url={'//front-images.oss-cn-hangzhou.aliyuncs.com/i4/79a058b05c133d9f307be025662fd535-128-128.png'} width={ '65px' } height={ '65px' } circle={ true }/>
            <p className='login_btn'>登入</p>
          </div>
        }
      </header>
      <section className="my-main_section">
        { this.renderTopTabList() }
        { this.renderBodyTabList() }
      </section>
      <TabBar />
    </div>
  }
}
