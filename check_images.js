const fs = require("fs");
const https = require("https");

function checkUrl(url) {
    if(!url.startsWith("http")) return Promise.resolve(null);
    return new Promise(resolve => {
        https.get(url, res => {
            resolve({url, status: res.statusCode});
        }).on("error", () => resolve({url, status: 500}));
    });
}
async function run() {
    const text = fs.readFileSync("indian-nft-web/views/index.ejs", "utf-8");
    const regex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    const urls = [];
    while ((match = regex.exec(text)) !== null) {
        urls.push(match[1]);
    }
    
    for(const u of urls) {
        const res = await checkUrl(u);
        if(res && res.status >= 300) {
            console.log("BROKEN:", res.status, res.url);
        }
    }
    console.log("Done index.ejs");
}
run();
