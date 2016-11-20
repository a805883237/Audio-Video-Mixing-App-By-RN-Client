import React, { Component } from 'react'
import {
  AppRegistry,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  AsyncStorage,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import _ from 'lodash'
import Video from 'react-native-video'
import Button from 'react-native-button'
import ImagePicker from 'react-native-image-picker'
import * as Progress from 'react-native-progress'
import Icon from 'react-native-vector-icons/Ionicons'
import TabNavigator from 'react-native-tab-navigator'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import { Bubbles} from 'react-native-loader'
const CountDownText = require('react-native-sk-countdown').CountDownText
const RNUploader = require('react-native-uploader')
const TabNavigatorItem =TabNavigator.Item


import config from '../common/config'
import request from '../common/request'
import styles from '../style/edit/index'

let width=Dimensions.get('window').width
let height=Dimensions.get('window').height

//视频的配置
const videoOptions = {
  title: '选择视频',
  cancelButtonTitle:'取消',
  takePhotoButtonTitle:'录制10s视频',
  chooseFromLibraryButtonTitle:'选择已有视频',
  videoQuality:'high',
  mediaType:'video',
  //控制时长为10s
  durationLimit:10,
  noData:false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}
//录音的配置
const audioOptions = {
  SampleRate: 22050,
  Channels: 1,
  AudioQuality: "High",
  AudioEncoding: "aac",
  AudioEncodingBitRate: 32000
}

//所有的初始状态，用在每次点击“更换视频”的时候
let defaultState={
    //加载页面显示的动画
    loadingAnimation:false,
    //控制加载页面背景颜色变化
    modalBgc:1,
    previewVideo:null,
    //音频是否已经保存到数据库
    videoIsSave:false,

    videoId:null,
    audioId:null,

    //发布视频
    title:'',
    modalVisible:false,
    publishing:false,
    willPublish:false,

    //视频上传
    //上传到七牛之后返回的响应数据
    video:null,
    //视频是否上传完毕
    videoUploaded:false,
    //视频是否正在上传
    videoUploading:false,
    //上传进度
    videoUploadedProgress:0.1,
    paused:false,

    //视频播放进度
    videoProgress:0,
    videoTotal:0,
    //视频当前播放到的时间点
    currentTime:0,

    //视频播放
    rate:1,
    //是否静音
    muted:true,
    //视频自适应方式
    resizeMode:'contain',
    //是否重复播放
    repeat:false,

    //录音倒计时
    counting:false,
    recording:false,

    //audio
    //初始化音频文件路径
    audioPath:AudioUtils.MusicDirectoryPath + '/'+new Date().getTime()+'_audio.aac',
    //上传到cloudinary之后返回的响应数据
    audio:null,
    audioPlaying:false,
    recordDone:false,
    //是否已经录音了
    hasRecorded:false,
    //是否在预览声音
    previewRecord:false,

    //音频是否上传完毕
    audioUploaded:false,
    //音频是否正在上传
    audioUploading:false,
    //上传进度
    audioUploadedProgress:0.16,
}

//自定义倒计时组件
class MyCountTime extends Component{
    constructor(props) {
        super(props)
        let timeLeft=this.props.timeLeft>0 ? this.props.timeLeft:5
        let width=this.props.width || 60
        let height=this.props.height || 32
        let color=this.props.color || '#fff'
        let fontSize=this.props.fontSize || 22
        let fontWeight=this.props.fontWeight || '600'
        let borderColor=this.props.borderColor || '#ee735c'
        let borderWidth=this.props.borderWidth || 1
        let borderRadius=this.props.borderRadius || 4
        let backgroundColor=this.props.backgroundColor || '#ee735c'
        
        this._callback=this.props.afterEnd || this._afterEnd
        this.state={
            timeLeft:timeLeft
        }
        this.countTextStyle={
            textAlign:'center',
            color:color,
            fontSize:fontSize,
            fontWeight:fontWeight
        }
        this.countViewStyle={
          backgroundColor:backgroundColor,
          alignItems:'center',
          borderColor:borderColor,
          borderWidth:borderWidth,
          borderRadius:borderRadius,
          width:width,
          height:height
        }
    }
    countdownfn(timeLeft,callback){
      if(timeLeft>0){
          let that=this
          let interval=setInterval(function(){
              if(that.state.timeLeft<1){
                  clearInterval(interval)
                  callback()
              }else{
                let totalTime=that.state.timeLeft
                that.setState({
                    timeLeft:totalTime-1
                })
              }
          },1000)
      }
    }
    _afterEnd(){
        console.log('------------time over')
    }
    
    componentDidMount(){
        let time=this.state.timeLeft
        let afterEnd=this._callback
        this.countdownfn(time,afterEnd)
    }   
    render(){
        return (
            <View style={this.countViewStyle}>
                <Text style={this.countTextStyle}>{this.state.timeLeft===0?'Go':this.state.timeLeft}</Text>
            </View>
        )
    }
}

export default class Edit extends Component {
  constructor(props){
    super(props)
    let user=this.props.user || {}

    //将上面默认状态复制进来，并且额外增加user状态,最后全部放到组件的state中
    let state=_.clone(defaultState)
    state.user=user
    // 视频总长度
    state.videoDuration=0
    this.state=state

    this._onLoadStart=this._onLoadStart.bind(this)
    this._onLoad=this._onLoad.bind(this)
    this._onProgress=this._onProgress.bind(this)
    this._onEnd=this._onEnd.bind(this)
    this._onError=this._onError.bind(this)
    this._counting=this._counting.bind(this)
    this._record=this._record.bind(this)
    this._preview=this._preview.bind(this)
  }

  //视频播放过程中的几个事件
  _onLoadStart(){
    console.log('load start')
  }
  _onLoad(data){
    this.setState({
      videoDuration:data.duration
    })
    console.log('loads')
  }
  _onProgress(data){
    //视频总长度
    let duration=this.state.videoDuration
    //视频当前播放到的时间点
    let currentTime=data.currentTime
    //视频播放的进度
    let percent=Number((currentTime / duration).toFixed(2))
    this.setState({
      videoTotal:duration,
      currentTime:Number(currentTime.toFixed(2)),
      videoProgress:percent
    })
    
  }
  _onEnd(){
    this.setState({
      paused:true,
      videoProgress:1,
      audioPlaying:false
    })
    if(this.state.recording){
      //停止录音
      AudioRecorder.stopRecording()
      this.setState({
        hasRecorded:true,
        recordDone:true,
      })
    }
    if(this.state.recording || this.state.previewRecord){
      this.setState({
        recording:false,
        previewRecord:false
      })
    }
    console.log('_onEnd')
  }
  _onError(err){
    console.log('_onError:',err)
  }

  //预览音频
  _preview(){
    console.log('begin _preview');
    if(this.state.audioPlaying){
      AudioRecorder.stopRecording()
    }
    this.refs['videoPlayer'].seek(0)

    this.setState({
      videoProgress:0,
      audioPlaying:true,
      paused:false,
      previewRecord:true
    })
    AudioRecorder.playRecording()
  }
  
  _closeModal(){
    this.setState({
      modalVisible:false
    })
  }
  _showModal(){
    this.setState({
      modalVisible:true
    })
  }

  _videoIsSave(audioId){
    let that=this
    let videoIsSaveUrl=config.api.base+config.api.videoIsSave
    let time=0
    console.log('time:',time);
    let interval=setInterval(()=>{
      time++
      if(time>20){
        Alert.alert('网络超时，请重试')
        clearInterval(interval)
        that.setState(defaultState)
        return
      }
      if(!that.state.videoIsSave){
        request.get(videoIsSaveUrl,audioId)
          .then((data)=>{
            console.log('_videoIsSave data:',data);
            if(data && data.success){
              if(data.videoIsSave){
                that.setState({
                  videoIsSave:true
                })
              }
            }
          })
      }
      else{
        clearInterval(interval)
      }
      
    },1500)
  }
  

  _record(){
    //使用refs引用组件
    this.refs.videoPlayer.seek(0)
    let audioPath = this.state.audioPath
    AudioRecorder.prepareRecordingAtPath(audioPath, audioOptions)
    //开始往音频文件中录音
    AudioRecorder.startRecording()

    this.setState({
      videoProgress:0,
      counting:false,
      recording:true,
      paused:false,
      recordDone:false,
      previewRecord:true
    })

    console.log('_record')
  }
  _counting(){
    console.log('counting');
    //既没有在倒计时，也没有在录音
    if(!this.state.counting && !this.state.recording && !this.state.audioPlaying){
      this.setState({
        counting:true,
        paused:true
      })
      this.refs.videoPlayer.seek(0)
    }
  }

  //可以传七牛，也可以传cloudinary
  _getToken(body){
    let signatureURL=config.api.base+config.api.signature
    body.accessToken=this.state.user.accessToken
    return request.post(signatureURL,body)
  }

  //向cloudinary.com图床post包含视频文件的表单
  _upload(body,type){
    let that=this
    let xhr=new XMLHttpRequest()
    let url=config.qiniu.upload

    xhr.timeout = 10000
    xhr.ontimeout = function(e){
      Alert.alert('网络错误，请求超时！')
      that.setState(defaultState)
      return
    }



    //如果是音频，则上传到cloudinary
    if(type==='audio'){
      url=config.cloudinary.video
      console.log('it is audio');
    }

    let state={}
    //动态赋值，区分视频和音频,达到兼容的效果
    state[type+'UploadedProgress']=0
    state[type+'Uploading']=true
    state[type+'Uploaded']=false

    this.setState(state)

    xhr.open('POST',url)
    
    xhr.onload=()=>{
      if(xhr.status!==200){
        Alert.alert('┌(。Д。)┐请求失败a')
        console.log('xhr.respnseText',xhr.responseText)
        return
      }
      if(!xhr.responseText){
        Alert.alert('┌(。Д。)┐请求失败b')
        return
      }
      let response
      try{
        response=JSON.parse(xhr.response)
      }
      catch(e){
        console.log('xhr-Error',e)
      }
      console.log('xhr upload')
      if(response){
        let newState={}
        newState[type]=response
        newState[type+'Uploading']=false
        newState[type+'Uploaded']=true

        that.setState(newState)

        let updateURL=config.api.base+config.api[type]
        let accessToken=this.state.user.accessToken
        let updateBody={
          accessToken:accessToken
        }
        updateBody[type]=response

        request.post(updateURL,updateBody)
        .catch((err)=>{
          Alert.alert('(๑°ㅁ°๑)‼视频同步出错a，请稍后重试')
          console.log('xhr.onload-->request.post Error:',err)
        })
        .then((data)=>{
          if(data && data.success){
            let mediaState={}
            mediaState.videoId=data.data
            that.setState(mediaState)
          }
          else{
            Alert.alert('(๑°ㅁ°๑)‼视频同步出错c，请稍后重试')
          }
        })
      }
    }
    console.log('xhr begin upload:',xhr.upload);
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{
        if(event.lengthComputable){
          let percent=Number((event.loaded / event.total).toFixed(2))
          let progressSate={}
          progressSate[type+'UploadedProgress']=percent
          that.setState(progressSate)
        }
      }
    }
    xhr.onerror=(e)=>{
      console.log('xhr.onerror:',e);
    }
    xhr.send(body)
  }

  //上传音频到cloudinary
  _uploadAudioSelfFetch(body){
    let that=this
    this.setState({
      audioUploadedProgress:0,
      audioUploading:true,
      audioUploaded:false
    })
    let uploadUrl=config.cloudinary.video
    let uri=body._parts[6][1].uri
    let fileName=body._parts[6][1].name
    let method='POST'

    //开始向cloudinary上传音频
    let files = [
        {
            name: 'file[]',
            filename: 'myaudio.acc',
            filepath: uri,
            filetype: 'video/mp4',
        }
    ]

    let opts = {
        url: uploadUrl,
        files: files,
        method: 'POST', 
        headers: { 'Accept': 'application/json' },
        params: {
          folder:body._parts[0][1],
          signature:body._parts[1][1],
          tags:body._parts[2][1],
          timestamp:body._parts[3][1],
          api_key:body._parts[4][1],
          resource_type:body._parts[5][1],
          file:body._parts[6][1]
        }
    }

    RNUploader.upload( opts, (err, response) => {
        if( err ){
            console.log(err);
            Alert.alert('┌(。Д。)┐上传音频失败,请重试！')
        }else{
          let responseString = response.data;
          console.log('upload complete with response:',response);

          //上传视频、视频成功，弹出Modal
          that.setState({
            audio:response,
            audioUploading:false,
            audioUploaded:true
          })

          let updateURL=config.api.base+config.api.audio
          let accessToken=that.state.user.accessToken
          let updateBody={
            audio:response,
            accessToken:accessToken,
            videoId:that.state.videoId
          }

          request.post(updateURL,updateBody)
          .catch((err)=>{
              console.log('xhr.onload-->request.post Error:',err)
              Alert.alert('(๑°ㅁ°๑)‼音频同步出错a，请稍后重试')
          })
          .then((data)=>{
            console.log('updateBody request data:',data);
            if(data && data.success){
              let mediaState={}
              mediaState.audioId=data.data
              this.setState({
                loadingAnimation:false
              })
              that._showModal()
              mediaState.willPublish=true
              that.setState(mediaState)
              //检测音频是否上传成功
              let body={
                audioId:mediaState.audioId,
                accessToken:this.state.user.accessToken
              }
              that._videoIsSave(body)
            }
            else{
            Alert.alert('(๑°ㅁ°๑)‼音频同步出错c，请稍后重试')
            }
          })
        }
    })
  }

  _pickVideo(){
    let that=this
    this.setState({
      recording:false,
      paused:true
    })
    ImagePicker.showImagePicker(videoOptions, (res) => {
      console.log('ImagePicker res : ', res)

      if (res.didCancel) {
        console.log('edit/index.js :User cancelled video picker')
        this.setState({
          paused:true
        })
        return
      }
      else if (res.error) {
        console.log('edit/index.js :videoPicker Error: ', res.error)
        return
      }
      else if (res.customButton) {
        console.log('edit/index.js :User tapped custom button: ', res.customButton)
        return
      }
      //将所有状态重置为初始状态
      let state=_.clone(defaultState)

      let uri=res.uri

      state.previewVideo=uri
      state.user=this.state.user
      state.videoDuration=this.state.videoDuration
      
      console.log('edit/index.js video uri:',uri)
      that.setState(state)

      that._getToken({
        type:'video',
        cloud:'qiniu'
      })
        .catch((e)=>{
          console.log('_pickVideo that._getToken Error:',e)
          Alert.alert('上传出错,请重试')
        })
        .then((data)=>{
          console.log('_getToken:data:',data);
          if(data && data.success){
            let token=data.data.token
            let key=data.data.key
            //HTML5构建表单的方式
            //使用FormData模拟一个完整的表单，然后使用XMLHttpRequest发送这个"表单".
            let body=new FormData()

            body.append('token',token)
            body.append('key',key)
            body.append('file',{
              type:'video/mp4',
              uri:uri,
              name:key
            })

            that._upload(body,'video')
          }
        })
        .catch((err)=>{
          console.log('_getQiniuToken() Error:',err)
        })
    })
  }

  //上传音频到cloudinarry
  _uploadAudio(){
    this.setState({
      loadingAnimation:true
    })
    console.log('begin _uploadAudio');
    let that=this
    let tags='app,audio'
    let folder='audio'
    let timestamp=Date.now()

    this._getToken({
      type:'audio',
      timestamp:timestamp,
      cloud:'cloudinary'
    })
    .catch((err)=>{
      console.log('edit/index _uploadAudio request-Error:',err)
    })
    .then((data)=>{
      if(data && data.success){
        let signature=data.data.token
        let key=data.data.key

        //HTML5构建表单的方式
        //使用FormData模拟一个完整的表单，然后使用XMLHttpRequest发送这个"表单".
        let body=new FormData()
        body.append('folder',folder)
        body.append('signature',signature)
        body.append('tags',tags)
        body.append('timestamp',timestamp.toString())
        body.append('api_key',config.cloudinary.api_key)
        body.append('resource_type','video')
        body.append('file',{
          type:'video/mp4',
          uri:that.state.audioPath,
          name:key
        })
        that._uploadAudioSelfFetch(body)
      }
    })
  }

  _initAudio(){
      let audioPath = this.state.audioPath
      AudioRecorder.prepareRecordingAtPath(audioPath, audioOptions)
      AudioRecorder.onProgress = (data) => {
        this.setState({currentTime: Math.floor(data.currentTime)})
      }
      AudioRecorder.onFinished = (data) => {
        this.setState({finished: data.finished});
        console.log(`Finished recording: ${data.finished}`)
      }
    }

  componentDidMount(){
    let that=this
    AsyncStorage.getItem('user15')
      .then((data)=>{
        let user
        if(data){
          user=JSON.parse(data)
        }
        if(user && user.accessToken){
          that.setState({
            user:user
          })
        }
      })

      // //初始化音频
      this._initAudio()
  }

  _submit(){
    let that=this
    let body={
      title:this.state.title,
      videoId:this.state.videoId,
      audioId:this.state.audioId
    }

    let creationURL=config.api.base+config.api.creations
    let user =this.state.user

    if(user && user.accessToken){
      body.accessToken=user.accessToken

      this.setState({
        publishing:true
      })

      request.post(creationURL,body)
        .catch((err)=>{
          console.log('edit/index.js _submit request Error:',err);
          Alert.alert('视频发布失败a！')
        })
        .then((data)=>{
          if(data && data.success){
            that._closeModal()
            Alert.alert('视频发布成功！')
            let state=_.clone(defaultState)
            that.setState(state)
          }
          else{
            this.setState({
              publishing:false
            })
            Alert.alert('视频发布失败！')
          }
        })
    }
  }


  render(){
    if(this.state.loadingAnimation){
      return (
        <Modal
          animationType={'slide'}
          visible={this.state.loadingModal}
          onRequestClose={()=>{}}>
          <View style={[styles.loadingAnimationModal]}>
            <Text style={[styles.loadingModalText]}>正在拼命上传中</Text>
            <Text style={styles.loadingModalText}>o(*////▽////*)q</Text>
            <Text style={styles.loadingModalText}>请稍等~~~</Text>
            <ActivityIndicator size={'large'} style={styles.loadingAnimation} color='#ee735c'/>
          </View>
        </Modal>
      )
    }
    return (
      <View style={styles.container}>
        <View style={styles.toolBar}>
          <Text style={styles.toolbarTitle}>
            {this.state.previewVideo?'点击图标配音':'发布心情'}
          </Text>
          {
            this.state.previewVideo && this.state.videoUploaded
            ? <Text style={styles.toolbarExtra} onPress={this._pickVideo.bind(this)}>
                更换视频
              </Text>
            : null
          }
          
        </View>

        <View style={styles.page}>
          {
            this.state.previewVideo
            ? <View style={styles.videoContainer}>
                <View style={styles.videoBox}>
                  <Video
                    ref="videoPlayer"
                    source={{uri:this.state.previewVideo}}
                    style={styles.video}
                    volume={3}
                    rate={this.state.rate}
                    muted={this.state.muted}
                    resizeMode={this.state.resizeMode}
                    repeat={this.state.repeat}
                    paused={this.state.paused}
                    
                    onLoadStart={this._onLoadStart}
                    onLoad={this._onLoad}
                    onProgress={this._onProgress}
                    onEnd={this._onEnd}
                    onError={this._onError}/>
                    {
                      !this.state.videoUploaded && this.state.videoUploading
                      ? <View style={styles.progressTipBox}>
                          <Progress.Bar
                            style={styles.progressBar}
                            showText={true}
                            width={width}
                            height={3}
                            borderColor={'#ee735c'}
                            color='#ee735c'
                            progress={this.state.videoUploadedProgress} />
                          <Text style={styles.progressTip}>
                            正在生成静音视频，已完成{(this.state.videoUploadedProgress * 100).toFixed(2)}%
                          </Text>
                        </View>
                      : null
                    }
                    {
                      this.state.recording || this.state.audioPlaying
                      ? <View style={styles.progressTipBox}>
                          <Progress.Bar
                            style={styles.progressBar}
                            showText={true}
                            width={width}
                            height={3}
                            borderColor={'#ee735c'}
                            color='#ee735c'
                            progress={this.state.videoProgress} />
                            {
                              this.state.recording
                              ? <Text style={styles.progressTip}>
                                  录制声音中...
                                </Text>
                              : null
                            }
                         </View>
                        : null
                    }
                </View>
              </View>
            : <TouchableOpacity
                style={styles.uploadContainer}
                onPress={this._pickVideo.bind(this)}
                >
                <View style={styles.uploadBox}>
                  <Icon name='ios-paper-plane' style={styles.uploadIcon}/>
                  <Text style={styles.uploadTitle}>点我上传视频</Text>
                  <Text style={styles.uploadDesc}>建议时长不超过10s</Text>
                </View>
              </TouchableOpacity>
          }

          {
            this.state.videoUploaded
            ? <View style={styles.recordBox}>
              <View style={[styles.recordIconBox,(this.state.recording||this.state.audioPlaying) && styles.recordOn]}>
                {
                  this.state.counting && !this.state.recording
                  ? <MyCountTime timeLeft={3} afterEnd={this._record}/>
                  : <TouchableOpacity onPress={this._counting}>
                      <Icon name='ios-mic' style={styles.recordIcon}/>
                    </TouchableOpacity>
                }
              </View>
            </View>
            : null
          }
          {
            this.state.videoUploaded && this.state.recordDone
            ? <View style={styles.uploadAudioBox}>
                {
                  !this.state.audioUploaded && !this.audioUploading
                  ? <View style={styles.uploadAudioText}>
                      <TouchableOpacity style={[styles.previewBox]}>
                        <Icon name='ios-arrow-back' style={styles.previewIcon}/>
                        <Text style={styles.previewText} onPress={this._preview}>
                          = 预览声音
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.previewBox}>
                        <Text  style={styles.previewText} onPress={this._uploadAudio.bind(this)}>上传视频 =</Text>
                        <Icon name='ios-arrow-forward' style={styles.previewIcon}/>
                      </TouchableOpacity>
                    </View>
                  : null
                }
              </View>
            : null
          }
        </View>
        <Modal
          animationType={'slide'}
          visible={this.state.modalVisible}
          onRequestClose={()=>{}}>
          <View style={styles.modalContainer}>
            {
              !this.state.publishing
              ? <TouchableOpacity style={styles.modalHeader} onPress={this._closeModal.bind(this)}>
                  <Icon
                    name='ios-arrow-back'
                    style={styles.closeIcon}/>
                  <Text style={{color:'#fff'}}> 返回</Text>
                </TouchableOpacity>
              : null
            }
            {
              this.state.audioUploaded && !this.state.publishing
              ? <View style={styles.filedBox}>
                  <TextInput
                    placeholderTextColor={'#ccc'}
                    autoFocus={true}
                    placeholder='真是棒极了，为你的配音来句个性宣言怎么样？'
                    style={styles.inputField}
                    autoCapitalize ={'none'}
                    autoCorrect={false}
                    underlineColorAndroid='transparent'
                    defaultValue ={this.state.title}
                    onChangeText ={(text)=>{
                      this.setState({
                        title:text
                      })
                    }}/>
                </View>
              : null
            }
            {
              this.state.publishing
              ? <View style={styles.loadingBox}>
                  <Text style={styles.loadingText}>耐心等一下，拼命为您生成专属视频中...</Text>
                  {
                    this.state.willPublish
                    ? <Text style={styles.loadingText}>正在合并视频、音频中...</Text>
                    : null
                  }
                  <ActivityIndicator style={styles.loadingAnimation} color='#ee735c'/>
                </View>
              : null
            }
            <View style={styles.submitBox}>
              {
                this.state.audioUploaded && !this.state.publishing
                ? <Button
                    style={styles.btn}
                    styleDisabled={styles.disabledBtn}
                    disabled={!this.state.videoIsSave}
                    onPress={
                      this.state.videoIsSave
                      ? this._submit.bind(this)
                      : ()=>{}
                    }>
                      {
                        this.state.videoIsSave
                        ? '发布视频'
                        : '正在同步音频中...'
                      }
                    </Button>
                : null
              }
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}




