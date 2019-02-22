import { ProxyConfig } from './proxy';
import { CacheConfig } from './cache';

export interface Config extends ProxyConfig, CacheConfig {}