/*
 * @Author: saohui 
 * @Date: 2017-09-28 08:36:21 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-10-16 14:53:57
 */
import React from 'react'
import Icon from '../../component/icon/Icon'
import util from '../../lib/util'

const Item = ({ logo, title, subTitle, briefs, extra, href }) => {
  const iconStyle = {
    width: '58px',
    height: '58px',
    marginRight: '10px'
  }
  return <li className="list-item list-nowrap list-item-middel txt-nowrap ">
    <a href={ href } className={'list-link-wrapper '+ ( extra ? '':'txt-arrowlink')}>
      <Icon url={ logo } circle={true} style={iconStyle} />
      <div className="list-content">
        <div className="list-title follow-title">{ title } <span className='follow-subtitle'>{ subTitle }</span></div>
        { briefs && briefs.map(( val, key ) => {
            return <div key={ key } className="list-brief follow-brief txt-nowrap">{ val }</div>
        })}
      </div>
      <div className="list-extra" >{ extra }</div>
    </a>
  </li>
}


export const FollowList = ({ list ,unionId}) => {
  return <ul className="list-ord">
    { list.map(( item, key ) => {
        const param = util.flat({
          target: '_blank'
          ,unionId: unionId
          ,corpId: item.corpId
          ,doctCode: item.doctCode
          ,doctName: item.doctName
          ,deptCode: item.deptCode
          ,regMode: 1
        })
        return item.type == 2 ? 
                <Item key={ key } 
                      logo={ setDoctLogo( item )}
                      title={ item.doctName }
                      subTitle={ item.doctProfe }
                      briefs={[ item.deptName, item.corpName ]}
                      href={'doctor.html?'+ param } /> :
                <Item key={ key } 
                      logo={'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/0e6fcd961c6b84b5d866c737758c1eb8-116-116.png'}
                      title={ item.deptName }
                      briefs={[ item.corpName ]} 
                      href={'dept.html?'+ param } />
    })}
  </ul>
}


export const RegisteredDoct = ({ list, dispatch }) => {
  return <ul className="list-ord">
    { list.map(( item, key ) => {
        const followBtnClassName = !( item.state == 0 ) ? 'btn-secondary' : ''
        , followBtnVal = !( item.state == 0 ) ? '已关注' : '关注'

        const param = util.flat({
          target: '_blank'
          ,unionId: item.unionId
          ,corpId: item.corpId
          ,doctCode: item.doctCode
          ,doctName: item.doctName
          ,deptCode: item.deptCode
          ,regMode: 1
        })
        return item.type == 2 ? 
                <Item key={ key }
                      logo={ setDoctLogo( item )}
                      title={ item.doctName }
                      subTitle={ item.doctProfe }
                      briefs={[ item.deptName, item.corpName ]}
                      href={'doctor.html?'+ param }
                      extra={ <button onClick={(e) => {
                        e.preventDefault()
                        dispatch({ type: 'myFollow/alterFollow', index: key })
                        return false
                      }} className={'btn btn-sm follow-btn '+ followBtnClassName }>{ followBtnVal }</button> } /> :
                <Item key={ key }  
                      logo={'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/0e6fcd961c6b84b5d866c737758c1eb8-116-116.png'}
                      title={ item.deptName }
                      briefs={[ item.corpName ]}
                      href={'dept.html?'+ param }
                      extra={ <button onClick={(e) => {
                        e.preventDefault()
                        dispatch({ type: 'myFollow/alterFollow', index: key })
                        return false
                      }} className={'btn btn-sm follow-btn '+ followBtnClassName }>{ followBtnVal }</button> }  />
    })}
  </ul> 
}


export default { 
  FollowList
  ,RegisteredDoct
}


function setDoctLogo ( item ) {
  return item.logo || ( item.sex == '女' ? 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/fe22e264886052a69a3fffabbebaace9-174-174.png' : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/90e5757435f5c21c4cfc9d3483b7132a-174-174.png')
}
