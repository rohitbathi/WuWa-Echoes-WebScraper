const puppeteer = require("puppeteer");
const fs = require('fs')

const getHtmlData = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });

    try {
        const page = await browser.newPage();

        await page.goto("https://wutheringwaves.gg/echoes/", {
            waitUntil: "domcontentloaded"
        });

        await page.waitForSelector('.sc-fUnNpA.jNzqTc')

        const echoesHTML = await page.$$eval('.sc-fUnNpA.jNzqTc', (eles)=>{
            return eles.map(ele=>{
                return [ele.innerHTML]
            })
        })

        const results = [];

        for (const html of echoesHTML) {
            await page.setContent(html[0]);

            const cost = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('.sc-eldOKa'));
                const costElement = elements.find(el => el.textContent.includes('Cost:'));
                return costElement ? costElement.textContent.replace('Cost: ', '') : null;
            });

            const element = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('.sc-eldOKa'));
                const elementElement = elements.find(el => el.textContent.includes('Element:'));
                return elementElement ? elementElement.textContent.replace('Element: ', '') : null;
            });

            const sonatas = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('.sc-eldOKa'));
                const sonataElements = elements.filter(el => el.textContent.includes('Sonatas:'));
                return sonataElements.map(el => el.textContent.replace('Sonatas: ', ''));
            });

            const name = await page.evaluate(() => {
                const nameElement = document.querySelector('.sc-ikkyvV');
                return nameElement ? nameElement.textContent : null;
            });

            results.push({
                name,
                cost,
                element,
                sonatas
            });
        }

        console.log(results);

        fs.writeFileSync(
            'echoes.json',
            JSON.stringify(results),
            err => console.log(err)
        )

    } catch (error) {
        console.error('Error occurred:', error);
    } 
    finally {
        await browser.close();
    }
};

getHtmlData();