const fs = require('fs');
const path = require('path');

const ejsDir = path.join(__dirname, 'views');

const replaces = [
    { to: />All Categories</g, from: />તમામ શ્રેણીઓ</g },
    { to: />Mobiles</g, from: />મોબાઇલ્સ</g },
    { to: />Electronics</g, from: />ઇલેક્ટ્રોનિક્સ</g },
    { to: />Fashion</g, from: />ફેશન</g },
    { to: />Home Appliances</g, from: />ઘરગથ્થુ ઉપકરણો</g },
    { to: />Toys &amp; Games</g, from: />રમકડાં અને રમતો</g },
    { to: />Toys & Games</g, from: />રમકડાં અને રમતો</g },
    { to: />Beauty</g, from: />સૌંદર્ય</g },
    { to: />Grocery</g, from: />કરિયાણું</g },
    { to: />Home &amp; Decor</g, from: />ઘર અને સજાવટ</g },
    { to: />Home & Decor</g, from: />ઘર અને સજાવટ</g },
    { to: />Sports</g, from: />રમતગમત</g },
    { to: />Search for products, brands and more...</g, from: />પ્રોડક્ટ્સ, બ્રાન્ડ્સ અને વધુ શોધો...</g },
    { to: /placeholder="Search for products, brands and more..."/g, from: /placeholder="પ્રોડક્ટ્સ, બ્રાન્ડ્સ અને વધુ શોધો..."/g },
    { to: /placeholder="Search items..."/g, from: /placeholder="આઇટમ્સ શોધો..."/g },
    { to: />\s*Profile\s*</g, from: /> પ્રોફાઇલ </g },
    { to: />\s*Cart\s*</g, from: /> કાર્ટ </g },
    { to: />\s*Exit\s*</g, from: /> બહાર નીકળો </g },
    { to: />Login</g, from: />લૉગિન</g },
    { to: />MEGA CLEARANCE SALE</g, from: />મેગા ક્લિયરન્સ સેલ</g },
    { to: />Get up to 60%\s*<br>on Top Brands</g, from: />ટોચની બ્રાન્ડ્સ પર 60% સુધીની<br>છૂટ મેળવો</g },
    { to: />Upgrade your lifestyle with our premium selection of electronics, fashion, and smart home devices. Limited time offer.</g, from: />પ્રીમિયમ ઉત્પાદનો સાથે તમારી જીવનશૈલી અપગ્રેડ કરો. મર્યાદિત સમયની ઓફર.</g },
    { to: />Shop\s*Deals Now</g, from: />હવે ડીલ્સ ખરીદો</g },
    { to: />\s*Deal of the Day\s*</g, from: /> આજના ડીલ્સ </g },
    { to: />View All\s*Deals &rarr;</g, from: />બધા ડીલ્સ જુઓ &rarr;</g },
    { to: />\s*Add to Cart\s*</g, from: /> કાર્ટમાં ઉમેરો </g },
    { to: />Shop by Category</g, from: />શ્રેણી મુજબ ખરીદી કરો</g },
    { to: />24\/7 Customer Support</g, from: />24\/7 ગ્રાહક સપોર્ટ</g },
    { to: />Need help with your order\? Find answers in our\s*Help Center or contact our dedicated support team directly.</g, from: />તમારા ઓર્ડર માટે મદદ જોઈએ છે\? અમારા હેલ્પ સેન્ટરમાં જવાબો શોધો અથવા સીધો અમારી સપોર્ટ ટીમનો સંપર્ક કરો.</g },
    { to: />Contact Support</g, from: />સપોર્ટનો સંપર્ક કરો</g },
    { to: />Send a Message</g, from: />સંદેશ મોકલો</g },
    { to: />Your Name</g, from: />તમારું નામ</g },
    { to: />Email Address</g, from: />ઇમેઇલ સરનામું</g },
    { to: />Message</g, from: />સંદેશ</g },
    { to: />About</g, from: />અમારા વિશે</g },
    { to: />Returns</g, from: />રીટર્ન</g },
    { to: />Privacy Policy</g, from: />ગોપનીયતા નીતિ</g },
    { to: />Terms of Service</g, from: />સેવાની શરતો</g },
    { to: />All rights reserved.</g, from: />બધા હકો અનામત છે.</g },
    { to: />Back Home</g, from: />હોમ પર પાછા ફરો</g },
    { to: />Your Cart</g, from: />તમારું કાર્ટ</g },
    { to: />Order Summary</g, from: />ઓર્ડર સારાંશ</g },
    { to: />Proceed to Checkout</g, from: />ચેકઆઉટ કરવા આગળ વધો</g },
    { to: />Explore Collections</g, from: />સંગ્રહનું અન્વેષણ કરો</g },
    { to: />Browse the best exclusive Products from top brands.</g, from: />ટોચની બ્રાન્ડ્સના શ્રેષ્ઠ વિશિષ્ટ ઉત્પાદનો બ્રાઉઝ કરો.</g },
    { to: />All Items</g, from: />તમામ આઇટમ્સ</g },
    { to: />Items \(/g, from: />આઇટમ્સ \(/g },
    { to: />Shipping</g, from: />શિપિંગ</g },
    { to: />Free</g, from: />મફત</g },
    { to: />Estimated Tax</g, from: />અંદાજિત કર</g },
    { to: />Total</g, from: />કુલ</g },
    { to: />Continue Shopping</g, from: />ખરીદી ચાલુ રાખો</g },
    { to: />Start Shopping</g, from: />ખરીદી શરૂ કરો</g },
    { to: />Your cart is empty</g, from: />તમારું કાર્ટ ખાલી છે</g },
    { to: />Looks like you haven't added anything to your cart yet.</g, from: />એવું લાગે છે કે તમે હજી સુધી તમારા કાર્ટમાં કંઈપણ ઉમેર્યું નથી.</g },
    { to: />Sort by:</g, from: />આનાથી સૉર્ટ કરો:</g },
    { to: />Featured</g, from: />વિશેષ</g },
    { to: />Price: Low to High</g, from: />કિંમત: ઓછી થી વધુ</g },
    { to: />Price: High to Low</g, from: />કિંમત: વધુ થી ઓછી</g },
    { to: />Price</g, from: />કિંમત</g },
    { to: />Buy Now</g, from: />હમણાં ખરીદો</g },
    { to: />Login to Buy</g, from: />ખરીદવા માટે લૉગિન કરો</g },
];

const filesToTranslate = ['index.ejs', 'explore.ejs', 'cart.ejs'];

filesToTranslate.forEach(file => {
    const filePath = path.join(ejsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        replaces.forEach(rule => {
			// Convert regex strings back to actual Replacement targets
			// e.g. rule.to is a Regex like />All Categories</g and we want to replace with ">All Categories<"
			const rawStringTo = rule.to.toString().replace(/^\//, '').replace(/\/g$/, '').replace(/\\s\*/g, '').replace(/\\/g, '');
			
            content = content.replace(rule.from, rawStringTo);
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Reverted ${file}`);
    }
});
