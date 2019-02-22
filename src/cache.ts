import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import { ServerResponse, IncomingMessage } from 'http';
import { Config } from '.';

const fnv1a = require('@sindresorhus/fnv1a');
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
    if(!url){
      return 
    }
  const path = getPathForUrl(config, url)
  config.debug&&console.log('Caching '+url+' in '+path);
  writeFileSync(path, proxyResData)
  writeFileSync(getHeadersPathForUrl(config, url), JSON.stringify(proxyRes.headers))
}
function getHeadersPathForUrl(config: CacheConfig, url: string) {
  const path = fnv1a(url)+'-headers-'+filenamifyUrl(url)
  return join(config.folder, path)
}

export function get(url: string, config: CacheConfig): Data|undefined {
  try {
    return {
      data: readFileSync(getPathForUrl(config, url)), 
      headers: JSON.parse(readFileSync(getHeadersPathForUrl(config, url)).toString())
    }
  } catch (error) {
    return undefined
  }
}

function getPathForUrl(config: CacheConfig, url: string) {
  const path = fnv1a(url)+'-'+filenamifyUrl(url)
  return join(config.folder, path)
}

interface Data{
  data: Buffer, headers: any
}