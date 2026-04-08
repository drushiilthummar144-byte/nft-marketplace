const fs = require('fs');
const path = 'indian-nft-web/views/index.ejs';
let content = fs.readFileSync(path, 'utf8');

const dynamicSection = \
        <!-- DYNAMIC PRODUCTS SECTION -->
        <section id="deals-category" class="container section">
            <div class="section-title">
                <h2>Explore <span class="highlight">Everything</span></h2>
                <a href="#" class="view-all">View All</a>
            </div>
            
            <div class="product-grid" id="all-products-main-grid">
                <% if(typeof listings !== 'undefined' && listings.length > 0) { %>
                    <% listings.forEach(function(item) { %>
                        <div class="product-card" onclick="showView('product')" style="cursor: pointer;" data-id="<%= item.id %>">
                            <button class="wishlist-btn" onclick="event.stopPropagation(); this.style.color='#ff3366';"><ion-icon name="heart-outline"></ion-icon></button>
                            <div class="product-image">
                                <img src="<%= item.image %>" alt="<%= item.title %>">
                            </div>
                            <div class="product-details">
                                <div class="brand-name"><%= item.brand || item.category %></div>
                                <h3 class="product-name"><%= item.title %></h3>
                                <div class="ratings"><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star-half"></ion-icon><span>(4.2k)</span></div>
                                <div class="product-price">
                                    <% 
                                      let priceNum = parseInt(item.price.replace(/,/g, ''));
                                      if(isNaN(priceNum)) priceNum = 0;
                                    %>
                                    <span class="current-price">?<%= priceNum.toLocaleString('en-IN') %></span>
                                </div>
                                <button class="btn btn-outline full-width" onclick="event.stopPropagation(); addToCart({ id: '<%= item.id %>', name: '<%= item.title.replace(/'/g, "\\'") %>', brand: '<%= (item.brand||'').replace(/'/g, "\\'") %>', price: '<%= priceNum.toLocaleString('en-IN') %>', img: '<%= item.image %>' });">Add to Cart</button>
                            </div>
                        </div>
                    <% }); %>
                <% } else { %>
                    <h3 style="color: #fff;">No products available matching your criteria.</h3>
                <% } %>
            </div>
        </section>
\;

const startDeals = content.indexOf('<!-- Deals of the day -->');
const endHomeBeauty = content.indexOf('<!-- ================== VIEW 2: PRODUCT DETAILS ================== -->');

if (startDeals !== -1 && endHomeBeauty !== -1) {
    const before = content.substring(0, startDeals);
    const after = content.substring(endHomeBeauty);
    fs.writeFileSync(path, before + dynamicSection + '\n    ' + after);
    console.log('Successfully injected dynamic DB EJS loop inside home view.');
} else {
    console.log('Could not find boundaries.');
}

const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
// Add missing elements to db.json to make it pop!
if (db.listings.length < 15) {
  // Let's ensure the products look awesome.
  console.log('Ensure listings are robust.');
}

