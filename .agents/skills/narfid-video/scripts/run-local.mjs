// Direct local entrypoints only. Never loads the reference project's dotenv files.
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {parseEnv} from 'node:util';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const loopback=new Set(['localhost','127.0.0.1','[::1]']);
const forbidden=new Set(['NODE_OPTIONS','NODE_PATH','DOTENV_CONFIG_PATH','PGHOST','PGHOSTADDR','PGSERVICE','PGSERVICEFILE','PGPASSFILE','SUPABASE_ACCESS_TOKEN','FIREBASE_SERVICE_ACCOUNT_FILE','GOOGLE_APPLICATION_CREDENTIALS','WHATSAPP_ACCESS_TOKEN','WHATSAPP_PHONE_NUMBER_ID']);
const osKeys=new Set(['path','pathext','systemroot','windir','comspec','temp','tmp','userprofile','appdata','localappdata','homedrive','homepath','home','lang','lc_all','systemdrive','number_of_processors','processor_architecture']);
function fail(message){throw new Error(message);}
function localUrl(value,key,protocols){
 let url;try{url=new URL(value);}catch{fail(`Invalid local endpoint: ${key}`);}
 if(!protocols.includes(url.protocol)||!loopback.has(url.hostname))fail(`Non-loopback endpoint rejected: ${key}`);
 // libpq connection options can redirect even a loopback-looking URL.
 if([...url.searchParams].some(([k,v])=>k!=='sslmode'||v!=='disable'))fail(`Endpoint query options rejected: ${key}`);
 if((url.protocol==='http:'||url.protocol==='https:')&&(url.username||url.password))fail(`Embedded HTTP credentials rejected: ${key}`);
}
export function prepare({role,dir,envFile,inherited=process.env}){
 if(!['backend','frontend'].includes(role))fail('Use --role backend or frontend');
 if(!dir||!envFile)fail('Both --dir and --env are required');
 const cwd=resolve(dir),file=resolve(envFile);
 const inside=relative(cwd,file);
 if(inside===''||(!inside.startsWith(`..${sep}`)&&inside!=='..'&&!/^[A-Za-z]:/.test(inside)))fail('The explicit environment file must be outside the service directory');
 if(readdirSync(cwd).some(name=>/^\.env(?:\.|$)/i.test(name)&&name!=='.env.example'))fail('Refusing a service directory containing dotenv files');
 const env=parseEnv(readFileSync(file,'utf8'));
 if(!['development','test'].includes(env.NODE_ENV))fail('Set NODE_ENV to development or test');
 if(env.HOST!=='127.0.0.1')fail('Set HOST to 127.0.0.1');
 if(!/^\d+$/.test(env.PORT||'')||Number(env.PORT)<1024||Number(env.PORT)>65535)fail('Choose a local PORT between 1024 and 65535');
 for(const [key,value] of Object.entries(env)){
  if(forbidden.has(key)&&value)fail(`External service or process override rejected: ${key}`);
  if(/^PRODUCTION_/.test(key)&&value&&value!=='false')fail(`Production override rejected: ${key}`);
  if(/(?:https?|postgres(?:ql)?):\/\//i.test(value)){
   const endpoints=key==='CORS_ORIGINS'?value.split(',').map(v=>v.trim()):[value];
   for(const endpoint of endpoints)localUrl(endpoint,key,['http:','https:','postgres:','postgresql:']);
  }
 }
 const required=role==='backend'?['DATABASE_URL','SUPABASE_URL','UNIFONIC_API_URL','WHATSAPP_GRAPH_API_URL','CORS_ORIGINS']:['API_BASE_URL','NEXT_PUBLIC_API_BASE_URL'];
 for(const key of required){
  if(!env[key])fail(`Missing explicit local setting: ${key}`);
  for(const value of key==='CORS_ORIGINS'?env[key].split(',').map(v=>v.trim()):[env[key]])localUrl(value,key,key==='DATABASE_URL'?['postgres:','postgresql:']:['http:','https:']);
 }
 if(role==='backend'&&env.UNIFONIC_APP_SID!=='video-local-disabled')fail('Use the dummy video-local-disabled SMS credential');
 if(role==='frontend'&&Object.keys(env).some(k=>k.startsWith('SUPABASE_')&&env[k]))fail('Do not pass Supabase keys/configuration to the frontend');
 const clean=Object.fromEntries(Object.entries(inherited).filter(([key])=>osKeys.has(key.toLowerCase())));
 Object.assign(clean,env,{NEXT_TELEMETRY_DISABLED:'1'});
 const entry=role==='frontend'?join(cwd,'node_modules/next/dist/bin/next'):join(cwd,'node_modules/tsx/dist/cli.mjs');
 if(!existsSync(entry))fail('Install dependencies in the isolated service directory first');
 if(role==='backend'&&!existsSync(join(cwd,'src/main.ts')))fail('Backend entrypoint src/main.ts is missing');
 const args=role==='frontend'?[entry,'dev','--hostname','127.0.0.1','--port',env.PORT]:[entry,'src/main.ts'];
 return {cwd,env:clean,args};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const argv=process.argv.slice(2);
  if(argv.includes('--help')){
   console.log('node run-local.mjs --role backend|frontend --dir <isolated-service> --env <external-local-env-file> [--check-only]\nChecks are necessary but do not verify database ownership, adapters or network egress; follow references/local-capture.md.');
  }else{
   const options={};
   for(let i=0;i<argv.length;i++){
    const flag=argv[i];
    if(flag==='--check-only'){options.checkOnly=true;continue;}
    if(!['--role','--dir','--env'].includes(flag)||!argv[i+1])fail('Invalid launcher arguments; run --help');
    options[flag==='--env'?'envFile':flag.slice(2)]=argv[++i];
   }
   const plan=prepare(options);
   if(options.checkOnly)console.log('Local environment checks passed; no service started or connection opened.');
   else{
    console.log(`Starting isolated ${options.role} on loopback; explicit local environment only.`);
    const child=spawn(process.execPath,plan.args,{cwd:plan.cwd,env:plan.env,stdio:'inherit',windowsHide:true});
    child.on('error',()=>{console.error('Local service failed to start.');process.exitCode=1;});
    child.on('exit',code=>{process.exitCode=code??1;});
    process.on('SIGINT',()=>child.kill('SIGINT'));
    process.on('SIGTERM',()=>child.kill('SIGTERM'));
   }
  }
 }catch(error){console.error(error.message);process.exitCode=1;}
}
