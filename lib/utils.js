/**
 * Created by Administrator on 2014/9/2.
 */
function extend(options, target, decendent){
    target = typeof target === "undefined" ? this : target;
    if(!options) return target;
    for(var k in options){
        if(options.hasOwnProperty(k) && !decendent || decendent){
            target[k] = options[k];
        }
    }
}

/**
 * load plugin resource
 * @param obj
 * @param success
 */
function loadResource(obj,success){
    var xhr1= new XMLHttpRequest();
    xhr1.open('GET', chrome.extension.getURL(obj.url), true);
    if (obj.type && xhr1.overrideMimeType) {
        xhr1.overrideMimeType(obj.type);
    }

    xhr1.onreadystatechange = function(e) {
        if (this.readyState == 4 && this.status == 200) {
            success(this.response);
        }
    };
    xhr1.send();
}

/**
 * evaluate expression like "{var}"
 * @param obj
 * @param replace
 * @param ignore
 * @returns {*|evaluate}
 */
function evaluate(obj, replace, ignore){
    obj = obj || this;
    var regexp = /\{([a-zA-Z0-9_-]+)\}/gi;
    for(var k in obj){
        if(obj.hasOwnProperty(k) && (!ignore || !ignore(k))){
            var val = obj[k];
            if(regexp.test(val)){
                obj[k] = val.replace(regexp,replace)
            }
        }
    }
    return obj;
}

function selfEvaluate(obj,ignore){
    obj = obj || this;
    return evaluate(obj,function(str, p1){
        return obj[p1];
    },ignore);
}

function ElementHighlighter(options){
    extend(options, this.options);
}
ElementHighlighter.prototype = {

};

function retrieveNeighbourText(el, backward){
    var prevText = retrieveSiblingText(el, backward).trim();
    if(prevText) return prevText;
    else return retrieveNeighbourText(el.parentElement, backward);
}

function retrieveSiblingText(el, backward){
    var prev = backward ? el.previousSibling : el.nextSibling, text = "",nodeName;
    if(null != prev){
        text = prev.innerText || prev.textContent;
        text = text.trim();
        nodeName = prev.nodeName.toLowerCase();
        if(!text || nodeName == "script" || nodeName == "#comment"){
            return retrieveSiblingText(prev, backward);
        }
    }
    return text;
}

function inspectElement(inspect,uninspect,onselect,onescape){
    var self = this,
        activeTarget,
        inspectDecorator = function (e) {
            activeTarget = e.target;
            addClass(activeTarget, "inspect-decorator");
            inspect && inspect(activeTarget);
        },
        unInspectDecorator = function(e){
            if(e) activeTarget = e.target;
            removeClass(activeTarget, "inspect-decorator");
            uninspect && uninspect(activeTarget);
        },
        onInspect = function(e){
            self.off(e);
            onselect && onselect(e);
        },
        onEsc = function(e){
            if(e.keyCode == 27){
                self.off();
                onescape && onescape();
            }
        };
    this.on = function(){
        document.addEventListener("mouseover", inspectDecorator, false);
        document.addEventListener("mouseout", unInspectDecorator, false);
        document.addEventListener("mousedown", onInspect, false);
        document.addEventListener("keydown", onEsc, false);
        topTip.style.display = "block";
    };
    this.off = function(e){
        unInspectDecorator(e);
        document.removeEventListener("mouseover", inspectDecorator, false);
        document.removeEventListener("mouseout", unInspectDecorator, false);
        document.removeEventListener("mousedown", onInspect, false);
        document.removeEventListener("keydown", onEsc, false);
        topTip.style.display = "none";
    };

    var topTip = document.createElement("div");
    topTip.className = "top-tip";
    topTip.innerText = $T("inspector.window.tip");
    document.body.appendChild(topTip);
    topTip.addEventListener("mousedown",function(e){
        e.stopImmediatePropagation();
        e.stopPropagation();
        this.style.display = "none";
    },true);
    setTimeout(function(){
        addClass(topTip,"fade-out");
    },2000);

    this.on();

    return this;
}

//-------------- simple class manipulator ----------//
function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(obj, cls) {
    if (!this.hasClass(obj, cls)) obj.className = obj.className.trim() + " " + cls;
}

function removeClass(obj, cls) {
    if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, ' ');
    }
}

function toggleClass(obj,cls){
    if(hasClass(obj,cls)){
        removeClass(obj, cls);
    }else{
        addClass(obj, cls);
    }
}