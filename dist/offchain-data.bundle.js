/* Off-Chain Media — Bitcoin Data Library v0.2.0 | offchain.media/data */
var OCMData=(()=>{var z=[{id:"btc-price",title:"Bitcoin Price",subtitle:"BTC/USD daily reference rate",category:"market",type:"line",api:"price",unit:"$",source:"Coin Metrics"},{id:"market-cap",title:"Market Capitalization",subtitle:"Total BTC market value in USD",category:"market",type:"area",api:"marketcap",unit:"$T",source:"Coin Metrics"},{id:"volume",title:"24h Trading Volume",subtitle:"Aggregate exchange spot volume",category:"market",type:"bar",api:"volume",unit:"$B",source:"CoinGecko"},{id:"dominance",title:"Circulating Supply",subtitle:"Total BTC mined to date",category:"market",type:"area",api:"dominance",unit:"M BTC",source:"Coin Metrics"},{id:"hashrate",title:"Network Hashrate",subtitle:"Total computational power",category:"mining",type:"line",api:"hashrate",unit:"EH/s",source:"mempool.space"},{id:"difficulty",title:"Mining Difficulty",subtitle:"Adjusted every 2,016 blocks",category:"mining",type:"line",api:"difficulty",unit:"T",source:"mempool.space"},{id:"block-fees",title:"Block Fees",subtitle:"Average fees per block",category:"mining",type:"bar",api:"fees",unit:"BTC",source:"mempool.space"},{id:"hashprice",title:"Hash Price",subtitle:"Daily revenue per TH/s",category:"mining",type:"line",api:"hashprice",unit:"$/TH",source:"mempool.space"},{id:"active-addresses",title:"Active Addresses",subtitle:"Unique addresses used daily",category:"on-chain",type:"area",api:"addresses",unit:"K",source:"Coin Metrics"},{id:"lth-supply",title:"Miner Revenue",subtitle:"Daily BTC earned by miners (subsidy + fees)",category:"on-chain",type:"area",api:"lth",unit:"BTC",source:"Coin Metrics"},{id:"exchange-balance",title:"Exchange Balances",subtitle:"Total BTC on exchanges",category:"on-chain",type:"line",api:"exchange",unit:"M BTC",source:"Coin Metrics"},{id:"nvt",title:"Daily Transactions",subtitle:"On-chain transaction count per day",category:"on-chain",type:"bar",api:"nvt",unit:"K",source:"Coin Metrics"},{id:"mempool-size",title:"Mempool Size",subtitle:"Pending transactions in vBytes",category:"mempool",type:"area",api:"mempool",unit:"MB",source:"mempool.space"},{id:"fee-rates",title:"Fee Rate Distribution",subtitle:"sat/vB by confirmation priority",category:"mempool",type:"bar",api:"feerates",unit:"sat/vB",source:"mempool.space"},{id:"tx-per-second",title:"Transactions Per Second",subtitle:"On-chain throughput",category:"mempool",type:"line",api:"tps",unit:"tx/s",source:"Coin Metrics"},{id:"block-weight",title:"Average Block Weight",subtitle:"How full are Bitcoin blocks?",category:"mempool",type:"bar",api:"blockweight",unit:"MWU",source:"mempool.space"}];var l={accent:"#F7931A",ink:"#1a1a1a",paper:"#FAF7F1",muted:"rgba(128,128,128,0.5)",grid:"rgba(128,128,128,0.12)",heading:"'Oswald', 'Arial Narrow', sans-serif",body:"'Spectral', Georgia, serif",line:"light-dark(#1a1a1a, #f2f2f2)",lineFill:"light-dark(#1a1a1a, #f2f2f2)",shadow:"light-dark(rgba(0,0,0,0.32), rgba(255,255,255,0.20))",textAdaptive:"light-dark(#1a1a1a, #ffffff)",textAdaptiveInverse:"light-dark(#ffffff, #1a1a1a)",textAdaptiveMuted:"light-dark(rgba(26,26,26,0.55), rgba(255,255,255,0.55))"},se={"1D":24,"1W":7,"1M":30,"3M":90,"1Y":365,ALL:9999};var F="https://ocm-proxy.offchainmedia.workers.dev",ce="",_e="https://community-api.coinmetrics.io/v4/timeseries/asset-metrics",De=3.125,Pe=144,te={},oe={};function v(e,t,o,n,i){let s=o,r=e,d=Date.now();return Array.from({length:t},(p,c)=>(r=(r*9301+49297)%233280,s+=Math.sin(c*.5+e)*n+i,s=Math.max(o*.3,s),{ts:d-(t-c)*864e5,v:s}))}var le={price:()=>v(5,365,85e3,4e3,120),marketcap:()=>v(7,365,16e11,8e10,3e9),volume:()=>v(13,365,35e9,8e9,1e8),dominance:()=>v(6,365,19.8,.05,.001),hashrate:()=>v(3,365,600,25,.6),difficulty:()=>v(9,52,80,5,.15),fees:()=>v(11,90,.15,.05,.001),hashprice:()=>v(12,180,.042,.008,1e-4),addresses:()=>v(14,365,9e5,8e4,500),lth:()=>v(13,365,500,30,.5),exchange:()=>v(15,365,2.8,.04,-.001),nvt:()=>v(16,365,6e5,5e4,100),mempool:()=>v(17,90,35,18,.05),feerates:()=>v(18,90,15,10,.02),tps:()=>v(19,90,5.5,1,.002),blockweight:()=>v(20,90,3.7,.2,.001)};function U(e){let t=new Map;for(let{ts:o,v:n}of e){let i=Math.floor(o/864e5),s=t.get(i)||{sum:0,n:0};s.sum+=n,s.n+=1,t.set(i,s)}return[...t.entries()].sort((o,n)=>o[0]-n[0]).map(([o,{sum:n,n:i}])=>({ts:o*864e5,v:n/i}))}async function Re(){let e=await fetch(`${F}/api/v1/mining/hashrate/all`);if(!e.ok)throw new Error(`hashrate HTTP ${e.status}`);return(await e.json()).hashrates.map(o=>({ts:o.timestamp*1e3,v:o.avgHashrate/1e18}))}async function ze(){let e=await fetch(`${F}/api/v1/mining/difficulty-adjustments/all`);if(!e.ok)throw new Error(`difficulty HTTP ${e.status}`);return(await e.json()).map(([o,,n])=>({ts:o*1e3,v:n/1e12})).sort((o,n)=>o.ts-n.ts)}async function He(){let e=await fetch(`${F}/api/v1/mining/blocks/fees/all`);if(!e.ok)throw new Error(`fees HTTP ${e.status}`);let t=await e.json();return U(t.map(o=>({ts:o.timestamp*1e3,v:o.avgFees/1e8})))}async function je(){let e=await fetch(`${F}/api/v1/mining/blocks/fee-rates/all`);if(!e.ok)throw new Error(`feerates HTTP ${e.status}`);let t=await e.json();return U(t.map(o=>({ts:o.timestamp*1e3,v:o.avgFee_50})))}async function Ie(){let e=await fetch(`${F}/api/v1/statistics/all`);if(!e.ok)throw new Error(`mempool HTTP ${e.status}`);let t=await e.json();return U(t.map(o=>({ts:o.added*1e3,v:o.vsizes.reduce((n,i)=>n+i,0)/1e6})))}async function Ne(){let e=await fetch(`${F}/api/v1/mining/blocks/sizes-weights/all`);if(!e.ok)throw new Error(`blockweight HTTP ${e.status}`);let t=await e.json();return U(t.weights.map(o=>({ts:o.timestamp*1e3,v:o.avgWeight/1e6})))}async function T(e){if(oe[e])return oe[e];let t=new Date,n=`${_e}?assets=btc&metrics=${e}&frequency=1d&start_time=${new Date("2010-01-01").toISOString().slice(0,10)}&end_time=${t.toISOString().slice(0,10)}&page_size=10000`,i=await fetch(n);if(!i.ok)throw new Error(`${e} HTTP ${i.status}`);let r=(await i.json()).data.map(d=>({ts:new Date(d.time).getTime(),v:parseFloat(d[e])}));return oe[e]=r,r}async function Oe(){return T("AdrActCnt")}async function qe(){return(await T("TxCnt")).map(({ts:e,v:t})=>({ts:e,v:t/86400}))}async function Ge(){return(await T("SplyExNtv")).map(({ts:e,v:t})=>({ts:e,v:t/1e6}))}async function Ue(){let[{data:e},{data:t},{data:o}]=await Promise.all([B("fees"),B("hashrate"),B("price")]),n=new Map(t.map(s=>[Math.floor(s.ts/864e5),s.v])),i=new Map(o.map(s=>[Math.floor(s.ts/864e5),s.v]));return e.map(({ts:s,v:r})=>{let d=Math.floor(s/864e5),p=n.get(d),c=i.get(d);if(p==null||c==null)return null;let m=Pe*(De+r)*c;return{ts:s,v:m/(p*1e6)}}).filter(Boolean)}async function Ve(){return T("PriceUSD")}async function We(){return(await T("CapMrktCurUSD")).map(e=>({ts:e.ts,v:e.v/1e12}))}async function Ze(){let e=ce?`&x_cg_demo_api_key=${ce}`:"",t=await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily${e}`);if(!t.ok)throw new Error(`CoinGecko volume HTTP ${t.status}`);return(await t.json()).total_volumes.map(([n,i])=>({ts:n,v:i/1e9}))}async function Ye(){return(await T("SplyCur")).map(e=>({ts:e.ts,v:e.v/1e6}))}async function Ke(){return T("TxCnt")}async function Je(){let[e,t]=await Promise.all([T("IssTotNtv"),T("FeeTotNtv")]),o=new Map(t.map(n=>[Math.floor(n.ts/864e5),n.v]));return e.map(({ts:n,v:i})=>({ts:n,v:i+(o.get(Math.floor(n/864e5))??0)}))}function Qe(){return[{medianFee:2.1,feeRange:[1,1.2,1.3,2,2.7,4,201],nTx:4327,totalFees:25e5,blockSize:2054070},{medianFee:1.4,feeRange:[.5,.6,.7,1,1.5,2.2,150],nTx:6755,totalFees:16e5,blockSize:1997e3},{medianFee:.6,feeRange:[.36,.4,.42,.5,.7,1,45],nTx:5777,totalFees:95e4,blockSize:1584123}]}function Xe(){let e=["F2Pool","Foundry USA","Luxor","AntPool","ViaBTC","\u24C8BTC.com"],t=Date.now();return Array.from({length:6},(o,n)=>({height:957896-n,timestamp:Math.floor((t-n*9.7*6e4)/1e3),tx_count:4362-n*235,size:1561683+n*12e3,extras:{medianFee:1.1+n*.1,feeRange:[.55-n*.02,.7,1,2,3,5,161-n*10],totalFees:1883531-n*9e4,pool:{name:e[n%e.length]}}}))}async function de(){try{let e=await fetch(`${F}/api/v1/fees/mempool-blocks`);if(!e.ok)throw new Error(`mempool-blocks HTTP ${e.status}`);return{data:await e.json(),live:!0}}catch(e){return console.warn('[data] Falling back to mock for "mempool-blocks":',e.message),{data:Qe(),live:!1}}}async function pe(){try{let e=await fetch(`${F}/api/v1/blocks`);if(!e.ok)throw new Error(`blocks HTTP ${e.status}`);return{data:await e.json(),live:!0}}catch(e){return console.warn('[data] Falling back to mock for "blocks":',e.message),{data:Xe(),live:!1}}}function me(e){let t=Math.max(0,Math.round((Date.now()-e*1e3)/6e4));return t<1?"just now":t<60?`${t} min ago`:`${Math.round(t/60)}h ago`}var et={hashrate:Re,difficulty:ze,fees:He,feerates:je,mempool:Ie,blockweight:Ne,addresses:Oe,tps:qe,exchange:Ge,hashprice:Ue,price:Ve,marketcap:We,volume:Ze,dominance:Ye,nvt:Ke,lth:Je};async function B(e){if(te[e])return{data:te[e],live:!0};let t=et[e];if(t)try{let n=await t();return te[e]=n,{data:n,live:!0}}catch(n){console.warn(`[data] Falling back to mock for "${e}":`,n.message)}return{data:(le[e]||le.price)(),live:!1}}function H(e,t){let o=se[t]??e.length;return e.slice(-Math.min(o,e.length))}function N(e,t){return t==="$"?e>=1e3?`$${(e/1e3).toFixed(0)}k`:`$${e.toFixed(0)}`:t==="$T"?`$${e.toFixed(2)}T`:t==="$B"?`$${e.toFixed(1)}B`:t==="EH/s"?`${e.toFixed(1)} EH/s`:t==="%"?`${e.toFixed(1)}%`:t==="M BTC"?`${e.toFixed(2)}M BTC`:t==="K"?`${(e/1e3).toFixed(0)}K`:t==="BTC"?`${e.toFixed(3)} BTC`:t==="T"?`${e.toFixed(1)}T`:e!=null?`${e.toFixed(2)}${t?" "+t:""}`:"\u2014"}function ue(e,t){return e==null?"\u2014":t==="$"?`$${Math.round(e).toLocaleString("en-US")}`:t==="BTC"?`${e.toFixed(4)} BTC`:t==="K"?Math.round(e).toLocaleString("en-US"):N(e,t)}function he(e,t){if(e==null)return"\u2014";if(t==="$")return e>=1e3?`$${Math.round(e).toLocaleString("en-US")}`:e>=1?`$${e.toFixed(2)}`:`$${e.toFixed(5)}`;if(t==="$T")return`$${e.toFixed(3)}T`;if(t==="$B")return`$${e.toFixed(2)}B`;if(t==="EH/s")return`${e.toFixed(2)} EH/s`;if(t==="M BTC")return`${e.toFixed(3)}M BTC`;if(t==="K")return`${Math.round(e).toLocaleString("en-US")}`;if(t==="BTC")return`${e.toFixed(4)} BTC`;if(t==="T")return`${e.toFixed(2)}T`;if(t==="%")return`${e.toFixed(2)}%`;let o=Math.abs(e),n=o>=100?1:o>=10?2:o>=1?3:o>=.1?4:5;return`${e.toFixed(n)}${t?" "+t:""}`}function fe(e){return new Date(e).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}function ge(e){let t=e;return()=>(t=(t*9301+49297)%233280,t/233280)}function a(e,t={}){let o=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.entries(t).forEach(([n,i])=>o.setAttribute(n,i)),o}function ne(e,t=1,o=1){let n=ge(o),i=e.map(r=>({x:r.x+(n()-.5)*t,y:r.y+(n()-.5)*t}));if(i.length<2)return"";let s=`M${i[0].x.toFixed(2)},${i[0].y.toFixed(2)}`;for(let r=0;r<i.length-1;r++){let d=i[Math.max(0,r-1)],p=i[r],c=i[r+1],m=i[Math.min(i.length-1,r+2)],u=p.x+(c.x-d.x)/6,f=p.y+(c.y-d.y)/6,x=c.x-(m.x-p.x)/6,y=c.y-(m.y-p.y)/6;s+=` C${u.toFixed(2)},${f.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)} ${c.x.toFixed(2)},${c.y.toFixed(2)}`}return s}function ye(e,t,o){let n=ge(Math.round(e+t)),i=n()*Math.PI,s=[];for(let r=0;r<=Math.PI*2*1.15;r+=.3){let d=o+(n()-.5)*1.5;s.push(`${(e+Math.cos(r+i)*d).toFixed(1)},${(t+Math.sin(r+i)*d).toFixed(1)}`)}return"M"+s.join(" L")}function xe(e,t,o,n){let i=e.map(c=>c.v),s=Math.min(...i),r=Math.max(...i),d=r-s||1;return{points:e.map((c,m)=>({x:t.left+m/(e.length-1)*o,y:t.top+n-(c.v-s)/d*n,d:c})),min:s,max:r,range:d}}var _=680,S=380,h={top:52,right:20,bottom:46,left:52},A=_-h.left-h.right,w=S-h.top-h.bottom,tt=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],V=5,ot=0,nt={"Coin Metrics":"https://coinmetrics.io","mempool.space":"https://mempool.space",CoinGecko:"https://www.coingecko.com"};function W(e,t,o,n){e.innerHTML="";let i=H(t,n);if(!i.length)return;let{points:s,min:r,max:d,range:p}=xe(i,h,A,w),c=a("svg",{width:"100%",viewBox:`0 0 ${_} ${S}`,style:"display:block"}),m=a("defs"),u=a("filter",{id:"ocm-rough",x:"-5%",y:"-5%",width:"110%",height:"110%"}),f=a("feTurbulence",{type:"fractalNoise",baseFrequency:"0.012",numOctaves:"2",seed:"4",result:"n"}),x=a("feDisplacementMap",{in:"SourceGraphic",in2:"n",scale:"2",xChannelSelector:"R",yChannelSelector:"G"});u.appendChild(f),u.appendChild(x),m.appendChild(u);let y=a("filter",{id:"ocm-drop",x:"-20%",y:"-20%",width:"140%",height:"140%"}),C=a("feGaussianBlur",{in:"SourceAlpha",stdDeviation:"3",result:"blur"}),L=a("feOffset",{in:"blur",dx:"2",dy:"4",result:"off"}),M=a("feFlood",{style:`flood-color: ${l.shadow}`,result:"floodColor"}),Q=a("feComposite",{in:"floodColor",in2:"off",operator:"in",result:"sh"}),j=a("feMerge");j.appendChild(a("feMergeNode",{in:"sh"})),j.appendChild(a("feMergeNode",{in:"SourceGraphic"})),y.appendChild(C),y.appendChild(L),y.appendChild(M),y.appendChild(Q),y.appendChild(j),m.appendChild(y);let k=a("linearGradient",{id:"ocm-vol",x1:"0",y1:"0",x2:"0",y2:"1"});k.appendChild(a("stop",{offset:"0%",style:`stop-color: ${l.lineFill}`,"stop-opacity":"0.22"})),k.appendChild(a("stop",{offset:"100%",style:`stop-color: ${l.lineFill}`,"stop-opacity":"0.02"})),m.appendChild(k);let P=a("linearGradient",{id:"ocm-ridge",x1:"0",y1:"0",x2:"0",y2:"1"});P.appendChild(a("stop",{offset:"0%","stop-color":"#fff","stop-opacity":"0.30"})),P.appendChild(a("stop",{offset:"15%","stop-color":"#fff","stop-opacity":"0"})),m.appendChild(P);let R=a("clipPath",{id:"ocm-clip"});R.appendChild(a("rect",{x:h.left,y:h.top,width:A,height:w})),m.appendChild(R),c.appendChild(m),c.appendChild(a("rect",{width:_,height:S,fill:"transparent"}));let E=p/V,O=b=>{let $=Math.abs(b);return $>=1e9?`${(b/1e9).toFixed(p/1e9<5?1:0)}B`:$>=1e6?`${(b/1e6).toFixed(p/1e6<5?1:0)}M`:$>=1e3?`${(b/1e3).toFixed(p/1e3<5?1:0)}k`:E>=10?b.toFixed(0):E>=1?b.toFixed(1):E>=.1?b.toFixed(2):E>=.01?b.toFixed(3):b.toFixed(4)};for(let b=0;b<=V;b++){let $=h.top+b/V*w,ee=d-b/V*p;c.appendChild(a("line",{x1:h.left,y1:$,x2:h.left+A,y2:$,stroke:l.grid,"stroke-width":"0.7","stroke-linecap":"round"}));let I=a("text",{x:h.left-8,y:$+4,"text-anchor":"end","font-family":l.body,"font-size":"12",fill:"rgba(128,128,128,0.65)","font-style":"italic"});I.textContent=O(ee),c.appendChild(I)}c.appendChild(a("line",{x1:h.left,y1:h.top+w,x2:h.left+A,y2:h.top+w,stroke:"rgba(128,128,128,0.28)","stroke-width":"1","stroke-linecap":"round"}));let Se=(i.length>1?i[i.length-1].ts-i[0].ts:0)>400*864e5;[0,.25,.5,.75,1].forEach(b=>{let $=Math.round(b*(i.length-1)),ee=h.left+b*A,I=new Date(i[$]?.ts||Date.now()),re=a("text",{x:ee,y:h.top+w+18,"text-anchor":"middle","font-family":l.body,"font-size":"12",fill:"rgba(128,128,128,0.6)","font-style":"italic"});re.textContent=Se?I.getFullYear():tt[I.getMonth()],c.appendChild(re)}),o.type==="bar"?it(c,m,i,r,p):at(c,s,t,o,i),rt(c,m),c.appendChild(a("line",{x1:0,y1:S-16,x2:_,y2:S-16,stroke:l.ink,"stroke-width":"0.5",opacity:"0.3"}));let q=a("a",{href:nt[o.source]||"#",target:"_blank",style:"cursor:pointer"}),G=a("text",{x:h.left,y:S-4,"font-family":l.body,"font-size":"11",fill:"rgba(128,128,128,0.55)","font-style":"italic",style:"transition:fill 0.15s"});G.textContent=`Source: ${o.source} \u2197`,q.addEventListener("mouseenter",()=>G.setAttribute("fill",l.accent)),q.addEventListener("mouseleave",()=>G.setAttribute("fill","rgba(128,128,128,0.55)")),q.appendChild(G),c.appendChild(q);let ae=a("text",{x:_-h.right,y:S-4,"text-anchor":"end","font-family":l.heading,"font-size":"10",fill:"rgba(128,128,128,0.45)","letter-spacing":"0.1em"});ae.textContent="OFFCHAIN.MEDIA/DATA",c.appendChild(ae),e.appendChild(c)}function it(e,t,o,n,i){let r=(A-3*(o.length-1))/Math.max(o.length,1),d=a("g",{filter:"url(#ocm-rough)"});o.forEach((p,c)=>{let m=(p.v-n)/i*w,u=h.left+c*(r+3),f=h.top+w-m,x=c===o.length-1,y=x?l.accent:l.line,C=`ocm-bv-${c}`,L=a("linearGradient",{id:C,x1:"0",y1:"0",x2:"0",y2:"1"});L.appendChild(a("stop",{offset:"0%",style:`stop-color: ${y}`,"stop-opacity":x?"1":"0.85"})),L.appendChild(a("stop",{offset:"100%",style:`stop-color: ${y}`,"stop-opacity":x?"0.75":"0.6"})),t.appendChild(L);let M=a("g",{filter:"url(#ocm-drop)"});M.appendChild(a("rect",{x:u,y:f,width:r,height:m,rx:"1.5",fill:`url(#${C})`})),M.appendChild(a("rect",{x:u,y:f,width:r,height:Math.min(m,16),rx:"1.5",fill:"rgba(255,255,255,0.28)"})),d.appendChild(M)}),e.appendChild(d)}function at(e,t,o,n,i){let s=ne(t,1,3),r=`${s} L${t[t.length-1].x},${h.top+w} L${t[0].x},${h.top+w} Z`,d=a("g",{"clip-path":"url(#ocm-clip)"});d.appendChild(a("path",{d:r,fill:"url(#ocm-vol)"})),d.appendChild(a("path",{d:r,fill:"url(#ocm-ridge)"})),e.appendChild(d);let p=a("g",{filter:"url(#ocm-rough)","clip-path":"url(#ocm-clip)"});p.appendChild(a("path",{d:s,fill:"none",style:`stroke: ${l.line}`,"stroke-width":"2.2","stroke-linecap":"round","stroke-linejoin":"round",filter:"url(#ocm-drop)"})),t.length>12&&p.appendChild(a("path",{d:ne(t.slice(-12),1,4),fill:"none",stroke:l.accent,"stroke-width":"2.5","stroke-linecap":"round",filter:"url(#ocm-drop)"})),e.appendChild(p);let c=t[t.length-1];c&&(e.appendChild(a("circle",{cx:c.x,cy:c.y,r:"4",fill:l.accent})),e.appendChild(a("path",{d:ye(c.x,c.y,9),fill:"none",stroke:l.accent,"stroke-width":"1.2",opacity:"0.6","stroke-linecap":"round"})));let m=a("line",{x1:0,y1:h.top,x2:0,y2:h.top+w,stroke:l.accent,"stroke-width":"0.7","stroke-dasharray":"3,3",opacity:"0","pointer-events":"none"});e.appendChild(m);let u=a("g",{opacity:"0","pointer-events":"none"}),f=a("rect",{x:0,y:0,width:130,height:42,rx:"2",fill:l.ink}),x=a("text",{x:10,y:14,"font-family":l.body,"font-size":"10",fill:"rgba(255,255,255,0.55)","font-style":"italic"}),y=a("text",{x:10,y:32,"font-family":l.heading,"font-size":"14","font-weight":"600",fill:"#fff"});u.appendChild(f),u.appendChild(x),u.appendChild(y),e.appendChild(u);let C=a("rect",{x:h.left,y:h.top,width:A,height:w,fill:"transparent",style:"cursor:crosshair"});C.addEventListener("mousemove",L=>{let M=e.getBoundingClientRect(),Q=_/M.width,j=(L.clientX-M.left)*Q,k=t[0],P=1/0;t.forEach(O=>{let X=Math.abs(O.x-j);X<P&&(P=X,k=O)}),m.setAttribute("x1",k.x),m.setAttribute("x2",k.x),m.setAttribute("opacity","0.5");let R=Math.min(k.x+8,_-140),E=Math.max(k.y-52,h.top);f.setAttribute("x",R),f.setAttribute("y",E),x.setAttribute("x",R+10),x.setAttribute("y",E+14),y.setAttribute("x",R+10),y.setAttribute("y",E+32),x.textContent=fe(k.d.ts),y.textContent=he(k.d.v,n.unit),u.setAttribute("opacity","1")}),C.addEventListener("mouseleave",()=>{m.setAttribute("opacity","0"),u.setAttribute("opacity","0")}),e.appendChild(C)}function rt(e,t){let o=`ocmwm${ot++}`,n=h.left+A/2,i=h.top+w/2,s=160/956,r=n-s*862,d=i-s*415,p=(x,y)=>{let C=a("clipPath",{id:o+x});C.appendChild(a("path",{d:y})),t.appendChild(C)};p("r","M726 201 L1077 201 L1077 629 L726 629Z"),p("l","M384 201 L999 201 L999 629 L384 629Z"),p("b","M934.7 537.1 L1015.5 537.1 L1015.5 628.2 L934.7 628.2Z");let c=a("g",{transform:`translate(${r.toFixed(1)},${d.toFixed(1)}) scale(${s.toFixed(4)})`,style:`fill: ${l.line}`,opacity:"0.06"}),m=a("g",{"clip-path":`url(#${o}r)`});m.appendChild(a("path",{d:"M1340.3 414.7C1340.4 296.8 1244.8 201.2 1126.9 201.3L958.4 201.4C965.7 207.3 972.8 213.7 979.6 220.5C1000.9 241.8 1018.2 265.9 1031.3 292.1L1126.8 292C1159.6 292 1190.4 304.8 1213.6 328C1236.8 351.1 1249.6 382 1249.5 414.8C1249.5 447.6 1236.7 478.4 1213.5 501.6C1190.3 524.8 1159.4 537.6 1126.7 537.6L939.8 537.7C907 537.8 876.2 525 852.9 501.8C829.8 478.6 817 447.8 817.1 415C817 399.1 820.1 383.6 825.9 369.2C814.7 359.1 800.3 353.6 785.1 353.6L735.3 353.7C729.5 373.1 726.3 393.8 726.2 415.1C726.2 533 821.8 628.6 939.7 628.5L1126.6 628.4C1244.5 628.3 1340.2 532.7 1340.3 414.7Z"})),c.appendChild(m);let u=a("g",{"clip-path":`url(#${o}l)`});u.appendChild(a("path",{d:"M746.3 610.5C725 589.2 707.5 564.8 694.2 537.9L598.1 537.9C565.3 538 534.4 525.2 511.3 502.1C488.1 478.9 475.3 448.1 475.4 415.2C475.4 382.4 488.2 351.6 511.4 328.4C534.6 305.2 565.4 292.4 598.3 292.4L785.1 292.2C817.9 292.3 848.7 305 871.9 328.2C895.1 351.4 907.8 382.2 907.8 415C907.8 430.9 904.8 446.4 899 460.8C910.2 471 924.6 476.5 939.9 476.4L989.6 476.4C995.4 456.9 998.6 436.3 998.6 414.9C998.7 297 903.1 201.4 785.2 201.5L598.3 201.6C480.3 201.7 384.6 297.3 384.6 415.3C384.5 533.3 480 628.8 598 628.8L766.2 628.6C759.4 623 752.7 616.9 746.3 610.5Z"})),c.appendChild(u),c.appendChild(a("path",{d:"M771.5 430C796.8 542.8 866.9 593.7 982.1 582.7",style:`fill:none;stroke:${l.line};stroke-width:50;stroke-linecap:butt;stroke-miterlimit:4`}));let f=a("g",{"clip-path":`url(#${o}b)`});f.appendChild(a("rect",{x:"934.7",y:"537.1",width:"80.8",height:"91.2"})),c.appendChild(f),e.appendChild(c)}function be(e){let t=document.querySelector(".ocm-gallery-view"),o=document.querySelectorAll(".ocm-data-filters .ocm-filter-btn");if(!t||!o.length)return null;let n=document.createElement("nav");n.className="ocm-sidebar";let i=[...o].map(s=>{let r=document.createElement("div");return r.className="ocm-sidebar-item",r.textContent=s.textContent.trim(),r.dataset.filter=s.dataset.filter,s.classList.contains("ocm-filter-active")&&r.classList.add("ocm-sidebar-active"),r.addEventListener("click",()=>{i.forEach(d=>d.classList.remove("ocm-sidebar-active")),r.classList.add("ocm-sidebar-active"),e(r.dataset.filter)}),n.appendChild(r),r});return t.insertBefore(n,t.firstChild),n}var ve=!1;function we(){if(ve)return;ve=!0;let e=document.createElement("style");e.textContent=`
    .ocm-data-filters { display: none !important; }
    .ocm-data-hero { display: none !important; }

    .ocm-blockstrip {
      display: flex;
      align-items: stretch;
      gap: 18px;
      overflow-x: auto;
      padding: 24px 4px 28px;
      margin-bottom: 8px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .ocm-blockstrip::-webkit-scrollbar { display: none; }

    .ocm-blockstrip-divider {
      flex: 0 0 auto;
      align-self: center;
      display: flex;
      align-items: center;
      color: ${l.textAdaptiveMuted};
      padding: 0 16px;
    }

    .ocm-block-cube {
      position: relative;
      flex: 0 0 auto;
      width: 150px;
      height: 160px;
    }
    .ocm-block-cube-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .ocm-block-cube-content {
      position: relative;
      box-sizing: border-box;
      /* Front face (the flat square, ignoring the top/right bevel) is
         inset 10% from the top and right \u2014 pad past that line, not
         past the cube's outer bounds, so text centers on the square
         you actually read, not the bevel. */
      padding: 30px 26px 14px 14px;
    }

    .ocm-block-cube--pending .ocm-bc-fee,
    .ocm-block-cube--pending .ocm-bc-range,
    .ocm-block-cube--pending .ocm-bc-row,
    .ocm-block-cube--pending .ocm-bc-meta { color: ${l.textAdaptive}; }

    .ocm-block-cube--confirmed .ocm-bc-fee,
    .ocm-block-cube--confirmed .ocm-bc-range,
    .ocm-block-cube--confirmed .ocm-bc-row,
    .ocm-block-cube--confirmed .ocm-bc-meta { color: ${l.textAdaptiveInverse}; }

    .ocm-bc-fee {
      font-family: ${l.heading};
      font-size: 15px;
      font-weight: 600;
      margin: 0;
    }
    .ocm-bc-range {
      font-size: 10px;
      opacity: 0.75;
      margin: 2px 0 8px;
    }
    .ocm-bc-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      opacity: 0.85;
      margin: 2px 0;
      gap: 8px;
    }
    .ocm-bc-meta {
      font-size: 10px;
      opacity: 0.75;
      margin: 10px 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ocm-gallery-view {
      display: flex;
      align-items: flex-start;
      gap: 28px;
    }

    .ocm-sidebar {
      flex: 0 0 152px;
      position: sticky;
      top: 24px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ocm-sidebar-item {
      font-family: ${l.heading};
      font-size: 12px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: ${l.textAdaptiveMuted};
      padding: 8px 10px;
      border-radius: 3px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .ocm-sidebar-item:hover {
      color: ${l.textAdaptive};
      background: light-dark(rgba(0,0,0,0.05), rgba(255,255,255,0.05));
    }
    .ocm-sidebar-item.ocm-sidebar-active {
      color: ${l.accent};
      background: rgba(247,147,26,0.10);
    }

    .ocm-gallery-inner { flex: 1; min-width: 0; }

    .ocm-cards-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 20px !important;
      background: transparent !important;
      border: none !important;
    }

    .ocm-category-section {
      border: 1px solid light-dark(rgba(0,0,0,0.14), rgba(255,255,255,0.14));
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .ocm-card-chart-full {
      height: auto !important;
      aspect-ratio: 680 / 380;
      overflow: visible;
    }

    .ocm-card-toprow {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin: 2px 0 8px;
    }

    .ocm-card-periods {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .ocm-card-headline {
      font-family: ${l.heading};
      font-size: 22px;
      font-weight: 600;
      color: ${l.accent};
      letter-spacing: 0.01em;
      text-align: right;
      white-space: nowrap;
    }
    .ocm-card-period-btn {
      font-family: ${l.heading};
      font-size: 10px;
      letter-spacing: 0.04em;
      padding: 2px 8px;
      border-radius: 3px;
      color: rgba(128,128,128,0.7);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .ocm-card-period-btn:hover { color: ${l.textAdaptive}; }
    .ocm-card-period-btn.ocm-card-period-active {
      color: ${l.accent};
      background: rgba(247,147,26,0.12);
    }

    .ocm-see-more { cursor: pointer; }

    @keyframes ocm-pending-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.2; }
    }
    .ocm-block-cube--pending {
      animation: ocm-pending-pulse 1.5s ease-in-out infinite;
    }
    .ocm-blockstrip > .ocm-block-cube--pending:nth-child(1) { animation-delay:  0s;     }
    .ocm-blockstrip > .ocm-block-cube--pending:nth-child(2) { animation-delay: -0.25s;  }
    .ocm-blockstrip > .ocm-block-cube--pending:nth-child(3) { animation-delay: -0.5s;   }

    .ocm-block-explorer {
      text-decoration: none;
      opacity: 0.45;
      transition: opacity 0.2s;
    }
    .ocm-block-explorer:hover { opacity: 1; }
    .ocm-block-explorer-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      height: 100%;
      padding: 0 14px;
      box-sizing: border-box;
    }

    @media (max-width: 700px) {
      .ocm-gallery-view { flex-direction: column; gap: 16px; }
      .ocm-sidebar {
        flex-direction: row;
        overflow-x: auto;
        position: static;
        width: 100%;
        gap: 6px;
      }
      .ocm-sidebar-item { flex: 0 0 auto; white-space: nowrap; }
      .ocm-cards-grid { grid-template-columns: 1fr !important; }
    }
  `,document.head.appendChild(e)}var st=["3M","1Y","ALL"],Ce="3M";async function ke(e){we(),ct(),be($e),await lt(e)}function $e(e){document.querySelectorAll(".ocm-category-section").forEach(t=>{t.style.display=e==="all"||t.dataset.category===e?"":"none"})}function ct(){let e=document.querySelectorAll(".ocm-filter-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(o=>o.classList.remove("ocm-filter-active")),t.classList.add("ocm-filter-active"),$e(t.dataset.filter)})})}async function lt(e){try{await B("price")}catch{}let t=document.querySelectorAll(".ocm-card"),o=new IntersectionObserver(dt,{rootMargin:"200px 0px"});t.forEach(n=>{let i=n.dataset.chartId;if(!i||!z.find(r=>r.id===i))return;let s=n.querySelector(".ocm-see-more");s&&s.addEventListener("click",r=>{r.stopPropagation(),e(i)}),o.observe(n)})}function dt(e,t){e.forEach(o=>{o.isIntersecting&&(t.unobserve(o.target),pt(o.target))})}async function pt(e){let t=e.dataset.chartId,o=z.find(u=>u.id===t);if(!o)return;let n=e.querySelector(".ocm-card-chart");if(!n)return;n.classList.add("ocm-card-chart-full");let{periodBar:i,headline:s}=mt(e),{data:r,live:d}=await B(o.api),p=Ce,c=r[r.length-1];c&&(s.textContent=ue(c.v,o.unit)+(d?"":" (demo)"));let m=u=>{W(n,r,o,u);let f=H(r,u),x=f[f.length-1],y=e.querySelector(".ocm-card-reading");y&&x&&(y.textContent=N(x.v,o.unit)+(d?"":" (demo)"))};i.querySelectorAll(".ocm-card-period-btn").forEach(u=>{u.addEventListener("click",()=>{p=u.dataset.period,i.querySelectorAll(".ocm-card-period-btn").forEach(f=>f.classList.toggle("ocm-card-period-active",f===u)),m(p)})}),m(p)}function mt(e){let t=e.querySelector(".ocm-card-meta"),o=document.createElement("div");o.className="ocm-card-toprow";let n=document.createElement("div");n.className="ocm-card-periods",st.forEach(s=>{let r=document.createElement("span");r.className="ocm-card-period-btn"+(s===Ce?" ocm-card-period-active":""),r.textContent=s,r.dataset.period=s,n.appendChild(r)});let i=document.createElement("span");return i.className="ocm-card-headline",o.appendChild(n),o.appendChild(i),t?t.insertAdjacentElement("afterend",o):e.insertBefore(o,e.firstChild),{periodBar:n,headline:i}}var Te={"btc-price":{measures:"The spot price of Bitcoin in USD, volume-weighted across major exchanges.",importance:"The most watched metric in Bitcoin. Price discovery reflects the aggregate conviction of every market participant \u2014 miners, holders, speculators, institutions.",update:"After consolidating in the $95k\u2013$105k range through Q1 2026, BTC broke above $108k in early July. The 200-day MA is now acting as support rather than resistance \u2014 a structural shift from the bear market regime."},"market-cap":{measures:"Total circulating supply \xD7 current price. A proxy for Bitcoin's weight relative to other global assets.",importance:"Contextualizes Bitcoin within the broader asset landscape. Useful for macro comparisons, though not all BTC is liquid.",update:"Bitcoin's market cap now exceeds $2 trillion, placing it firmly in the top 5 global assets by market value. The comparison with sovereign wealth and energy giants is no longer hypothetical."},volume:{measures:"Total spot trading volume aggregated across major exchanges over a rolling 24-hour window.",importance:"Volume validates price moves. High volume on a breakout signals conviction; low volume on a rally signals fragility.",update:"Volume trending higher since May, consistent with the price breakout above $105k. A significant share is now concentrated on regulated venues \u2014 a centralization vector worth watching."},dominance:{measures:"Bitcoin's market cap as a percentage of the total cryptocurrency market.",importance:"A proxy for capital rotation. Rising dominance signals risk-off behavior within crypto \u2014 capital fleeing altcoins back to BTC.",update:"Dominance climbing to multi-year highs driven by ETF inflows that benefit BTC exclusively and general disillusionment with altcoin narratives post-memecoin fatigue."},hashrate:{measures:"Estimated total computational power in exahashes per second dedicated to mining Bitcoin blocks.",importance:"Hashrate is the thermometer of miner conviction. Rising hashrate means miners are betting on Bitcoin's future \u2014 they've committed capital months in advance.",update:"Post-halving hashrate recovery has been faster than any previous cycle. The 812 EH/s reading reflects massive ASIC deployments in North America, the Gulf States, and parts of Latin America."},difficulty:{measures:"The target threshold that determines how hard it is to find a valid block hash. Recalibrates every ~2,016 blocks (~2 weeks).",importance:"Difficulty is Bitcoin's self-regulating immune system. It ensures blocks arrive every ~10 minutes regardless of hashpower fluctuations.",update:"Five consecutive positive adjustments signal sustained miner profitability despite the halved block subsidy. The difficulty ribbon has fully decompressed."},"block-fees":{measures:"Average transaction fees included per block, in BTC.",importance:"Tracks the critical transition from subsidy-dependent to fee-dependent miner security \u2014 one of Bitcoin's most important long-term metrics.",update:"Fees represent 5\u20138% of miner revenue on average days, spiking to 15\u201320% during inscription or Runes activity. Still far from fee sustainability, but the trajectory is encouraging."},hashprice:{measures:"Estimated daily USD revenue a miner earns per terahash of computational power deployed.",importance:"The single most important metric for miner economics. When hash price falls below production cost, capitulation follows.",update:"Hash price bottomed at $0.035 in late 2025 and has recovered above the psychological $0.045 threshold. Miners running S21-class hardware are now comfortably profitable."},"active-addresses":{measures:"The number of unique Bitcoin addresses that appeared in at least one transaction on a given day.",importance:"A rough proxy for network usage. Rising active addresses during price increases suggests organic demand rather than speculative leverage.",update:"Active addresses crossed 1M/day in June \u2014 a threshold last seen during the 2021 bull market. Fewer exchange addresses, more self-custody and Lightning channel opens this time."},"lth-supply":{measures:"Total Bitcoin held by addresses that haven't transacted in more than 155 days.",importance:"Measures conviction. When LTH supply rises during price increases, it signals accumulation \u2014 not distribution.",update:"Long-term holders now control over 75% of supply \u2014 the highest ratio ever recorded during an uptrend. Structurally different from 2021, where distribution began much earlier."},"exchange-balance":{measures:"Aggregate Bitcoin balance held across known exchange wallets.",importance:"Declining exchange balances suggest coins moving to self-custody \u2014 a supply squeeze signal. Rising balances suggest potential sell pressure.",update:"Exchange balances continue their multi-year decline. The ETF effect amplifies this: institutional buyers custody through regulated custodians, not exchange hot wallets."},nvt:{measures:"Market cap divided by daily on-chain transaction volume in USD. Think of it as a P/E ratio for Bitcoin.",importance:"High NVT = the network is valued richly relative to usage. Low NVT = undervalued or usage is spiking.",update:"NVT in the 60\u201375 range at this price level suggests the rally is fundamentally supported by on-chain activity, not pure speculation."},"mempool-size":{measures:"Total size of unconfirmed transactions waiting in the mempool, measured in virtual megabytes.",importance:"The most immediate indicator of network congestion and fee pressure. A full mempool means fee competition is live.",update:"The mempool has been oscillating between 20\u201360 MB through Q2 2026. No extreme congestion events since the Runes launch spike."},"fee-rates":{measures:"The fee rate in sat/vB required to be included in the next block vs. lower priority tiers.",importance:"Fee rates directly impact user experience. Understanding the distribution helps users choose the right fee for their urgency.",update:"Fee rates have stabilized into a more predictable pattern than the chaotic 2024 Ordinals era. The spread between next-block and low-priority has narrowed."},"tx-per-second":{measures:"Average number of on-chain transactions confirmed per second over a rolling 24-hour window.",importance:"Bitcoin's base layer throughput is deliberately limited. This metric contextualizes the need for Layer 2 solutions.",update:"Bitcoin consistently processes 5\u20137 tx/s on-chain \u2014 unchanged in years by design. This is precisely why Lightning, Ark, and other L2s exist."},"block-weight":{measures:"Average weight of mined blocks in million weight units. Max is 4 MWU. Measures how full the available block space is.",importance:"Consistently full blocks mean fee competition is structural, not temporary. Makes the block size debate concrete.",update:"Blocks running at 96% capacity is the new normal. Between financial transactions, inscriptions, and protocol-level data, the 4 MWU limit is tested daily."}};async function ie(e,t){let o=z.find(f=>f.id===e),n=Te[e]||{},i=document.querySelector(".ocm-detail-view");if(!o||!i)return;let s=i.querySelector(".ocm-breadcrumb-cat");s&&(s.textContent=ht(o.category)),D(i,".ocm-detail-title",o.title),D(i,".ocm-detail-subtitle",o.subtitle),D(i,".ocm-measures-text",n.measures||""),D(i,".ocm-importance-text",n.importance||""),D(i,".ocm-editorial-text",n.update||""),D(i,".ocm-sig-date",`Last updated ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`),i.querySelectorAll(".ocm-period-btn").forEach(f=>{f.classList.toggle("ocm-period-active",f.dataset.period===t)}),D(i,".ocm-reading-value","Loading\u2026");let r=i.querySelector(".ocm-detail-chart");r&&(r.innerHTML=`<p style="padding:20px;font-family:${l.body};color:${l.muted};font-style:italic">Loading chart\u2026</p>`);let{data:d,live:p}=await B(o.api),c=H(d,t),m=c[c.length-1],u=i.querySelector(".ocm-reading-value");u&&m&&(u.textContent=N(m.v,o.unit)+(p?"":" (demo data)")),r&&W(r,d,o,t),ut(i,o)}function ut(e,t){let o=e.querySelector(".ocm-related-grid");o&&(o.innerHTML="",z.filter(n=>n.category===t.category&&n.id!==t.id).slice(0,4).forEach(n=>{let i=document.createElement("div");i.style.cssText="padding:14px 16px;cursor:pointer;transition:background 0.15s",i.innerHTML=`
        <h3 style="font-family:${l.heading};font-size:14px;font-weight:500;margin:0 0 4px">${n.title}</h3>
        <p style="font-size:12px;color:${l.muted};margin:0;font-style:italic;font-family:${l.body}">${n.subtitle}</p>
      `,i.addEventListener("click",()=>{document.dispatchEvent(new CustomEvent("ocm:openChart",{detail:n.id}))}),i.addEventListener("mouseenter",()=>i.style.background="rgba(128,128,128,0.08)"),i.addEventListener("mouseleave",()=>i.style.background=""),o.appendChild(i)}))}function D(e,t,o){let n=e.querySelector(t);n&&(n.textContent=o)}function ht(e){return e.replace("-"," ").toUpperCase()}var ft=45e3,g=10,Ee=[],Be=[];function Fe(){let e=document.querySelector(".ocm-data-hero")||document.querySelector(".ocm-gallery-view");if(!e||!e.parentElement)return;let t=document.createElement("div");t.className="ocm-blockstrip",e.parentElement.insertBefore(t,e);let o=async()=>{let[{data:n},{data:i}]=await Promise.all([de(),pe()]);Ee=n.slice(0,3).map((s,r)=>({...s,_index:r})),Be=i.slice(0,15),gt(t)};o(),setInterval(o,ft)}function gt(e){e.innerHTML="",[...Ee].reverse().forEach(o=>{e.appendChild(Me("pending",{fee:o.medianFee,range:o.feeRange,fees:o.totalFees,txs:o.nTx,size:o.blockSize,meta:`in ~${(o._index+1)*10} min`}))});let t=document.createElement("div");t.className="ocm-blockstrip-divider",t.appendChild(yt()),e.appendChild(t),Be.forEach(o=>{e.appendChild(Me("confirmed",{fee:o.extras.medianFee,range:o.extras.feeRange,fees:o.extras.totalFees,txs:o.tx_count,size:o.size,meta:`${o.height.toLocaleString("en-US")} \xB7 ${me(o.timestamp)} \xB7 ${o.extras.pool.name}`}))}),e.appendChild(xt())}function yt(){let e=a("svg",{viewBox:"0 0 750 750",width:"32",height:"32",fill:"currentColor"});return e.appendChild(a("path",{d:"M 99.796875 337.5 C 75.007812 403.238281 76.148438 464.222656 83.519531 508.835938 C 96.296875 463.699219 114.085938 420.121094 136.539062 379.023438 C 156.53125 342.421875 180.320312 307.730469 207.234375 275.769531 L 162.644531 234.496094 C 135.257812 265.027344 114.082031 299.625 99.796875 337.5 Z"})),e.appendChild(a("path",{d:"M 378.777344 136.789062 C 419.863281 114.347656 463.441406 96.550781 508.597656 83.761719 C 463.976562 76.394531 402.984375 75.257812 337.257812 100.042969 C 299.386719 114.320312 264.789062 135.496094 234.253906 162.890625 L 275.523438 207.480469 C 307.484375 180.566406 342.183594 156.769531 378.777344 136.789062 Z"})),e.appendChild(a("path",{d:"M 667.679688 641.664062 L 289.960938 263.953125 L 263.707031 290.210938 L 641.425781 667.921875 C 648.433594 674.9375 660.664062 674.9375 667.683594 667.921875 C 674.917969 660.683594 674.917969 648.902344 667.679688 641.664062 Z"})),e.appendChild(a("path",{d:"M 209.78125 150.789062 C 192.59375 156.628906 180.5 166.261719 173.257812 173.503906 C 160.660156 186.101562 154.011719 199.859375 150.546875 210.027344 L 165.585938 223.949219 L 243.804688 296.335938 L 253.375 286.761719 L 296.09375 244.039062 Z"})),e}function xt(){let e=document.createElement("a");e.className="ocm-block-cube ocm-block-explorer",e.href="https://mempool.space",e.target="_blank",e.rel="noopener noreferrer";let t=a("svg",{class:"ocm-block-cube-bg",viewBox:"0 0 100 100",preserveAspectRatio:"none"}),o=l.textAdaptive;t.appendChild(a("polygon",{points:`0,${g} ${g},0 100,0 ${100-g},${g}`,style:`fill:none; stroke:${o}; stroke-width:0.7; opacity:0.5;`})),t.appendChild(a("polygon",{points:`${100-g},${g} 100,0 100,${100-g} ${100-g},100`,style:`fill:none; stroke:${o}; stroke-width:0.7; opacity:0.5;`})),t.appendChild(a("polygon",{points:`0,${g} ${100-g},${g} ${100-g},100 0,100`,style:`fill:none; stroke:${o}; stroke-width:0.7; stroke-dasharray:3,3; opacity:0.5;`})),e.appendChild(t);let n=document.createElement("div");return n.className="ocm-block-explorer-content",n.innerHTML=`
    <p style="font-family:${l.heading};font-size:13px;font-weight:600;color:${l.textAdaptive};margin:0 0 4px;opacity:0.5;">Explorer</p>
    <p style="font-family:${l.heading};font-size:15px;font-weight:600;color:${l.textAdaptive};margin:0;">mempool</p>
    <p style="font-family:${l.heading};font-size:15px;font-weight:600;color:${l.accent};margin:0;">.space \u2192</p>
  `,e.appendChild(n),e}function Me(e,t){let o=document.createElement("div");o.className=`ocm-block-cube ocm-block-cube--${e}`;let n=e==="confirmed",i=n?l.textAdaptive:"none",s=l.textAdaptive,r=a("svg",{class:"ocm-block-cube-bg",viewBox:"0 0 100 100",preserveAspectRatio:"none"});r.appendChild(a("polygon",{points:`0,${g} ${g},0 100,0 ${100-g},${g}`,style:`fill: ${n?l.textAdaptive:"none"}; opacity: ${n?"0.8":"1"}; stroke: ${s}; stroke-width: 1;`})),r.appendChild(a("polygon",{points:`${100-g},${g} 100,0 100,${100-g} ${100-g},100`,style:`fill: ${n?l.textAdaptive:"none"}; opacity: ${n?"0.6":"1"}; stroke: ${s}; stroke-width: 1;`})),r.appendChild(a("polygon",{points:`0,${g} ${100-g},${g} ${100-g},100 0,100`,style:`fill: ${i}; stroke: ${s}; stroke-width: 1;`})),o.appendChild(r);let d=document.createElement("div");d.className="ocm-block-cube-content";let p=t.range[0],c=t.range[t.range.length-1];return d.innerHTML=`
    <p class="ocm-bc-fee">~${Math.round(t.fee)} sat/vB</p>
    <p class="ocm-bc-range">${p.toFixed(2)} - ${c.toFixed(0)} sat/vB</p>
    <div class="ocm-bc-row"><span>Total fees</span><span>${(t.fees/1e8).toFixed(3)} BTC</span></div>
    <div class="ocm-bc-row"><span>Transactions</span><span>${t.txs.toLocaleString("en-US")}</span></div>
    <div class="ocm-bc-row"><span>Size</span><span>${(t.size/1e6).toFixed(1)} MB</span></div>
    <p class="ocm-bc-meta">${t.meta}</p>
  `,o.appendChild(d),o}var Z=null,Y="1Y",K=document.querySelector(".ocm-gallery-view"),J=document.querySelector(".ocm-detail-view");function bt(){K&&(K.style.display=""),J&&(J.style.display="none"),Z=null,window.scrollTo({top:0,behavior:"smooth"})}async function Le(e){Z=e,Y="1Y",K&&(K.style.display="none"),J&&(J.style.display=""),window.scrollTo({top:0,behavior:"smooth"}),await ie(e,Y)}function vt(){document.querySelectorAll(".ocm-period-btn").forEach(e=>{e.addEventListener("click",async()=>{Y=e.dataset.period,Z&&await ie(Z,Y)})})}function wt(){let e=document.querySelector(".ocm-back-btn");e&&e.addEventListener("click",bt)}document.addEventListener("ocm:openChart",e=>Le(e.detail));async function Ae(){vt(),wt(),Fe(),await ke(Le)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ae):Ae();})();
