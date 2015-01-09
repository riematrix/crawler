/**
 * Created by Stanley Zhou on 2015/1/2.
 */
var translations = {};
var $T = function(string,vars){
    var translation = translations[string];
    var varRegexp = /\{([a-zA-Z0-9_-]+)\}/gi;
    if(typeof translation == 'undefined') return string;
    else if(translation.substr(0,1) == '$') return $T(translation.substr(1),vars);
    else if(varRegexp.test(translation)) {
        translation = translation.replace(varRegexp,function(str, p1){
            return vars[p1] || "";
        });
    }
    return translation;
};

$T.registerPack = function(pack){
    translations = pack;
};
$T.init = function(){
    var lang = navigator.userLanguage
        || navigator.language
        || 'en',
        code = lang.split('-')[0];
    $T.locale = code;
    var path = $T.langPackagePath = 'libs/langpacks/' + code + '.js';

    //For content script sand box
    chrome.runtime.sendMessage({method: 'updateContentLocale',
        data: {path: path}});
};
$T.loadResource = function(callback){
    injectCode($T.langPackagePath, false, function(){
        if(typeof callback === "function") callback();
    });
};

$T.init();