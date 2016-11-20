import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import Swiper from 'react-native-swiper'
import Button from 'react-native-button'

import styles from '../style/account/slider'

export default class Slider extends Component{
    constructor(props){
        super(props)

        this.state={
            loop:false,
            banners:[
                require('../assets/images/s1.jpg'),
                require('../assets/images/s2.jpg'),
                require('../assets/images/s3.jpg')
            ]
        }
    }
    //点击轮播图 马上体验 按钮后，跳转到首页
    _enter(){
        this.props.enterSlide()
    }

    render(){
        return (
            <Swiper
                dot={<View style={styles.dot}/>}
                activeDot={<View style={styles.activeDot}/>}
                paginationStyle={styles.pagination}
                loop={this.state.loop}
                style={styles.wrapper}>
                <View style={styles.slider}>
                    <Image style={styles.image} source={this.state.banners[0]}/>
                </View>
                <View style={styles.slider}>
                    <Image style={styles.image} source={this.state.banners[1]}/>
                </View>
                <View style={styles.slider}>
                    <Image style={styles.image} source={this.state.banners[2]}/>
                    <TouchableOpacity style={styles.btn}>
                        <Text style={styles.btnText} onPress={this._enter.bind(this)}>马上体验</Text>
                    </TouchableOpacity>
                </View>
            </Swiper>
        )
    }
}
