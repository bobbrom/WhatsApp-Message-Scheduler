$(document).ready(function() {
    var messageDateTimeElements = document.getElementsByClassName("message-datetime")
    var messageCountdownElements = document.getElementsByClassName("message-countdown")

    for (var i = 1; i < messageDateTimeElements.length; i++) {
        console.log(messageDateTimeElements[i].innerHTML)
        console.log(moment(messageDateTimeElements[i].innerHTML, "DD/MM/YYYY {hh:mm:ss}"))
        var count_down = moment(messageDateTimeElements[i].innerHTML, "DD/MM/YYYY {hh:mm:ss}").fromNow()
        messageCountdownElements[i].innerHTML = count_down
    }

});