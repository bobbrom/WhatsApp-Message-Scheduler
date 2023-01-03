
$( document ).ready(function() {
    document.getElementById('input-date').valueAsDate = new Date();

    // Add an event listener to the repeat_unit select element to toggle the visibility of the repeat input
    $('[name="repeat_unit"]').on('change', event => {
      // Get the value of the repeat_unit select element
      const repeatUnit = event.target.value;

      // If the repeat_unit is not "None"
      if (repeatUnit !== 'n') {
        // Show the repeat input and set its value to 1
        $('[name="repeat"]').closest('label').show();
        $('[name="repeat"]').val(1);
      } else {
        // Otherwise, hide the repeat input
        $('[name="repeat"]').closest('label').hide();
      }
    });

    $('[name="repeat_unit"]').on('change', event => {
      // Get the value of the repeat_unit select element
      const repeatUnit = event.target.value;

      // If the repeat_unit is not "None"
      if (repeatUnit !== 'n' && repeatUnit !== 'hol') {
        // Show the repeat input and set its value to 1
        $('[name="repeat"]').closest('label').show();
        $('[name="repeat"]').val(1);
      } else {
        // Otherwise, hide the repeat input
        $('[name="repeat"]').closest('label').hide();
      }

      // If the repeat_unit is not "Holiday"
      if (repeatUnit == 'hol') {
        // Show the repeat input and set its value to 1
        $('[name="country"]').closest('label').show();
        $('[name="holiday"]').closest('label').show();
      } else {
        // Otherwise, hide the repeat input
        $('[name="country"]').closest('label').hide();
        $('[name="holiday"]').closest('label').hide();
      }
    });

    $('#new-recipient').on('click', event => {
        console.log('new-recipient clicked');
        var last = $('.recipient-number').last();

        if(last.val() == '') {
            return;
        }
        $('.recipient-number').last().clone().appendTo('#phone-label');
        last.hide()

        console.log(last.val())
        $('#other-recipient').show()
        $('#other-recipient ul').append("<li>"+$('#recipient-name').val()+" -- "+last.val()+"</li>")

        $('#recipient-name').val('')
        $('.recipient-number').last().val('')
        $('#autocomplete-items').empty();
    });

});

  $(document).ready(function() {
    // Initial state: table is minimized and button shows "+"
    var tableMaximized = false;
    $('#message-table').hide();

    $('#maximize-button').click(function() {
      // Toggle the table's visibility and update the button
      if (tableMaximized) {
        $('#message-table').slideUp("slow");
      } else {
        $('#message-table').slideDown("slow");
      }
      tableMaximized = !tableMaximized;
    });
  });