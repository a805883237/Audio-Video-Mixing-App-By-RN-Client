/*
 * 具有输入功能的模态框
 */

'use strict'

import React, { Component, PropTypes } from 'react'
import {
View,
Dimensions,
Text,
TouchableOpacity,
Animated,
Easing,
TextInput,
} from 'react-native'

const { height,width } = Dimensions.get('window')

const propTypes = {
onConfirm: React.PropTypes.func.isRequired,
onCancel: React.PropTypes.func.isRequired,

title: React.PropTypes.string.isRequired,
titleTextStyle: React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.object,React.PropTypes.array]),

detailText: React.PropTypes.string,
detailTextStyle: React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.object,React.PropTypes.array]),

confirmText: React.PropTypes.string,
confirmTextStyle:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.object,React.PropTypes.array]),
confirmButtonStyle:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.object,React.PropTypes.array]),

cancelText: React.PropTypes.string,
cancelTextStyle: React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.object,React.PropTypes.array]),
cancelButtonStyle:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.object,React.PropTypes.array]),

backgroundColor: React.PropTypes.string,

containerStyle: React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.object,React.PropTypes.array]),

springFromBottom: React.PropTypes.bool,
springFromTop: React.PropTypes.bool,

zIndex: React.PropTypes.number, // try and avoid this.  only needed if you used zIndex elsewhere

}

export default class ConfirmModal extends Component {

 constructor(props){
   super(props);
   this.dismiss = this.dismiss.bind(this);

   this.state = {
   }
 }

 componentWillMount(){
   let xOffset = new Animated.Value(0)
   let yOffset = new Animated.Value(0)


   if (this.props.springFromBottom) {
     yOffset.setValue(1)
   }
   if (this.props.springFromTop) {
     yOffset.setValue(-1)
   }

   this.setState({xOffset:xOffset,yOffset:yOffset})
 };

 componentDidMount(){
   Animated.parallel([
     Animated.spring(this.state.yOffset,{
       toValue:0
     })
   ]).start()
 }

 dismiss(cb){
   let toValue = 0
   if (this.props.springFromBottom) {
     toValue = 1
   }
   if (this.props.springFromTop) {
     toValue = -1
   }
   Animated.timing(this.state.yOffset,{
     toValue: toValue,
     duration: 200,
     easing: Easing.linear
   }).start(cb)
 };

 render(){
   return(
     <View style={{
       zIndex:this.props.zIndex || 0,
       position:'absolute',
       top:0,
       left:0,
       height:height,
       width:width,
       backgroundColor: this.props.backgroundColor || 'rgba(111,111,111,.9)',
       alignItems:'center',
       justifyContent:'center'
     }}>
       <Animated.View style={[{
         backgroundColor: 'white',
         borderRadius:8,
         width:width*0.8,
         height:width*0.4,
         flexDirection:'column',
         paddingTop:12
       },this.props.containerStyle,{
         transform:[{
           translateY:this.state.yOffset.interpolate({
             inputRange: [-1,0,1],
             outputRange: [-500,-80,500]
           })}]}]}>

         <Text style={[{
           fontSize:20,
           fontWeight:'500',
           marginBottom:10,
           textAlign:'center',
           color:'#666'
         },this.props.titleTextStyle]}>
           {this.props.title}
         </Text>
         <View style={{
           position:'absolute',
           bottom:0,
           width:width*0.8
         }}>
          <View
            style={{
                borderBottomWidth:1,
                borderColor:"#E8E8EA",
                height:width*0.16,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center'
            }}>
            <TextInput
                underlineColorAndroid={'transparent'}
                autoFocus={true}
                maxLength={30}//{this.state.inputMaxLen}
                placeholder={this.props.placeholder}
                defaultValue={this.props.defaultValue}
                onChangeText={(text) => {
                    this.setState({text})
                    this.props.isEdit()
                    this.props.editText(text)
                }}
                style={{width:width*0.7}}
                />
          </View>
          <View style={{
            flexDirection: 'row'
            }}>
            <View style={{
              flex:1
              }}>
              <TouchableOpacity
                style={[{
                  padding:10,
                  backgroundColor:'#fff',
                  alignItems:'center',
                  marginLeft:4,
                  marginBottom:4,
                  borderRightWidth:1,
                  borderColor:'#E8E8EA'
                },this.props.cancelButtonStyle]}
                onPress={
                  () => this.dismiss(this.props.onCancel)
                }>
                <Text style={[{
                  color:'#666',
                  fontWeight:'700'
                },this.props.cancelTextStyle]}>
                  {(this.props.cancelText) ? this.props.cancelText:'取消'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{
              flex:1,
              paddingLeft:10
            }}>
              <TouchableOpacity
                style={[{
                  padding:10,
                  backgroundColor:'#fff',
                  alignItems:'center',
                  marginRight:4,
                  marginBottom:4,
                  borderColor:'#E8E8EA'
                },this.props.confirmButtonStyle]}
                onPress={
                  () => this.dismiss(this.props.onConfirm)
                }>
                <Text style={[{
                  color:'#666',
                  fontWeight:'700',
                },this.props.confirmTextStyle]}>
                  {(this.props.confirmText) ? this.props.confirmText:'确认'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
         </View>
       </Animated.View>
     </View>
   )
 }

}

ConfirmModal.propTypes = propTypes


