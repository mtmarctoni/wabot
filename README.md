# WhatsApp Message Scheduler

This project is a WhatsApp bot that allows users to schedule messages to be sent at a later time via a web interface or directly via whatsapp message.

## Setup and Run

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
2.  **Install server dependencies:**
    ```bash
    npm install
    ```
3.  **Install client dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```
4.  **Configure environment variables:**
    - Create a `.env` file in the root directory by copying the `template.env` file.
    - Update the `.env` file with your specific configuration details.
5.  **Start the server:**
    ```bash
    npm start
    ```
6.  **Access the frontend:**
    - Open your web browser and navigate to `http://localhost:<port>`, where `<port>` is the port number specified in your `.env` file (default is 3000).

## Project Structure

-   `server.js`: Main server file, handles WhatsApp client initialization, message queuing, and API routes.
-   `client/`: Contains the React frontend application.
-   `botFunctions.js`: Includes functions related to bot operations like listening to messages.
-   `msgQueue.js`: Manages the queue for scheduled messages.
-   `config.js`: Handles application configuration, likely loading from `.env`.
-   `template.env`: Template file for environment variables.
-   `data/`: Directory potentially used for storing data (e.g., session information, message logs).

## How to Use

1.  **Authentication:**
    -   When you first run the server (`npm start`), a QR code will be displayed in the terminal.
    -   Scan this QR code with your WhatsApp mobile app (Link a device) to authenticate the bot.
    -   Session information will be saved locally in the `data/` folder (or as configured) so you don't have to scan the QR code every time.
2.  **Scheduling Messages:**
    -   Once the server is running and authenticated, open the web interface (default: `http://localhost:3000`).
    -   Use the form to enter the recipient's WhatsApp number (without the `@c.us` suffix, just the number), the message content, and the desired date and time for sending.
    -   Click "Schedule Message". You should see a confirmation if the message is scheduled successfully.
    -   The bot will automatically send the message at the scheduled time.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug fixes, please feel free to open an issue or submit a pull request.
