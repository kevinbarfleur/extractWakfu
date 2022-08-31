const browserObject = require('./src/browser');
const scraperController = require('./src/scraper');

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
scraperController(browserInstance)