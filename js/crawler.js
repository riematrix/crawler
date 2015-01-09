/**
 * Created by Stanley Zhou on 2014/9/5.
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

/*var rightClickedElement;
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
 }*/
var richTextDataContainer = {};
function renderRichTextData(path, container) {
    var dom = Xpath.getElementsByXPath(document, path)[0];
    if (!dom) {
        console.warn($T("xpath.error.retrieve.richtext", [path]));
        return
    }
    var text = dom.innerText,
        images = getInnerImageElements(dom);
    var start = 0, end = images.length;
    for (var i = 0; i < end; i++) {
        var image = images[i];
        (function(data, index) {
            var currentText = retrieveNeighbourText(data, true),
                currentLength = currentText.length,
                current = start;
            start = text.indexOf(currentText) + currentLength;
            data.desc_prev = text.substring(current, start);
            if (index == end - 1) {
                var nextText = retrieveNeighbourText(data, false);
                data.desc_next = text.substring(text.indexOf(nextText), text.length)
            }
            var name = data.innerText || new Date().getTime() + "_" + index;
            generateImageData(String(data.src), container, {
                name: name,
                desc_prev: data.desc_prev || "",
                desc_next: data.desc_next || ""
            });
        })(image, i);
    }
}
function getInnerImageElements(e) {
    var imageTags = Array.prototype.slice.call(e.getElementsByTagName("img")),
        imageLinks = Array.prototype.slice.call(e.getElementsByTagName("a")),
        result = [];
    for (var i = 0; i < imageLinks.length; i++) {
        for (var j = 0, endFix = [".jpg", ".png"]; j < endFix.length; j++) {
            if (imageLinks[i].innerText.toLowerCase().indexOf(endFix[j]) >= 0) {
                imageLinks[i].src = imageLinks[i].href;
                result.push(imageLinks[i]);
                break
            }
        }
    }
    result = result.concat(imageTags);
    return result
}

var documentData;
function collectData() {
    var dateStamp = new Date(),
        data = {
            year: dateStamp.getFullYear(),
            month: dateStamp.getMonth() + 1,
            day: dateStamp.getDate()
        };
    for (var key in UserConfig) {
        if(UserConfig.hasOwnProperty(key)){
            var config = UserConfig[key];
            if (typeof config === "object") {
                data[key] = richTextDataContainer[encodeURIComponent(config.xpath)];
                continue
            }
            var dom = Xpath.getElementsByXPath(document, config)[0];
            if (!dom) {
                console.warn($T("xpath.error.retrieve.value", [key, config]));
                continue
            }
            data[key] = dom.value || dom.innerText || ""
        }
    }
    documentData = data;
}

function generateImageData(src, resultStack, data) {
    var image = new Image(),
        dataUrl,
        base64Prefix = /^data:image\/(png|jpg);base64,/,
        name = new Date().getTime(),
        isDataUrl = src.indexOf(base64Prefix) >= 0;
    if (!data.name) {
        data.name = name + ".jpg"
    }
    image.onload = function() {
        var width = this.width,
            height = this.height,
            maxWidthPx = 554,
            imageBinary;
        if (!isDataUrl) {
            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");
            context.drawImage(this, 0, 0);
            dataUrl = canvas.toDataURL("image/png")
        } else {
            dataUrl = src;
        }
        imageBinary = JSZipBase64.decode(dataUrl.replace(base64Prefix, ""));
        if (width > maxWidthPx) {
            height = parseInt(maxWidthPx * height / width);
            width = maxWidthPx
        }
        // convert to EMU ( 1px ~= 9525 emu )
        width *= 9525;
        height *= 9525;
        resultStack.push({
            id: name,
            desc_prev: data.desc_prev,
            desc_next: data.desc_next,
            img: [{data: imageBinary,name: name + ".jpg",width: width,height: height}]});
        if (data.thumbnailWidth) {
            this.width = data.thumbnailWidth
        }
        if (data.thumbnailHeight) {
            this.height = data.thumbnailHeight
        }
    };
    image.id = String(name);
    image.alt = "thumbnail_" + data.name;
    image.src = src;
    image.title = data.name;
    image.crossOrigin = "*";
    return image;
}

var lightBox = new LightBox();
var rightClickedEl = null;
document.addEventListener("mousedown", function(e) {
    if (e.button == 2) {
        rightClickedEl = e.target
    }
}, true);

chrome.extension.onRequest.addListener(function(request, c, response) {
    var templateName;
    if (request == "getClickedEl") {
        response({value: Xpath.getElementXPath(rightClickedEl)});
        addDataCollectTarget(rightClickedEl)
    }
    else if (request == "trackClickedEl") {
        response({value: Xpath.getElementXPath(rightClickedEl)});
        trackTarget(rightClickedEl, Xpath.getElementXPath(rightClickedEl))
    }
    else if (request == "deleteAllTemplateVar") {
        deleteAllDataCollectTarget()
    }
    else if (request.indexOf("updateTemplateVarName_") >= 0) {
        templateName = request.replace("updateTemplateVarName_", "");
        relocateDataCollectTarget(templateName)
    }
    else if (request.indexOf("deleteTemplateVar_") >= 0) {
        templateName = request.replace("deleteTemplateVar_", "");
        deleteDataCollectTarget(templateName)
    }
});
function addDataCollectTarget(path) {
    var dom = Xpath.getElementXPath(path),
        imageEls = getInnerImageElements(path).length;
    var value = path.value || path.innerText || "[未填写]";
    var message = "<p><label for='templateVarValue' >" + $T("data.collect.target") + ":</label><i style='font-weight: bold;'>" + value + "</i></p>";
    message += "<p><label for='templateVarName' >" + $T("data.collect.neighbour") + ":</label><i>" + retrieveNeighbourText(path, true) + "</i></p>";
    message += "<p><label for='templateVarName' >" + $T("data.collect.variable.name") + ":</label><input type='text' id='templateVarName'/><label>" + $T("data.collect.variable.desc") + "</label></p>";
    message += "<p><input type='text' id='chopParagraph' disabled onclick='this.removeAttributeNode(\"disabled\")' onblur='if(!this.value)this.disabled=\"disabled\"'/><label for='chopParagraph' >" + $T("data.collect.chopparagraph") + "</label></p>";
    if (imageEls > 0) {
        message += "<p><input type='checkbox' id='collectImageData'/><label for='collectImageData' >" + $T("data.collect.includeimg") + "</label></p>"
    }
    lightBox.popup({title: $T("data.collect.pop.title"),body: message}, function(content) {
        removeClass(path, "inspect-decorator");
        var val = content.getElementsByTagName("input")[0].value.trim();
        if (!val) {
            throw new Error($T("data.collect.pop.error.name"))
        }
        var includeImgs = content.getElementsByTagName("input")[1];
        if (includeImgs && includeImgs.checked) {
            dom = {xpath: dom,include_images: "true"}
        }
        updateUserConfig(val, dom)
    })
}
function deleteDataCollectTarget(id) {
    var message = "<p>" + $T("data.delete.message", ["<span style='font-weight: bold;font-size: 18px'>[" + id + "]</span>"]) + "</p>";
    lightBox.popup({title: $T("data.delete.pop.title"),body: message}, function(c) {
        delete UserConfig[id];
        updateUserConfig()
    })
}
function deleteAllDataCollectTarget() {
    var message = "<p>" + $T("data.deleteall.message") + "</p>";
    lightBox.popup({title: $T("data.deleteall.pop.title"),body: message}, function(b) {
        updateUserConfig("{}")
    })
}
function relocateDataCollectTarget(id) {
    var path = Xpath.getElementXPath(rightClickedEl);
    var dom = Xpath.getElementsByXPath(document, path)[0],
        value = dom.value || dom.innerText || "[未填写]";
    var message = "<p>" + $T("data.relocate.message", ["<span style='font-weight: bold;font-size: 18px'>[" + id + "]</span>"]) + "</p>";
    message += "<p><label for='templateVarValue' >" + $T("data.collect.target") + "：</label><i style='font-weight: bold;'>" + value + "</i></p>";
    message += "<p><label for='templateVarName' >" + $T("data.collect.neighbour") + "：</label><i>" + retrieveNeighbourText(dom, true) + "</i></p>";
    lightBox.popup({title: $T("data.relocate.pop.title"),body: message}, function(f) {
        updateUserConfig(id, path)
    })
}

var fs = new Filesystem(PERSISTENT, 5 * 1024 * 1024),
    fsDeferred = null,
    UserConfig = {},
    configFileName = "config.json",
    userTemplates = {},
    templateFileDir = "templates",
    preferFileName = "prefer.json",
    preferData;
(function loadUserConfig() {
    fsDeferred = fs.init();
    fsDeferred.done(function() {
        fs.readFile(configFileName).done(function(data) {
            UserConfig = JSON.parse(data);
            updateCollectTargets()
        }).fail(function(e) {
            console.log(e.message + $T("filesystem.create.message", [configFileName]));
            if (FileError.NOT_FOUND_ERR == e.code) {
                fs.createFile(configFileName, "{}");
                updateCollectTargets()
            }
        });

        fs.readDir(templateFileDir, function(entry) {
            if (entry.isFile) {
                var splitedName = entry.name.split("_");
                var id = splitedName.shift(), path = entry.fullPath;
                fs.readFile(path).done(function(binaryData) {
                    userTemplates[id] = {
                        id: id,
                        name: splitedName.join(""),
                        data: binaryData,
                        fullPath: path
                    }
                })
            }
        }).fail(function(e) {
            console.warn(e.message)
        });

        fs.readFile(preferFileName).done(function(data) {
            preferData = JSON.parse(data)
        }).fail(function(a) {
            if (FileError.NOT_FOUND_ERR == a.code) {
                console.log(a.message + $T("filesystem.create.message", [preferFileName]));
                fs.createFile(preferFileName, "{}", {create: true})
            }
            preferData = {}
        })
    })
})();
function updateCollectTargets() {
    for (var b in UserConfig) {
        var e = UserConfig[b];
        if (typeof e === "object" && e.include_images) {
            var c = [], a = e.xpath, d = encodeURIComponent(a);
            if (typeof richTextDataContainer[d] === "undefined") {
                richTextDataContainer[d] = c;
                renderRichTextData(a, c)
            }
        }
    }
    chrome.runtime.sendMessage({method: "updateTargetsContextMenus",data: UserConfig})
}
function updateUserConfig(a, c) {
    if (typeof a === "string") {
        if (c) {
            UserConfig[a] = c
        } else {
            UserConfig = JSON.parse(a)
        }
    } else {
        if (typeof a === "object") {
            extend(a, UserConfig)
        }
    }
    var b = JSON.stringify(UserConfig);
    fs.createFile(configFileName, b, {create: true}).done(function() {
        console.log($T("filesystem.update.message", [b]));
        updateCollectTargets()
    })
}
chrome.runtime.onMessage.addListener(function(e, d, a) {
    if ((e.from === "popup") && (e.subject === "getManagedTemplates")) {
        var c = [];
        for (var b in userTemplates) {
            c.push({id: userTemplates[b].id,name: userTemplates[b].name,fullPath: userTemplates[b].fullPath})
        }
        a(c)
    }
});
function importDocxTemplate() {
    var a = "<p><label for='templateVarName' >\t\t</label><input type='file' id='configfile'/></p>";
    lightBox.popup({title: $T("template.upload.title"),body: a}, function(e) {
        var c = e.getElementsByTagName("input")[0].value.trim();
        if (!c) {
            throw new Error("no file selected")
        } else {
            var f = c.split("\\").pop();
            var b = e.getElementsByTagName("input")[0].files[0], d = new FileReader();
            d.onload = function(g) {
                updateDocxTemplate(g.target.result, f)
            };
            d.readAsBinaryString(b)
        }
    })
}
function exportTaggedDocument(c, b) {
    var d = preferData[c];
    if (d && d.docxName) {
        documentData.docxName = d.docxName
    } else {
        documentData.docxName = b
    }
    evaluate(documentData);
    var a = userTemplates[c];
    var e = new DocxGen(a.data);
    e.setTemplateVars(documentData).applyTemplateVars();
    e.output(true, "", function(f) {
        createDownload(documentData.docxName, f)
    })
}
function updateDocxTemplate(d, e) {
    var c = new Date().getTime();
    var a = c + "_" + e, b = templateFileDir + "/" + a;
    fs.createFile(b, d, {create: true}).done(function() {
        console.log($T("filesystem.update.message", [e]));
        userTemplates[c] = {id: c,name: e,data: d,fullPath: b}
    })
}
function modifyTemplateExportName(d) {
    var b = preferData[d], a = b && b.docxName || "";
    var c = "<p><input type='text' id='templateName' style='width: 400px' value='" + a + "'/></p>";
    c += "<p><label>" + $T("template.modify.name.desc") + "</label></p>";
    lightBox.popup({title: $T("template.modify.name.title"),body: c}, function(g) {
        var i = g.getElementsByTagName("input")[0].value.trim();
        if (!i) {
            throw new Error("invalid name pattern")
        } else {
            var f = preferData[d], e;
            if (f) {
                e = f.docxName;
                f.docxName = i
            } else {
                preferData[d] = f = {docxName: i}
            }
            var h = JSON.stringify(preferData);
            fs.createFile(preferFileName, h, {create: true}).fail(function() {
                f.docxName = e
            })
        }
    })
}
function deleteTemplate(templateId, templateFullPath, name) {
    var message = "<p>" + $T("template.delete.filename") + "：" + name + "</p>";
    message += "<p><label>" + $T("template.delete.desc") + "</label></p>";
    lightBox.popup({title: $T("template.delete.title"),body: message}, function(e) {
        fs.removeFile(templateFullPath).done(function() {
            delete userTemplates[templateId];
            var prefer = preferData[templateId];
            if (!prefer) {
                console.warn("Preference of " + name + " doesn't exist anymore.")
            } else {
                delete prefer.docxName;
                var data = JSON.stringify(preferData);
                fs.createFile(preferFileName, data)
            }
        })
    })
}

function importUserConfig() {
    var id = "config_container_" + new Date().getTime(),
        input = document.createElement("input");
    input.type = "hidden";
    input.id = id;
    document.body.appendChild(input);
    function uploadHandler(e, id) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById(id).value = e.target.result
            };
            reader.readAsText(file)
        }
    }
    injectCode(uploadHandler.toLocaleString());
    var message = "<p><label for='templateVarName' >\t\t</label><input type='file' id='configfile' onchange='uploadHandler(event,\"" + id + "\")'/></p>";
    lightBox.popup({title: $T("config.upload"),body: message}, function(content) {
        var file = content.getElementsByTagName("input")[0].value.trim();
        if (!file) {
            throw new Error("no file selected")
        } else {
            var data = input.value.trim();
            updateUserConfig(data || "{}");
            document.body.removeChild(input)
        }
    }, function() {
        document.body.removeChild(input)
    })
}
function inspectToSelectElement() {
    var b = function(f) {
        for (var key in UserConfig) {
            if(UserConfig.hasOwnProperty(key)){
                var config = UserConfig[key];
                if (typeof config == "object") {
                    config = config.xpath
                }
                var dom = Xpath.getElementsByXPath(document, config)[0];
                if (!dom) {
                    continue
                }
                if (f(config, key, dom)) {
                    break
                }
            }
        }
    };
    b(function(c, d, e) {
        addClass(e, "existed")
    });
    var a = inspectElement(function(c) {
        b(function(d, f) {
            if (d == Xpath.getElementXPath(c)) {
                var e = c.title;
                if (e) {
                    c.setAttribute("originalTitle", e)
                }
                c.title = $T("inspector.target.exist", [f]);
                addClass(c, "existed-active");
                return true
            }
        })
    }, function(d) {
        var c = d.getAttribute("originalTitle");
        if (c) {
            d.title = c
        } else {
            d.removeAttribute("title")
        }
        d.removeAttribute("originalTitle");
        removeClass(d, "existed-active")
    }, function(c) {
        b(function(d, e, f) {
            removeClass(f, "existed")
        });
        if (c.button != 0) {
            return
        }
        c.preventDefault();
        c.stopPropagation();
        addDataCollectTarget(c.target)
    }, function() {
        b(function(c, d, e) {
            removeClass(e, "existed")
        })
    })
}
