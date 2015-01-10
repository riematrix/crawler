/**
 * Created by Stanley Zhou on 2015/1/2.
 */
document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.executeScript(null, {code: "collectData();",allFrames: false});

    document.getElementById("monitor_toggle").addEventListener("click",function(){
        chrome.tabs.executeScript(null, {code: "watcher.approve();",allFrames: false});
    });

    document.getElementById("inspect").addEventListener("click", function() {
        chrome.tabs.executeScript(null, {code: "inspectToSelectElement();",allFrames: false});
        window.close()
    });

    document.getElementById("import_template").addEventListener("click", function() {
        chrome.tabs.executeScript(null, {code: "importDocxTemplate();",allFrames: false})
    });

    /*document.getElementById("export_config").addEventListener("click", function() {
        chrome.tabs.executeScript(null, {code: "exportUserConfig();",allFrames: false})
    });
    document.getElementById("import_config").addEventListener("click", function() {
        chrome.tabs.executeScript(null, {code: "importUserConfig();",allFrames: false})
    });
    */
    var links = document.getElementsByClassName("links");
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function() {
            chrome.tabs.create({url: this.href})
        })
    }
    $T.loadResource(function() {
        (function translateDecendent(dom) {
            for (var i = 0; i < dom.length; i++) {
                var node = dom[i], nodeType = node.nodeType;
                if (nodeType === 1) {
                    if (node.title) {
                        node.title = $T(node.title)
                    }
                    translateDecendent(node.childNodes)
                } else {
                    if (nodeType === 3) {
                        node.nodeValue = $T(node.nodeValue)
                    }
                }
            }
        })(document.getElementsByClassName("locale"))
    });
    chrome.tabs.query({active: true,currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {from: "popup",subject: "getManagedTemplates"}, function(templates) {
            if (templates) {
                for (var i = 0; i < templates.length; i++) {
                    var template = templates[i];
                    createExportLink(template.name, template.id, template.fullPath)
                }
            }
        })
    })
});
function createExportLink(name, targetId, path) {
    var container = document.createElement("div"),
        operatorTarget = document.createElement("span"),
        operation = document.createElement("div"),
        deleteLink = document.createElement("a"),
        modifyLink = document.createElement("a");
    container.className = "operator download";
    operatorTarget.className = "operator-target";
    operatorTarget.innerText = name;
    operation.className = "operator-operation";

    deleteLink.className = "mini-ico actual-ico delete";
    deleteLink.title = $T("template.button.delete");
    deleteLink.setAttribute("fullPath", path);
    deleteLink.setAttribute("targetId", targetId);
    deleteLink.setAttribute("templateName", name);
    deleteLink.addEventListener("click", function(e) {
        e.stopPropagation();
        var fullPath = this.getAttribute("fullPath"),
            targetId = this.getAttribute("targetId"),
            templateName = this.getAttribute("templateName");
        chrome.tabs.executeScript(null, {code: "deleteTemplate('" + targetId + "','" + fullPath + "','"
            + templateName + "');",allFrames: false})
    });

    modifyLink.className = "mini-ico actual-ico modify";
    modifyLink.title = $T("template.button.modify");
    modifyLink.setAttribute("targetId", targetId);
    modifyLink.addEventListener("click", function(e) {
        e.stopPropagation();
        var k = this.getAttribute("targetId");
        chrome.tabs.executeScript(null, {code: "modifyTemplateExportName('" + k + "');",allFrames: false})
    });

    operation.addEventListener("click", function(e) {
        e.stopPropagation()
    });
    operation.appendChild(deleteLink);
    operation.appendChild(modifyLink);
    container.appendChild(operatorTarget);
    container.appendChild(operation);

    document.body.insertBefore(container, document.getElementById("inspect"));
    container.onclick = function() {
        chrome.tabs.executeScript(null, {code: "exportTaggedDocument('" + targetId + "','" + name
            + "')",allFrames: false})
    }
}
function tablog(message) {
    chrome.tabs.executeScript(null, {code: "console.log('popup says: " + message + "');",allFrames: false})
}