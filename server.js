require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const User = require('./models/User');

const twilio = require('twilio');
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
    : null;

const app = express();
const PORT = process.env.PORT || 3000;

// We will connect inside initDb function below

// Security Middleware (Helmet configurations for Web3 aesthetics compatibility)
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to allow external images/fonts/scripts loaded dynamically
    crossOriginEmbedderPolicy: false
}));

// Rate Limiting (Protects from brute-force & spam requests)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session Config
app.use(session({
    secret: 'product-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Fast In-Memory Database + MongoDB Sync
const mongoose = require('mongoose');
const DataStoreSchema = new mongoose.Schema({ data: Object }, { strict: false });
// Check if model exists to avoid OverwriteModelError in repeated loads
const DataStore = mongoose.models.DataStore || mongoose.model('DataStore', DataStoreSchema);

let memoryDb = null;
const dbPath = path.join(__dirname, 'data', 'db.json');

const getDb = () => memoryDb;
const saveDb = (data) => {
    memoryDb = data;
    // Save to Mongo instantly without blocking
    if (mongoose.connection.readyState === 1) {
        DataStore.updateOne({}, { data: data }, { upsert: true })
            .catch(err => console.error("Mongo Save Error:", err));
    }
    // Fallback save to db.json
    fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {
        if (err) console.error("Local save error:", err);
    });
};

// Content Injection Middleware
app.use((req, res, next) => {
    const db = getDb();
    res.locals.content = db.content || {}; // Available in ALL views
    res.locals.user = req.session.user || null;
    if (!req.session.cart) req.session.cart = [];
    res.locals.cart = req.session.cart;
    next();
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Twilio OTP Routes
app.post('/api/send-otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = otp;
    
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
            await twilioClient.messages.create({
                body: `Your SamKart verification code is ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            res.json({ success: true, message: 'OTP sent via Twilio' });
        } catch (error) {
            console.error("Twilio Error:", error);
            res.status(500).json({ success: false, message: 'Failed to send OTP. Check Twilio credentials.' });
        }
    } else {
        // Fallback for testing if Twilio isn't configured yet
        console.log(`\n[DEV MODE - TWILIO NOT CONFIGURED] OTP for ${phone} is: ${otp}\n`);
        res.json({ success: true, message: 'Twilio not linked. Check console for OTP.' });
    }
});

app.post('/api/verify-otp', (req, res) => {
    const { otp } = req.body;
    if (req.session.otp && req.session.otp === otp) {
        req.session.mobileVerified = true;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// --- ROUTES ---

// 1. Public Routes
app.get('/', (req, res) => {
    const db = getDb();
    res.render('index', {
        content: db.content || {},
        collections: db.collections || [],
        listings: db.listings || []
    });
});

app.post('/contact', (req, res) => {
    const db = getDb();
    const newTicket = {
        id: Date.now(),
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        subject: "New Contact Message", // Default subject since form has no subject field
        status: "Open",
        date: new Date().toISOString().split('T')[0]
    };

    // Safety check if support array exists
    if (!db.support) db.support = [];

    db.support.push(newTicket);
    saveDb(db);

    // In a real app, flash a success message. Here just redirect to home.
    res.redirect('/?msg=Message Sent');
});

app.get('/explore', (req, res) => {
    const db = getDb();
    res.render('explore', { listings: db.listings }); // Explore with real data
});

app.get('/login', (req, res) => res.render('login', { error: req.query.error, adminTab: req.query.tab === 'admin' }));
app.get('/asset-details', (req, res) => {
    const db = getDb();
    const product = db.listings.find(l => l.id == req.query.id) || db.listings[0];
    res.render('asset-details', { product });
});
app.get('/checkout', (req, res) => {
    const db = getDb();
    if (req.query.id === 'cart') {
        if (!req.session.cart || req.session.cart.length === 0) return res.redirect('/cart');
        const cartTotal = req.session.cart.reduce((acc, item) => {
            const price = parseFloat(item.price) < 1000 ? Math.floor(((parseFloat(item.price) * 7391) % 9000) + 1000) : parseFloat(item.price);
            return acc + price;
        }, 0);
        const cartProduct = {
            id: 'cart',
            title: `Cart Order (${req.session.cart.length} items)`,
            brand: 'SamKart',
            category: 'Multiple Items',
            price: cartTotal.toString(),
            image: req.session.cart[0] ? req.session.cart[0].image : 'https://picsum.photos/seed/cart/200/200'
        };
        return res.render('checkout', { product: cartProduct, cart: req.session.cart });
    }
    const product = db.listings.find(l => l.id == req.query.id);
    res.render('checkout', { product, cart: req.session.cart || [] });
});
app.get('/payment', (req, res) => {
    const db = getDb();
    if (req.query.id === 'cart') {
        const cartTotal = (req.session.cart || []).reduce((acc, item) => {
            const price = parseFloat(item.price) < 1000 ? Math.floor(((parseFloat(item.price) * 7391) % 9000) + 1000) : parseFloat(item.price);
            return acc + price;
        }, 0);
        const cartProduct = { id: 'cart', title: `Cart Order (${req.session.cart.length} items)`, price: cartTotal.toString(), category: 'Multiple Items', brand: 'SamKart' };
        return res.render('payment', { product: cartProduct });
    }
    const product = db.listings.find(l => l.id == req.query.id);
    res.render('payment', { product });
});

// Cart Routes
app.get('/cart', (req, res) => {
    res.render('cart', { cart: req.session.cart || [] });
});

app.post('/cart/add', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    const db = getDb();
    const product = db.listings.find(l => l.id == req.body.productId);
    if (product) {
        // Prevent dupes or add quantity
        const existing = req.session.cart.find(item => item.id == product.id);
        if (!existing) {
            req.session.cart.push(product);
        }
    }
    res.redirect(req.get('Referer') || '/cart');
});

app.post('/cart/remove', (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id != req.body.productId);
    }
    res.redirect('/cart');
});

// Real payment confirm logic
app.post('/payment/confirm', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const db = getDb();
    if (!db.orders) db.orders = [];

    if (req.body.id === 'cart' && req.session.cart) {
        req.session.cart.forEach(product => {
            db.orders.push({
                id: Date.now().toString() + Math.floor(Math.random() * 1000),
                productId: product.id,
                title: product.title,
                image: product.image,
                price: product.price,
                buyer: req.session.user.username,
                seller: product.brand,
                status: 'Confirmed',
                date: new Date().toISOString()
            });
            const dbProduct = db.listings.find(l => l.id == product.id);
            if (dbProduct) dbProduct.owner = req.session.user.username;
        });
        req.session.cart = []; // Empty cart
        saveDb(db);
        return res.redirect('/profile?status=ordered');
    }

    const product = db.listings.find(l => l.id == req.body.id);
    if (product) {
        db.orders.push({
            id: Date.now().toString(),
            productId: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            buyer: req.session.user.username,
            seller: product.brand,
            status: 'Confirmed',
            date: new Date().toISOString()
        });

        // Auto-transfer ownership instanly
        product.owner = req.session.user.username;
        saveDb(db);
    }
    res.redirect('/profile?status=ordered');
});

// Order Management Routes
app.post('/order/accept', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const db = getDb();
    const order = (db.orders || []).find(o => o.id === req.body.orderId);

    // Check if the current user is the seller or the buyer (allowing buyer to force accept old pending orders)
    if (order && (order.seller.toLowerCase() === '@' + req.session.user.username.toLowerCase() || order.buyer.toLowerCase() === req.session.user.username.toLowerCase())) {
        order.status = 'Accepted';

        // Transfer ownership
        const product = db.listings.find(l => l.id == order.productId);
        if (product) {
            product.owner = order.buyer;
        }
        saveDb(db);
    }
    const referer = req.get('Referer') || '/profile';
    res.redirect(referer);
});

app.post('/order/cancel', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const db = getDb();
    const order = (db.orders || []).find(o => o.id === req.body.orderId);

    // Check if current user is seller OR buyer
    if (order && (order.seller.toLowerCase() === '@' + req.session.user.username.toLowerCase() || order.buyer.toLowerCase() === req.session.user.username.toLowerCase())) {
        order.status = 'Cancelled';

        // Revert ownership to seller if it was automatically confirmed before
        const product = db.listings.find(l => l.id == order.productId);
        if (product) {
            product.owner = order.seller.replace('@', '');
        }

        saveDb(db);
    }
    const referer = req.get('Referer') || '/profile';
    res.redirect(referer);
});
// User Login Logic (Mock via db.json)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDb();

        // Find user in db.json
        const user = db.users.find(u => u.email === email);

        if (!user) {
            return res.redirect('/login?error=User not found');
        }

        // Check password (plain text for mock)
        if (user.password !== password) {
            return res.redirect('/login?error=Incorrect password');
        }

        req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
        if (user.role === 'Admin') req.session.isAdmin = true;
        return res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.redirect('/login?error=Server Error');
    }
});

// User Registration Route
app.get('/register', (req, res) => res.render('register', { error: req.query.error }));

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const db = getDb();

        const userExists = db.users.find(u => u.email === email);
        if (userExists) {
            return res.redirect('/register?error=User already exists');
        }

        const usernameExists = db.users.find(u => u.username === username);
        if (usernameExists) {
            return res.redirect('/register?error=Username taken');
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            role: 'User',
            status: 'Active',
            joined: new Date().getFullYear().toString(),
            balance: "0.0",
            bio: "",
            website: "",
            twitter: "",
            instagram: "",
            avatar: "",
            banner: ""
        };

        db.users.push(newUser);
        saveDb(db);

        // Auto login after register
        req.session.user = { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role };
        res.redirect('/profile');

    } catch (error) {
        console.error(error);
        res.redirect('/register?error=Server Error');
    }
});

// Profile Page (Dynamic)
app.get('/profile', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        const db = getDb();
        const user = db.users.find(u => u.id == req.session.user.id);

        if (!user) return res.redirect('/login');

        // 1. Created: Items where brand matches current user
        const createdItems = db.listings.filter(l => l.brand.toLowerCase() === '@' + user.username.toLowerCase());

        // 2. Collected: Items where owner matches current user
        const collectedItems = db.listings.filter(l => l.owner && l.owner.toLowerCase() === user.username.toLowerCase());

        // 3. Favorited: Mock logic - pick different random items
        // 3. Favorited: Mock logic - pick different random items
        const favoritedItems = db.listings.slice(0, 1);

        if (!db.orders) db.orders = [];
        const myOrders = db.orders.filter(o => o.buyer.toLowerCase() === user.username.toLowerCase());
        const mySales = db.orders.filter(o => o.seller.toLowerCase() === '@' + user.username.toLowerCase());

        res.render('profile', {
            user,
            createdItems,
            collectedItems,
            favoritedItems,
            myOrders,
            mySales,
            status: req.query.status
        });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Edit Profile
app.post('/profile/edit', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        const db = getDb();
        const userIndex = db.users.findIndex(u => u.id == req.session.user.id);

        if (userIndex !== -1) {
            const user = db.users[userIndex];
            user.username = req.body.username || user.username;
            if (req.body.avatarUrl) user.avatar = req.body.avatarUrl;

            // Fields
            user.bio = req.body.bio || user.bio || "";
            user.website = req.body.website || user.website || "";
            user.twitter = req.body.twitter || user.twitter || "";
            user.instagram = req.body.instagram || user.instagram || "";

            if (req.body.bannerUrl) user.banner = req.body.bannerUrl;

            db.users[userIndex] = user;
            saveDb(db);

            // Update session
            req.session.user.username = user.username;
        }
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.redirect('/profile?error=Update failed');
    }
});

// Change Password (User)
app.post('/profile/password', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { currentPassword, newPassword } = req.body;
    const db = getDb();
    const user = db.users.find(u => u.id === req.session.user.id);

    if (user && user.password === currentPassword) {
        user.password = newPassword;
        saveDb(db);
        return res.redirect('/profile?msg=Password Changed');
    }
    res.redirect('/profile?error=Incorrect Password');
});

// Create Product
app.post('/product/create', (req, res) => {
    const db = getDb();
    const userId = req.session.user ? req.session.user.id : 1;
    const user = db.users.find(u => u.id === userId);

    const newListing = {
        id: Date.now(),
        title: req.body.title,
        brand: '@' + user.username.toLowerCase(), // Link to user
        price: req.body.price,
        status: 'Active',
        image: req.body.imageUrl || 'https://picsum.photos/seed/new/400/400'
    };

    db.listings.push(newListing);
    saveDb(db);
    res.redirect('/profile');
});


// 2. Admin Routes
// Middleware to check admin auth (mock)
const isAdmin = (req, res, next) => {
    // For demo, just check a session flag. In real app, verify user role.
    if (req.session.isAdmin) {
        return next();
    }
    // If not logged in, redirect to login
    res.redirect('/admin/login');
};

// Admin Login Page
app.get('/admin/login', (req, res) => {
    res.render('login', { error: req.query.error, adminTab: true });
});

// Handle Login Logic
// Handle Login Logic
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const db = getDb();

    // Find user with matching credentials and Admin role
    const user = db.users.find(u => (u.email || '').toLowerCase() === cleanEmail && u.role === 'Admin');

    if (!user) {
        return res.redirect('/admin/login?error=Access Denied or User not found');
    }

    if (user.password !== password) {
        return res.redirect('/admin/login?error=Incorrect password');
    }

    req.session.isAdmin = true;
    req.session.user = user;
    return res.redirect('/admin/dashboard');
});

// Admin Dashboard
app.get('/admin/dashboard', isAdmin, (req, res) => {
    const db = getDb();
    // Calculate stats
    const totalUsers = db.users ? db.users.length : 0;
    const activeListings = db.listings ? db.listings.filter(l => l.status === 'Active').length : 0;
    
    const orders = db.orders || [];
    const pendingOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Pending').length;
    const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.price) || 0), 0);

    // Mock recent monthly trends based on total
    const revenueData = [0, totalRevenue * 0.1, totalRevenue * 0.2, totalRevenue * 0.15, totalRevenue * 0.4, totalRevenue * 0.8, totalRevenue];

    res.render('admin/dashboard', {
        page: 'dashboard',
        stats: { totalUsers, activeListings, pendingOrders, totalRevenue },
        revenueData: JSON.stringify(revenueData),
        gateways: db.gateways || { paypal: {}, moonpay: {} }
    });
});

// Admin Users
app.get('/admin/users', isAdmin, (req, res) => {
    const db = getDb();
    res.render('admin/users', { page: 'users', users: db.users });
});

app.post('/admin/users/:id/ban', isAdmin, (req, res) => {
    const db = getDb();
    const user = db.users.find(u => u.id == req.params.id);
    if (user) {
        user.status = 'Banned';
        saveDb(db);
    }
    res.redirect('/admin/users');
});

// Admin Listings
app.get('/admin/listings', isAdmin, (req, res) => {
    const db = getDb();
    res.render('admin/listings', { page: 'listings', listings: db.listings });
});

app.post('/admin/listings/:id/approve', isAdmin, (req, res) => {
    const db = getDb();
    const item = db.listings.find(i => i.id == req.params.id);
    if (item) {
        item.status = 'Active';
        saveDb(db);
    }
    res.redirect('/admin/listings');
});

// Admin Settings
app.get('/admin/settings', isAdmin, (req, res) => {
    const db = getDb();
    res.render('admin/settings', { page: 'settings', settings: db.settings });
});

app.post('/admin/settings', isAdmin, (req, res) => {
    const db = getDb();
    db.settings = { ...db.settings, ...req.body };
    // Convert checkbox "on" to boolean
    db.settings.maintenanceMode = req.body.maintenanceMode === 'on';
    saveDb(db);
    res.redirect('/admin/settings');
});

// Admin Password Change
app.post('/admin/password', isAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const db = getDb();
    const user = db.users.find(u => u.email === req.session.user.email);

    if (user && user.password === currentPassword) {
        user.password = newPassword;
        saveDb(db);
        return res.redirect('/admin/settings?msg=Password Changed');
    }
    res.redirect('/admin/settings?error=Incorrect Password');
});

// Admin Gateways
app.get('/admin/gateways', isAdmin, (req, res) => {
    const db = getDb();
    res.render('admin/gateways', { page: 'gateways', gateways: db.gateways });
});

app.post('/admin/gateways/configure', isAdmin, (req, res) => {
    const db = getDb();
    const { gatewayId, environment, clientId, clientSecret, apiKey, secretKey } = req.body;

    if (db.gateways[gatewayId]) {
        // Update common fields
        db.gateways[gatewayId].environment = environment;

        // Update specific fields based on gateway type
        if (gatewayId === 'paypal') {
            db.gateways[gatewayId].clientId = clientId;
            db.gateways[gatewayId].clientSecret = clientSecret;
        } else if (gatewayId === 'moonpay') {
            db.gateways[gatewayId].apiKey = apiKey;
            db.gateways[gatewayId].secretKey = secretKey;
        } else if (gatewayId === 'simplex') {
            db.gateways[gatewayId].partnerId = req.body.partnerId;
            db.gateways[gatewayId].apiKey = apiKey;
        }

        saveDb(db);
    }

    res.redirect('/admin/gateways');
});

app.get('/admin/transactions', isAdmin, (req, res) => {
    const db = getDb();
    res.render('admin/transactions', { page: 'transactions', transactions: db.transactions });
});

app.get('/admin/roles', isAdmin, (req, res) => {
    const db = getDb();
    res.render('admin/roles', { page: 'roles', users: db.users });
});

app.post('/admin/users/create', isAdmin, (req, res) => {
    const db = getDb();
    const newUser = {
        id: db.users.length + 1,
        username: req.body.username,
        email: req.body.email,
        role: req.body.role,
        status: 'Active',
        joined: new Date().toISOString().split('T')[0],
        balance: '0.0'
    };
    db.users.push(newUser);
    saveDb(db);
    res.redirect('/admin/roles');
});

app.post('/admin/users/:id/role', isAdmin, (req, res) => {
    const db = getDb();
    const user = db.users.find(u => u.id == req.params.id);
    if (user) {
        user.role = req.body.role;
        saveDb(db);
    }
    res.redirect('/admin/roles');
});

app.get('/admin/cms', isAdmin, (req, res) => {
    const db = getDb();
    // Initialize content if missing (migration safety)
    if (!db.content) {
        db.content = {
            hero: {
                title: "premium products Revolution",
                subtitle: "Discover, collect, and sell extraordinary Products on the world's first and largest digital marketplace.",
                ctaPrimary: "Explore Now",
                ctaSecondary: "Create Product"
            },
            stats: { artworks: "400k+", brands: "20k+" }
        };
        saveDb(db);
    }
    res.render('admin/cms', { page: 'cms', content: db.content });
});

app.post('/admin/cms', isAdmin, (req, res) => {
    const db = getDb();
    db.content = {
        hero: {
            title: req.body.heroTitle,
            subtitle: req.body.heroSubtitle,
            ctaPrimary: req.body.ctaPrimary,
            ctaSecondary: req.body.ctaSecondary
        },
        visuals: {
            heroImage: req.body.heroImage,
            logoText: req.body.logoText,
            logoImage: req.body.logoImage
        },
        announcement: {
            enabled: req.body.showAnnouncement === 'true',
            text: req.body.announcementText
        },
        footer: {
            text: req.body.footerText
        },
        stats: {
            artworks: req.body.statsArtworks,
            brands: req.body.statsBrands
        }
    };
    saveDb(db);
    res.redirect('/admin/cms');
});
app.get('/admin/support', isAdmin, (req, res) => {
    const db = getDb();
    res.render('admin/support', {
        page: 'support',
        tickets: db.support || []
    });
});



// Initialize Database & Start Server
const initApp = async () => {
    await connectDB();

    // Legacy Data Migrator for Live MongoDB connection
    const fixData = (db) => {
        if (!db) return db;
        if (db.listings) {
            db.listings = db.listings.map(l => {
                if (l.artist && !l.brand) l.brand = l.artist;
                return l;
            });
        }
        if (db.collections) {
            db.collections = db.collections.map(c => {
                if (c.artist && !c.brand) c.brand = c.artist;
                return c;
            });
        }
        return db;
    };

    try {
        let doc = await DataStore.findOne({});
        const initialData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        // Force E-commerce migration
        if (doc && doc.data && doc.data.listings && !doc.data.listings.find(l => l.id == 101)) {
            console.log("Upgrading live MongoDB to Ecommerce Data...");
            doc.data = fixData(initialData);
            await DataStore.updateOne({}, { data: doc.data });
        } else if (!doc) {
            console.log("First time setup: Copying initial data to MongoDB...");
            doc = await DataStore.create({ data: fixData(initialData) });
        }
        memoryDb = fixData(doc.data);
        console.log("Memory Database synchronized with MongoDB Atlas successfully!");

        // Start Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Admin Login: sam@samkart.com / admin123`);
        });
    } catch (e) {
        console.error("Critical DB Load Error:", e);
        console.log("Falling back to local db.json");
        memoryDb = fixData(JSON.parse(fs.readFileSync(dbPath, 'utf8')));

        // Start Server anyway
        app.listen(PORT, () => {
            console.log(`Server running (Offline mode) at http://localhost:${PORT}`);
        });
    }
};

// Temp Force Reset Route (Always available)
app.get('/api/force-reset', async (req, res) => {
    try {
        const initialData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        // Define fixData locally since it's outside initApp
        const fixDataObj = (db) => {
            if (!db) return db;
            if (db.listings) {
                db.listings = db.listings.map(l => {
                    if (l.artist && !l.brand) l.brand = l.artist;
                    return l;
                });
            }
            return db;
        };

        if (mongoose.connection.readyState === 1) {
            const doc = await DataStore.findOne({});
            if (doc) {
                if (doc.data && doc.data.users) {
                    initialData.users = doc.data.users;
                }
                doc.data = fixDataObj(initialData);
                await DataStore.updateOne({}, { data: doc.data });
                
                // also update memory db
                memoryDb = doc.data;
                res.send("Successfully synced MongoDB with db.json!");
            } else {
                await DataStore.create({ data: fixDataObj(initialData) });
                res.send("Created new MongoDB data from db.json!");
            }
        } else {
            memoryDb = fixDataObj(initialData);
            res.send("MongoDB not connected. Updated local Memory DB with db.json!");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

initApp();
/ /   f o r c e   r e n d e r   r e s t a r t  
 