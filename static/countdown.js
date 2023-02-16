$(document).ready(function() {
    var messageDateTimeElements = document.getElementsByClassName("message-datetime")
    var messageCountdownElements = document.getElementsByClassName("message-countdown")

    for (var i = 1; i < messageDateTimeElements.length; i++) {
        var count_down = moment(messageDateTimeElements[i].innerHTML, "DD/MM/YYYY {hh:mm:ss}").fromNow()
        messageCountdownElements[i].innerHTML = count_down
    }

});