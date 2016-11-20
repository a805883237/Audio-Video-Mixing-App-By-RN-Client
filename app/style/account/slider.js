import {
  StyleSheet,
  Dimensions,
} from 'react-native'

let width=Dimensions.get('window').width
let height=Dimensions.get('window').height


export default StyleSheet.create({
    container:{
        flex:1
    },
    slider:{
        flex:1,
        width:width,
        position:'relative',
    },
    image:{
        flex:1,
        width:width
    },
    dot:{
        width:10,
        height:10,
        backgroundColor:'transparent',
        borderColor:'#ff6600',
        borderWidth:1,
        borderRadius:5,
        marginHorizontal:12
    },
    activeDot:{
        width:10,
        height:10,
        borderWidth:1,
        marginHorizontal:12,
        backgroundColor:'#ee735c',
        borderColor:'#ee735c',
        borderRadius:5
    },
    pagination:{
        bottom:40
    },
    btn:{
        position:'absolute',
        width:width,
        paddingHorizontal:30,
        bottom:90,
        height:60,
        marginTop:10,
    },
    btnText:{
        backgroundColor:'#ee735c',
        
        paddingVertical:12,
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:4,
        fontSize:24,
        color:'#fff',
        textAlign:'center'
    }
})
