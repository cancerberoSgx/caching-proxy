import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import { ServerResponse, IncomingMessage } from 'http';

const filenamifyUrl = require('filenamify-url')

export interface CacheConfig {
  folder: string
}
export function set(
  proxyRes: IncomingMessage,
  proxyResData: Buffer,
  userReq: IncomingMessage,
  userRes: ServerResponse,
  config: CacheConfig) {
    const url = userReq.url
  const path = join(config.folder, filenamifyUrl(url))
  console.log('Caching '+url+' in '+path);
  writeFileSync(path, proxyResData)
  // console.log(proxyRes);
  
  // console.log('(userRes.getHeaders()', (userRes.getHeaders()))
  
  // console.log('(userReq.headers', (userReq.headers));
  writeFileSync(getHeadersPathForUrl(path), JSON.stringify({}))
}
function getHeadersPathForUrl(path: string) {
  return path + '__headers__';
}

export function get(url: string, config: CacheConfig): Data|undefined {
  const path = getPathForUrl(config, url)
  try {
    return {
      data: readFileSync(path), 
      headers: JSON.parse(readFileSync(getHeadersPathForUrl(path)).toString())
    }
  } catch (error) {
    return undefined
  }
}
function getPathForUrl(config: CacheConfig, url: string) {
  return join(config.folder, filenamifyUrl(url));
}

interface Data{
  data: Buffer, headers: any
}