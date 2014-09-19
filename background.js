/**
 * Created by Administrator on 2014/9/4.
 */
chrome.contextMenus.create({
    title: 'Persistent information',
    contexts: ['page'],
    onclick: function (evt,tab) {
        //chrome.tabs.create({ url: evt.pageUrl })
        var info = evt.selectionText;
        if(info){}// instant information
        else{} // serializable information
        /*chrome.runtime.sendMessage({method: 'collect_persistent_info'}, function(response) {
            //clickLinkWithText(name);
        });*/
        executeTabFunction(tab.id,"collectPersistentInfo",[info]);
    }
});

chrome.contextMenus.create({
    title: 'Temporary information',
    contexts: ['selection'],
    onclick: function (evt, tab) {
        var info = evt.selectionText;
        if(info){}
        else{}

        executeTabFunction(tab.id,"collectTemporaryInfo",[info]);
    }
});

chrome.contextMenus.create({
    title: 'Run this snippet',
    contexts: ['selection'],
    onclick: function (evt, tab) {
        var info = evt.selectionText;
        if(info){}
        else{}
        executeTabFunction(tab.id,"openwin",[info]);
    }
});

function executeTabFunction(tabId, functionName, params){
    chrome.tabs.executeScript(tabId,{
        code: functionName + "('" + params.join("','") + "')"
    });
}