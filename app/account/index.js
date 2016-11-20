import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  AsyncStorage,
  Alert,
  Modal,
  ToastAndroid,
} from 'react-native'

import Icon from 'react-native-vector-icons/Ionicons'
import ImagePicker from 'react-native-image-picker'
import * as Progress from 'react-native-progress'

import Button from 'react-native-button'
import sha1 from 'sha1'
import _ from 'lodash'
import ConfirmModal from '../common/confirmModal'

import config from '../common/config'
import request from '../common/request'
import styles from '../style/account/index'

const photoOptions = {
  title: '选择头像',
  cancelButtonTitle:'取消',
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'选择相册',
  quality:0.75,
  allowsEditing:true,
  noData:false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

//根据cloudinary.com响应回来的public_id字段拼接地址
function avatar(id,type) {
  if(id.indexOf('http')>-1){
    return id
  }
  if(id.indexOf('base64:image')>-1){
    return id
  }
  
  if(id.indexOf('avatar/')>-1){
    return config.cloudinary.base+'/'+type+'/upload/'+id
  }
  //七牛的上传返回
  return 'http://ogd72jlbf.bkt.clouddn.com/'+id
}


export default class Account extends Component {
  constructor(props){
    super(props)
    let user=this.props.user || {}
    this.state={
      user:user,
      //用户数据副本，为批量修改用户信息所用
      user_tmp:{},
      //头像上传进度，默认为0
      avatarProgress:0,
      //头像是否正在上传中，默认false
      avatarUploding:false,
      modalVisible:false,

      //修改用户信息


      //修改信息模态框的状态
      //是否弹出模态框
      renderAlert:false,
      isEdit:false,
      editText:'',
      infoItems:'',
      infoText:''
    }
  }

  //点击'编辑'之后，弹出编辑模态框
  _edit(){
    this.setState({
      modalVisible:true
    })
  }
  //点击模态框上的关闭图标之后，关闭编辑模态框
  _closeModal(){
    this.setState({
      modalVisible:false,
      user_tmp:{}
    })
  }

    _renderButton(title, onPress, active) {
      var style = (active) ? styles.activeButtonText : styles.buttonText;

      return (
        <TouchableHighlight style={styles.button} onPress={onPress}>
          <Text style={style}>
            {title}
          </Text>
        </TouchableHighlight>
      )
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
  }

  //七牛云的token
  _getQiniuToken(){
    let accessToken=this.state.user.accessToken
    let signatureURL=config.api.base+config.api.signature
    return request.post(signatureURL,{
        accessToken:accessToken,
        type:'avatar',
        cloud:'qiniu'
      })
      .catch((err)=>{
        console.log('account/index request-Error:',err);
      })
  }

  //选择相册或拍照
  _pickPhoto(){
    let that=this
    ImagePicker.showImagePicker(photoOptions, (res) => {
      // console.log('res = ', res)

      if (res.didCancel) {
        console.log('User cancelled image picker')
        return
      }
      else if (res.error) {
        console.log('ImagePicker Error: ', res.error)
        return
      }
      else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton)
        return
      }
      
      let avatarData='data:image/jpeg;base64,'+res.data
      let uri=res.uri

      that._getQiniuToken()
        .then((data)=>{
          if(data && data.success){
            let token=data.data.token
            let key=data.data.key
            //HTML5构建表单的方式
            //使用FormData模拟一个完整的表单，然后使用XMLHttpRequest发送这个"表单".
            let body=new FormData()

            body.append('token',token)
            body.append('key',key)
            body.append('file',{
              type:'image/jpeg',
              uri:uri,
              name:key
            })

            that._upload(body)
          }
        })
    })
  }
  //向cloudinary.com图床post包含图片文件的表单
  _upload(body){
    let that=this
    let user=this.state.user
    let xhr=new XMLHttpRequest()
    let url=config.qiniu.upload

    this.setState({
      avatarUploding:true,
      avatarProgress:0
    })

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
      if(response){
        //如果带有public_id，表明是cloudinary图床
        let user=this.state.user
        if(response.public_id){
          user.avatar=response.public_id
        }

        //如果带有key（就是上传），表明是七牛图床
        if(response.key){
          user.avatar=response.key
        }

        that.setState({
          avatarUploding:false,
          avatarProgress:0,
          user:user
        })
        that._asyncUser(user)
      }
    }
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{
        if(event.lengthComputable){
          let percent=Number((event.loaded / event.total).toFixed(2))
          that.setState({
            avatarProgress:percent
          })
        }
      }
    }
    xhr.send(body)
  }

  _asyncUser(body){
    let that=this
    let user=this.state.user

    if(user && user.accessToken){
      let url=config.api.base+config.api.update

      request.post(url,body)
        .then((data)=>{
          if(data && data.success){
            let user=data.data
            that.setState({
              user:user
            },()=>{
              that._closeModal()
              AsyncStorage.setItem('user15',JSON.stringify(user))
                .catch((err)=>{
                  console.log('本地存储失败：',err);
                })
            })
          }
        })
        .catch((err)=>{
          console.log('Err123:',err);
        })
    }
  }
  
  _changeUserState(key,value){
    let user_tmp=this.state.user_tmp
    user_tmp[key]=value
    this.setState({
      user_tmp:user_tmp
    })
  }
  //编辑资料，用户数据的编辑更新
  _submit(){
    //保存数据到后台
    _.assignIn(this.state.user,this.state.user_tmp)
    this.setState({
      user_tmp:{}
    })
    try{
      this._asyncUser(this.state.user)
    }
    catch(e){
      console.log('index.js _submit+error',e);
    }
  }
  //退出登录状态
  _logout(){
    this.props.logout()
  }
  
  //弹出模态框，修改用户资料
  _popModal(infoItems,infoText){
    this.props.showMainView()
    this.setState({
      renderAlert:true,
      infoItems:infoItems,
      infoText:infoText
    })
  }
  //弹出模态框，修改用户性别
  _popAlert(){
    let that=this
    Alert.alert(
      '选择您的性别',
            null,
            [
              {text: '男', onPress: () => setGender(1)},
              {text: '女', onPress: () => setGender(0)},
            ]
    )
    function setGender(gender){
      let infoText
      gender===1?infoText='male':infoText='female'
       // only : 值true代表是单独修改某一个项
      let body={
        infoItems:'gender',
        infoText:infoText,
        accessToken:that.state.user.accessToken,
        only:true
      }
      
      //保存到服务器，并同步本地数据
      that._asyncUser(body)
    }
  }
  //判断用户是否真的修改了信息，避免多次连接数据库
  _isEdit(){
    this.setState({
      isEdit:true
    })
  }
  //拿到用户的输入值
  _editText(text){
    this.setState({
      infoText:text
    })
  }
  //将修改的用户信息保存到数据库
  _editUserInfo(){
    this.props.showMainView()
    //并没有修改信息，则无需连接数据库
    if(!this.state.isEdit){
      this.setState({renderAlert:false})
      return
    }
    let infoItems=this.state.infoItems
    let infoText=this.state.infoText
    if((infoItems==='nickname' && !infoText) || (infoItems==='password' && !infoText)){
      ToastAndroid.show(nickname?'用户名':'密码'+'不能为空哦', ToastAndroid.SHORT)
      return
    }
    else{
      this.setState({renderAlert:false})
      
      // only : 值true代表是单独修改某一个项
      let body={
        infoItems:infoItems,
        infoText:infoText,
        accessToken:this.state.user.accessToken,
        only:true
      }
      
      //保存到服务器，并同步本地数据
      this._asyncUser(body)
    }
  }

  _renderAlert(){
    if(this.state.renderAlert){
      let modalTitle=this.state.infoItems
      switch(modalTitle){
        case 'nickname':
          modalTitle='昵称'
        break
        case 'address':
          modalTitle='住址'
        break
        case 'personalNote':
          modalTitle='个性签名'
        break
      }
      return(
        <ConfirmModal
          isEdit={this._isEdit.bind(this)}
          editText={this._editText.bind(this)}
          placeholder={'输入您的'+modalTitle}
          defaultValue={this.state.infoText}
          title={modalTitle}
          detailText={this.state.infoText}
          onConfirm={this._editUserInfo.bind(this)}
          onCancel={
            () => {
              this.props.showMainView()
              this.setState({renderAlert:false})
            }
          }/>
      )
    }
  }

  render(){
    let user=this.state.user
    return (
      <View style={styles.container}>
        <View style={styles.toolBar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
          <Text style={styles.toolbarExtra} onPress={this._edit.bind(this)}>编辑</Text>
        </View>
        {
          user.avatar
          ? <TouchableOpacity onPress={this._pickPhoto.bind(this)} style={styles.avatarContainer}>
              <Image source={{uri:avatar(user.avatar,'image')}} style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  {
                    this.avatarUploding
                    ? <Progress.Circle
                        showText={true}
                        color={'#ee735c'}
                        size={76}
                        progress={this.state.avatarProgress} />
                    : <Image
                        source={{uri:avatar(user.avatar,'image')}}
                        style={styles.avatar}/>
                  }
                  
                </View>
                <Text style={styles.avatarTip}>更换头像</Text>
              </Image>
            </TouchableOpacity>
          : <TouchableOpacity onPress={this._pickPhoto.bind(this)} style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>上传头像</Text>
              <View style={styles.avatarBox}>
                {
                  this.avatarUploding
                  ? <Progress.Circle
                      showText={true}
                      color={'#ee735c'}
                      size={76}
                      progress={this.state.avatarProgress} />
                  : <Icon
                    name='ios-cloud-upload-outline'
                    style={styles.plusIcon}/>
                }
              </View>
            </TouchableOpacity>
        }
        <View style={styles.userInfoBox}>
          <TouchableOpacity style={styles.userInfoItem} onPress={this._popModal.bind(this,'nickname',this.state.user.nickname)}>
            <Text style={styles.userInfoText_a}>昵称</Text>
            <Text style={styles.userInfoText_b}>{this.state.user.nickname}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.userInfoItem} onPress={this._popAlert.bind(this,'gender',this.state.user.gender)}>
            <Text style={styles.userInfoText_a}>性别</Text>
            <Text style={styles.userInfoText_b}>{this.state.user.gender==='male'?'男':this.state.user.gender==='female'?'女':''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.userInfoItem} onPress={this._popModal.bind(this,'address',this.state.user.address)}>
            <Text style={styles.userInfoText_a}>住址</Text>
            <Text style={styles.userInfoText_b}>{this.state.user.address}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.userInfoItem} onPress={this._popModal.bind(this,'personalNote',this.state.user.personalNote)}>
            <Text style={styles.userInfoText_a}>个性签名</Text>
            <Text style={styles.userInfoText_b}>
              {
                this.state.user.personalNote&&this.state.user.personalNote.length>15
                ? this.state.user.personalNote.slice(0,15)+'...'
                : this.state.user.personalNote
              }
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={this.state.modalVisible}
          animationType={'slide'}
          onRequestClose={()=>{}}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalHeader} onPress={this._closeModal.bind(this)}>
              <Icon
                name='ios-arrow-back'
                style={styles.closeIcon}/>
              <Text style={styles.backText}> 返回</Text>
            </TouchableOpacity>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                placeholder='昵称不能为空哦'
                placeholderTextColor={'#eee'}
                style={styles.inputField}
                autoCapitalize ={'none'}
                autoCorrect={false}
                maxLength = {10}
                underlineColorAndroid='transparent'
                defaultValue ={user.nickname}
                onChangeText ={(text)=>{
                  this._changeUserState('nickname',text)
                }}/>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>密码</Text>
              <TextInput
                placeholder='密码不能为空哦'
                placeholderTextColor={'#eee'}
                secureTextEntry={true}
                maxLength = {15}
                style={styles.inputField}
                autoCapitalize ={'none'}
                autoCorrect={false}
                underlineColorAndroid='transparent'
                defaultValue ={user.password}
                onChangeText ={(text)=>{
                  this._changeUserState('password',text)
                }}/>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>手机号</Text>
              <TextInput
                placeholder='交个朋友吧'
                placeholderTextColor={'#eee'}
                maxLength = {15}
                style={styles.inputField}
                autoCapitalize ={'none'}
                autoCorrect={false}
                underlineColorAndroid='transparent'
                defaultValue ={user.phoneNumber}
                onChangeText ={(text)=>{
                  this._changeUserState('phoneNumber',text)
                }}/>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput
                placeholder='请输入您的年龄'
                placeholderTextColor={'#eee'}
                style={styles.inputField}
                maxLength = {3}
                autoCapitalize ={'none'}
                autoCorrect={false}
                underlineColorAndroid='transparent'
                defaultValue ={user.age}
                onChangeText ={(text)=>{
                  this._changeUserState('age',text)
                }}/>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button
                onPress={()=>{
                  this._changeUserState('gender','male')
                }}
                style={[
                  styles.gender,
                  !this.state.user_tmp.gender
                  ? user.gender==='male' && styles.genderChecked
                  : this.state.user_tmp.gender==='male' && styles.genderChecked
                  ]}
                  name='ios-male'>男</Icon.Button>
                  <View style={{width:16}}></View>
              <Icon.Button
                onPress={()=>{
                  this._changeUserState('gender','female')
                }}
                style={[
                  styles.gender,
                  !this.state.user_tmp.gender
                  ? user.gender==='female' && styles.genderChecked
                  : this.state.user_tmp.gender==='female' && styles.genderChecked
                  ]}
                  name='ios-female'>女</Icon.Button>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>住址</Text>
              <TextInput
                placeholder='火星来客？'
                placeholderTextColor={'#eee'}
                maxLength = {60}
                style={styles.inputField}
                autoCapitalize ={'none'}
                autoCorrect={false}
                underlineColorAndroid='transparent'
                defaultValue ={user.address}
                onChangeText ={(text)=>{
                  this._changeUserState('address',text)
                }}/>
            </View>
            <View style={styles.fieldItemNote}>
              <Text style={styles.label}>个性宣言</Text>
              <TextInput
                maxLength = {30}
                placeholder='(๑•ᴗ•๑)生活不只有眼前的苟且，还有远方的苟且'
                placeholderTextColor={'#eee'}
                style={styles.inputFieldNote}
                autoCapitalize ={'none'}
                autoCorrect={false}
                underlineColorAndroid='transparent'
                defaultValue ={user.personalNote}
                multiline={true}
                onChangeText ={(text)=>{
                  this._changeUserState('personalNote',text)
                }}/>
            </View>
            <Button
              style={styles.btn}
              onPress={this._submit.bind(this)}>保存资料</Button>
          </View>
        </Modal>
         <Button
            style={styles.btn}
            onPress={this._logout.bind(this)}>退出登录</Button>
        {this._renderAlert()}
      </View>
    )
  }
}

