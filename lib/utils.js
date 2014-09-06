/**
 * Created by Administrator on 2014/9/2.
 */

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