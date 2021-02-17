const ProxyLists = require('proxy-lists');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const ProxyVerifier = require('proxy-verifier');
const fs = require('fs');

const urlLink = 'https://www.youtube.com/watch?v=JBQGHqv-pCI';
const instances = 5;

var app = express();

let proxyArray = [];
let chromeCounter = 0;
let successCounter = 0;
let failCounter = 0;
let workingProxies = [];

var app = express();
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// listen to port
app.listen(process.env.PORT || 13000);
console.log(`You are listening to port ${process.env.PORT || 13000}`);

app.post('/watch', (req, res) => {
    amount = +req.body.amount;
    value = req.body.value;
    requestController();
    console.log('Sending spam for: ', req.body.value);
    res.end('Accepted');
});

const runChrome = async (url, ip, port) => {
    chromeCounter++
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        defaultViewport: null,
        args: [
            // '--mute-audio',
            "--autoplay-policy=no-user-gesture-required",
            `--proxy-server=${ip}:${port}`,
            `--ignore-certificate-errors`,
            '--single-process', 
            '--no-zygote', 
            '--no-sandbox'
        ]
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000); 
    try {
        await loadDirPage(page);
    } catch (e) {
        chromeCounter--;
        await browser.close();
        return;
    }
    await  new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 5000);
    });
    setInterval(() => {
        clickAll(page, browser);
    }, 5000);
    try {
        await loadUrlPage(page, url);
    } catch (e) {
        chromeCounter--;
        await browser.close();
        return;
    }
    await  new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 5000);
    });
    await  new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 5000);
    });
    await  new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, (Math.floor(Math.random() * 31) + 50) * 1000);
    });
    await browser.close();
    chromeCounter--;
    successCounter++;
    fs.writeFile('counter.txt', successCounter + '', (err) => {});
    if(chromeCounter < instances) {
        while((chromeCounter < instances) && (workingProxies.length > instances)) {
            let proxy = workingProxies.pop();
            runChrome(urlLink, proxy.ipAddress, proxy.port);
        }
    }
    if(workingProxies.length < instances * 10) {
        setTimeout(() => {
            testProxy(getRandomproxy());
        }, 1);
    }
};

const clickAll = async (page, browser) => {
    await page.evaluate(() => {
        try {
            if(document.getElementsByClassName('U26fgb O0WRkf oG5Srb HQ8yf C0oVfc wtr0xd ic02He M9Bg4d')[0]) {
                document.getElementsByClassName('U26fgb O0WRkf oG5Srb HQ8yf C0oVfc wtr0xd ic02He M9Bg4d')[0].click();
            }
        } catch(e) {

        }
        try {
            if(document.getElementsByClassName('ytp-ad-skip-button ytp-button')[0]) {
                document.getElementsByClassName('ytp-ad-skip-button ytp-button')[0].click();
            }
        } catch(e) {

        }
        try {
            if(document.getElementsByClassName('ytp-fullscreen-button ytp-button')[0]) {
                document.getElementsByClassName('ytp-fullscreen-button ytp-button')[0].click()
            }
        } catch(e) {

        }
        try {
            if(document.getElementsByClassName('style-scope yt-button-renderer style-text size-small')[0]) {
                document.getElementsByClassName('style-scope yt-button-renderer style-text size-small')[0].click();
            }
        } catch(e) {

        }
        try {
            if(document.getElementsByClassName('style-scope yt-button-renderer style-blue-text size-default')[0]) {
                document.getElementsByClassName('style-scope yt-button-renderer style-blue-text size-default')[0].click();
            }
        } catch(e) {

        }

        try {
            if(document.getElementById('captcha-form') !== null) {
                console.log('Check captcha');
                chromeCounter--;
                browser.close();
            }
            if(document.getElementById('captcha-page') !== null) {
                console.log('Check captcha');
                chromeCounter--;
                browser.close();
            }
        } catch(e) {

        }
        return true;
    });
};

const loadDirPage = (page) => {
    return page.goto('http://www.abv.bg', {waitUntil: 'networkidle2',timeout: 0});
};

const loadUrlPage = (page, url) => {
    return page.goto(url, {waitUntil: 'networkidle2',timeout: 0});
};

// runChrome('https://www.youtube.com/watch?v=E0M_sUe1Ri8', null, null)

const fetchproxies = () => {
    proxyArray = [];
    ProxyLists.getProxies({
        // protocols: ['socks4'],
        // anonymityLevels: ['elite', 'anonymous']
    })
        .on('data', function(proxies) {
            // Received some proxies.
            console.log('got some proxies');
            console.log(proxyArray.length);
            proxyArray.push(...proxies);
        })
        .on('error', function(error) {
            // Some error has occurred.
            // console.log('error!', error);
        })
        .once('end', function() {
            // Done getting proxies.
            console.log('proxyArray: ', proxyArray.length);
            console.log('end!');
        });
}

const getRandomproxy = () => {
    return proxyArray[Math.floor(Math.random() * proxyArray.length)];
};

const testProxy = (proxy) => {
    if(!proxy || !proxy.protocols) {
        setTimeout(() => {
            testProxy(getRandomproxy());
        }, 1);
        return;
    }
    ProxyVerifier.test({
        ...proxy,
        protocol: proxy.protocols[0]
    }, {
        testUrl: 'https://www.google.com/?q=test',
        testFn: (data, status, headers) => {
            if(status < 300) {
                console.log('workingProxies length: ', workingProxies.length);
                console.log('chromeCounter: ', chromeCounter);
                if(chromeCounter < instances) {
                    runChrome(urlLink, proxy.ipAddress, proxy.port);
                } else {
                    workingProxies.push(proxy);
                }
            } else {
                fs.writeFile('failcounter.txt', failCounter + '', (err) => {});
            }
            if(workingProxies.length < instances * 10) {
                setTimeout(() => {
                    testProxy(getRandomproxy());
                }, 1);
            }
        }
    }, (error, results) => {
        // Do something with error or results.
        fs.writeFile('failcounter.txt', failCounter + '', (err) => {});
        setTimeout(() => {
            testProxy(getRandomproxy());
        }, 1);
    });
};

setInterval(() => {
    fetchproxies();
}, 600000);

fetchproxies();

setTimeout(() => {
    // startProcess();
    for(let counter = 1; counter < 20; counter++) {
        setTimeout(() => {
            testProxy(getRandomproxy());
        }, 100 * counter)
    }
}, 10000);