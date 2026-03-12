const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

if (fs.existsSync(dbPath)) {
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // New e-commerce listings
    db.listings = [
        {
            "id": 201,
            "title": "iPhone 15 Pro",
            "brand": "Apple",
            "price": "129000",
            "category": "Mobiles",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800",
            "owner": "admin"
        },
        {
            "id": 202,
            "title": "Samsung Galaxy S24 Ultra",
            "brand": "Samsung",
            "price": "134999",
            "category": "Mobiles",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1707227155694-87f5d475ce30?w=800",
            "owner": "admin"
        },
        {
            "id": 203,
            "title": "Sony WH-1000XM5 Noise Cancelling Headphones",
            "brand": "Sony",
            "price": "29990",
            "category": "Electronics",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
            "owner": "admin"
        },
        {
            "id": 204,
            "title": "MacBook Air M2",
            "brand": "Apple",
            "price": "114900",
            "category": "Electronics",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
            "owner": "admin"
        },
        {
            "id": 205,
            "title": "Nike Air Force 1",
            "brand": "Nike",
            "price": "8495",
            "category": "Fashion",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800",
            "owner": "admin"
        },
        {
            "id": 206,
            "title": "Levi's Men's Slim Jeans",
            "brand": "Levis",
            "price": "2599",
            "category": "Fashion",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
            "owner": "admin"
        },
        {
            "id": 207,
            "title": "LG 55 inch 4K OLED TV",
            "brand": "LG",
            "price": "145000",
            "category": "Appliances",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800",
            "owner": "admin"
        },
        {
            "id": 208,
            "title": "Dyson V15 Detect Vacuum Cleaner",
            "brand": "Dyson",
            "price": "65900",
            "category": "Appliances",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
            "owner": "admin"
        },
        {
            "id": 209,
            "title": "Lego Star Wars Millennium Falcon",
            "brand": "LEGO",
            "price": "75990",
            "category": "Toys",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800",
            "owner": "admin"
        },
        {
            "id": 210,
            "title": "L'Oreal Paris Revitalift Serum",
            "brand": "LOreal",
            "price": "999",
            "category": "Beauty",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800",
            "owner": "admin"
        },
        {
            "id": 211,
            "title": "Premium Coffee Beans 1kg",
            "brand": "BlueTokai",
            "price": "1200",
            "category": "Grocery",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800",
            "owner": "admin"
        },
        {
            "id": 212,
            "title": "PlayStation 5 Console",
            "brand": "Sony",
            "price": "54990",
            "category": "Electronics",
            "status": "Active",
            "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
            "owner": "admin"
        }
    ];

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log('Successfully replaced old items with new E-commerce items!');
} else {
    console.error('db.json not found!');
}
