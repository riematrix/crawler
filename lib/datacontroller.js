/**
 * Created by Administrator on 2014/9/5.
 */
function DataCollector(){
    this.data = {};
}
DataCollector.prototype = {
    evaluate: function(){
        selfEvaluate();
    }
};
/*
DataCollector.prototype.evaluate = function{
    selfEvaluate
};*/
