const fs = require('fs');
const path = require('path');

const ejsDir = path.join(__dirname, 'views');

const replaces = [
    // index.ejs / explore.ejs
    { from: />All Categories</g, to: ">તમામ શ્રેણીઓ<" },
    { from: />Mobiles</g, to: ">મોબાઇલ્સ<" },
    { from: />Electronics</g, to: ">ઇલેક્ટ્રોનિક્સ<" },
    { from: />Fashion</g, to: ">ફેશન<" },
    { from: />Home Appliances</g, to: ">ઘરગથ્થુ ઉપકરણો<" },
    { from: />Toys &amp; Games</g, to: ">રમકડાં અને રમતો<" },
    { from: />Toys & Games</g, to: ">રમકડાં અને રમતો<" },
    { from: />Beauty</g, to: ">સૌંદર્ય<" },
    { from: />Grocery</g, to: ">કરિયાણું<" },
    { from: />Home &amp; Decor</g, to: ">ઘર અને સજાવટ<" },
    { from: />Home & Decor</g, to: ">ઘર અને સજાવટ<" },
    { from: />Sports</g, to: ">રમતગમત<" },
    { from: />Search for products, brands and more...</g, to: ">પ્રોડક્ટ્સ, બ્રાન્ડ્સ અને વધુ શોધો...<" },
    { from: /placeholder="Search for products, brands and more..."/g, to: 'placeholder="પ્રોડક્ટ્સ, બ્રાન્ડ્સ અને વધુ શોધો..."' },
    { from: /placeholder="Search items..."/g, to: 'placeholder="આઇટમ્સ શોધો..."' },
    { from: />\s*Profile\s*</g, to: "> પ્રોફાઇલ <" },
    { from: />\s*Cart\s*</g, to: "> કાર્ટ <" },
    { from: />\s*Exit\s*</g, to: "> બહાર નીકળો <" },
    { from: />Login</g, to: ">લૉગિન<" },
    { from: />MEGA CLEARANCE SALE</g, to: ">મેગા ક્લિયરન્સ સેલ<" },
    { from: />Get up to 60%\s*<br>on Top Brands</g, to: ">ટોચની બ્રાન્ડ્સ પર 60% સુધીની<br>છૂટ મેળવો<" },
    { from: />Upgrade your lifestyle with our premium selection of electronics, fashion, and smart home devices. Limited time offer.</g, to: ">પ્રીમિયમ ઉત્પાદનો સાથે તમારી જીવનશૈલી અપગ્રેડ કરો. મર્યાદિત સમયની ઓફર.<" },
    { from: />Shop\s*Deals Now</g, to: ">હવે ડીલ્સ ખરીદો<" },
    { from: />\s*Deal of the Day\s*</g, to: "> આજના ડીલ્સ <" },
    { from: />View All\s*Deals &rarr;</g, to: ">બધા ડીલ્સ જુઓ &rarr;<" },
    { from: />\s*Add to Cart\s*</g, to: "> કાર્ટમાં ઉમેરો <" },
    { from: />Shop by Category</g, to: ">શ્રેણી મુજબ ખરીદી કરો<" },
    { from: />24\/7 Customer Support</g, to: ">24/7 ગ્રાહક સપોર્ટ<" },
    { from: />Need help with your order\? Find answers in our\s*Help Center or contact our dedicated support team directly.</g, to: ">તમારા ઓર્ડર માટે મદદ જોઈએ છે? અમારા હેલ્પ સેન્ટરમાં જવાબો શોધો અથવા સીધો અમારી સપોર્ટ ટીમનો સંપર્ક કરો.<" },
    { from: />Contact Support</g, to: ">સપોર્ટનો સંપર્ક કરો<" },
    { from: />Send a Message</g, to: ">સંદેશ મોકલો<" },
    { from: />Your Name</g, to: ">તમારું નામ<" },
    { from: />Email Address</g, to: ">ઇમેઇલ સરનામું<" },
    { from: />Message</g, to: ">સંદેશ<" },
    { from: />About</g, to: ">અમારા વિશે<" },
    { from: />Returns</g, to: ">રીટર્ન<" },
    { from: />Privacy Policy</g, to: ">ગોપનીયતા નીતિ<" },
    { from: />Terms of Service</g, to: ">સેવાની શરતો<" },
    { from: />All rights reserved.</g, to: ">બધા હકો અનામત છે.<" },
    { from: />Back Home</g, to: ">હોમ પર પાછા ફરો<" },
    { from: />Your Cart</g, to: ">તમારું કાર્ટ<" },
    { from: />Order Summary</g, to: ">ઓર્ડર સારાંશ<" },
    { from: />Proceed to Checkout</g, to: ">ચેકઆઉટ કરવા આગળ વધો<" },
    { from: />Explore Collections</g, to: ">સંગ્રહનું અન્વેષણ કરો<" },
    { from: />Browse the best exclusive Products from top brands.</g, to: ">ટોચની બ્રાન્ડ્સના શ્રેષ્ઠ વિશિષ્ટ ઉત્પાદનો બ્રાઉઝ કરો.<" },
    { from: />All Items</g, to: ">તમામ આઇટમ્સ<" },
    // cart details
    { from: />Items \(/g, to: ">આઇટમ્સ (" },
    { from: />Shipping</g, to: ">શિપિંગ<" },
    { from: />Free</g, to: ">મફત<" },
    { from: />Estimated Tax</g, to: ">અંદાજિત કર<" },
    { from: />Total</g, to: ">કુલ<" },
    { from: />Continue Shopping/g, to: ">ખરીદી ચાલુ રાખો<" },
    { from: />Start Shopping</g, to: ">ખરીદી શરૂ કરો<" },
    { from: />Your cart is empty</g, to: ">તમારું કાર્ટ ખાલી છે<" },
    { from: />Looks like you haven't added anything to your cart yet.</g, to: ">એવું લાગે છે કે તમે હજી સુધી તમારા કાર્ટમાં કંઈપણ ઉમેર્યું નથી.<" },
    { from: />Sort by:</g, to: ">આનાથી સૉર્ટ કરો:<" },
    { from: />Featured</g, to: ">વિશેષ<" },
    { from: />Price: Low to High</g, to: ">કિંમત: ઓછી થી વધુ<" },
    { from: />Price: High to Low</g, to: ">કિંમત: વધુ થી ઓછી<" },
    { from: />Price</g, to: ">કિંમત<" },
    { from: />Buy Now</g, to: ">હમણાં ખરીદો<" },
    { from: />Login to Buy</g, to: ">ખરીદવા માટે લૉગિન કરો<" },
];

const filesToTranslate = ['index.ejs', 'explore.ejs', 'cart.ejs'];

filesToTranslate.forEach(file => {
    const filePath = path.join(ejsDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        replaces.forEach(rule => {
            content = content.replace(rule.from, rule.to);
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Translated ${file}`);
    }
});
