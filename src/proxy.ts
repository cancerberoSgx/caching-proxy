import { ServerResponse, ClientRequest, IncomingMessage } from 'http'
import { set, get } from './cache'
import { Config } from './index'

export interface ProxyConfig {
  port?: number
  hostName: string
  help?: boolean
}

var proxy = require('express-http-proxy')
var app = require('express')()

function enableCors(userReq: IncomingMessage, userRes: ServerResponse, headers: any = {}) {
  console.log('enableCors');
  
  // Object.keys(headers).forEach(k=>{
  //   userRes.setHeader(k, headers[k])
  //   console.log('header', k, headers[k]);

  // })
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
              console.log('Responding with cached for ' + req.url + ', bytes: ' + cached.data.length)

              enableCors(req, res, cached.headers) //cached.headers)
              res.end(cached.data)
              console.log('filter: yes, data: '+cached.data.length);
              
              return false
            }
          } catch (error) {
            console.log('filter: no', error);
            
            return true
          }
        }
        console.log('filter: no');
        
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
          console.log('proxied ' + userReq.url)
          set(proxyRes, proxyResData, userReq, userRes, config)
        }
        return proxyResData
      }
    })
  )

  app.listen(config.port || 3000)

  // http
  //   .createServer((req, client_res)=> {
  //     client_res.setHeader('Access-Control-Allow-Origin', '*')
  //     client_res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  //     client_res.setHeader(
  //       'Access-Control-Allow-Headers',
  //       'Content-Type, Authorization, Content-Length, X-Requested-With'
  //     )
  //     client_res.statusCode = 200 //(200);
  //     if (req.method === 'OPTIONS') {
  //       client_res.writeHead(200)
  //       client_res.end()
  //       return
  //     }
  //     const options = {
  //       hostname: config.hostName,
  //       port: 80,
  //       path: req.url,
  //       method: req.method,
  //       headers: req.headers
  //     }
  //     console.log('serve: ', options)

  //     const proxy = http.request(options, res=> {
  //       console.log('remote response ', res.statusCode, res.headers);

  //       client_res.writeHead(res.statusCode||200, res.headers)
  //       res.pipe(
  //         client_res,
  //         {
  //           end: true
  //         }
  //       )
  //     })
  //     .on('data', d=>{
  //       console.log('data', d);
  //     })
  //     .on('finish', ()=>{
  //       console.log('finish');

  //     })

  //     req.pipe(
  //       proxy,
  //       {
  //         end: true
  //       }
  //     )
  //   })
  //   .listen(config.port || 3000)
}

// export fetch(url)
