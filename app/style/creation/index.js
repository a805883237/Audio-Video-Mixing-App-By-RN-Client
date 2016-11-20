import {
  StyleSheet,
  Dimensions,
} from 'react-native'

let width=Dimensions.get('window').width
let height=Dimensions.get('window').height

export default StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#f5FcFF'
    },
    header:{
        paddingTop:16,
        paddingBottom:10,
        backgroundColor:'#ee735c'
    },
    headerTitle:{
      color:"#fff",
      fontSize:16,
      textAlign:'center',
      fontWeight:'600'
    },
    listBox:{
      flexDirection:'column',
      width:width,
      alignItems:'center',
      justifyContent:'center',
      marginTop:12
    },
    listViewBox:{
      width:width*0.98,
      backgroundColor:'#fff',
      flexDirection:'column'
    },
    descInfo:{
      width:width*0.98,
      flexDirection:'row',
      alignItems:'center',
      padding:6,
      borderBottomWidth:1,
      borderBottomColor:'#eee'
    },
    authordesc:{
      flex:1,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between'
    },
    authordescLeft:{
      flexDirection:'row',
      alignItems:'center',
    },
    authornickname:{
      marginLeft:12
    },
    authordescRightText:{
      color:'#666'
    },
    authorAvatar:{
      width:width*0.1,
      height:width*0.1,
      borderRadius:width*0.05
    },
    item:{
      flex:1,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      padding:8
    },
    thumb:{
      position:'relative',
      // width:width*0.26,
      flex:0.26,
      height:width*0.2,
      resizeMode:'cover'
    },
    title:{
      padding:10,
      fontSize:12,
      color:'#333'
    },
    play:{
      position:'absolute',
      top:width*0.05,
      left:width*0.08,
      width:38,
      height:38,
      paddingTop:6,
      paddingLeft:14,
      backgroundColor:'transparent',
      borderColor:'#fff',
      borderWidth:1,
      borderRadius:19,
      color:'#ed7b66'
    },
    videoInfo:{
      flex:0.6,
      paddingHorizontal:8,
      height:width*0.2,
      flexDirection:'column',
      justifyContent:'space-between',
    },
    loveHeart:{
      flex:0.14,
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      borderLeftWidth:1,
      borderLeftColor:'#eee',
      height:width*0.13
    },
    handleText:{
      paddingLeft:12,
      fontSize:18,
      color:'#333'
    },
    //已经点赞后的样式
    up:{
      flex:1,
      fontSize:28,
      color:'#ee735c',
    },
    upCount:{
      fontSize:12,
      color:'#ee735c'
    },
    commentIcon:{
      fontSize:22,
      color:'#ed7b66',
    },
    loadingMore:{
      marginVertical:20,
    },
    loadingText:{
      color:'#777',
      textAlign:'center'
    }
})