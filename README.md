# react-native App
---

效果图（篇幅有限，只放一部分，具体可见目录中其他图片文件）：
<br>
![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-14-50.png)![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-15-11.png)
![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-15-54.png)![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-16-03.png)
![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-18-30.png)![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-19-00.png)
![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-19-05.png)![image](https://github.com/accforgit/Audio-Video-Mixing-App-By-RN-Client/blob/master/Screenshot_2016-11-19-23-19-11.png)


> 注意：因为Github对于上传的单个文件大小有限制，所以整个项目无法完全原模原样地上传，
代码文件中值包含了其中最核心的一部分，想要整个项目文件，拉取文件目录中的`project.7z`文件即可。


## 1. 依赖模块

>1. lodash:提供很多好用的工具函数，类似于underscore
>2. mockjs:在项目开发的初始阶段，方便生成测试数据，省去创建后台的麻烦，配合 [Rap](http://rap.taobao.org) 使用
>3. query-string:解析URL
>4. react-native-audio:音频模块，具备录音、播放、暂停等功能
>5. react-native-button ：按钮组件
>6. react-native-countdown ：倒计时组件，这个版本与Video配合使用，会出现问题，小心使用
>7. react-native-image-picker ：本地相册photo、视频video读取
>8. react-native-loader ：加载动画，支持三种表现形式
>9. react-native-progress : 进度条模块，支持圆形和长条形
>10. react-native-scrollable-tab-view : TabBar组件
>11. react-native-sk-countdown ：倒计时模块
>12. react-native-swiper ：轮播图组件
>13. react-native-tab-navigator ：TabBar组件（本项目中所使用）
>14. react-native-uploader ：上传文件模块，支持uri和绝对路径path<br>
    注意此项目中使用的模块不是使用npm下载，而是直接从github上下载<br>
    `npm install https://github.com/tranquangvu/react-native-uploader.git --save`
>15. react-native-vector-icons : 各种流行图标元素
>16. rnpm : 专为react-native设计的npm管理工具（ 最好全局安装）
>17. Rap & Mockjs : 伪造数据所用(注意：安装完Mockjs之后，找到node_module/mockjs/dist/mock.js  中的dataImage()方法,将之完全删除，避免带来一些麻烦)
>18. react-native-video : 视频播放组件 (注意，这里 `npm install react-native-video --save` 之后，需要再输入 `rnpm link react-native-video`，这样就能在项目中直接使用了，不需要重新打包编译一遍
>19. sha1:加密模块（这里是对上传到cloudinary的图片进行签名加密）
>20. rn-animate-alert:弹出仿照IOS的对话框

---

## 2. 流程设计

### 2.1 总体设计
>1. App启动
>2. 启动画面-->配置文件
>3. 过渡画面（过渡倒计时）
>4. 状态初始化（注册状态、本地数据状态）
>5. 如果没有登录状态，则显示一个点击之后可以进行注册或登录的fullpage轮播图（轮播组件）
>6. 注册（短信验证码）
>7. 登录之后，加载首页数据
>8. 点击视频之后，跳转到详情页，可以进行评论
>9. 上传功能
>10. 合并进度显示（合并视频比较耗时）
>11. 删除视频

### 2.2 详细设计
#### 2.2.1 用户账户
>1. 上传头像(可以从本地相册读取图片)
>2. 修改头像
>3. 上传进度条
>4. 退出登录
>5. 编辑资料浮层（修改资料、本地localstorage同步）

#### 2.2.2 录制视频页
>1. 录制音频
>2. 录制视频
>3. 重新录制
>4. 预览效果
>5. 视频发布
>6. 录音倒计时
>7. 上传进度条
>8. 上传视频
>9. 录制视频
>10. 选择视频

#### 2.2.3 视频列表页
>1. 请求视频数据，可以进行播放视频，视频文件滑动加载
>2. 视频点赞功能（以及取消点赞功能）

#### 2.2.4 详情页
>1. 视频播放
>2. 评论浮层
>3. 视频播放
>4. 评论列表
>5. 评论功能

#### 2.2.5 已发布视频页面
>1. 合并进度显示
>2. 请求视频数据
>3. 删除视频
>4. '催一下'功能（比较人性化）


---

## 3. 重要功能实现流程

### 3.1 视频、音频录制、选择、合并、上传
```
视频配音页面---->初始化音频---->选择视频---->获取七牛token---->上传视频到七牛---->
本地录制音频---->获取七牛token---->上传音频到七牛---->
浮窗填写标题---->提交数据---->后台处理视频、音频合并数据---->发布成功
``` 

---


## 4. 项目结构(app文件夹)

```
1. /account文件夹 ： 用户账户，以及app开启的轮播动画
2. /assets ： 图片文件
3. /common : 配置文件以及辅助方法
4. /creation : 视频列表首页，以及视频播放详情页
5. /edit : 用户上传视频、配音页
6. /style : 项目样式文件


```



---

## 5. 有用的网站

> 1. 图床<br>
> 1.1 : cloudinary.com:国外图床，免费，速度较慢，但是具有将音频和视频，以及视频与视频合二为一的功能<br>
> 1.2 : qiniu.com:速度较快，免费<br>
> 2. App图标制作<br>
> 2.1 : [applypixels](https://applypixels.com/template/ios-app-icon/)：可以下载到各种app图标的PSD文件，定制化程度比较高，并且对于IOS支持较好，但是需要具备一定的PS能力<br>
> 2.2 ：[makeappicon](https://makeappicon.com/)在线上传、下载图标，方便快捷（可能需要科学上网）<br>
> 3. app的分发测试<br>
>[蒲公英](http://www.pgyer.com/)
