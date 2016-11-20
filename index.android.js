/**
 * React Native App
 * https://github.com/facebook/react-native
 * @flow
 * 刷新模拟器重新加载reloadJS:fn+F2  or adb shell input keyevent 82
 */

import React, { Component } from 'react'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Navigator,
  TouchableOpacity,
  AsyncStorage,
  ActivityIndicator,
  Dimensions,
  BackAndroid,
  ToastAndroid,
  Image,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import TabNavigator from 'react-native-tab-navigator'

import List from './app/creation/index'
import Edit from './app/edit/index'
import Account from './app/account/index'
import UserAction from './app/account/useraction'
import Slider from './app/account/slider'

//测试模块
import ConfirmModal from './app/common/confirmModal'

const TabNavigatorItem =TabNavigator.Item

let width=Dimensions.get('window').width
let height=Dimensions.get('window').height

//启动画面，同时方便app同步数据
export class StartView extends Component {
  render(){
    return(
          <View style={styles.mainBox}>
            <Image source={require('./app/assets/images/start.jpg')} style={styles.start}/>
          </View>
    )
  }
}


export default class hello extends Component {
  constructor(props){
    super(props)
    this.state={
      user:null,
      selectedTab:'List',
      //app是否是第一次启动，如果是第一次安装启动，则呈现轮播图
      entered:false,
      logined:false,
      // app是否启动
      booted:false,
      mainView:true,
      startTime:0
    }
  }

  componentWillMount(){
    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid.bind(this))
    }
  }

  componentWillUnmount(){
    if (Platform.OS === 'android') {
      BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid.bind(this))
    }
  }

  onBackAndroid(){
    if(this.lastBackPressed && this.lastBackPressed+2000>=Date.now()){
      return false
    }
    this.lastBackPressed=Date.now()
    ToastAndroid.show('再按一次退出应用',ToastAndroid.SHORT)
    return true
  }


  componentDidMount(){
    //下面这句是测试启动轮播所用，需要删除
    // AsyncStorage.removeItem('entered')

    let that=this
    let startInterval=setInterval(()=>{
      if(that.state.startTime>1){
        clearInterval(startInterval)
      }else{
        that.setState({startTime:that.state.startTime+1})
      }
    },1000)
    this._asycAppStatus()
  }

  //用户登出登录
  _logout(){
    AsyncStorage.removeItem('user15')
    this.setState({
      logined:false,
      user:null
    })
  }

  _asycAppStatus(){
    let that=this
    AsyncStorage.multiGet(['user15','entered'])
      .then((data)=>{
        let userData=data[0][1]
        let entered=data[1][1]
        let user
        let newState={
          booted:true
        }
        if(userData){
          user=JSON.parse(userData)
        }
        // user.avatar=''
        // AsyncStorage.setItem('user15',JSON.stringify(user))
        //   .catch((err)=>{
        //     console.log('user15:Error:',err);
        //   })
        if(user && user.accessToken){
          newState.user=user
          newState.logined=true
        }else{
          newState.logined=false
        }

        if(entered==='yes'){
          newState.entered=true
        }
        this.setState(newState)
      })
  }
  //登录之后，存储登录信息
  _afterLogin(user){
    let that=this
    // console.log('index.android.js userloginaa:',user,typeof user)
    AsyncStorage.setItem('user15',JSON.stringify(user))
      .then(()=>{
        that.setState({
          logined:true,
          user:user
        })
      })
      .catch((err)=>{
        console.log('index:AsyncStorageError:',err)
      })
  }

  //app第一次启动时的启动轮播图
  _enterSlide(){
    this.setState({
      entered:true
    },()=>{
      AsyncStorage.setItem('entered','yes')
    })
  }
  _showMainView(){
    this.setState({
      mainView:!this.state.mainView
    })
  }

  render() {
    let that=this

    if((!this.state.booted && this.state.entered) && that.state.startTime<2){
      return (
        <StartView/>
      )
    }

    if(!this.state.entered){
      return <Slider enterSlide={this._enterSlide.bind(this)}/>
    }
    if(!this.state.logined){
      return <UserAction afterLogin={this._afterLogin.bind(this)}/>
    }
		return (
      <View style={styles.mainBox}>
          <TabNavigator
            tabBarStyle={this.state.mainView?styles.tab:styles.hideTab}
            sceneStyle={!this.state.mainView?styles.tabScene:null}>
              <TabNavigatorItem
                title={'视频广场'}
                selectedTitleStyle={{color:'#ee735c'}}
                selected={this.state.selectedTab==='List'}
                renderIcon={()=><Icon name="ios-folder-outline" size={30} color="#ee735c" />}
                renderSelectedIcon={()=><Icon name="ios-folder-open" size={30} color="#ee735c" />}
                onPress={()=>this.setState({selectedTab:'List'})}>
                  <Navigator
                    initialRoute={{
                    name:"List",
                    component:List,
                    params:{
                      user:this.state.user,
                      showMainView:this._showMainView.bind(this)
                    }
                    }}
                    configureScene={(route) => {
                      return Navigator.SceneConfigs.FloatFromRight
                    }}
                    renderScene={(route,navigator) => {
                      let Component=route.component
                      return <Component {...route.params} navigator={navigator}/>
                    }}/>
              </TabNavigatorItem>
              <TabNavigatorItem
              title={'发布心情'}
              selectedTitleStyle={{color:'#ee735c'}}
              selected={this.state.selectedTab==='Edit'}
              renderIcon={()=><Icon name="ios-camera-outline" size={30} color="#ee735c" />}
              renderSelectedIcon={()=><Icon name="ios-camera" size={30} color="#ee735c" />}
              onPress={()=>this.setState({selectedTab:'Edit'})}>
              <Edit/>
              </TabNavigatorItem>
              <TabNavigatorItem
              title={'我的账户'}
              selectedTitleStyle={{color:'#ee735c'}}
              selected={this.state.selectedTab==='Account'}
              renderIcon={()=><Icon name="ios-person-outline" size={30} color="#ee735c" />}
              renderSelectedIcon={()=><Icon name="ios-person" size={30} color="#ee735c" />}
              onPress={()=>this.setState({selectedTab:'Account'})}>
              <Account showMainView={this._showMainView.bind(this)} user={this.state.user} logout={this._logout.bind(this)}/>
              </TabNavigatorItem>
          </TabNavigator>
      </View>
    )
    
  }
}

const styles = StyleSheet.create({
  mainBox:{
    //注意，这句不能删
    flex:1
  },
  start:{
    width:width,
    height:height,
  },
  tab:{
    backgroundColor:'#fff'
  },
  hideTab:{
    height: 0,
    overflow: 'hidden'
  },
  tabScene:{
    paddingBottom: 0
  },

  bootPage:{
    width:width,
    height:height,
    backgroundColor:'#fff',
    justifyContent:"center"
  }
})

AppRegistry.registerComponent('hello', () => hello)
