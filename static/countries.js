// Load the CSV file and store the country data in an object with the country code as the key
const countryData = {};
$( document ).ready(function() {
    $.get('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv', data => {
      // Split the text into rows
      const rows = data.split('\n');

      // Extract the headings from the first row
      const headings = rows[0].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

      // Iterate through the remaining rows
      for (let i = 1; i < rows.length; i++) {
        // Split the row into cells

        let cells;
        Papa.parse(rows[i], {
          delimiter: ',',
          quoteChar: '"',
          complete: function(results) {
            cells = results.data[0];
          }
        });
        if(cells == null){
          continue;
        }

        // Create an object for the country
        const country = {};

        // Iterate through the cells and add the cell values to the country object
        for (let j = 0; j < cells.length; j++) {
          country[headings[j]] = cells[j];
        }

        // Add the country object to the countryData object with the country code as the key
        countryData[country['alpha-2']] = country['name'];
      }
    });
});

// Set up an autocomplete function for the country input field
function autocomplete(inp) {
  // Get the autocomplete items container element
  var items = $('#autocomplete-items-country');

  // Close any open lists of autocomplete items
  $('#autocomplete-items-country').empty();
  // If the input field is empty, do nothing
  if (!inp.val()) {
    return false;
  }

  // Create a new div element for each matching item
  items.empty();
  $.each(countryData, function(key, country) {
    if (country.substr(0, inp.val().length).toUpperCase() == inp.val().toUpperCase()) {
      $('<div>')
        .html("<strong>" + country.substr(0, inp.val().length) + "</strong>" + country.substr(inp.val().length))
        .append(
          $('<input>').attr('type', 'hidden').val(key)
        )
        .appendTo(items)
        .click(function() {
          inp.val(country);
          $('#country-code').val(key);
          $('#autocomplete-items-country').empty();
          fillHolidayDropdown(); // Fill the holiday dropdown with holidays for the selected country
        });
    }
  });
}

// Close all autocomplete lists in the document
//function closeAllLists(elmnt) {
//  /*close all autocomplete lists in the document,
//  except the one passed as an argument:*/
//  var x = document.getElementsByClassName("autocomplete-items-country");
//  for (var i = 0; i < x.length; i++) {
//    if (elmnt != x[i] && elmnt != inp) {
//      x[i].parentNode.removeChild(x[i]);
//    }
//  }
//}

// Set up the input field to trigger the autocomplete function
$( document ).ready(function() {
    $('.country').on('input', function() {
      autocomplete($(this));
    });
});

function fillHolidayDropdown() {
    // Get the country code from the input field
    const countryCode = $('#country-code').val();

    // Make a GET request to the holidays endpoint with the country code as a query parameter

    $.get('/holidays?country_code='+countryCode, function(data) {
    if(data != null && data != "null"){
        // Clear the options in the holiday select element
        $('#holiday').empty();

        holidays = JSON.parse(data);

        // Iterate through the array of holidays
        holidays.forEach(holiday => {

          // Create a new option element for each holiday
          const option = $('<option>').text(holiday).val(holiday);

          // Add the option element to the holiday select element
          $('#holiday').append(option);
        });

        // Show the holiday select element
        $('#holiday').show();
    }
    });
}


$( document ).ready(function() {
    $('.country-code').on('input', function() {
        fillHolidayDropdown();
    });
    $('#holiday').on('input', function() {
        console.log(this.value);
    });

    $('#holiday').change(function() {
      // Get the country code and holiday from the input fields
      const countryCode = $('#country-code').val();
      const holiday = $(this).val();

      // Make a GET request to the holiday_date endpoint with the country code and holiday as query parameters
      $.get(`/holiday_date?country_code=${countryCode}&holiday=${holiday}`, function(data) {
        // Update the value of the input-date field with the date received from the server
        $('#input-date').val(data);
      });
    });

});
