/**
 * Created by Stanley Zhou on 2014/11/16.
 */
function Operation(event, target){
    this.event = event;
    this.target = target;
}
Operation.prototype = {
    trigger: function(){
        $(this.target).trigger(event);
    }
};

function Trace(){
    this.queue = new Queue();
}
Trace.prototype = {
    monitorEvents: [
        "click",
        "keyup",
        "focus",
        "blur"
        //etc.
    ],
    monitor: function(ev){
        var eventType = ev.type,
            xpath = Xpath.getElementXPath(ev.target);
        var opt = new Operation(eventType, xpath);
    },
    activate: function(){
        var monitor = this.monitor,
            events = this.monitorEvents.join(" ");
        $(document).bind(events,monitor);
    },
    inactivate: function(){
        var monitor = this.monitor,
            events = this.monitorEvents.join(" ");
        $(document).unbind(events,monitor);
    }
};