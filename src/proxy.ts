import { ServerResponse, ClientRequest, IncomingMessage } from 'http'
import { set, get } from './cache'
import { Config } from './index'
var proxy = require('express-http-proxy')
var app = require('express')()


export interface ProxyConfig {
  port?: number
  hostName: string
  help?: boolean
}

const whitelistHeaders = ['content-type', 'content-length', 'date', 'set-cookie', 'allow', 'connection','strict-transport-security', 'x-xss-protection', 'x-content-type-options', 'x-frame-options']

function enableCors(userReq: IncomingMessage, userRes: ServerResponse, config: Config, headers: {[k:string]:any}, setCors=true) {
  whitelistHeaders.forEach(h=>{
    const val = headers[h]
    if(val){
      // if(h==='set-cookie'){
      //   console.log(typeof val, h, val);
        
      // }
      // if(Array.isArray(val)){
        // val.forEach(hh=>{
          // config.debug && console.log('setHeader array ', val, val.length)
          // userRes.setHeader(h, hh)
        // })
      // }
      // else {

        config.debug && console.log('setHeader', h, val)
        userRes.setHeader(h, val)
      // }
    }
  })
  if(setCors){
    userRes.setHeader('Access-Control-Allow-Origin', '*')
    userRes.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    userRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  }
  userRes.statusCode = 200
  
}
export function main(config: Config) {
  app.use(
    '/',
    proxy(config.hostName, {
      filter: (req: IncomingMessage, res: ServerResponse) => {
        
        let doProxy=req.method === 'OPTIONS'
        // config.debug&&console.log('\n\nUSER REQ:\n', req.method, req.headers)//, '\n\nUSER RES:\n',  res.getHeaders())
        if (req.url) {
          try {
            const cached = get(req.url, config)
            if (cached) {
              // config.debug&&console.log('Responding with cached for ' + req.url + ', bytes: ' + cached.data.length)
              if(req.method!=='OPTIONS'){
                enableCors(req, res, config, cached.headers) 
                res.end(cached.data)
              }
              // else {
              //   // if (userReq.method === 'OPTIONS') {
              //     enableCors(req, res, config, {}) 
                  
              //     // res.writeHead(200)
              //     res.end()
              //     doProxy=true
              //     // }
              //   }
                // return false
                // result=false
              }
              else {

                if(req.method === 'OPTIONS'){
                  enableCors(req, res, config, {}) 
                  req.method='GET'
                }
                doProxy=true
              }
          } catch (error) {
            config.debug && console.error(error)
            // return true
            doProxy=true
          }
          doProxy=true
        }
        
        return doProxy
      },
      userResDecorator: (
        proxyRes: IncomingMessage,
        proxyResData: Buffer,
        userReq: IncomingMessage,
        userRes: ServerResponse
      ) => {
        enableCors(userReq, userRes, config, {})
        if (userReq.url && proxyResData) {
          set(proxyRes, proxyResData, userReq, userRes, config)
        }
        config.debug&&console.log('\n\nPROXY RES\n', proxyRes.headers,'\n\nUSER RES\n', userRes.getHeaders(), '\n\nUSERREQ', userReq.url, userReq.method, userReq.headers,)
        return proxyResData
      }
    })
  )

  app.listen(config.port || 3000)

}

