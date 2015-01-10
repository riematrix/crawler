function LightBox(){
    this.lightbox = document.createElement("div");
    this.dimmer = document.createElement("div");
    this.content = document.createElement("div");
    this.header = document.createElement("div");

    var lightbox = this.lightbox;
    lightbox.id = "lightbox";
    var content = this.content,
        header = this.header,
        bar = document.createElement("div"),
        confirm = document.createElement("a"),
        cancel = document.createElement("a");
    content.className = "content";
    header.className = "lightbox-header";
    confirm.className = "lightbox-button lightbox-confirm";
    cancel.className = "lightbox-button lightbox-cancel";
    header.innerText = "Message";

    this.cancelDom = cancel;
    this.confirmDom = confirm;

    bar.className = "lightbox-bar";
    this.dimmer.className = "dimmer";
    bar.appendChild(confirm);
    bar.appendChild(cancel);
    lightbox.appendChild(header);
    lightbox.appendChild(content);
    lightbox.appendChild(bar);

    document.body.appendChild(lightbox);
}
LightBox.prototype = {
    popup: function (message,confirm,cancel){
        var lightbox = this.lightbox,
            dimmer = this.dimmer;

        this.content.innerHTML = message.body;
        this.header.innerText = message.title;
        if(message.hideConfirm)addClass(this.confirmDom,"invisiable");

        dimmer.style.width =  window.innerWidth + 'px';
        dimmer.style.height = window.innerHeight + 'px';

        document.body.appendChild(dimmer);

        lightbox.style.visibility = 'visible';
        lightbox.style.top = window.innerHeight/2 - 100 + 'px';
        lightbox.style.left = window.innerWidth/2 - 200 + 'px';
        lightbox.style.margin = "0";

        var input = lightbox.getElementsByTagName("input")[0];
        input && input.focus();

        var self = this;
        this.confirmDom.innerText = $T("lightbox.button.confirm");
        this.cancelDom.innerText = $T("lightbox.button.cancel");
        this.cancelDom.onclick = function(){
            self.close();
            if(cancel) cancel();
        };
        this.confirmDom.onclick = function(){
            if(confirm) {
                try{
                    confirm(self.content);
                }
                catch(e){
                    var error = self.errorDom;
                    if(!error)
                    {
                        error = document.createElement("p");
                        error.style.color = "red";
                        error.className = "error-text";
                        self.errorDom = error;
                        self.lightbox.appendChild(error);
                    }
                    error.innerText = e.message;
                    error.style.display = "block";
                    return;
                }
            }
            self.close();
        };
        return false;
    },
    close: function(){
        if(this.errorDom) this.errorDom.style.display = "none";
        this.lightbox.style.marginLeft = "-99999px";
        document.body.removeChild(this.dimmer);
        this.lightbox.style.visibility = 'hidden';
        removeClass(this.confirmDom,"invisiable");
    }
};