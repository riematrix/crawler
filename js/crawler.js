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

var rightClickedElement;
(function init(){
    document.addEventListener("mousedown",function(e){
        if(e.button === 2){
            rightClickedElement = e.target;
        }
    })
})();

function collectPersistentInfo(info){
    console.log(rightClickedElement.innerHTML);
}

function collectTemporaryInfo(info){
    console.log(info);
}