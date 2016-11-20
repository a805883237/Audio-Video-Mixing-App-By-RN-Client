'use strict'

export default {
    header: {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    },
    qiniu: {
        //将视频上传到七牛的Base路径
        upload: 'http://upload.qiniu.com',
        //视频在七牛上的缩略图预览地址
        previewThumbBase:'http://oges18l1g.bkt.clouddn.com/',
        //用户头像在七牛上的预览地址
        previewAvatarBase:'http://ogd72jlbf.bkt.clouddn.com/',
        //如果用户没有设置头像，使用默认头像代替
        default_avatar:'6ea7406c-5fc1-4b2e-b402-620360837477.jpeg'
    },
    // cloudinary.com 图床的地址等配置
    cloudinary: {
        cloud_name: 'myrnappss',
        api_key: 'xxxxxxxxxxxxxx',
        api_secret: 'zTwVxxxxxxxxxxxxxxxxxxxDEdcc',
        base: 'http://res.cloudinary.com/myrnappss',
        image: 'https://api.cloudinary.com/v1_1/myrnappss/image/upload',
        video: 'https://api.cloudinary.com/v1_1/myrnappss/video/upload',
        audio: 'https://api.cloudinary.com/v1_1/myrnappss/raw/upload'
    },
    api: {
        //本地服务器
        base: 'http://zhtwx.com.cn:3002/',
        //rap模拟的服务器
        base2: 'http://rap.taobao.org/mockjs/9694/',
        creations: 'api/creations',
        videolist:'api/videolist',
        comment: 'api/comments',
        up: 'api/up',
        video: 'api/creations/video',
        audio: 'api/creations/audio',
        videoIsSave:'api/videoIsSave',
        signup: 'api/u/signup',
        normalsignup:'api/u/normalsignup',
        verify: 'api/u/verify',
        signature: 'api/signature',
        update: 'api/u/update',
        pwdlogin:'api/u/pwdlogin'
    }
}