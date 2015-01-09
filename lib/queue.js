/**
 * The MIT License (MIT)

 Copyright (c) 2014 riematrix

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 * Date: 14-7-13
 * Time: 上午11:17
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
