$(function() {
  // Function to update the minimum date and time
  function updateMinDateTime(secondsToAdd) {
    // Get the current time
    var now = new Date();

    // Calculate the minimum date and time that can be selected
    var minDate = new Date( now.valueOf() + secondsToAdd * 1000 );
    minDate.setSeconds(0);
    minDate.setMilliseconds(0);
    minDate.setMinutes( minDate.getMinutes() + 1 );
    var minTime = minDate.toTimeString().split(" ")[0];

    // Get the date input and check if the day is after today
    var dateInput = document.getElementById('input-date');
    var date = new Date(dateInput.value);
    var isAfterToday = date > now;

    if (!isAfterToday && $("#input-time").prop("min") != minTime) {
    // Set the minimum time for the time inputs
      $("#input-time").prop("min", minTime);
    }

    if (minDate.toISOString().split("T")[0] != dateInput.min) {
        // Set the minimum date for the date inputs
        $("#input-date").prop("min", minDate.toISOString().split("T")[0]);
    }

    // Update the minimum time if the date is changed
    $("#input-date").on("change", function() {
      // Get the new minimum date and time
      var newMinDate = new Date(this.value + "T00:00:00");
      var newMinTime = newMinDate instanceof Date && !isNaN(newMinDate) ? newMinDate.toTimeString().split(" ")[0] : null;

      if(newMinDate > new Date()) {
        // Remove min attribute if the new minimum date is in the future
        $("#input-time").removeAttr("min");
      }else if (newMinTime) {
        // Set the new minimum time
        $("#input-time").prop("min", newMinTime);

        // If the current time is before the new minimum, reset the time input to the new minimum
        var currentTime = new Date();
        if (currentTime < newMinDate) {
          $("#input-time").val(newMinTime);
        }
      }
    });

    // Update the time input if it's left blank so that the new minimum is above that
    var selectedTime = new Date($("#input-date").val() + "T" + $("#input-time").val());

    if (selectedTime == "Invalid Date" || selectedTime < minDate) {
      $("#input-time").val(minTime);
    }
  }

  // Function to update the script every second
  function updateEverySecond() {
    // Make an HTTP GET request to /message_send_buffer to get the number of seconds to add
    $.get("/message_send_buffer", function(data) {
      var secondsToAdd = parseInt(data) + 30;
      updateMinDateTime(secondsToAdd);
    });
  }

  // Call the function to update the script every second
  setInterval(updateEverySecond, 1000);
});
