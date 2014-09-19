/**
 * Created by Administrator on 2014/9/5.
 */
/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request)
    switch (request.method) {
        case 'collect_persistent_info':
            console.log("collect");
            sendResponse({status: ""});
            break;
        default:
            sendResponse({});
            break;
    }
});*/

var rightClicke dElement;
(function init(){
    document.addEventListener("mousedown",function(e){
        if(e.button === 2){
            rightClickedElement = e.target;
        }
    })
})();

function collectPersistentInfo(info){
    var path = Xpath.getElementXPath(rightClickedElement);
    console.log(rightClickedElement.innerText,path);
}

function collectTemporaryInfo(info){
    console.log(info);
}