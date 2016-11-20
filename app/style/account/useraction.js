import {
  StyleSheet,
  Dimensions,
} from 'react-native'

let width=Dimensions.get('window').width
let height=Dimensions.get('window').height


export default StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#F9F9F9',
        paddingTop:height*0.12
    },
    containerBox:{
        flex:1,
        flexDirection:'column'
    },
    logo:{
        width:width*0.30,
        height:width*0.30,
        borderRadius:width*0.30*0.5,
        borderWidth:1,
        borderColor:'transparent',
        marginLeft:width*0.7*0.5
    },
    signBox:{
        marginTop:30
    },
    inputField:{
        marginBottom:1,
        flex:1,
        height:40,
        padding:5,
        color:'#333',
        fontSize:16,
        backgroundColor:'#fff',
        borderRadius:4
    },
    verifyCodeBox:{
        marginTop:10,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    countBtn:{
        width:110,
        height:40,
        padding:10,
        marginLeft:8,
        backgroundColor:'#ee735c',
        borderColor:'#ee735c',
        textAlign:'left',
        fontWeight:'600',
        fontSize:16,
        borderRadius:2
    },
    btn:{
        width:width-20,
        marginLeft:10,
        marginTop:16,
        paddingVertical:10,
        backgroundColor:'#ee735c',
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:4,
        color:'#fff'
    },
    footerBox:{
        position:'absolute',
        flexDirection:'row',
        justifyContent:'space-between',
        top:height*0.88-72,
        width:width,
        padding:18
    },
    footerLeft:{
        fontSize:14,
        color:'#ee735c',
    },
    footerRight:{
        fontSize:14,
        color:'#ee735c',
    }
})
