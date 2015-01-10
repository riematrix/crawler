/**
 * Created by Administrator on 2014/9/4.
 */

var backgroundConfig = {
    enableUpdateVars: true
};

var dataCollected,docHrefText;
// Handler
MsgHandler = {
    setData:function(data,sender,sendResponse){
        dataCollected = data;
    },
    getData:function(data,sender,sendResponse){
        sendResponse(dataCollected);
    },
    setDocHrefText:function(data,sender,sendResponse){
        docHrefText = data;
    },
    getDocHrefText:function(data,sender,sendResponse){
        sendResponse(docHrefText);
    },
    updateTargetsContextMenus: function(data,sender,sendResponse){
        chrome.contextMenus.removeAll();
        initStaticContextMenus();
        if(!data || JSON.stringify(data) === "{}" || !backgroundConfig.enableUpdateVars) {

        }else{
            initVariableContextMenus(data);
        }
    },
    updateContentLocale: function(data,sender,sendResponse){
        if(sender.tab){
            chrome.tabs.executeScript(sender.tab.id, {file: data.path}, function() {
            });
        }
    }
};
// Wire up the listener.
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message.method)MsgHandler[message.method](message.data,sender,sendResponse);
});

//lang
$T.loadResource();

var contexts = ["page","link","editable"];
function initStaticContextMenus(){
    console.log("initStaticContextMenus")
    chrome.contextMenus.create({
        title: $T("data.collect.target.add"),
        contexts: contexts,
        onclick: function(info,tab){
            chrome.tabs.sendRequest(tab.id, "getClickedEl", function(clickedEl) {
                console.log("xpath",clickedEl.value);
            });
        }
    }, function (){});
}

function initVariableContextMenus(data){
    // update
    var updateTargetMenuId = "updateTarget",
        updateTargetMenuIdPrefix = "to_update_";
    chrome.contextMenus.create({
        id: updateTargetMenuId,
        title: $T("data.collect.target.update"),
        contexts: contexts
    }, function (){
        for(var k in data){
            chrome.contextMenus.create({
                parentId: updateTargetMenuId,
                id: updateTargetMenuIdPrefix + k,
                title: k,
                contexts: contexts,
                onclick: function(info,tab){
                    var templateVarName = info.menuItemId.replace(updateTargetMenuIdPrefix,"");
                    //sendResponse(templateVarName);
                    chrome.tabs.sendRequest(tab.id, "updateTemplateVarName_"+templateVarName);
                }
            }, function (){});
        }
    });

    // delete
    var deleteTargetMenuId = "deleteTarget",
        deleteTargetMenuIdPrefix = "to_delete_",
    deleteAllTargetMenuId = "deleteAllTarget";
    chrome.contextMenus.create({
        id: deleteTargetMenuId,
        title: $T("data.collect.target.delete"),
        contexts: ["all"]
    }, function (){
        for(var k in data){
            chrome.contextMenus.create({
                parentId: deleteTargetMenuId,
                id: deleteTargetMenuIdPrefix + k,
                title: k,
                contexts: ["all"],
                onclick: function(info,tab){
                    var templateVarName = info.menuItemId.replace(deleteTargetMenuIdPrefix,"");
                    //sendResponse(templateVarName);
                    chrome.tabs.sendRequest(tab.id, "deleteTemplateVar_"+templateVarName);
                }
            }, function (){});
        }
        chrome.contextMenus.create({
            parentId: deleteTargetMenuId,
            id: deleteAllTargetMenuId,
            title: $T("data.collect.target.delete.all"),
            contexts: ["all"],
            onclick: function(info,tab){
                chrome.tabs.sendRequest(tab.id, "deleteAllTemplateVar");
            }
        }, function (){});
    });
}
/*

chrome.contextMenus.create({
    title: 'Persistent information',
    contexts: ['page'],
    onclick: function (evt,tab) {
        //chrome.tabs.create({ url: evt.pageUrl })
        var info = evt.selectionText;
        if(info){}// instant information
        else{} // serializable information
        */
/*chrome.runtime.sendMessage({method: 'collect_persistent_info'}, function(response) {
            //clickLinkWithText(name);
        });*//*

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
}*/
