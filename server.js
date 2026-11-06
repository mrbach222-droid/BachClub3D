import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'node:http';
const app = express();
app.use(express.static('public'));
app.use(express.json({limit:'16kb'}));
const server=createServer(app);
const wss=new WebSocketServer({server,path:'/events'});
const allowed={beer:5,lights:10,dancer:50,party:100};
const totals=new Map();
function broadcast(obj){const msg=JSON.stringify(obj);for(const c of wss.clients)if(c.readyState===1)c.send(msg)}
function ranking(){return [...totals.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,points])=>({name,points}))}
function emitGift({name,gift}){
 if(typeof name!=='string'||!name.trim()||name.length>32||!Object.hasOwn(allowed,gift))return false;
 const clean=name.trim();totals.set(clean,(totals.get(clean)||0)+allowed[gift]);
 broadcast({type:'gift',name:clean,gift,points:allowed[gift],ranking:ranking(),at:Date.now()});return true;
}
app.post('/api/demo-gift',(req,res)=>{const ok=emitGift(req.body||{});res.status(ok?200:400).json({ok})});
wss.on('connection',ws=>ws.send(JSON.stringify({type:'ranking',ranking:ranking()})));
server.listen(process.env.PORT||3000,()=>console.log('Bach Club demo: http://localhost:'+(process.env.PORT||3000)));