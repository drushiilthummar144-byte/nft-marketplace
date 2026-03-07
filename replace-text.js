const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Case sensitive replacements first
    content = content.replace(/NFTs/g, 'Products');
    content = content.replace(/NFT/g, 'Product');
    content = content.replace(/nft/g, 'product');
    content = content.replace(/Creators/g, 'Sellers');
    content = content.replace(/Creator/g, 'Seller');
    content = content.replace(/creator/g, 'seller');
    content = content.replace(/Artists/g, 'Brands');
    content = content.replace(/Artist/g, 'Brand');
    content = content.replace(/artist/g, 'brand');
    content = content.replace(/Wallets/g, 'Carts');
    content = content.replace(/Wallet/g, 'Cart');
    content = content.replace(/wallet/g, 'cart');
    content = content.replace(/Crypto/g, 'Points');
    content = content.replace(/crypto/g, 'points');
    content = content.replace(/Bids/g, 'Offers');
    content = content.replace(/Bid/g, 'Offer');
    content = content.replace(/bid/g, 'offer');
    content = content.replace(/Auction/g, 'Sale');
    content = content.replace(/auction/g, 'sale');

    // Multi-word phrases
    content = content.replace(/digital art/gi, 'premium products');

    // Special fix for URLs and paths that might get incorrectly capitalized depending on matches
    content = content.replace(/product_login_bg\.png/g, 'nft_login_bg.png'); // Keep the original image path since we didn't rename the file yet

    fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ejs') || fullPath.endsWith('.css') || fullPath.endsWith('.json') || fullPath.endsWith('.js')) {
            // we will run this on specific directories and server.js directly
            replaceInFile(fullPath);
        }
    }
}

processDirectory('./views');
processDirectory('./public/styles');
replaceInFile('./data/db.json');
replaceInFile('./server.js');
console.log('Text replacement complete!');
