const fs = require("fs");
const path = "indian-nft-web/views/index.ejs";
let content = fs.readFileSync(path, "utf8");

const startIdx = content.indexOf("<!-- Fashion Category -->");
const endIdx = content.indexOf("<!-- ================== VIEW 4: CATEGORY PAGE ================== -->");

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    
    const dynamicSections = `
        <section id="explore-category" class="container section">
            <div class="section-title">
                <h2>Explore <span class="highlight">Everything</span></h2>
                <a href="#" class="view-all">View All</a>
            </div>
            <div class="product-grid" id="all-products-main-grid">
                <% if(typeof listings !== "undefined" && listings.length > 0) { %>
                    <% listings.forEach(function(item) { %>
                        <div class="product-card" onclick="showView(\`product\`)" style="cursor: pointer;" data-id="<%= item.id %>">
                            <button class="wishlist-btn" onclick="event.stopPropagation(); this.style.color=\`#ff3366\`;"><ion-icon name="heart-outline"></ion-icon></button>
                            <div class="product-image">
                                <img src="<%= item.image %>" alt="<%= item.title %>">
                            </div>
                            <div class="product-details">
                                <div class="brand-name"><%= item.brand || item.category %></div>
                                <h3 class="product-name"><%= item.title %></h3>
                                <div class="ratings"><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star"></ion-icon><ion-icon name="star-half"></ion-icon><span>(4.2k)</span></div>
                                <div class="product-price">
                                    <% 
                                      let priceNum = parseInt(String(item.price).replace(/,/g, ""));
                                      if(isNaN(priceNum)) priceNum = 0;
                                    %>
                                    <span class="current-price">?<%= priceNum.toLocaleString("en-IN") %></span>
                                </div>
                                <%
                                  let cleanTitle = String(item.title).replace(/'/g, "").replace(/"/g, "");
                                  let cleanBrand = String(item.brand || item.category).replace(/'/g, "").replace(/"/g, "");
                                %>
                                <button class="btn btn-outline full-width" onclick="event.stopPropagation(); addToCart({ id: \`<%= item.id %>\`, name: \`<%= cleanTitle %>\`, brand: \`<%= cleanBrand %>\`, price: \`<%= priceNum.toLocaleString(\"en-IN\") %>\`, img: \`<%= item.image %>\` });">Add to Cart</button>
                            </div>
                        </div>
                    <% }); %>
                <% } else { %>
                    <h3 style="color: #fff;">No products available. Add some in DB!</h3>
                <% } %>
            </div>
        </section>
    </div>
    `;

    fs.writeFileSync(path, before + dynamicSections + "\n    " + after);
    console.log("Successfully replaced hardcoded sections.");
} else {
    console.log("Could not find boundaries.");
}

