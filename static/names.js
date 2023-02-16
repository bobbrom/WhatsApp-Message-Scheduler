// Load the CSV file and store the contacts in an object with the phone number as the key
const contactArr = {};
$( document ).ready(function() {
    $.get('static/contacts.csv', data => {
      // Split the text into rows
      const rows = data.split('\n');

      // Extract the headings from the first row
      const headings = rows[0].split(',');

      // Iterate through the remaining rows
      for (let i = 1; i < rows.length; i++) {
        // Split the row into cells
        const cells = rows[i].split(',');

        // Create an object for the contact
        const contact = {};

        // Iterate through the cells and add the cell values to the contact object
        for (let j = 0; j < cells.length; j++) {
          contact[headings[j]] = cells[j];
        }

        let phoneNumberHeadings = ['Telephone (mobile)', 'Telephone (home)', 'Telephone (work)', 'Telephone (main)'];
        let contactPhoneNumber = "";
        for (let i = 0; i < phoneNumberHeadings.length; i++) {
            if (contact[phoneNumberHeadings[i]] != "" && contact[phoneNumberHeadings[i]] != undefined) {
                contactPhoneNumber = contact[phoneNumberHeadings[i]];
                break;
            }
        }
        if(contactPhoneNumber == "" || contactPhoneNumber == undefined) {
          //console.log("No phone number found for " + contact['First name'] + " " + contact['Last name']);
          continue;
        }

        if(contactPhoneNumber.charAt(0) == '0') {
            contactPhoneNumber = '+44' + contactPhoneNumber.substring(1);
        }

        // Add the contact object to the contacts object with the phone number as the key
        contactArr[contactPhoneNumber] = contact;
      }

        // Iterate through the rows of the table
        $('tr').each((index, row) => {
          // Get the phone number from the row
          var phone = $(row).find('.message-recipient').text().trim();

          if(phone.charAt(0) == '0') {
            phone = '+44' + phone.substring(1);
          }


          // Get the contact with the matching phone number
          const contact = contactArr[phone];

          // If a matching contact was found
          if (contact) {
            const firstName = contact['First name'] || contact['First name'] == "undefined" ? contact['First name'] : '';
            const lastName = contact['Last name'] || contact['Last name'] == "undefined"  ? contact['Last name'] : '';

            // Get the full name of the contact
            const fullName = `${firstName} ${lastName}`;

            // Update the "Phone" column with the full name of the contact
            $(row).find('.message-name').text(fullName);
          }
        });
    });
});