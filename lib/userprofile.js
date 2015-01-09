/**
 * Created by Stanley Zhou on 2015/1/4.
 */
var userProfiles = {
    add: function(profile) {
        this[profile.id] = profile
    }
},
    myProfile = new UserProfile({
    id: new Date().getTime(),
    username: "anonymous",
    isMaster: true
});

fsDeferred.done(function() {
    UserProfile.load(fs, function(data) {
        var profile = new UserProfile(data);
        userProfiles.add(profile);
        if (profile.isMaster) {
            myProfile = profile;
            chrome.runtime.sendMessage({
                method: "updateMasterAlias",
                data: myProfile.username
            });
        }
    })
});

function changeUserProfile() {
    var message = "<img src='" + myProfile.headImage + "'/>";
    message += "<p><label for='headimg' >\t\t</label><input type='file' id='headimg'/></p>";
    message += "<p><label for='username' >\t\t</label><input type='text' id='username'" + myProfile.username + "/></p>";
    lightBox.popup({title: $T("headimg.upload.title"),body: message}, function(content) {
        var headimage = content.getElementsByTagName("input")[0].value.trim(),
            name = content.getElementsByTagName("input")[1].value.trim();
        if (!headimage || !name) {
            throw new Error("no file selected")
        } else {
            if (name) {
                myProfile.username = name
            }
            var imageInput = content.getElementsByTagName("input")[0].files[0],
                filereader = new FileReader();
            filereader.onload = function(e) {
                myProfile.headImage = e.target.result;
                myProfile.save(fs)
            };
            if (imageInput) {
                filereader.readAsDataURL(imageInput)
            } else {
                myProfile.save(fs)
            }
        }
    })
}
function pullNeighbours() {
    chrome.runtime.sendMessage({method: "pullNeighbours"})
}
function onNeighbourClick(a) {
    myProfile.notify(a, "HOWDY!")
}
function broadcastNotify() {
    myProfile.notify("HOWDY!")
}
var traces = {};
function trackTarget(b, a) {
    b.addEventListener("blur", function() {
        console.log(this.value)
    })
}