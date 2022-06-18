import {loadFont,drawPinx,getLastComps} from "./hzpx.js"
import {GWCOMP} from "./gwcomp.mjs";// dynamically loaded by service worker 
import {CJKEXT} from "./cjkext.mjs";// too big to bundle into background.bundle.js
import {CJKBMP} from "./cjkbmp.mjs";
chrome.runtime.onInstalled.addListener(() => {
  console.log('extension installed');
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  loadFont(GWCOMP,CJKBMP,GWCOMP);
  const req=request.data;
  if (req.id=='hzpx') {
    const {gwcomp,cjkbmp,cjkext}=loadFont(GWCOMP,CJKBMP,CJKEXT);
    const out = [];
    const D = req.pinx;
    const opts = request.data.options;
    for (let i = 0; i < D.length; i++) {
      out.push(drawPinx(D[i],opts));
    }
    sendResponse(out);    
  } else if (req.id=='comps') {
    sendResponse(getLastComps(req.text));
  }
});
