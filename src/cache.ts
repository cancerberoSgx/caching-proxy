import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import { ServerResponse, IncomingMessage } from 'http';
import { Config } from '.';

const filenamifyUrl = require('filenamify-url')

export interface CacheConfig {
  folder: string
}
export function set(
  proxyRes: IncomingMessage,
  proxyResData: Buffer,
  userReq: IncomingMessage,
  userRes: ServerResponse,
  config: Config) {
    const url = userReq.url
  const path = join(config.folder, filenamifyUrl(url))
  config.debug&&console.log('Caching '+url+' in '+path);
  writeFileSync(path, proxyResData)
  writeFileSync(getHeadersPathForUrl(path), JSON.stringify(proxyRes.headers))
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
  return join(config.folder, filenamifyUrl(url))
}

interface Data{
  data: Buffer, headers: any
}