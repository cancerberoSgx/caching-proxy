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


const whitelistHeaders = ['content-type']

function enableCors(userReq: IncomingMessage, userRes: ServerResponse, headers: any = {}) {
  whitelistHeaders.forEach(h=>{
    if(headers[h]){
      userRes.setHeader(h, headers[h])
    }
  })
  userRes.setHeader('Access-Control-Allow-Origin', '*')
  userRes.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  userRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  userRes.statusCode = 200
  if (userReq.method === 'OPTIONS') {
    userRes.writeHead(200)
    userRes.end()
    return
  }
}
export function main(config: Config) {
  app.use(
    '/',
    proxy(config.hostName, {
      filter: (req: IncomingMessage, res: ServerResponse) => {
        if (req.url) {
          try {
            const cached = get(req.url, config)
            if (cached) {
              config.debug&&console.log('Responding with cached for ' + req.url + ', bytes: ' + cached.data.length)
              enableCors(req, res, cached.headers) 
              res.end(cached.data)
              return false
            }
          } catch (error) {
            
            return true
          }
        }
        return true
      },
      userResDecorator: (
        proxyRes: IncomingMessage,
        proxyResData: Buffer,
        userReq: IncomingMessage,
        userRes: ServerResponse
      ) => {
        enableCors(userReq, userRes)
        if (userReq.url && proxyResData) {
          config.debug&&console.log('proxied ' + userReq.url, arguments)
          set(proxyRes, proxyResData, userReq, userRes, config)
        }
        return proxyResData
      }
    })
  )

  app.listen(config.port || 3000)

}

