/* Off-Chain Media — Bitcoin Data Library v0.2.0 | offchain.media/data */
var OCMData=(()=>{var R=[{id:"btc-price",title:"Bitcoin Price",subtitle:"BTC/USD spot price",category:"market",type:"line",api:"price",unit:"$",source:"CoinGecko"},{id:"market-cap",title:"Market Capitalization",subtitle:"Total BTC market value",category:"market",type:"area",api:"marketcap",unit:"$T",source:"CoinGecko"},{id:"volume",title:"24h Trading Volume",subtitle:"Aggregate spot volume",category:"market",type:"bar",api:"volume",unit:"$B",source:"CoinGecko"},{id:"dominance",title:"BTC Dominance",subtitle:"Share of total crypto market cap",category:"market",type:"line",api:"dominance",unit:"%",source:"CoinGecko"},{id:"hashrate",title:"Network Hashrate",subtitle:"Total computational power",category:"mining",type:"line",api:"hashrate",unit:"EH/s",source:"mempool.space"},{id:"difficulty",title:"Mining Difficulty",subtitle:"Adjusted every 2,016 blocks",category:"mining",type:"line",api:"difficulty",unit:"T",source:"mempool.space"},{id:"block-fees",title:"Block Fees",subtitle:"Average fees per block",category:"mining",type:"bar",api:"fees",unit:"BTC",source:"mempool.space"},{id:"hashprice",title:"Hash Price",subtitle:"Daily revenue per TH/s",category:"mining",type:"line",api:"hashprice",unit:"$/TH",source:"mempool.space"},{id:"active-addresses",title:"Active Addresses",subtitle:"Unique addresses used daily",category:"on-chain",type:"area",api:"addresses",unit:"K",source:"Coin Metrics"},{id:"lth-supply",title:"Long-Term Holder Supply",subtitle:"BTC held >155 days",category:"on-chain",type:"area",api:"lth",unit:"M BTC",source:"Glassnode"},{id:"exchange-balance",title:"Exchange Balances",subtitle:"Total BTC on exchanges",category:"on-chain",type:"line",api:"exchange",unit:"M BTC",source:"Coin Metrics"},{id:"nvt",title:"NVT Ratio",subtitle:"Network Value to Transactions",category:"on-chain",type:"line",api:"nvt",unit:"",source:"Glassnode"},{id:"mempool-size",title:"Mempool Size",subtitle:"Pending transactions in vBytes",category:"mempool",type:"area",api:"mempool",unit:"MB",source:"mempool.space"},{id:"fee-rates",title:"Fee Rate Distribution",subtitle:"sat/vB by confirmation priority",category:"mempool",type:"bar",api:"feerates",unit:"sat/vB",source:"mempool.space"},{id:"tx-per-second",title:"Transactions Per Second",subtitle:"On-chain throughput",category:"mempool",type:"line",api:"tps",unit:"tx/s",source:"Coin Metrics"},{id:"block-weight",title:"Average Block Weight",subtitle:"How full are Bitcoin blocks?",category:"mempool",type:"bar",api:"blockweight",unit:"MWU",source:"mempool.space"}];var l={accent:"#F7931A",ink:"#1a1a1a",paper:"#FAF7F1",muted:"rgba(128,128,128,0.5)",grid:"rgba(128,128,128,0.12)",heading:"'Oswald', 'Arial Narrow', sans-serif",body:"'Spectral', Georgia, serif",line:"light-dark(#1a1a1a, #f2f2f2)",lineFill:"light-dark(#1a1a1a, #f2f2f2)",shadow:"light-dark(rgba(0,0,0,0.32), rgba(255,255,255,0.20))",textAdaptive:"light-dark(#1a1a1a, #ffffff)",textAdaptiveInverse:"light-dark(#ffffff, #1a1a1a)",textAdaptiveMuted:"light-dark(rgba(26,26,26,0.55), rgba(255,255,255,0.55))"},ae={"1D":24,"1W":7,"1M":30,"3M":90,"1Y":365,ALL:730};var T="https://ocm-proxy.mariusoffchain.workers.dev",ne="",Me="https://community-api.coinmetrics.io/v4/timeseries/asset-metrics",Be=3.125,Fe=144,F={};function y(e,t,o,i,a){let s=o,n=e,d=Date.now();return Array.from({length:t},(h,c)=>(n=(n*9301+49297)%233280,s+=Math.sin(c*.5+e)*i+a,s=Math.max(o*.3,s),{ts:d-(t-c)*864e5,v:s}))}var re={price:()=>y(5,365,85e3,4e3,120),marketcap:()=>y(7,365,16e11,8e10,3e9),volume:()=>y(13,365,35e9,8e9,1e8),dominance:()=>y(6,365,55,3,.02),hashrate:()=>y(3,365,600,25,.6),difficulty:()=>y(9,52,80,5,.15),fees:()=>y(11,90,.15,.05,.001),hashprice:()=>y(12,180,.042,.008,1e-4),addresses:()=>y(14,365,9e5,8e4,500),lth:()=>y(13,365,14.2,.3,.003),exchange:()=>y(15,365,2.8,.04,-.001),nvt:()=>y(16,365,65,8,.02),mempool:()=>y(17,90,35,18,.05),feerates:()=>y(18,90,15,10,.02),tps:()=>y(19,90,5.5,1,.002),blockweight:()=>y(20,90,3.7,.2,.001)};function U(e){let t=new Map;for(let{ts:o,v:i}of e){let a=Math.floor(o/864e5),s=t.get(a)||{sum:0,n:0};s.sum+=i,s.n+=1,t.set(a,s)}return[...t.entries()].sort((o,i)=>o[0]-i[0]).map(([o,{sum:i,n:a}])=>({ts:o*864e5,v:i/a}))}async function Se(){let e=await fetch(`${T}/api/v1/mining/hashrate/1y`);if(!e.ok)throw new Error(`hashrate HTTP ${e.status}`);return(await e.json()).hashrates.map(o=>({ts:o.timestamp*1e3,v:o.avgHashrate/1e18}))}async function _e(){let e=await fetch(`${T}/api/v1/mining/difficulty-adjustments/1y`);if(!e.ok)throw new Error(`difficulty HTTP ${e.status}`);return(await e.json()).map(([o,,i])=>({ts:o*1e3,v:i/1e12})).sort((o,i)=>o.ts-i.ts)}async function Le(){let e=await fetch(`${T}/api/v1/mining/blocks/fees/1y`);if(!e.ok)throw new Error(`fees HTTP ${e.status}`);let t=await e.json();return U(t.map(o=>({ts:o.timestamp*1e3,v:o.avgFees/1e8})))}async function De(){let e=await fetch(`${T}/api/v1/mining/blocks/fee-rates/1y`);if(!e.ok)throw new Error(`feerates HTTP ${e.status}`);let t=await e.json();return U(t.map(o=>({ts:o.timestamp*1e3,v:o.avgFee_50})))}async function Pe(){let e=await fetch(`${T}/api/v1/statistics/1y`);if(!e.ok)throw new Error(`mempool HTTP ${e.status}`);let t=await e.json();return U(t.map(o=>({ts:o.added*1e3,v:o.vsizes.reduce((i,a)=>i+a,0)/1e6})))}async function ze(){let e=await fetch(`${T}/api/v1/mining/blocks/sizes-weights/1y`);if(!e.ok)throw new Error(`blockweight HTTP ${e.status}`);let t=await e.json();return U(t.weights.map(o=>({ts:o.timestamp*1e3,v:o.avgWeight/1e6})))}async function Z(e){let t=new Date,o=new Date(t-370*864e5),i=`${Me}?assets=btc&metrics=${e}&frequency=1d&start_time=${o.toISOString().slice(0,10)}&end_time=${t.toISOString().slice(0,10)}&page_size=10000`,a=await fetch(i);if(!a.ok)throw new Error(`${e} HTTP ${a.status}`);return(await a.json()).data.map(n=>({ts:new Date(n.time).getTime(),v:parseFloat(n[e])}))}async function He(){return(await Z("AdrActCnt")).map(({ts:e,v:t})=>({ts:e,v:t/1e3}))}async function Re(){return(await Z("TxCnt")).map(({ts:e,v:t})=>({ts:e,v:t/86400}))}async function je(){return(await Z("SplyExNtv")).map(({ts:e,v:t})=>({ts:e,v:t/1e6}))}async function Ge(){let[{data:e},{data:t},{data:o}]=await Promise.all([$("fees"),$("hashrate"),$("price")]),i=new Map(t.map(s=>[Math.floor(s.ts/864e5),s.v])),a=new Map(o.map(s=>[Math.floor(s.ts/864e5),s.v]));return e.map(({ts:s,v:n})=>{let d=Math.floor(s/864e5),h=i.get(d),c=a.get(d);if(h==null||c==null)return null;let p=Fe*(Be+n)*c;return{ts:s,v:p/(h*1e6)}}).filter(Boolean)}function Ie(){return[{medianFee:2.1,feeRange:[1,1.2,1.3,2,2.7,4,201],nTx:4327,totalFees:25e5,blockSize:2054070},{medianFee:1.4,feeRange:[.5,.6,.7,1,1.5,2.2,150],nTx:6755,totalFees:16e5,blockSize:1997e3},{medianFee:.6,feeRange:[.36,.4,.42,.5,.7,1,45],nTx:5777,totalFees:95e4,blockSize:1584123}]}function qe(){let e=["F2Pool","Foundry USA","Luxor","AntPool","ViaBTC","\u24C8BTC.com"],t=Date.now();return Array.from({length:6},(o,i)=>({height:957896-i,timestamp:Math.floor((t-i*9.7*6e4)/1e3),tx_count:4362-i*235,size:1561683+i*12e3,extras:{medianFee:1.1+i*.1,feeRange:[.55-i*.02,.7,1,2,3,5,161-i*10],totalFees:1883531-i*9e4,pool:{name:e[i%e.length]}}}))}async function se(){try{let e=await fetch(`${T}/api/v1/fees/mempool-blocks`);if(!e.ok)throw new Error(`mempool-blocks HTTP ${e.status}`);return{data:await e.json(),live:!0}}catch(e){return console.warn('[data] Falling back to mock for "mempool-blocks":',e.message),{data:Ie(),live:!1}}}async function ce(){try{let e=await fetch(`${T}/api/v1/blocks`);if(!e.ok)throw new Error(`blocks HTTP ${e.status}`);return{data:await e.json(),live:!0}}catch(e){return console.warn('[data] Falling back to mock for "blocks":',e.message),{data:qe(),live:!1}}}function le(e){let t=Math.max(0,Math.round((Date.now()-e*1e3)/6e4));return t<1?"just now":t<60?`${t} min ago`:`${Math.round(t/60)}h ago`}async function X(){if(F._market)return F._market;let e=ne?`&x_cg_demo_api_key=${ne}`:"",t=await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily${e}`);if(!t.ok)throw new Error(`CoinGecko HTTP ${t.status}`);let o=await t.json();return F._market={price:o.prices.map(([i,a])=>({ts:i,v:a})),marketcap:o.market_caps.map(([i,a])=>({ts:i,v:a/1e12})),volume:o.total_volumes.map(([i,a])=>({ts:i,v:a/1e9}))},F._market}var Ne={hashrate:Se,difficulty:_e,fees:Le,feerates:De,mempool:Pe,blockweight:ze,addresses:He,tps:Re,exchange:je,hashprice:Ge,price:async()=>(await X()).price,marketcap:async()=>(await X()).marketcap,volume:async()=>(await X()).volume};async function $(e){if(F[e])return{data:F[e],live:!0};let t=Ne[e];if(t)try{let i=await t();return F[e]=i,{data:i,live:!0}}catch(i){console.warn(`[data] Falling back to mock for "${e}":`,i.message)}return{data:(re[e]||re.price)(),live:!1}}function j(e,t){let o=ae[t]??e.length;return e.slice(-Math.min(o,e.length))}function S(e,t){return t==="$"?e>=1e3?`$${(e/1e3).toFixed(0)}k`:`$${e.toFixed(0)}`:t==="$T"?`$${e.toFixed(2)}T`:t==="$B"?`$${e.toFixed(1)}B`:t==="EH/s"?`${e.toFixed(1)} EH/s`:t==="%"?`${e.toFixed(1)}%`:t==="M BTC"?`${e.toFixed(2)}M BTC`:t==="K"?`${(e/1e3).toFixed(0)}K`:t==="BTC"?`${e.toFixed(3)} BTC`:t==="T"?`${e.toFixed(1)}T`:e!=null?`${e.toFixed(2)}${t?" "+t:""}`:"\u2014"}function de(e,t){return e==null?"\u2014":t==="$"?`$${Math.round(e).toLocaleString("en-US")}`:t==="BTC"?`${e.toFixed(4)} BTC`:t==="K"?Math.round(e).toLocaleString("en-US"):S(e,t)}function pe(e){return new Date(e).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}function me(e){let t=e;return()=>(t=(t*9301+49297)%233280,t/233280)}function r(e,t={}){let o=document.createElementNS("http://www.w3.org/2000/svg",e);return Object.entries(t).forEach(([i,a])=>o.setAttribute(i,a)),o}function ee(e,t=1,o=1){let i=me(o),a=e.map(n=>({x:n.x+(i()-.5)*t,y:n.y+(i()-.5)*t}));if(a.length<2)return"";let s=`M${a[0].x.toFixed(2)},${a[0].y.toFixed(2)}`;for(let n=0;n<a.length-1;n++){let d=a[Math.max(0,n-1)],h=a[n],c=a[n+1],p=a[Math.min(a.length-1,n+2)],u=h.x+(c.x-d.x)/6,f=h.y+(c.y-d.y)/6,x=c.x-(p.x-h.x)/6,g=c.y-(p.y-h.y)/6;s+=` C${u.toFixed(2)},${f.toFixed(2)} ${x.toFixed(2)},${g.toFixed(2)} ${c.x.toFixed(2)},${c.y.toFixed(2)}`}return s}function ue(e,t,o){let i=me(Math.round(e+t)),a=i()*Math.PI,s=[];for(let n=0;n<=Math.PI*2*1.15;n+=.3){let d=o+(i()-.5)*1.5;s.push(`${(e+Math.cos(n+a)*d).toFixed(1)},${(t+Math.sin(n+a)*d).toFixed(1)}`)}return"M"+s.join(" L")}function he(e,t,o,i){let a=e.map(c=>c.v),s=Math.min(...a),n=Math.max(...a),d=n-s||1;return{points:e.map((c,p)=>({x:t.left+p/(e.length-1)*o,y:t.top+i-(c.v-s)/d*i,d:c})),min:s,max:n,range:d}}var E=680,_=380,m={top:52,right:20,bottom:46,left:52},L=E-m.left-m.right,b=_-m.top-m.bottom,Oe=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],te=5;function V(e,t,o,i){e.innerHTML="";let a=j(t,i);if(!a.length)return;let{points:s,min:n,max:d,range:h}=he(a,m,L,b),c=r("svg",{width:"100%",viewBox:`0 0 ${E} ${_}`,style:"display:block"}),p=r("defs"),u=r("filter",{id:"ocm-rough",x:"-5%",y:"-5%",width:"110%",height:"110%"}),f=r("feTurbulence",{type:"fractalNoise",baseFrequency:"0.012",numOctaves:"2",seed:"4",result:"n"}),x=r("feDisplacementMap",{in:"SourceGraphic",in2:"n",scale:"2",xChannelSelector:"R",yChannelSelector:"G"});u.appendChild(f),u.appendChild(x),p.appendChild(u);let g=r("filter",{id:"ocm-drop",x:"-20%",y:"-20%",width:"140%",height:"140%"}),k=r("feGaussianBlur",{in:"SourceAlpha",stdDeviation:"3",result:"blur"}),A=r("feOffset",{in:"blur",dx:"2",dy:"4",result:"off"}),C=r("feFlood",{style:`flood-color: ${l.shadow}`,result:"floodColor"}),Q=r("feComposite",{in:"floodColor",in2:"off",operator:"in",result:"sh"}),G=r("feMerge");G.appendChild(r("feMergeNode",{in:"sh"})),G.appendChild(r("feMergeNode",{in:"SourceGraphic"})),g.appendChild(k),g.appendChild(A),g.appendChild(C),g.appendChild(Q),g.appendChild(G),p.appendChild(g);let w=r("linearGradient",{id:"ocm-vol",x1:"0",y1:"0",x2:"0",y2:"1"});w.appendChild(r("stop",{offset:"0%",style:`stop-color: ${l.lineFill}`,"stop-opacity":"0.22"})),w.appendChild(r("stop",{offset:"100%",style:`stop-color: ${l.lineFill}`,"stop-opacity":"0.02"})),p.appendChild(w);let P=r("linearGradient",{id:"ocm-ridge",x1:"0",y1:"0",x2:"0",y2:"1"});P.appendChild(r("stop",{offset:"0%","stop-color":"#fff","stop-opacity":"0.30"})),P.appendChild(r("stop",{offset:"15%","stop-color":"#fff","stop-opacity":"0"})),p.appendChild(P);let z=r("clipPath",{id:"ocm-clip"});z.appendChild(r("rect",{x:m.left,y:m.top,width:L,height:b})),p.appendChild(z),c.appendChild(p),c.appendChild(r("rect",{width:E,height:_,fill:"transparent"}));for(let M=0;M<=te;M++){let N=m.top+M/te*b,B=d-M/te*h;c.appendChild(r("line",{x1:m.left,y1:N,x2:m.left+L,y2:N,stroke:l.grid,"stroke-width":"0.7","stroke-linecap":"round"}));let O=r("text",{x:m.left-8,y:N+4,"text-anchor":"end","font-family":l.body,"font-size":"12",fill:"rgba(128,128,128,0.65)","font-style":"italic"});O.textContent=B>1e9?`${(B/1e9).toFixed(0)}B`:B>1e6?`${(B/1e6).toFixed(0)}M`:B.toFixed(1),c.appendChild(O)}c.appendChild(r("line",{x1:m.left,y1:m.top+b,x2:m.left+L,y2:m.top+b,stroke:"rgba(128,128,128,0.28)","stroke-width":"1","stroke-linecap":"round"})),[0,.25,.5,.75,1].forEach(M=>{let N=Math.round(M*(a.length-1)),B=m.left+M*L,O=new Date(a[N]?.ts||Date.now()).getMonth(),ie=r("text",{x:B,y:m.top+b+18,"text-anchor":"middle","font-family":l.body,"font-size":"12",fill:"rgba(128,128,128,0.6)","font-style":"italic"});ie.textContent=Oe[O],c.appendChild(ie)}),o.type==="bar"?Ue(c,p,a,n,h):Ve(c,s,t,o,a);let H=r("text",{x:E/2,y:m.top+b/2+8,"text-anchor":"middle","font-family":l.heading,"font-size":"18","font-weight":"600",fill:l.ink,opacity:"0.04","letter-spacing":"0.18em"});H.textContent="OFF-CHAIN MEDIA",c.appendChild(H),c.appendChild(r("line",{x1:0,y1:_-14,x2:E,y2:_-14,stroke:l.ink,"stroke-width":"0.5",opacity:"0.3"}));let I=r("text",{x:m.left,y:_-4,"font-family":l.body,"font-size":"9",fill:"rgba(128,128,128,0.4)","font-style":"italic"});I.textContent=`Source: ${o.source}`,c.appendChild(I);let q=r("text",{x:E-m.right,y:_-4,"text-anchor":"end","font-family":l.heading,"font-size":"8",fill:"rgba(128,128,128,0.35)","letter-spacing":"0.1em"});q.textContent="OFFCHAIN.MEDIA/DATA",c.appendChild(q),e.appendChild(c)}function Ue(e,t,o,i,a){let n=(L-3*(o.length-1))/Math.max(o.length,1),d=r("g",{filter:"url(#ocm-rough)"});o.forEach((h,c)=>{let p=(h.v-i)/a*b,u=m.left+c*(n+3),f=m.top+b-p,x=c===o.length-1,g=x?l.accent:l.line,k=`ocm-bv-${c}`,A=r("linearGradient",{id:k,x1:"0",y1:"0",x2:"0",y2:"1"});A.appendChild(r("stop",{offset:"0%",style:`stop-color: ${g}`,"stop-opacity":x?"1":"0.85"})),A.appendChild(r("stop",{offset:"100%",style:`stop-color: ${g}`,"stop-opacity":x?"0.75":"0.6"})),t.appendChild(A);let C=r("g",{filter:"url(#ocm-drop)"});C.appendChild(r("rect",{x:u,y:f,width:n,height:p,rx:"1.5",fill:`url(#${k})`})),C.appendChild(r("rect",{x:u,y:f,width:n,height:Math.min(p,16),rx:"1.5",fill:"rgba(255,255,255,0.28)"})),d.appendChild(C)}),e.appendChild(d)}function Ve(e,t,o,i,a){let s=ee(t,1,3),n=`${s} L${t[t.length-1].x},${m.top+b} L${t[0].x},${m.top+b} Z`,d=r("g",{"clip-path":"url(#ocm-clip)"});d.appendChild(r("path",{d:n,fill:"url(#ocm-vol)"})),d.appendChild(r("path",{d:n,fill:"url(#ocm-ridge)"})),e.appendChild(d);let h=r("g",{filter:"url(#ocm-rough)","clip-path":"url(#ocm-clip)"});h.appendChild(r("path",{d:s,fill:"none",style:`stroke: ${l.line}`,"stroke-width":"2.2","stroke-linecap":"round","stroke-linejoin":"round",filter:"url(#ocm-drop)"})),t.length>12&&h.appendChild(r("path",{d:ee(t.slice(-12),1,4),fill:"none",stroke:l.accent,"stroke-width":"2.5","stroke-linecap":"round",filter:"url(#ocm-drop)"})),e.appendChild(h);let c=t[t.length-1];c&&(e.appendChild(r("circle",{cx:c.x,cy:c.y,r:"4",fill:l.accent})),e.appendChild(r("path",{d:ue(c.x,c.y,9),fill:"none",stroke:l.accent,"stroke-width":"1.2",opacity:"0.6","stroke-linecap":"round"})));let p=r("line",{x1:0,y1:m.top,x2:0,y2:m.top+b,stroke:l.accent,"stroke-width":"0.7","stroke-dasharray":"3,3",opacity:"0","pointer-events":"none"});e.appendChild(p);let u=r("g",{opacity:"0","pointer-events":"none"}),f=r("rect",{x:0,y:0,width:130,height:42,rx:"2",fill:l.ink}),x=r("text",{x:10,y:14,"font-family":l.body,"font-size":"10",fill:"rgba(255,255,255,0.55)","font-style":"italic"}),g=r("text",{x:10,y:32,"font-family":l.heading,"font-size":"14","font-weight":"600",fill:"#fff"});u.appendChild(f),u.appendChild(x),u.appendChild(g),e.appendChild(u);let k=r("rect",{x:m.left,y:m.top,width:L,height:b,fill:"transparent",style:"cursor:crosshair"});k.addEventListener("mousemove",A=>{let C=e.getBoundingClientRect(),Q=E/C.width,G=(A.clientX-C.left)*Q,w=t[0],P=1/0;t.forEach(I=>{let q=Math.abs(I.x-G);q<P&&(P=q,w=I)}),p.setAttribute("x1",w.x),p.setAttribute("x2",w.x),p.setAttribute("opacity","0.5");let z=Math.min(w.x+8,E-140),H=Math.max(w.y-52,m.top);f.setAttribute("x",z),f.setAttribute("y",H),x.setAttribute("x",z+10),x.setAttribute("y",H+14),g.setAttribute("x",z+10),g.setAttribute("y",H+32),x.textContent=pe(w.d.ts),g.textContent=S(w.d.v,i.unit),u.setAttribute("opacity","1")}),k.addEventListener("mouseleave",()=>{p.setAttribute("opacity","0"),u.setAttribute("opacity","0")}),e.appendChild(k)}function fe(e){let t=document.querySelector(".ocm-gallery-view"),o=document.querySelectorAll(".ocm-data-filters .ocm-filter-btn");if(!t||!o.length)return null;let i=document.createElement("nav");i.className="ocm-sidebar";let a=[...o].map(s=>{let n=document.createElement("div");return n.className="ocm-sidebar-item",n.textContent=s.textContent.trim(),n.dataset.filter=s.dataset.filter,s.classList.contains("ocm-filter-active")&&n.classList.add("ocm-sidebar-active"),n.addEventListener("click",()=>{a.forEach(d=>d.classList.remove("ocm-sidebar-active")),n.classList.add("ocm-sidebar-active"),e(n.dataset.filter)}),i.appendChild(n),n});return t.insertBefore(i,t.firstChild),i}var ge=!1;function ye(){if(ge)return;ge=!0;let e=document.createElement("style");e.textContent=`
    .ocm-data-filters { display: none !important; }
    .ocm-data-hero { display: none !important; }

    .ocm-blockstrip {
      display: flex;
      align-items: stretch;
      gap: 18px;
      overflow-x: auto;
      padding: 24px 4px 28px;
      margin-bottom: 8px;
    }

    .ocm-blockstrip-divider {
      flex: 0 0 auto;
      align-self: center;
      display: flex;
      align-items: center;
      color: ${l.textAdaptiveMuted};
      font-size: 20px;
      padding: 0 16px;
    }
    .ocm-blockstrip-divider::before { content: '\u26CF\uFE0F'; }

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
  `,document.head.appendChild(e)}var We=["3M","1Y","ALL"],xe="3M";async function be(e){ye(),Ye(),fe(ve),await Je(e)}function ve(e){document.querySelectorAll(".ocm-category-section").forEach(t=>{t.style.display=e==="all"||t.dataset.category===e?"":"none"})}function Ye(){let e=document.querySelectorAll(".ocm-filter-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(o=>o.classList.remove("ocm-filter-active")),t.classList.add("ocm-filter-active"),ve(t.dataset.filter)})})}async function Je(e){try{await $("price")}catch{}let t=document.querySelectorAll(".ocm-card"),o=new IntersectionObserver(Ke,{rootMargin:"200px 0px"});t.forEach(i=>{let a=i.dataset.chartId;if(!a||!R.find(n=>n.id===a))return;let s=i.querySelector(".ocm-see-more");s&&s.addEventListener("click",n=>{n.stopPropagation(),e(a)}),o.observe(i)})}function Ke(e,t){e.forEach(o=>{o.isIntersecting&&(t.unobserve(o.target),Qe(o.target))})}async function Qe(e){let t=e.dataset.chartId,o=R.find(u=>u.id===t);if(!o)return;let i=e.querySelector(".ocm-card-chart");if(!i)return;i.classList.add("ocm-card-chart-full");let{periodBar:a,headline:s}=Xe(e),{data:n,live:d}=await $(o.api),h=xe,c=n[n.length-1];c&&(s.textContent=de(c.v,o.unit)+(d?"":" (demo)"));let p=u=>{V(i,n,o,u);let f=j(n,u),x=f[f.length-1],g=e.querySelector(".ocm-card-reading");g&&x&&(g.textContent=S(x.v,o.unit)+(d?"":" (demo)"))};a.querySelectorAll(".ocm-card-period-btn").forEach(u=>{u.addEventListener("click",()=>{h=u.dataset.period,a.querySelectorAll(".ocm-card-period-btn").forEach(f=>f.classList.toggle("ocm-card-period-active",f===u)),p(h)})}),p(h)}function Xe(e){let t=e.querySelector(".ocm-card-meta"),o=document.createElement("div");o.className="ocm-card-toprow";let i=document.createElement("div");i.className="ocm-card-periods",We.forEach(s=>{let n=document.createElement("span");n.className="ocm-card-period-btn"+(s===xe?" ocm-card-period-active":""),n.textContent=s,n.dataset.period=s,i.appendChild(n)});let a=document.createElement("span");return a.className="ocm-card-headline",o.appendChild(i),o.appendChild(a),t?t.insertAdjacentElement("afterend",o):e.insertBefore(o,e.firstChild),{periodBar:i,headline:a}}var we={"btc-price":{measures:"The spot price of Bitcoin in USD, volume-weighted across major exchanges.",importance:"The most watched metric in Bitcoin. Price discovery reflects the aggregate conviction of every market participant \u2014 miners, holders, speculators, institutions.",update:"After consolidating in the $95k\u2013$105k range through Q1 2026, BTC broke above $108k in early July. The 200-day MA is now acting as support rather than resistance \u2014 a structural shift from the bear market regime."},"market-cap":{measures:"Total circulating supply \xD7 current price. A proxy for Bitcoin's weight relative to other global assets.",importance:"Contextualizes Bitcoin within the broader asset landscape. Useful for macro comparisons, though not all BTC is liquid.",update:"Bitcoin's market cap now exceeds $2 trillion, placing it firmly in the top 5 global assets by market value. The comparison with sovereign wealth and energy giants is no longer hypothetical."},volume:{measures:"Total spot trading volume aggregated across major exchanges over a rolling 24-hour window.",importance:"Volume validates price moves. High volume on a breakout signals conviction; low volume on a rally signals fragility.",update:"Volume trending higher since May, consistent with the price breakout above $105k. A significant share is now concentrated on regulated venues \u2014 a centralization vector worth watching."},dominance:{measures:"Bitcoin's market cap as a percentage of the total cryptocurrency market.",importance:"A proxy for capital rotation. Rising dominance signals risk-off behavior within crypto \u2014 capital fleeing altcoins back to BTC.",update:"Dominance climbing to multi-year highs driven by ETF inflows that benefit BTC exclusively and general disillusionment with altcoin narratives post-memecoin fatigue."},hashrate:{measures:"Estimated total computational power in exahashes per second dedicated to mining Bitcoin blocks.",importance:"Hashrate is the thermometer of miner conviction. Rising hashrate means miners are betting on Bitcoin's future \u2014 they've committed capital months in advance.",update:"Post-halving hashrate recovery has been faster than any previous cycle. The 812 EH/s reading reflects massive ASIC deployments in North America, the Gulf States, and parts of Latin America."},difficulty:{measures:"The target threshold that determines how hard it is to find a valid block hash. Recalibrates every ~2,016 blocks (~2 weeks).",importance:"Difficulty is Bitcoin's self-regulating immune system. It ensures blocks arrive every ~10 minutes regardless of hashpower fluctuations.",update:"Five consecutive positive adjustments signal sustained miner profitability despite the halved block subsidy. The difficulty ribbon has fully decompressed."},"block-fees":{measures:"Average transaction fees included per block, in BTC.",importance:"Tracks the critical transition from subsidy-dependent to fee-dependent miner security \u2014 one of Bitcoin's most important long-term metrics.",update:"Fees represent 5\u20138% of miner revenue on average days, spiking to 15\u201320% during inscription or Runes activity. Still far from fee sustainability, but the trajectory is encouraging."},hashprice:{measures:"Estimated daily USD revenue a miner earns per terahash of computational power deployed.",importance:"The single most important metric for miner economics. When hash price falls below production cost, capitulation follows.",update:"Hash price bottomed at $0.035 in late 2025 and has recovered above the psychological $0.045 threshold. Miners running S21-class hardware are now comfortably profitable."},"active-addresses":{measures:"The number of unique Bitcoin addresses that appeared in at least one transaction on a given day.",importance:"A rough proxy for network usage. Rising active addresses during price increases suggests organic demand rather than speculative leverage.",update:"Active addresses crossed 1M/day in June \u2014 a threshold last seen during the 2021 bull market. Fewer exchange addresses, more self-custody and Lightning channel opens this time."},"lth-supply":{measures:"Total Bitcoin held by addresses that haven't transacted in more than 155 days.",importance:"Measures conviction. When LTH supply rises during price increases, it signals accumulation \u2014 not distribution.",update:"Long-term holders now control over 75% of supply \u2014 the highest ratio ever recorded during an uptrend. Structurally different from 2021, where distribution began much earlier."},"exchange-balance":{measures:"Aggregate Bitcoin balance held across known exchange wallets.",importance:"Declining exchange balances suggest coins moving to self-custody \u2014 a supply squeeze signal. Rising balances suggest potential sell pressure.",update:"Exchange balances continue their multi-year decline. The ETF effect amplifies this: institutional buyers custody through regulated custodians, not exchange hot wallets."},nvt:{measures:"Market cap divided by daily on-chain transaction volume in USD. Think of it as a P/E ratio for Bitcoin.",importance:"High NVT = the network is valued richly relative to usage. Low NVT = undervalued or usage is spiking.",update:"NVT in the 60\u201375 range at this price level suggests the rally is fundamentally supported by on-chain activity, not pure speculation."},"mempool-size":{measures:"Total size of unconfirmed transactions waiting in the mempool, measured in virtual megabytes.",importance:"The most immediate indicator of network congestion and fee pressure. A full mempool means fee competition is live.",update:"The mempool has been oscillating between 20\u201360 MB through Q2 2026. No extreme congestion events since the Runes launch spike."},"fee-rates":{measures:"The fee rate in sat/vB required to be included in the next block vs. lower priority tiers.",importance:"Fee rates directly impact user experience. Understanding the distribution helps users choose the right fee for their urgency.",update:"Fee rates have stabilized into a more predictable pattern than the chaotic 2024 Ordinals era. The spread between next-block and low-priority has narrowed."},"tx-per-second":{measures:"Average number of on-chain transactions confirmed per second over a rolling 24-hour window.",importance:"Bitcoin's base layer throughput is deliberately limited. This metric contextualizes the need for Layer 2 solutions.",update:"Bitcoin consistently processes 5\u20137 tx/s on-chain \u2014 unchanged in years by design. This is precisely why Lightning, Ark, and other L2s exist."},"block-weight":{measures:"Average weight of mined blocks in million weight units. Max is 4 MWU. Measures how full the available block space is.",importance:"Consistently full blocks mean fee competition is structural, not temporary. Makes the block size debate concrete.",update:"Blocks running at 96% capacity is the new normal. Between financial transactions, inscriptions, and protocol-level data, the 4 MWU limit is tested daily."}};async function oe(e,t){let o=R.find(f=>f.id===e),i=we[e]||{},a=document.querySelector(".ocm-detail-view");if(!o||!a)return;let s=a.querySelector(".ocm-breadcrumb-cat");s&&(s.textContent=et(o.category)),D(a,".ocm-detail-title",o.title),D(a,".ocm-detail-subtitle",o.subtitle),D(a,".ocm-measures-text",i.measures||""),D(a,".ocm-importance-text",i.importance||""),D(a,".ocm-editorial-text",i.update||""),D(a,".ocm-sig-date",`Last updated ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`),a.querySelectorAll(".ocm-period-btn").forEach(f=>{f.classList.toggle("ocm-period-active",f.dataset.period===t)}),D(a,".ocm-reading-value","Loading\u2026");let n=a.querySelector(".ocm-detail-chart");n&&(n.innerHTML=`<p style="padding:20px;font-family:${l.body};color:${l.muted};font-style:italic">Loading chart\u2026</p>`);let{data:d,live:h}=await $(o.api),c=j(d,t),p=c[c.length-1],u=a.querySelector(".ocm-reading-value");u&&p&&(u.textContent=S(p.v,o.unit)+(h?"":" (demo data)")),n&&V(n,d,o,t),Ze(a,o)}function Ze(e,t){let o=e.querySelector(".ocm-related-grid");o&&(o.innerHTML="",R.filter(i=>i.category===t.category&&i.id!==t.id).slice(0,4).forEach(i=>{let a=document.createElement("div");a.style.cssText="padding:14px 16px;cursor:pointer;transition:background 0.15s",a.innerHTML=`
        <h3 style="font-family:${l.heading};font-size:14px;font-weight:500;margin:0 0 4px">${i.title}</h3>
        <p style="font-size:12px;color:${l.muted};margin:0;font-style:italic;font-family:${l.body}">${i.subtitle}</p>
      `,a.addEventListener("click",()=>{document.dispatchEvent(new CustomEvent("ocm:openChart",{detail:i.id}))}),a.addEventListener("mouseenter",()=>a.style.background="rgba(128,128,128,0.08)"),a.addEventListener("mouseleave",()=>a.style.background=""),o.appendChild(a)}))}function D(e,t,o){let i=e.querySelector(t);i&&(i.textContent=o)}function et(e){return e.replace("-"," ").toUpperCase()}var tt=45e3,v=10,Ce=[],$e=[];function Te(){let e=document.querySelector(".ocm-data-hero")||document.querySelector(".ocm-gallery-view");if(!e||!e.parentElement)return;let t=document.createElement("div");t.className="ocm-blockstrip",e.parentElement.insertBefore(t,e);let o=async()=>{let[{data:i},{data:a}]=await Promise.all([se(),ce()]);Ce=i.slice(0,3).map((s,n)=>({...s,_index:n})),$e=a.slice(0,8),ot(t)};o(),setInterval(o,tt)}function ot(e){e.innerHTML="",[...Ce].reverse().forEach(o=>{e.appendChild(ke("pending",{fee:o.medianFee,range:o.feeRange,fees:o.totalFees,txs:o.nTx,size:o.blockSize,meta:`in ~${(o._index+1)*10} min`}))});let t=document.createElement("div");t.className="ocm-blockstrip-divider",e.appendChild(t),$e.forEach(o=>{e.appendChild(ke("confirmed",{fee:o.extras.medianFee,range:o.extras.feeRange,fees:o.extras.totalFees,txs:o.tx_count,size:o.size,meta:`${o.height.toLocaleString("en-US")} \xB7 ${le(o.timestamp)} \xB7 ${o.extras.pool.name}`}))})}function ke(e,t){let o=document.createElement("div");o.className=`ocm-block-cube ocm-block-cube--${e}`;let i=e==="confirmed",a=i?l.textAdaptive:"none",s=l.textAdaptive,n=r("svg",{class:"ocm-block-cube-bg",viewBox:"0 0 100 100",preserveAspectRatio:"none"});n.appendChild(r("polygon",{points:`0,${v} ${v},0 100,0 ${100-v},${v}`,style:`fill: ${i?l.textAdaptive:"none"}; opacity: ${i?"0.8":"1"}; stroke: ${s}; stroke-width: 1;`})),n.appendChild(r("polygon",{points:`${100-v},${v} 100,0 100,${100-v} ${100-v},100`,style:`fill: ${i?l.textAdaptive:"none"}; opacity: ${i?"0.6":"1"}; stroke: ${s}; stroke-width: 1;`})),n.appendChild(r("polygon",{points:`0,${v} ${100-v},${v} ${100-v},100 0,100`,style:`fill: ${a}; stroke: ${s}; stroke-width: 1;`})),o.appendChild(n);let d=document.createElement("div");d.className="ocm-block-cube-content";let h=t.range[0],c=t.range[t.range.length-1];return d.innerHTML=`
    <p class="ocm-bc-fee">~${Math.round(t.fee)} sat/vB</p>
    <p class="ocm-bc-range">${h.toFixed(2)} - ${c.toFixed(0)} sat/vB</p>
    <div class="ocm-bc-row"><span>Total fees</span><span>${(t.fees/1e8).toFixed(3)} BTC</span></div>
    <div class="ocm-bc-row"><span>Transactions</span><span>${t.txs.toLocaleString("en-US")}</span></div>
    <div class="ocm-bc-row"><span>Size</span><span>${(t.size/1e6).toFixed(1)} MB</span></div>
    <p class="ocm-bc-meta">${t.meta}</p>
  `,o.appendChild(d),o}var W=null,Y="1Y",J=document.querySelector(".ocm-gallery-view"),K=document.querySelector(".ocm-detail-view");function it(){J&&(J.style.display=""),K&&(K.style.display="none"),W=null,window.scrollTo({top:0,behavior:"smooth"})}async function Ae(e){W=e,Y="1Y",J&&(J.style.display="none"),K&&(K.style.display=""),window.scrollTo({top:0,behavior:"smooth"}),await oe(e,Y)}function at(){document.querySelectorAll(".ocm-period-btn").forEach(e=>{e.addEventListener("click",async()=>{Y=e.dataset.period,W&&await oe(W,Y)})})}function nt(){let e=document.querySelector(".ocm-back-btn");e&&e.addEventListener("click",it)}document.addEventListener("ocm:openChart",e=>Ae(e.detail));async function Ee(){at(),nt(),Te(),await be(Ae)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ee):Ee();})();
