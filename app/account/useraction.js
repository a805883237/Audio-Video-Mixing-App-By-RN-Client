import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Alert,
  ToastAndroid,
} from 'react-native'

import Button from 'react-native-button'
const {CountDownText} = require('react-native-sk-countdown')

import request from '../common/request'
import config from '../common/config'

import styles from '../style/account/useraction'


//用户账号、密码注册，注册完成后，可以选择性的填写手机号
export class Signup extends Component{
    constructor(props){
        super(props)
        this.state={
            nickname:'',
            password:'',
            confirmPassword:''
        }
    }
    _submitSignup(){
        const that=this 
        let nickname=this.state.nickname.trim()
        let password=this.state.password.trim()
        let confirmPassword=this.state.confirmPassword.trim()
        if(!nickname){
            return ToastAndroid.show('昵称不能为空', ToastAndroid.SHORT)
        }
        if(!password){
            return ToastAndroid.show('密码不能为空', ToastAndroid.SHORT)
        }
        if(!confirmPassword){
            return ToastAndroid.show('请确认密码', ToastAndroid.SHORT)
        }
        
        if(password !==confirmPassword){
            return ToastAndroid.show('两次输入的密码不同', ToastAndroid.SHORT)
        }
        let body={
            nickname:nickname,
            password:password
        }
        let signupURL=config.api.base+config.api.normalsignup
        request.post(signupURL,body)
            .then((data)=>{
                if(data && data.success){
                    //获取验证码成功后，跳转到首页的界面
                    that.props.childLogin(data.data)
                }
                else{
                    if(data.code===1){
                        ToastAndroid.show('┌(。Д。)┐用户名已经存在', ToastAndroid.SHORT)
                    }
                    else{
                        ToastAndroid.show('┌(。Д。)┐服务器错误，请重试', ToastAndroid.SHORT)
                    }
                }
            })
            .catch((err)=>{
                ToastAndroid.show('┌(。Д。)┐注册失败，请稍后重试', ToastAndroid.SHORT)
                console.log('login.js: signupURL Error:',err)
            })
    }
    render(){
        return (
            <View style={styles.signBox}>
            <TextInput
                placeholder='请输入用户名'
                autoCapitalize={'none'}
                autoCorrect={false}
                underlineColorAndroid='transparent'
                style={styles.inputField}
                onChangeText={(text)=>{
                    this.setState({
                        nickname:text
                    })
                }}/>
                <TextInput
                    placeholder='请输入密码'
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    style={styles.inputField}
                    onChangeText={(text)=>{
                        this.setState({
                            password:text
                        })
                    }}/>
                <TextInput
                    placeholder='请确认密码'
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    style={styles.inputField}
                    onChangeText={(text)=>{
                        this.setState({
                            confirmPassword:text
                        })
                    }}/>
            <Button
                style={styles.btn}
                onPress={this._submitSignup.bind(this)}>注 册</Button>
        </View>
        )
    }
}

//快速登录组件
export class Quicklogin extends Component{
    constructor(props){
        super(props)
        this.state={
            //是否获取验证码
            codeSent:false,
            //默认phoneNumber为空
            phoneNumber:'',
            //默认验证码为空
            verifyCode:'',
            //默认验证码没有过期
            countingDone:false
        }
    }

    //验证码过期
    _countingDone(){
        this.setState({
            countingDone:true
        })
    }

    //获取到验证码之后，显示登录界面
    _showVerifyCode(){
        this.setState({
            codeSent:true
        })
    }
    //获取验证码
    _sendVerifyCode(){
        const that=this 
        let phoneNumber=this.state.phoneNumber
        if(!phoneNumber){
            return ToastAndroid.show('(,,• ₃ •,,)请输入您的手机号', ToastAndroid.SHORT)
        }
        let body={
            phoneNumber:phoneNumber
        }
        let signupURL=config.api.base+config.api.signup
        request.post(signupURL,body)
            .then((data)=>{
                if(data && data.success){
                    //获取验证码成功后，跳转到登录的界面
                    that._showVerifyCode()
                }
                else{
                    Alert.alert('┌(。Д。)┐获取验证码失败，请检查手机号是否正确')
                }
            })
            .catch((err)=>{
                Alert.alert('┌(。Д。)┐获取验证码失败，请稍后重试')
            })
    }
    
    //登录动作
    _submit(){
        const that=this 
        let phoneNumber=this.state.phoneNumber
        let verifyCode=this.state.verifyCode
        if(!phoneNumber || !verifyCode){
            return ToastAndroid.show('(,,• ₃ •,,)手机号或验证码不能为空', ToastAndroid.SHORT)
        }
        let body={
            phoneNumber:phoneNumber,
            verifyCode:verifyCode
        }
        let verifyURL=config.api.base+config.api.verify
        request.post(verifyURL,body)
            .then((data)=>{
                if(data && data.success){
                    //获取验证码成功后，跳转到首页
                    that.props.childLogin(data)
                }
                else{
                    Alert.alert('┌(。Д。)┐登录失败，请稍后重试')
                }
            })
            .catch((err)=>{
                Alert.alert('┌(。Д。)┐登录失败，请稍后重试')
            })
    }

    render(){
        return (
            <View style={styles.signBox}>
            <TextInput
                placeholder='请输入手机号'
                autoCapitalize={'none'}
                autoCorrect={false}
                keyboardType={'numeric'}
                underlineColorAndroid='transparent'
                style={styles.inputField}
                onChangeText={(text)=>{
                    this.setState({
                        phoneNumber:text
                    })
                }}/>
                {
                    this.state.codeSent
                    ? <View style={styles.verifyCodeBox}>
                        <TextInput
                            placeholder='输入验证码'
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            keyboardType={'numeric'}
                            underlineColorAndroid='transparent'
                            style={styles.inputField}
                            onChangeText={(text)=>{
                                this.setState({
                                    verifyCode:text
                                })
                            }}/>
                            {
                                //获取到验证码后，进行倒计时，如果验证码倒计时结束，需要重新获取
                                this.state.countingDone
                                ? <Button
                                style={styles.countBtn}
                                onPress={this._sendVerifyCode.bind(this)}>获取验证码</Button>
                                : <CountDownText
                                    style={styles.countBtn}
                                    countType='seconds' // 计时类型：seconds / date
                                    auto={true} // 自动开始
                                    afterEnd={this._countingDone} // 结束回调
                                    timeLeft={60} // 正向计时 时间起点为0秒
                                    step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                                    startText='获取验证码' // 开始的文本
                                    endText='获取验证码' // 结束的文本
                                    intervalText={(sec) => sec + '秒重新获取'}// 定时的文本回调
                                    />
                            }
                    </View>
                    : null
                }
                {
                    //判断是显示登录按钮还是获取验证码按钮
                    this.state.codeSent
                    ? <Button
                        style={styles.btn}
                        onPress={this._submit.bind(this)}>登录</Button>
                    : <Button style={styles.btn} onPress={this._sendVerifyCode.bind(this)}>获取验证码</Button>
                }
        </View>
        )
    }
}

//用户名密码登录组件
export class Phonelogin extends Component{
    constructor(props){
        super(props)
        this.state={
            phoneNumber:'',
            password:'',
            pwdSent:false,
            //用户账户或手机号
            useraccount:''
        }
    }
    _childsubmit(){
        const that=this 
        let useraccount=this.state.useraccount
        let password=this.state.password
        if(!useraccount || !password){
            return ToastAndroid.show('(,,• ₃ •,,)用户名或密码不能为空', ToastAndroid.SHORT)
        }
        let body={
            useraccount:useraccount,
            password:password
        }
        // let pwdloginURL='http://rap.taobao.org/mockjs/9694/api/u/pwdlogin'
        let pwdloginURL=config.api.base+config.api.pwdlogin
        request.post(pwdloginURL,body)
            .then((data)=>{
                if(data && data.success){
                    //获取验证码成功后，跳转到首页的界面
                    that.props.childLogin(data)
                }
                else{
                    ToastAndroid.show('(,,• ₃ •,,)账户名或密码错误', ToastAndroid.SHORT)
                }
            })
            .catch((err)=>{
                ToastAndroid.show('(,,• ₃ •,,)服务器错误，请稍后重试', ToastAndroid.SHORT)
            })
    }
    render(){
        return (
            <View style={styles.signBox}>
            <TextInput
                placeholder='请输入用户名或手机号'
                autoCapitalize={'none'}
                autoCorrect={false}
                underlineColorAndroid='transparent'
                style={styles.inputField}
                onChangeText={(text)=>{
                    this.setState({
                        useraccount:text
                    })
                }}/>
                <TextInput
                placeholder='请输入密码'
                autoCapitalize={'none'}
                autoCorrect={false}
                secureTextEntry={true}
                underlineColorAndroid='transparent'
                style={styles.inputField}
                onChangeText={(text)=>{
                    this.setState({
                        password:text
                    })
                }}/>
            <Button
                style={styles.btn}
                onPress={this._childsubmit.bind(this)}>登 录</Button>
        </View>
        )
    }
}

export default class UserAction extends Component {
    constructor(props){
        super(props)
        this.state={
            quicklogin:false
        }
    }
    //子组件用户名密码、登录
    childLogins(data){
        this.props.afterLogin(data.data)
    }
    //用户注册
    _newsignup(){
    }

    render(){
        return (
            <View style={styles.container}>
                <View style={styles.containerBox}>
                    <Image style={styles.logo} resizeMode={'contain'} source={require('../assets/images/logo.jpg')}/>
                    {
                        this.state.signup
                        ? <Signup childLogin={this.childLogins.bind(this)}/>
                        : this.state.quicklogin
                            ? <Quicklogin childLogin={this.childLogins.bind(this)} />
                            : <Phonelogin childLogin={this.childLogins.bind(this)} />
                    }
                    <View style={styles.footerBox}>
                        <Text
                            style={styles.footerLeft}
                            onPress={()=>{this.setState({
                                quicklogin:!this.state.quicklogin,
                                signup:false
                            })}}>
                            {
                                this.state.quicklogin
                                ? '账户密码登录'
                                : '短信验证登录'
                            }
                        </Text>
                        <Text
                            style={styles.footerRight}
                            onPress={()=>{this.setState({
                                quicklogin:false,
                                signup:!this.state.signup
                            })}}>
                            {
                                this.state.signup
                                ? '账户密码登录'
                                : '新用户注册'
                            }
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

}
