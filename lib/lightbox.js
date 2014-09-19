function LightBox(options){
    var container = document.createElement("div");
    container.className = "light-box";
    document.body.appendChild(container);
    this.container = container;

    var dimmer = document.createElement("div");
    dimmer.style.width =  window.innerWidth + 'px';
    dimmer.style.height = window.innerHeight + 'px';
    dimmer.className = 'dimmer';
    this.dimmer = dimmer;
    document.body.appendChild(dimmer);

    container.style.visibility = 'visible';
    container.style.top = window.innerHeight/2 - 50 + 'px';
    container.style.left = window.innerWidth/2 - 100 + 'px';
}
LightBox.prototype = {
    popup: function(options){
        options.head;
        options.content;
    },
    close: function(){},
    update: function(options){}
};