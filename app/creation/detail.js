import React, { Component } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ListView,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native'
import _ from 'lodash'
import Video from 'react-native-video'
import Icon from 'react-native-vector-icons/Ionicons'
import Button from 'react-native-button'

import config from '../common/config'
import request from '../common/request'
import styles from '../style/creation/detail'

let width=Dimensions.get('window').width

let cachedResults={
  items:[],
  total:0
}

//用户头像在七牛上的Base地址
const qiniuAvatarUrl=config.qiniu.previewAvatarBase

//默认状态，在退出组件时恢复

let defaultState={
      //视频加载
      //默认视频没有出错
      videoOk:true,
      //视频是否加载完毕
      videoLoaded:false,
      //视频是否正在播放
      playing:false,
      //视频是否暂停
      paused:true,
      //视频播放进度
      videoProgress:0,
      //默认视频还没加载好，将呈现加载动画
      loading:false,
      //视频当前播放到的时间点
      currentTime:0,
      //视频第一次加载后，直接播放，所以不需要出现暂停按钮，避免闪烁
      isVideoInit:true,

      //视频播放
      rate:1,
      //是否静音
      muted:false,
      //视频自适应方式
      resizeMode:'contain',
      //是否重复播放
      repeat:false,

      //modal
      animationType:'none',
      modalVisible:false,
      //评论是否已经发送出去了，避免后台延时造成的重复提交
      isSending:false,
      content:'',
      authorId:{
        avatar:'',
        nickname:''
      }
}

export default class Detail extends Component {
  constructor(props){
    super(props)

    this._onLoadStart=this._onLoadStart.bind(this)
    this._onLoad=this._onLoad.bind(this)
    this._onProgress=this._onProgress.bind(this)
    this._onEnd=this._onEnd.bind(this)
    this._onError=this._onError.bind(this)

    this._fetchData=this._fetchData.bind(this)
    this._renderRow=this._renderRow.bind(this)
    this._renderFooter=this._renderFooter.bind(this)
    this._fetchMoreData=this._fetchMoreData.bind(this)
    this._renderHeader=this._renderHeader.bind(this)
    this._focus=this._focus.bind(this)
    
    let data=this.props.data
    let user=this.props.user
    let ds=new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2})
    this.state={
      user:user,
      data:data,
      dataSource:ds.cloneWithRows([]),
    }
    _.assignIn(this.state, defaultState)
  }
  _pop(){
    this.props.navigator.pop()
    this.props.showMainView()
  }

  //视频播放过程中的几个事件
  _onLoadStart(){
    console.log('load start')
  }
  _onLoad(){
    console.log('loads');
    if(!this.state.videoLoaded){
      this.setState({
        videoLoaded:true
      })
    }
  }
  _onProgress(data){
    //视频总长度
    let duration=data.playableDuration
    //视频当前播放到的时间点
    let currentTime=data.currentTime
    //视频播放的进度
    let percent=Number((currentTime / duration).toFixed(2))
    let newState={
      currentTime:Number(currentTime.toFixed(2)),
      videoProgress:percent
    }
    
    if(!this.state.videoLoaded){
      newState.videoLoaded=true
    }
    if(!this.state.playing){
      newState.playing=true
    }
    if(this.isVideoInit){
      newState.isVideoInit=false
    }
    this.setState(newState)
    
  }
  _onEnd(){
    this.setState({
      videoProgress:1,
      playing:false,
      paused:true,
      isVideoInit:false
    })
    console.log('end')
  }
  _onError(err){
    this.setState({
      videoOk:false
    })
    console.log('_onError:')
    console.log(err);
  }

  //重新播放
  _rePlay(){
    this.refs.videoPlayer.seek(0)
    this.setState({
      playing:true,
      paused:false
    })
  }
  //暂停
  _pause(){
    if(!this.state.paused){
      this.setState({
        paused:true
      })
    }
  }
  //暂停之后，从当前播放进度继续播放，恢复播放
  _resume(){
    if(this.state.paused){
      this.setState({
        paused:false
      })
    }
  }


  //从后台获取数据,加载评论
  _fetchData(){
    const that=this
    this.setState({
      isLoadingTail:true
    })
    let user=typeof(this.state.user)==='string'?JSON.parse(this.state.user):this.state.user
    request.get(config.api.base+config.api.comment,{
      audioId:this.state.data._id,
      accessToken:user.accessToken
    })
      .then((data) => {
        if(data.success){
          //没有评论
          if(!data.data){
            this.setState({
              isLoadingTail:false
            })
            return
          }
          //获取新的数据，追加到已经加载出来的数据后面
          let items=cachedResults.items.slice()
          items=items.concat(data.data.commentDetail)

          cachedResults.items=items
          //data.total 表示数据库中所有数据的总个数
          cachedResults.total=data.total
          that.setState({
            isLoadingTail:false,
            dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
          })

        }
      })
      .catch((error) => {
        that.setState({
          isLoadingTail:false
        })
        console.error(error)
      });
      
  }
  
  //控制上拉加载刷新
  _fetchMoreData(){
    //如果没有更多内容了,或者已经在加载之中了
    if(this.state.isLoadingTail){
      return
    }
  }
  
  //ListView最底部加载时显示的动画
  _renderFooter(){
    if(cachedResults.total!==0){
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>
            没有更多了
          </Text>
        </View>
      )
    }
    if(cachedResults.total===0){
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>
            ╰(*°▽°*)╯抢到沙发啦
          </Text>
        </View>
      )
    }
    //如果请求已经发送出去，但是数据还没收到，就在ListView底部放一个空节点
    if(!this.state.isLoadingTail){
      return <View style={styles.loadingMore}></View>
    }
    return <ActivityIndicator style={styles.loadingMore}/>

  }

  //渲染评论内容
  _renderRow(row){
    // console.log('_renderRow:',row)
    let avatar=qiniuAvatarUrl+(row.authorId.avatar?row.authorId.avatar:config.qiniu.default_avatar)
    return (
      <View key={row._id} style={styles.replyBox}>
        <Image style={styles.replyAvatar} source={{uri:avatar}}/>
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.authorId.nickname}</Text>
          <Text style={styles.replyContent}>{row.commentDetail}</Text>
        </View>
      </View>
    )
  }

  //评论框聚焦的时候
  _focus(){
    this._setModalVisible(true)
    this.state.videoOk && this.setState({paused:true})
  }
  _blur(){

  }
  _closeModal(){
    this._setModalVisible(false)
  }
  //控制模态框是否显示
  _setModalVisible(isVisible){
    this.setState({
      modalVisible:isVisible
    })
  }

  _renderHeader(){
    let data=this.state.data
    let avatar=qiniuAvatarUrl+(data.author.avatar?data.author.avatar:config.qiniu.default_avatar)
    return (
      <View style={styles.listHeader}>
        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri:avatar}}/>
          <View style={styles.descBox}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View style={styles.comment}>
            <Text style={styles.commentTitle}>评论一个</Text>
            <View>
              <Text style={styles.contentText} onPress={this._focus}>表达一下您的心情吧</Text>
            </View>
          </View>
        </View>
        <View style={styles.commentArea}>
          <Text stype={styles.commentTitle}>精彩评论</Text>
        </View>
      </View>
    )
  }

  _submit(){
    const that=this
    let user=typeof(this.state.user)==='string'?JSON.parse(this.state.user):this.state.user

    if(!this.state.content){
      return Alert.alert('(,,• ₃ •,,) 您还没填写哦')
    }
    if(this.state.isSending){
      return Alert.alert('(*＾-＾*) 已经提交过啦')
    }
    //这里的setState方法多加了一个回调函数，用于在改变状态的同时，提交评论表单
    this.setState({
      isSending:true
    },()=>{
      let body={
        accessToken:user.accessToken,
        audioId:that.state.data._id,
        authorId:user._id,
        commentDetail:this.state.content
      }
      let url=config.api.base+config.api.comment
      request.post(url,body)
        .then((data)=>{
          if(data && data.success){
            // console.log('config.api.comment data:',data)
            let items=cachedResults.items.slice()
            let content=that.state.content
            items=items.concat([{
              commentDetail:that.state.content,
              authorId:{
                avatar:user.avatar,
                nickname:user.nickname
              }
            }])

            cachedResults.items=items
            cachedResults.total+=1
            //即时显示用户的提交内容
            that.setState({
              commentDetail:that.state.content,
              isSending:false,
              dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
            })
            //隐藏modal
            that._setModalVisible(false)
          }
        })
        .catch((error)=>{
          console.log('detail comment Error:',error)
          that.setState({
            isSending:false
          })
          that._setModalVisible(false)
          Alert.alert('(๑°ㅁ°๑)‼ 评论失败，请稍后重试')
        })
    })
  }

  componentDidMount(){
    //视频等全部加载完毕后 ，才开始加载视频以及评论
    this.setState({
      paused:false
    })
    this._fetchData()
  }

  componentWillUnmount(){
    this.setState({
      isLoadingTail:false,
      dataSource:this.state.dataSource.cloneWithRows([]),
    })
    this.setState(defaultState)
    cachedResults.items=[]
    cachedResults.total=0
  }

  render(){
    let data=this.state.data
    // console.log('VideoUrl:',data);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBox} onPress={this._pop.bind(this)}>
            <Icon name='ios-arrow-back' style={styles.backIcon}/>
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
            <Text style={styles.headerTitle} numberOflines={1}>视频详情页</Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref="videoPlayer"
            source={{uri:config.qiniu.previewThumbBase+data.qiniu_video}}
            style={styles.video}
            volume={3}
            paused={this.state.paused}
            rate={this.state.rate}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}
            playInBackground={false}
            
            onLoadStart={this._onLoadStart}
            onLoad={this._onLoad}
            onProgress={this._onProgress}
            onEnd={this._onEnd}
            onError={this._onError}/>
            {
              // 当视频出错时，
              !this.state.videoOk && <Text style={styles.failText}>┌(。Д。)┐ 视频出错了！</Text>
            }
            {
              //当视频没有加载完毕的时候，加载动画
              this.state.videoOk && !this.state.videoLoaded && <ActivityIndicator color="#ee735c" style={styles.loading}/>
            }
            {
              // 当视频加载完毕，并且还没播放，也就是开始时，或者已经播放完毕，可以重新播放的时候，出现播放按钮
              this.state.videoLoaded && !this.state.playing && !this.state.isVideoInit
              ? <Icon
                  onPress={this._rePlay.bind(this)}
                  name="ios-play"
                  size={48}
                  style={styles.playIcon}/>
              : null
            }
            {
              // 当视频加载完毕，并且已经播放了
              this.state.videoLoaded && this.state.playing
              ? <TouchableOpacity onPress={this._pause.bind(this)} style={styles.pauseBtn}>
                  {
                    // 当视频暂停时，给一个播放按钮
                    this.state.paused
                    ? <Icon onPress={this._resume.bind(this)} size={48} name="ios-play" style={styles.resumeIcon}/>
                    : <Text></Text>
                  }
                </TouchableOpacity>
              : null
            }

          <View style={styles.progressBox}>
            <View style={[styles.progressBar,{width:width*this.state.videoProgress}]}>
            </View>
          </View>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderHeader={this._renderHeader}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={10}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}/>

          <Modal
            animationType={'slide'}
            visible={this.state.modalVisible}
            onRequestClose={()=>{this._setModalVisible(false)}}>
            <TouchableOpacity style={styles.modalHeader} onPress={this._closeModal.bind(this)}>
              <Icon
                name='ios-arrow-back'
                style={styles.closeIcon}/>
              <Text style={styles.backText}> 返回</Text>
            </TouchableOpacity>
            <View style={styles.modalContainer}>
                <View style={styles.commentBox}>
                  <View style={styles.comment}>
                    <Text style={styles.commentText}>评论一个</Text>
                    <TextInput
                      autoFocus={true}
                      placeholder='表达一下您的心情吧'
                      placeholderTextColor={'#eee'}
                      style={styles.content}
                      onFocus={this._focus}
                      onBlur={this._blur}
                      defaultValue={this.state.content}
                      underlineColorAndroid='transparent'
                      multiline={true}
                      onChangeText={(text)=>{
                        this.setState({
                          content:text
                        })
                      }}/>
                  </View>
                </View>
                <Button style={styles.submitBtn} onPress={this._submit.bind(this)}>发 表</Button>
            </View>
          </Modal>
      </View>
    )
  }
}

