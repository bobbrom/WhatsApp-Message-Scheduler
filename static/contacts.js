// Load the CSV file and store the contacts in an array
const contacts = [];

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

        // Add the contact object to the contacts array
        contacts.push(contact);
    }
});

// Add an event listener to the recipient-name input to provide suggestions
$(document).ready(function() {
    $('#recipient-name').on('input', event => {
        // Get the value of the input
        const value = event.target.value;

        // Clear the existing suggestions
        $('#autocomplete-items').empty();

        if (value == "") {
            $('.recipient-name-label').css('margin-bottom', '10px');
            return;
        }
        // Filter the contacts array to get the matching names
        const matchingContacts = contacts.filter(contact => {
            const fullName = `${contact['First name']} ${contact['Last name']}`;
            return fullName.toLowerCase().includes(value.toLowerCase());
        });

        $('.recipient-name-label').css('margin-bottom', '0');
        // Add the matching names as suggestions
        matchingContacts.forEach(contact => {
            const fullName = `${contact['First name']} ${contact['Last name']}`;
            $('#autocomplete-items').append(`<div>${fullName}</div>`);
        });

        $('.autocomplete-items div').on('click', event => {
            const name = event.target.innerText;
            console.log(name);
            $('#recipient-name').val(name);
            $('#autocomplete-items').empty();
            setPhoneNumberInput(name)
        });

    });
});


function setPhoneNumberInput(name) {
    // Find the contact with the matching name
    const contact = contacts.find(contact => {
        const fullName = `${contact['First name']} ${contact['Last name']}`;
        return fullName.toLowerCase().includes(name.toLowerCase());
    });

    // Update the recipient-number input with the phone number of the matching contact
    if (contact != null) {
        let phoneNumberHeadings = ['Telephone (mobile)', 'Telephone (home)', 'Telephone (work)', 'Telephone (main)'];
        let phoneNumber = null;
        for (let i = 0; i < phoneNumberHeadings.length; i++) {
            if (contact[phoneNumberHeadings[i]] != "") {
                phoneNumber = contact[phoneNumberHeadings[i]];
                break;
            }
        }

        $('.recipient-number').last().val(phoneNumber);
    }
}

// Add an event listener to the recipient-name input to update the recipient-number input when a suggestion is selected
$(document).ready(function() {
    $('#recipient-name').on('change', event => {
        // Get the selected name
        const name = event.target.value.trim();
        setPhoneNumberInput(name)
    });
});