import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import TabNavigator from 'react-native-tab-navigator'

import request from '../common/request'
import config from '../common/config'
import styles from '../style/creation/index'
import Detail from './detail'

const TabNavigatorItem =TabNavigator.Item


let cachedResults={
  nextPage:1,
  items:[],
  total:0
}


export class Item extends Component{
  constructor(props){
    super(props)
    let row=this.props.row
    this._up=this._up.bind(this)
    this.state={
      row:row,
      upCount:row.video_up,
      user:this.props.user,
    }
  }

  //点赞动作触发的方法
  _up(){
    const that=this
    let row=this.state.row
    let url=config.api.base+config.api.up
    let accessToken=typeof(this.state.user)==='string'?JSON.parse(this.state.user).accessToken:this.state.user.accessToken
    let body={
      id:row._id,
      accessToken:accessToken
    }

    request.post(url,body)
      .then((data)=>{
        if(data && data.success){
          console.log('_up data:',data)
          that.setState({
            upCount:data.upCount
          })
        }else{
          Alert.alert('点赞失败，稍后重试')
        }
      })
      .catch((err)=>{
        console.log(err)
        Alert.alert('点赞失败，稍后重试')
      })
  }

  render(){
    let row=this.state.row
    let qiniuThumbUrl=config.qiniu.previewThumbBase
    let qiniuAvatarUrl=config.qiniu.previewAvatarBase
    let avatar=qiniuAvatarUrl+(row.author.avatar?row.author.avatar:config.qiniu.default_avatar)
    return (
      <TouchableOpacity
        underlayColor={"#EAF8FD"}
        activeOpacity={0.8}
        style={styles.listBox}
        onPress={this.props.onSelect}>
        <View style={styles.listViewBox}>
          <View style={styles.descInfo}>
            <View style={styles.authordesc}>
              <View style={styles.authordescLeft}>
                <Image source={{uri:avatar}} style={styles.authorAvatar}/>
                <Text style={styles.authornickname}>
                  {row.author.nickname}
                </Text>
              </View>
              <View style={styles.authordescRight}>
                <Text style={styles.authordescRightText}>{row.meta.createAt.slice(0,16)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.item}>
            <Image
              source={{uri:qiniuThumbUrl+row.qiniu_thumb}}
              style={styles.thumb}>
              <Icon
                name="ios-play"
                size={28}
                style={styles.play}/>
            </Image>
            <View style={styles.videoInfo}>
              <View style={styles.videotitle}>
                <Text style={styles.titleText}>{row.title}</Text>
              </View>
              <View style={styles.nickname}>
                <Text style={styles.nicknameText}>{row.author.nickname}</Text>
              </View>
            </View>

            <View style={styles.loveHeart}>
              <Icon
                  name={"ios-heart"}
                  size={28}
                  onPress={this._up}
                  style={styles.up}/>
              <Text style={styles.upCount}>{this.state.upCount}</Text>
            </View>

          </View>
        </View>
      </TouchableOpacity>
    )
  }
}


export default class List extends Component {
  constructor(props) {
    super(props)
    let user=this.props.user
    //注意，在组件中用到的内部方法，es6写法需要绑定this作用域
    this._fetchMoreData= this._fetchMoreData.bind(this)
    this._renderFooter=this._renderFooter.bind(this)
    this._onRefresh=this._onRefresh.bind(this)
    this._renderRow=this._renderRow.bind(this)

    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = {
      user:user,
      isLoadingTail:false,
      isRefreshing:false,
      dataSource: ds.cloneWithRows([])
    };
  }
  
  _renderRow(row){
    return <Item
              user={this.state.user}
              key={row._id}
              onSelect={()=>this._loadPage(row)}
              row={row}/>
  }
  
  //从后台获取数据
  _fetchData(page,skip){
    const that=this
    //page!==0：表示是上拉刷新，呈现底部加载动画
    if(page!==0){
      this.setState({
        isLoadingTail:true
      })
    }
    // page===0：表示是下拉刷新，呈现顶部加载动画
    else{
      this.setState({
        isRefreshing:true
      })
    }
    let user=typeof(this.state.user)==='string'?JSON.parse(this.state.user):this.state.user
    request.get(config.api.base + config.api.videolist,{
      accessToken:user.accessToken,
      skip:skip
    })
      .then((data) => {
        if(data.success){
          // console.log('_fetchData:',cachedResults.items.length,page,cachedResults.items,data.data);
          //获取新的数据，追加到已经加载出来的数据后面
          let items=cachedResults.items
          //如果是上拉刷新，往旧数据后面追加
          if(page!==0){
            items=items.concat(data.data)
            cachedResults.nextPage+=1
          }
          //如果是下拉刷新，在旧数据的最前面追加
          else{
            items=data.data.concat(items)
          }

          cachedResults.items=items
          //data.total 表示数据库中所有数据的总个数
          cachedResults.total=data.total
          // console.log('cachedResults.total:',cachedResults.total)
          if(page!==0){
            that.setState({
              isLoadingTail:false,
              dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }
          else{
            that.setState({
              isRefreshing:false,
              dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }
        }
      })
      .catch((error) => {
        if(page!==0){
          this.setState({
            isLoadingTail:false
          })
        }
        else{
          this.setState({
            isRefreshing:false
          })
        }
        console.error('creation _fetchData Error:',error)
      });
      
  }
  
  //是否有更多内容
  _hasMore(){
    // 当加载出来的items的长度等于总个数的时候，就表示数据已经完全加载出来了
    // 否则就表示还可以继续加载
    let accessToken=typeof(this.state.user)==='string'?JSON.parse(this.state.user).accessToken:this.state.user.accessToken
    request.get(config.api.base + config.api.videolist,{
      accessToken:accessToken,
      skip:cachedResults.items.length
    })
    .then((data) => {
        if(data.success){
          // console.log('_hasMore total:',data.total)
          if(data.total>cachedResults.items.length){
            cachedResults.total=data.total
          }
        }
    })
    // console.log('cachedResults.items.length,total:',cachedResults.items.length,cachedResults.total);
    // console.log('cachedResults.items.length!==cachedResults.total:',cachedResults.items.length!==cachedResults.total);
    return cachedResults.items.length!==cachedResults.total
  }
  
  //控制上拉加载刷新
  _fetchMoreData(){
    console.log('fetch');
    //如果没有更多内容了,或者已经在加载之中了
    if(!this._hasMore() || this.state.isLoadingTail){
      return
    }
    console.log('_fetchMoreData go');

    let page=cachedResults.nextPage
    this._fetchData(page,cachedResults.items.length)
  }
  
  //ListView最底部加载时显示的动画
  _renderFooter(){
    // console.log('_renderFooter')
    if(!this._hasMore() && cachedResults.total!==0){
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>没有更多了</Text>
        </View>
      )
    }
    //如果请求已经发送出去，但是数据还没收到，就在ListView底部放一个空节点
    if(!this.state.isLoadingTail){
      return <View style={styles.loadingMore}></View>
    }
    return <ActivityIndicator style={styles.loadingMore}/>

  }
  //控制下拉刷新
  _onRefresh(){
    //如果没有更多数据，或者已经是正在刷新了
    // console.log('_onRefresh this.hasMore（）：',this._hasMore())
    if(!this._hasMore() || this.state.isRefreshing){
      return
    }
    console.log('_onRefresh go');
    //0 :表示是下拉刷新，不需要向旧的数据后面追加，而是在最前面追加
    this._fetchData(0,cachedResults.items.length)
  }
  
  //在首页点击列表中的单个视频后，打开详情页
  _loadPage(row){
    let that=this
    this.props.navigator.push({
      name:'detail',
      component:Detail,
      params:{
        data:row,
        user:that.state.user,
        showMainView:this.props.showMainView
      }
    })
    this.props.showMainView()
  }

  componentDidMount(){
    this._fetchData(1,cachedResults.items.length)
  }

  componentWillUnmount(){
    cachedResults.nextPage=1
    cachedResults.items=[]
    this.setState({
      isLoadingTail:false,
      isRefreshing:false
    })
  }
  
  render(){
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>视频广场</Text>
        </View>
       <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={10}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor="#ff6600"
              title="拼命加载中..."
            />
          }
          showsVerticalScrollIndicator={false}
          enableEmptySections={true}
          automaticallyAdjustContentInsets={false}/>
      </View>
    )
  }
}

