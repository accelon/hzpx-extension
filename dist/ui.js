const stockbases="㫖仲凒勲匔匰厤吾哪圞埲奛奨娟嬰孲寵屘屢岱峉嶁幥廚彅彨循怠懚戓戭掉敟旟显晔晷暰朥梑歡殣毜毷氇氳泴泵沙泊濈炱煴爺牆牕犋犧犧犨狊狸珃瑽璹瓪甂畠畧畩疾皒皸盪睯瞃矞矠矪砠硰磱禧種窟竬竽筯籼粜粪糣緈縆罣羫翇翞翿聘聳聾肿膐艚艚蚦蜰蟧袂袵裂裔觶觺訣諬譵貔賌贎贜趘躎躰軇軸輙達適邁邷鄲酾醒鈝銴鑚钂钰铏闡陚雝霓靟鞃韟韷顢颪飅餥餬馽驕驚骽體髜鬚鬫鬸鬻鮤鯨鵟鷣鸔麜麣黖黸鼊齉齷齾"
const stockfavorites='初衤礻$颰犮电$峰夆電雨水$𬠶蛇冠寸苗$开腦囟同$寶缶充$衚胡舞$䳘鳥烏戰口火$騰月鳥$糙造臼$痛甬炱台肝$髜昇厏乍电$超召狸里美$国玉囡女书$邏羅寶貝𩀨從䞃致招'//鵝鳥烏
const inputPinx=document.querySelector("#pinx");
const splitUTF32Char=str=>{
    let i=0;
    const out=[];
    while (i<str.length) {
        const code=str.codePointAt(i)||0;
        out.push(String.fromCharCode(code));
        i++;
        if (code>0xffff) i++;
    }
    return out;
}
const createButtons=arr=>arr.map(comp=>"<button>"+comp+"</button> ").join('');

const updateSVG=async(text)=>{
	if (text.length>20) return;
	const r=await chrome.runtime.sendMessage({data:{id:'hzpx',pinx:[text]}})
	document.querySelector("#svg").innerHTML=r.join('');
	const comps=await chrome.runtime.sendMessage({data:{id:'comps',text}})
	document.querySelector("#comps").innerHTML=comps.map(comp=>"<button>"+comp+"</button> ").join('');

	inputPinx.focus();
	inputPinx.selectionStart=inputPinx.value.length;
	inputPinx.selectionEnd=inputPinx.value.length;
}
const onInput=async(evt)=>{
	const text=evt.target.value;
	if (text.length>20) return;
	updateSVG(text);
}
const onComp=async(evt)=>{
	let t=inputPinx.value+evt.target.innerText+'卍';
	inputPinx.value=t;
	await updateSVG(t)
}
const onFavorite=async(evt)=>{
	const text=evt.target.innerText;
	if (text.length>10) return;
	inputPinx.value=text;
	await updateSVG(text)
}
inputPinx.addEventListener("input", onInput , false);
document.querySelector("#comps").addEventListener("click", onComp , false);
document.querySelector("#favorite").addEventListener("click", onFavorite , false);
document.querySelector("#bases").addEventListener("click", onFavorite , false);

document.querySelector('#favorite').innerHTML=createButtons(stockfavorites.split('$'));
document.querySelector('#bases').innerHTML=createButtons(splitUTF32Char(stockbases));
