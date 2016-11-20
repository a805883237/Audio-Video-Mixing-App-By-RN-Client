/*
 * 网络请求，对 fetch 的封装,因为这里是使用Mock伪装的数据，需要处理一下
 * 如果将来不使用Mock伪造数据，需要对接真实数据，则只需要将 Mock.mock()所在行删除即可
 */
'use strict'

import queryString from 'query-string'
import _ from 'lodash'
import Mock from 'mockjs'

import config from './config'

let request = {}

//GET
/*
 * url:GET请求数据的地址
 * params:GET请求数据地址的参数
 */
request.get = (url, params) => {
    if (typeof(params)==='object') {
        url += '?' + queryString.stringify(params)
    }

    return fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
            if(url.indexOf('http://rap.taobao.org/mockjs')!==-1){
                return Mock.mock(responseJson)
            }else{
                return responseJson
            }
        })
        .catch((error) => {
            console.error(error)
        });
}

//POST
/*
 * url:POST请求数据的地址
 * body:POST向所请求地址发送过去的数据（例如表单等）
 */
request.post = (url, body) => {
    let options = _.extend(config.header, {
        body: JSON.stringify(body)
    })

    return fetch(url, options)
        .then((response) => { return response.json() })
        // .then((responseJson) => { return Mock.mock(responseJson) })
        .catch((error) => {
            console.error('request.js error', error)
        })
}

export default request