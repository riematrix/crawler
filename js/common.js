/**
 * Created by Stanley Zhou on 2015/1/9.
 */
function Queue(fns){
    this.processes = [];
    if(fns) this.addAll(fns);
}
Queue.prototype = {
    add: function(fn){
        this.processes.push(fn);
        return this;
    },
    addAll: function(fns){
        var processes = this.processes;
        this.processes = Array.prototype.concat.call(processes,fns);
        return this;
    },
    execute: function(callback){
        var processes = this.processes.slice();
        var chain = function(){
            if(processes.length === 0){
                if(typeof callback === "function") callback();
                return;
            }
            var process = processes.shift();
            if(typeof process === "function"){
                process(chain);
            }
        };
        chain();
    }
};

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
 * simple deferred object
 * @constructor
 */
function Deferred(){
    this._done = [];
    this._fail = [];
}
Deferred.prototype = {
    execute: function(list, args){
        var i = list.length;
        args = Array.prototype.slice.call(args);
        while(i--) list[i].apply(null, args);
    },
    resolve: function(){
        this.execute(this._done, arguments);
    },
    reject: function(){
        this.execute(this._fail, arguments);
    },
    done: function(callback){
        this._done.push(callback);
        return this.promise();
    },
    fail: function(callback){
        this._fail.push(callback);
        return this.promise();
    },
    promise: function(){
        return this;
    }
};