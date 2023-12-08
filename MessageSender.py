import atexit
import csv
import datetime
import os
import random
import threading
import time

import pywhatkit as kit

from Message import Message


class MessageSender:
    message_send_buffer = 120

    def __init__(self, messages_file):
        self.is_running = True
        self.messages_file = messages_file
        self.messages = []

        # If messages_file does not exist, create it
        if not os.path.exists(self.messages_file):
            f = open(self.messages_file, "w")
            f.close()

        # Open the CSV file in read mode
        with open(messages_file, 'r', encoding='UTF-8') as f:
            # Create an empty list to store the new lines
            new_lines = []

            # Iterate through the lines in the CSV file
            for line in f:
                if len(line) > 5:
                    # Create a message object for the line
                    message = Message(csv_line=line)

                    # If the message is not an old message, add the line to the list of new lines
                    if not message.is_old_message():
                        self.messages.append(message)
                        new_lines.append(message.make_line())
                        print(message)

        # Open the CSV file in write mode and overwrite the file with the new lines
        with open(messages_file, 'w', encoding='UTF-8') as f:
            f.writelines(new_lines)

        if os.path.exists(os.path.join("static", "contacts.csv")):
            self.csv_validator(os.path.join("static", "contacts.csv"))
            self.add_sequential_id_to_csv(os.path.join("static", "contacts.csv"))

        if os.path.exists(os.path.join("static", "groups.csv")):
            self.csv_validator(os.path.join("static", "groups.csv"))
            self.add_sequential_id_to_csv(os.path.join("static", "groups.csv"))

        # Register the send_messages method to run on exit
        atexit.register(self.send_messages)

    def add_sequential_id_to_csv(self, csv_file):
        try:
            with open(csv_file, mode='r', newline='', encoding='utf-8') as file:
                reader = csv.reader(file)
                rows = list(reader)

            header = rows[0]
            id_column_index = None

            # Check if 'ID' column exists, if not, add it
            if 'ID' not in header:
                header.append('ID')
                id_column_index = len(header) - 1
            else:
                id_column_index = header.index('ID')

            # Add a sequential ID to each row
            if id_column_index is not None:
                for i, row in enumerate(rows[1:], start=1):
                    if len(row) <= id_column_index:
                        row.extend([''] * (id_column_index - len(row) + 1))
                    if not row[id_column_index]:
                        row[id_column_index] = str(i)

            # Write the modified data back to the CSV file
            with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerows(rows)

        except Exception as e:
            print("Error:", e)

    def csv_validator(self, input_file_path):
        clean_rows = []

        with open(input_file_path, 'r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            for row in reader:
                clean_rows.append(row)

        # Checking if the file has any content
        if not clean_rows:
            print("The file is empty.")
            return

        # Assuming the first row is the header
        header = clean_rows[0]
        expected_columns = len(header)

        # Validate and adjust each row
        corrected_lines = []
        for row in clean_rows:
            if len(row) < expected_columns:
                # Add missing columns
                row += [''] * (expected_columns - len(row))
            elif len(row) > expected_columns:
                # Truncate extra columns
                row = row[:expected_columns]

            corrected_lines.append(row)

        # Write the corrected data back to the file
        with open(input_file_path, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerows(corrected_lines)

    def get_messages(self):
        messages = []
        for message in self.messages:
            if not message.is_old_message():
                messages.append(message)
        return sorted(messages, key=lambda message: message.date)

    def add_message(self, recipient, message, hour=None, minute=None, date=None, repeat=None, repeat_unit=None,
                    holiday_name=None):
        new_message = Message(recipient, message, hour, minute, date, repeat, repeat_unit)
        self.messages.append(new_message)

        # Save message to file
        with open(self.messages_file, 'a', encoding='UTF-8') as f:
            f.write(f"{recipient},{message},{hour},{minute},{date},{repeat},{repeat_unit},{holiday_name}\n")
        self.send_message(new_message)

    @staticmethod
    def send_today(message_info):
        # Check if the current date matches the date specified for the message
        now = datetime.datetime.now()
        date_split = "-".split(message_info.date)

        is_date = message_info.date is None
        is_date_now = now.strftime('%Y-%m-%d') == message_info.date

        # Check if the message should be repeated
        if message_info.repeat is not None:
            # Parse the repeat interval
            year_interval = month_interval = week_interval = day_interval = False
        else:
            year_interval = message_info.repeat_unit == 'y' and (
                    now.strftime(date_split[2] + '-%m-%d') == message_info.date and (
                    datetime.datetime.now().year - int(date_split[2])) % int(message_info.repeat) == 0)
            week_interval = message_info.repeat_unit == 'w' and (
                    datetime.datetime.utcnow() - datetime.datetime(int(date_split[2]), int(date_split[1]),
                                                                   int(date_split[0]))).days % (
                                    7 * int(message_info.repeat)) == 0
            month_interval = datetime.datetime.utcnow().day == date_split[0]
            day_interval = message_info.repeat_unit == 'd' and (
                    datetime.datetime.utcnow() - datetime.datetime(int(date_split[2]), int(date_split[1]),
                                                                   int(date_split[0]))).days % int(
                message_info.repeat) == 0
        return is_date or is_date_now or year_interval or month_interval or week_interval or day_interval

    def send_message(self, message_info):
        hour = int(message_info.hour)
        minute = int(message_info.minute)

        if message_info.recipient.startswith('+') or message_info.recipient.startswith('0'):
            # If phone number starts with 0 make '+44' the country code
            if message_info.recipient.startswith('0'):
                message_info.recipient = '+44' + message_info.recipient[1:]

            # Send message to individual
            kit.sendwhatmsg(message_info.recipient, message_info.message, hour, minute,
                            MessageSender.message_send_buffer, tab_close=True)
        else:
            # Send message to group
            kit.sendwhatmsg_to_group(message_info.recipient, message_info.message, hour, minute,
                                     MessageSender.message_send_bufferpyth, tab_close=True)

    def delete_old_messages(self):
        # Open the CSV file in read mode
        with open(self.messages_file, 'r', encoding='UTF-8') as f:
            # Create an empty list to store the new lines
            new_lines = []

            # Iterate through the lines in the CSV file
            for line in f:
                if len(line) > 5:
                    # Create a message object for the line
                    message = Message(csv_line=line)

                    # If the message is not an old message, add the line to the list of new lines
                    if not message.is_old_message():
                        new_lines.append(message.make_line())

        # Open the CSV file in write mode and overwrite the file with the new lines
        with open(self.messages_file, 'w', encoding='UTF-8') as f:
            f.writelines(new_lines)

    def send_messages(self):
        wait_time = 60 * 5
        last_get_messages = None  # keep track of the last time get_messages was called
        while self.is_running:
            # Check if it's time to call get_messages
            now = datetime.datetime.now()

            if last_get_messages is None or (now.hour == 0 and (now - last_get_messages).seconds > 60 * 60):
                # Delete old messages
                self.delete_old_messages()
                # Call get_messages if it's the first run or if it's after 2 AM and the last call was before today
                messages = self.get_messages()
                last_get_messages = now  # update the last get_messages time

            # Send the messages
            for message_info in messages:
                if message_info.hour is None or message_info.minute is None:
                    # If no hour or minute is specified, choose a random time in the morning
                    message_info.hour = random.randint(8, 11)
                    message_info.minute = random.randint(0, 59)

                if self.send_today(message_info):
                    # boolean of if message will be sent within wait_time
                    now = datetime.datetime.now()
                    within_wait_time = datetime.timedelta(hours=message_info.hour, minutes=message_info.minute)
                    now_time = datetime.timedelta(hours=now.hour, minutes=now.minute, seconds=now.second)

                    if (now_time - within_wait_time).seconds < wait_time:
                        self.send_message(message_info)
                        messages.remove(message_info)

            # Wait before checking again
            time.sleep(wait_time)

    def start_thread(self):
        self.thread = threading.Thread(target=self.my_daemon_thread)
        self.thread.daemon = True
        self.thread.start()

    def stop_thread(self):
        self.is_running = False


if __name__ == "__main__":
    # Create messages.txt file if it doesn't exist
    if not os.path.exists('messages.txt'):
        open('messages.txt', 'w').close()

    messageSender = MessageSender('messages.txt')
    messageSender.send_messages()
