const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');

const insertionSnippet = `
    <!-- PWA Setup -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#7F30FF">
    <link rel="apple-touch-icon" href="https://ui-avatars.com/api/?name=NovaStock&background=7F30FF&color=fff&size=192">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful');
                }).catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    </script>
</head>`;

function addPWAToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        // Only insert if it looks like a full HTML file with a </head> and hasn't had the manifest added yet
        if (content.includes('</head>') && !content.includes('manifest.json')) {
            content = content.replace(/<\/head>/i, insertionSnippet);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`PWA injected successfully into ${filePath}`);
        }
    } catch (e) {
        console.error(`Skipping ${filePath}: ${e.message}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ejs')) {
            addPWAToFile(fullPath);
        }
    }
}

processDirectory(viewsDir);
console.log('Done.');
