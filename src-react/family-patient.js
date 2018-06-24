import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import './family-patient.less';
import hybridAPI from './lib/hybridAPI'

export default class FamilyPatient extends SmartBlockComponent {

    constructor(props) {
        super(props);
        const query = util.query();
        this.unionId=query.unionId
        this.state = {
            loading: true,
            menuClass:'list-item',
            data: []
        };
    }
    componentDidMount() {
        UserCenter.getSignInfoByLoginUser().subscribe({
            onSuccess: (result) => {
                let data = result.data;
                this.setState({
                    data: data,
                    loading:false,
                    success:true
                })
            },
            onError: (err) => {
                console.log(err)
                this.setState({
                    loading: false,
                    success: true
                })
            }
        }).fetch()
    }
    render() {
        let { data, menuClass,acitveClass}=this.state;
        return (
            <div className="list-ord">
                {data.map((item,index)=>{
                    return <a className={menuClass} key={index} onClick={()=>{
                        this.setState={
                            menuClass:'list-item menu-item-action'
                        }
                        if (util.isInYuantuApp()) {
                            hybridAPI.pushDataToParent(true, JSON.stringify({
                                index:index
                            }))
                        }else{
                            window.location.href='my-doctors.html?patientName='+item.name+'&index='+index+'&target=_blank'
                        }
                    }}>
                        <div className="list-content">{item.name}</div>
                    </a>
                })}

            </div>
            
        );
    }
}