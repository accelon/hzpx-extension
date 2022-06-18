/* main content script */
const stylesheet=`
body {display:flex;left-margin:1em}
.hzpx {white-space:normal}
`

//this is javascript version from ../index.ts
const CJKRanges={
    'BMP': [0x4e00,0x9fa5],
    'ExtA':[0x3400,0x4dff],
    'ExtB':[0x20000,0x2A6FF],
    'ExtC':[0x2A700,0x2B73F],
    'ExtD':[0x2B740,0x2B81F],
    'ExtE':[0x2B820,0x2CEAF],
    'ExtF':[0x2CEB0,0x2EBE0],
    'ExtG':[0x30000,0x3134A]
}
const CJKRangeName=s=>{//return cjk range name by a char or unicode number value or a base 16 string
    let cp=s;
    if (typeof s==='string') {
        const code=parseInt(s,16);
        if (!isNaN(code)) {
            cp=code;
        } else {
            cp=s.codePointAt(0);
        }
    }
    for (let rangename in CJKRanges) {
        const [from,to]=CJKRanges[rangename];
        if (cp>=from && cp<=to) return rangename;
    }
}
const inRange=(s,cjkranges )=>{
	const rangename=CJKRangeName(s);
	return ~cjkranges.indexOf(rangename);
}
const splitUTF32 = (str) => {
  if (!str) {
    const empty = [];
    return empty;
  }
  let i = 0;
  const out = [];
  while (i < str.length) {
    const code = str.codePointAt(i) || 0;
    out.push(code);
    i++;
    if (code > 65535)
      i++;
  }
  return out;
}
const splitUTF32Char = (str) => splitUTF32(str).map((cp) => String.fromCodePoint(cp));
var replaceReg = /\07([^\07]+)\07/g;
const extractPinx=(html,opts={}) =>{
	const pair=opts.pair||'︻︼';
	const cjk=opts.cjk||'ABCDEFG';
	const cjkranges=cjk.toUpperCase().split('').map(s=>'Ext'+s); //match the CJKRangeName

	let out='', nreplace=0;
	const Pinx=[];  // keep the parameters for drawPinx, array index is \07idx\07 svg insert point

	const getReplaceId=s=>{
		const at=Pinx.indexOf(s);
		if (at==-1) {
			Pinx.push(s);
			return Pinx.length-1;
		}
		return at;
	}
	//replace the Pinx first, so that remaining extension char will not get mess up
	if (pair && pair.length==2) { //as finding Pinx is slow, user need to specify a enclosing pattern
		const [left,right]=splitUTF32Char(pair)
		const reg=new RegExp(left+'([^'+right+']+)'+right,'g');
		html=html.replace(reg, (m,m1)=>{
			const id=getReplaceId(m1);
			return String.fromCharCode(7) + id.toString() +String.fromCharCode(7) ;
		});
	}
	html=html.replace(/([\ud800-\udfff]{2})/g,function(m,sur){ //extract replaceble CJK Extension
		if (inRange(sur,cjkranges)) {
			const id=getReplaceId(sur);
			return String.fromCharCode(7) + id.toString() +String.fromCharCode(7) ;
		} else {
			return sur;
		}
	})
	return [html,Pinx];
}

const injectByServiceWorker=async (ele,opts={})=>{
	let {color,fontSize}=window.getComputedStyle(ele);
	const size=parseInt(fontSize);
	color=opts.color||color;
	let [text,pinx]=extractPinx(ele.innerHTML,opts);
	let prefix='',suffix='';
	if (opts.puretext) {
		prefix='<div class=hzpx>';
		suffix='</div>';
	}
	if (pinx.length) {
		text=text.replace(/\r?\n/g,'<br/>')
		const svgs=await chrome.runtime.sendMessage({data:{id:"hzpx",pinx, options:{size,color}}});
		const lines=text.split(/\r?\n/); //break into lines
		ele.innerHTML=lines.map(line=>prefix+line.replace(replaceReg,(m,id)=>svgs[parseInt(id)].join(''))+suffix);
		if (opts.puretext) ele.style['white-space']='nowrap';	
	}
}


const setStyle=()=>{
	const style=document.createElement('STYLE');
	style.innerText=stylesheet;
	document.head.appendChild(style);
}
const p=location.pathname;
if (typeof document!=='undefined') {
	setTimeout(async ()=>{
		//already rendered
		if(p.endsWith('.txt')) {
			setStyle();
			const pre=document.querySelector('pre');
			await injectByServiceWorker(pre,{puretext:true,cjk:'ABCDEFG', color:'silver'})
		} else if ( (p.endsWith('.html') || p.endsWith('.htm') )) {
			if (Array.from(document.scripts).filter(it=>it.outerHTML.indexOf('hzpx.js')>0).length) return;
			setTimeout(()=>{
				const eles=document.querySelectorAll(".hzpx");
				eles.forEach(ele=>{
					const t=ele.innerText;
					injectByServiceWorker(ele,{cjk:'ABCDEFG'});
				})
			},100);//wait for <script> to render
		}
	},1)
}
