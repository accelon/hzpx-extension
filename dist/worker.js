import {loadFont,drawPinx,getLastComps,LaZip,JSZip} from "./hzpx.js"
chrome.runtime.onInstalled.addListener(() => {
  console.log('extension installed');
});

const dohzpx=async (request)=>{
    const req=request.data;
    const zip=await LaZip("hzpx.ptk",JSZip);
    await loadFont(zip);
    const out = [];
    const D = req.pinx;
    const opts = request.data.options;
    for (let i = 0; i < D.length; i++) {
      out.push(drawPinx(D[i],opts));
    }
    return out;
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const req=request.data;
  if (req.id=='hzpx') {
    dohzpx(request).then(sendResponse);
    return true;
  } else if (req.id=='comps') {
    sendResponse(getLastComps(req.text));
  }
});
