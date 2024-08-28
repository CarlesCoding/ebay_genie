<h1 align="center">Ebay Genie</h1>
<p align="center">
    <img src="./img/logo.png" alt="Logo" style="width: 15%; height: auto; border-radius: 50%;" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/Beefymuffins/Ebay-Genie#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/Beefymuffins/Ebay-Genie/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/maintained-yes-green.svg" />
  </a>
  <a href="https://github.com/Beefymuffins/Ebay-Genie/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> **Disclaimer**: This project is a personal endeavor and is developed in my spare time. Please note that development progress may vary, and contributions are welcome.

<p align="left">
eBay Genie is a powerful CLI application designed to streamline your eBay selling experience. With eBay Genie, you can effortlessly manage multiple aspects of your eBay listings, including creating new eBay accounts, boosting your listings' visibility, and managing proxies.
</p>

<!-- Features -->

## Features

- **Create eBay Accounts**: Automate the process of creating multiple eBay accounts with ease.

- **Add Views to eBay Listings**: Increase the visibility of your listings by adding views.

- **Add Watchers to eBay Listings**: Use the created eBay accounts to add watchers, making your listings more attractive to potential buyers.

- **Proxy Management**: Get, add, and test proxies to ensure smooth and secure operations.

<!-- Images -->

## Example Images

![ebay-genie-1](https://github.com/user-attachments/assets/3c56eace-b067-4c0e-84ef-b422dd0f3411)

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

You will need Node and Npm preinstalled before running the program.

- node >= 18
- npm

  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repository and navigate to it

   ```sh
   git clone https://github.com/Beefymuffins/Ebay-Genie.git
   ```

2. Navigate to the folder
   ```sh
   cd Ebay-Genie
   ```
3. Install NPM packages

   ```sh
   npm install
   ```

4. Start the development environment

   ```sh
    npm run dev
   ```

<!-- Documentation -->

## Documentation

For detailed instructions and documentation, please visit [eBay Genie Documentation](https://beefy.gitbook.io/ebay-genie/).

<!-- API Examples -->

<!-- Tech Stack -->

## Built With

- **[Playwright](https://www.npmjs.com/package/playwright)**: A powerful library for browser automation, used for interacting with eBay and managing listings.
- **[axios](https://www.npmjs.com/package/axios)**: A promise-based HTTP client for making requests to external APIs.
- **[2Captcha](https://www.npmjs.com/package/@extra/recaptcha)**: Handles reCAPTCHA challenges during account creation and verification.
- **[inquirer](https://www.npmjs.com/package/inquirer)**: Provides an interactive command-line interface for user prompts and input.
- **[sqlite3](https://www.npmjs.com/package/sqlite3)**: For local database storage, and managing user data.
- **[puppeteer-extra-plugin-stealth](https://www.npmjs.com/package/puppeteer-extra-plugin-stealth)**: Plugin to make headless puppeteer usage undetectable.

### Additional Tools

These tools further enhance the functionality and user experience of eBay Genie:

- **[chalk](https://www.npmjs.com/package/chalk)**: For styling console output, making terminal messages more readable and visually appealing.
- **[gradient-string](https://www.npmjs.com/package/gradient-string)**: Adds colorful gradients to terminal messages, enhancing the visual experience.

<!-- Roadmap -->

## Roadmap

Here are some planned features and improvements for future releases:

- [ ] **Enhanced Account Creation**: Improve the reliability and speed of the account creation process.
- [ ] **Add Api Key**: Add the need for an API key to be able to run the app.
- [ ] **Improved CAPTCHA Handling**: Improve the captcha Monitor and solving functionality. Also, Integrate additional CAPTCHA solving services for better accuracy.
- [ ] **User-Friendly CLI**: Refine the CLI interface for easier navigation and usage.
- [ ] **Documentation Enhancements**: Expand the documentation with more examples and troubleshooting tips.
- [ ] **Error Handling**: Improve error handling throughout the application.
- [ ] **Process Title Update**: Implement a function to update the process title.
- [x] **Account Object Enhancement**: Add a "banned" property to the account object to indicate if the account is banned on login.
- [ ] **Load from File Option**: Add an option to load details from a file using user config.json for use on a new machine.
- [x] **Locator Management**: Consolidate all locators in a single file for easy updating.
- [ ] **Phone Number Re-Verification**: If login requires a sms text to phone number, add 2fa option to get around this.
- [ ] **Enhance ebay module**: Add ability to do multiple listings at once.

Feel free to suggest additional features or improvements by opening an issue or submitting a pull request!

<!-- CONTACT -->

## Contact

👤 Austin Carles

- Linkedin: [@carlescoding](https://www.linkedin.com/in/carlescoding/)
- Github: [@Beefymuffins](https://github.com/CarlesCoding)

Project Link: [https://github.com/Beefymuffins/Ebay-Genie](https://github.com/CarlesCoding/Ebay-Genie)

<!-- Acknowledgments  -->

<!-- Credits -->

<!-- LICENSE -->

## License

Distributed under the [MIT](https://github.com/CarlesCoding/Ebay-Genie/blob/main/LICENSE) License.
