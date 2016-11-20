import React, { Component } from 'react'
import { View, TouchableOpacity, AppRegistry, Text,Dimensions } from 'react-native'
import Alert from 'rn-animate-alert'

let width=Dimensions.get('window').width

export default class ModalAlert extends Component {

  constructor(){
    super()
    this.state={
      renderAlert: false,
      titel:this.props.title,
      detailText:this.props.detailText,
      title:this.props.title,
    }
  }

  render(){
    return(
        <Alert
          title={'I\'m an modal alert'}
          detailText={'Watch me animate out too!!'}
          onConfirm={
            () => {
              console.log('do stuff');
              this.setState({renderAlert:false})
            }
          }
          onCancel={
            () => {
              console.log('Do other stuff');
              this.setState({renderAlert:false})
            }
          }/>
      )
  }

}

AppRegistry.registerComponent('ModalAlert', () => ModalAlert)