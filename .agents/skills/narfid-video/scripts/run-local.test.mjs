import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {prepare} from './run-local.mjs';

const base={NODE_ENV:'development',HOST:'127.0.0.1',PORT:'3137',DATABASE_URL:'postgresql://postgres:local@127.0.0.1:54322/postgres',SUPABASE_URL:'http://127.0.0.1:54321',UNIFONIC_API_URL:'http://127.0.0.1:3140/sms',WHATSAPP_GRAPH_API_URL:'http://127.0.0.1:3140/whatsapp',CORS_ORIGINS:'http://127.0.0.1:3138',UNIFONIC_APP_SID:'video-local-disabled'};
function fixture(t,changes={}){
 const root=mkdtempSync(join(tmpdir(),'narfid-video-guard-'));
 t.after(()=>{
  assert.equal(dirname(resolve(root)),resolve(tmpdir()));
  assert.ok(resolve(root).startsWith(join(resolve(tmpdir()),'narfid-video-guard-')));
  rmSync(root,{recursive:true,force:true});
 });
 const dir=join(root,'service'),envFile=join(root,'local.env');
 for(const name of ['src','node_modules/tsx/dist','node_modules/next/dist/bin'])mkdirSync(join(dir,name),{recursive:true});
 for(const name of ['src/main.ts','node_modules/tsx/dist/cli.mjs','node_modules/next/dist/bin/next'])writeFileSync(join(dir,name),'');
 const env={...base,...changes};
 writeFileSync(envFile,Object.entries(env).map(([k,v])=>`${k}=${v}`).join('\n'));
 return {role:'backend',dir,envFile};
}
test('local launch discards inherited production credentials and process overrides',t=>{
 const plan=prepare({...fixture(t),inherited:{PATH:'system-path',DATABASE_URL:'postgresql://secret@remote.example/db',NODE_OPTIONS:'--env-file=production.env',SUPABASE_SECRET_KEY:'remote-secret'}});
 assert.equal(plan.env.DATABASE_URL,base.DATABASE_URL);
 assert.equal(plan.env.NODE_OPTIONS,undefined);assert.equal(plan.env.SUPABASE_SECRET_KEY,undefined);
 assert.equal(plan.env.PATH,'system-path');assert.deepEqual(plan.args.slice(1),['src/main.ts']);
});
test('remote database is rejected without exposing its password',t=>{
 const opts=fixture(t,{DATABASE_URL:'postgresql://postgres:do-not-print@remote.example/db'});
 assert.throws(()=>prepare(opts),e=>e.message.includes('DATABASE_URL')&&!e.message.includes('do-not-print'));
});
test('libpq query redirection is rejected',t=>{
 assert.throws(()=>prepare(fixture(t,{DATABASE_URL:base.DATABASE_URL+'?host=remote.example'})),/query options rejected/);
});
test('dotenv discovery in the service directory is blocked',t=>{
 const opts=fixture(t);writeFileSync(join(opts.dir,'.env.local'),'DATABASE_URL=private');
 assert.throws(()=>prepare(opts),/containing dotenv/);
});
test('real notification credentials and production overrides are rejected',t=>{
 assert.throws(()=>prepare(fixture(t,{WHATSAPP_ACCESS_TOKEN:'not-a-local-token'})),/WHATSAPP_ACCESS_TOKEN/);
 assert.throws(()=>prepare(fixture(t,{PRODUCTION_CREDENTIAL_ROTATED:'true'})),/Production override/);
});
test('frontend requires both local API URLs and rejects Supabase configuration',t=>{
 const opts=fixture(t,{API_BASE_URL:'http://127.0.0.1:3137',NEXT_PUBLIC_API_BASE_URL:'http://127.0.0.1:3137'});
 assert.throws(()=>prepare({...opts,role:'frontend'}),/Supabase keys/);
});
test('a frontend-only local environment produces a loopback Next launch',t=>{
 const opts=fixture(t);
 writeFileSync(opts.envFile,'NODE_ENV=development\nHOST=127.0.0.1\nPORT=3138\nAPI_BASE_URL=http://127.0.0.1:3137\nNEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3137');
 const plan=prepare({...opts,role:'frontend',inherited:{}});
 assert.deepEqual(plan.args.slice(1),['dev','--hostname','127.0.0.1','--port','3138']);
});
