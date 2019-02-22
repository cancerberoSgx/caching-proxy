import { Config } from './index';
import { main } from './proxy';
import { existsSync, mkdirSync } from 'fs';

const config = ({
  ...(require('yargs-parser')(process.argv.slice(2)) as { [k: string]: string })
} as any) as Config

if (config.help) {
  helpAndExit(0)
}

if(!config.hostName){
  console.error('--hostName is mandatory');
  helpAndExit(1)  
}

config.port = config.port||3000
config.folder = config.folder||'.caching-proxy'
if(!existsSync(config.folder)){
  mkdirSync(config.folder)
}
console.log(`Proxying server "${config.hostName}" in local server "http://localhost:${config.port}". Cache at "${config.folder}"`);

main(config)

function helpAndExit(code = 0) {
  console.log(`Usage examples: 
caching-proxy --hostName "www.google.com"

Optional arguments: --port --folder --debug
`)

  process.exit(code)
}
