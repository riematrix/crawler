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
 * inject code into real page sandbox
 * @param code
 * @param inline
 * @param onload
 */
function injectCode(code, inline, onload){
    var script = document.createElement("script");
    script.type="text/javascript";
    script.onload = onload;
    var q = new Queue();
    var complete = function(){
        document.head.appendChild(script);
        script.parentElement.removeChild(script);
    };
    if(code.substr(code.length-3)===".js"){
        if(inline){
            q.add(function(next){
                loadResource({url: code},function(data){
                    script.innerHTML = data;
                    next();
                });
            });
        }
        else{
            script.src = code;
        }
    }
    else{
        script.innerHTML = code;
    }
    q.add(complete).execute();
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