/**
 * Created by Stanley Zhou on 2014/12/27.
 */

function DomainMonitor(){
    //
}
DomainMonitor.prototype = {
    localEntry: "localize_domains",
    query: function(){
        var allowExecuteDomains = localStorage.getItem(this.localEntry);
            allowExecuteDomains = allowExecuteDomains ? JSON.parse(allowExecuteDomains) : {};
        return allowExecuteDomains;
    },
    save: function(domains){
        localStorage.setItem(this.localEntry,JSON.stringify(domains));
    },
    approve: function(host){
        host = host || location.host;
        var allowExecuteDomains = this.query();
        if(!allowExecuteDomains[host]){
                allowExecuteDomains[host] = true;
            }
        this.save(allowExecuteDomains);
    },
    reject: function(host){
        host = host || location.host;
        var allowExecuteDomains = this.query();
        delete allowExecuteDomains[host];
        this.save(allowExecuteDomains);
    },
    check: function(host){
        host = host || location.host;
        var allowExecuteDomains = this.query();
        return !!allowExecuteDomains[host];
    }
};