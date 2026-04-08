/* SamKart Floating Quick Nav */
(function() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `

        /* ===== BOTTOM NAV BAR ===== */
        #sk-bottom-nav {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 64px;
            background: rgba(15, 52, 96, 0.97);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255,210,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-around;
            z-index: 99990;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
            padding: 0 8px;
        }

        .sk-bnav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            flex: 1;
            text-decoration: none;
            color: rgba(255,255,255,0.5);
            font-size: 0.62rem;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.3px;
            padding: 8px 0;
            transition: all 0.2s;
            border-radius: 12px;
            position: relative;
        }

        .sk-bnav-item:hover, .sk-bnav-item.active {
            color: #ffd200;
        }

        .sk-bnav-icon {
            font-size: 1.4rem;
            line-height: 1;
        }

        .sk-bnav-cart-badge {
            position: absolute;
            top: 4px;
            left: 50%;
            transform: translateX(4px);
            background: linear-gradient(135deg, #ff416c, #ff4b2b);
            color: white;
            font-size: 0.55rem;
            font-weight: 800;
            width: 16px; height: 16px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
        }

        /* Add bottom padding to body so content isn't hidden behind the nav */
        body { padding-bottom: 70px !important; }


        #sk-fab {
            position: fixed;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            z-index: 99999;
        }

        #sk-fab-btn {
            width: 40px;
            height: 72px;
            background: linear-gradient(180deg, #7828C8, #FF3085);
            border: none;
            border-radius: 12px 0 0 12px;
            color: white;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            box-shadow: -4px 0 20px rgba(120, 40, 200, 0.4);
            transition: all 0.3s ease;
            writing-mode: vertical-rl;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 1px;
            font-family: sans-serif;
            padding: 0;
        }

        #sk-fab-btn:hover {
            width: 46px;
            box-shadow: -6px 0 28px rgba(120, 40, 200, 0.7);
        }

        #sk-fab-btn span {
            writing-mode: vertical-rl;
            font-size: 0.6rem;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            font-weight: 800;
        }

        #sk-panel {
            position: fixed;
            right: -340px;
            top: 0;
            width: 320px;
            height: 100vh;
            background: rgba(10, 8, 20, 0.97);
            backdrop-filter: blur(20px);
            border-left: 1px solid rgba(255,255,255,0.08);
            z-index: 99998;
            transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
            box-shadow: -10px 0 60px rgba(0,0,0,0.8);
            padding: 0 0 40px 0;
        }

        #sk-panel.open { right: 0; }

        #sk-overlay {
            display: none;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 99997;
            backdrop-filter: blur(2px);
        }
        #sk-overlay.open { display: block; }

        .sk-panel-header {
            background: linear-gradient(135deg, #7828C8, #FF3085);
            padding: 24px 20px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .sk-panel-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: sans-serif;
        }

        .sk-logo-icon {
            width: 36px; height: 36px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-weight: 900; font-size: 1.1rem;
        }

        .sk-logo-name {
            font-size: 1.2rem; font-weight: 800;
            color: white; letter-spacing: -0.5px;
        }

        .sk-logo-sub {
            font-size: 0.65rem; color: rgba(255,255,255,0.6);
            font-weight: 400;
        }

        .sk-close {
            background: rgba(255,255,255,0.15);
            border: none; color: white;
            width: 32px; height: 32px;
            border-radius: 8px;
            cursor: pointer; font-size: 1rem;
            transition: background 0.2s;
        }
        .sk-close:hover { background: rgba(255,255,255,0.3); }

        .sk-section-title {
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.25);
            padding: 20px 20px 8px;
            font-family: sans-serif;
        }

        .sk-nav-link {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 11px 20px;
            color: rgba(255,255,255,0.75);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            font-family: sans-serif;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .sk-nav-link:hover {
            background: rgba(255,255,255,0.06);
            color: white;
            border-left-color: #7828C8;
        }

        .sk-nav-icon {
            width: 32px; height: 32px;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1rem; flex-shrink: 0;
        }

        .sk-divider {
            height: 1px;
            background: rgba(255,255,255,0.06);
            margin: 8px 20px;
        }

        .sk-creds {
            margin: 12px 16px;
            background: rgba(0,255,100,0.05);
            border: 1px solid rgba(0,255,100,0.15);
            border-radius: 12px;
            padding: 14px 16px;
            font-family: sans-serif;
        }

        .sk-creds-title {
            font-size: 0.65rem; font-weight: 700;
            color: rgba(0,255,100,0.7);
            text-transform: uppercase; letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .sk-cred-row {
            display: flex; justify-content: space-between;
            align-items: center;
            font-size: 0.78rem;
            color: rgba(255,255,255,0.6);
            margin-bottom: 4px;
        }

        .sk-cred-val {
            font-family: monospace;
            color: #00ff64;
            font-size: 0.78rem;
        }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const html = `
        <!-- Bottom Navigation Bar -->
        <div id="sk-bottom-nav">
            <a href="/" class="sk-bnav-item ${typeof window !== 'undefined' && window.location.pathname === '/' ? 'active' : ''}">
                <span class="sk-bnav-icon">🏠</span>
                <span>Home</span>
            </a>
            <a href="/explore" class="sk-bnav-item">
                <span class="sk-bnav-icon">🔍</span>
                <span>Explore</span>
            </a>
            <a href="/cart" class="sk-bnav-item">
                <span class="sk-bnav-icon">🛒</span>
                <span>Cart</span>
            </a>
            <a href="/login" class="sk-bnav-item">
                <span class="sk-bnav-icon">👤</span>
                <span>Login</span>
            </a>
            <a href="/admin/login" class="sk-bnav-item">
                <span class="sk-bnav-icon">⚙️</span>
                <span>Admin</span>
            </a>
        </div>

        <div id="sk-overlay" onclick="skClose()"></div>
        <div id="sk-fab">
            <button id="sk-fab-btn" onclick="skToggle()" title="SamKart Quick Nav">
                <span>⚡ MENU</span>
            </button>
        </div>
        <div id="sk-panel">
            <div class="sk-panel-header">
                <div class="sk-panel-logo">
                    <div class="sk-logo-icon">S</div>
                    <div>
                        <div class="sk-logo-name">SamKart</div>
                        <div class="sk-logo-sub">Quick Navigation</div>
                    </div>
                </div>
                <button class="sk-close" onclick="skClose()">✕</button>
            </div>

            <div class="sk-section-title">🛍️ Customer Pages</div>

            <a href="/" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(120,40,200,0.2)">🏠</div>
                Homepage
            </a>
            <a href="/explore" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(40,120,255,0.2)">🔍</div>
                Explore Products
            </a>
            <a href="/cart" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(255,160,40,0.2)">🛒</div>
                Shopping Cart
            </a>
            <a href="/profile" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(0,180,180,0.2)">👤</div>
                My Profile & Orders
            </a>
            <a href="/login" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(0,200,100,0.2)">🔑</div>
                User Login
            </a>
            <a href="/register" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(0,200,100,0.15)">✍️</div>
                Register
            </a>

            <div class="sk-divider"></div>
            <div class="sk-section-title">⚙️ Admin / CEO Pages</div>

            <a href="/admin/dashboard" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(120,40,200,0.2)">📊</div>
                CEO Dashboard
            </a>
            <a href="/admin/users" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(40,120,255,0.2)">👥</div>
                User Management
            </a>
            <a href="/admin/listings" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(255,160,40,0.2)">📦</div>
                Product Listings
            </a>
            <a href="/admin/transactions" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(0,200,100,0.2)">💰</div>
                Transactions
            </a>
            <a href="/admin/cms" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(255,48,133,0.2)">🎨</div>
                Content Manager
            </a>
            <a href="/admin/settings" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(0,180,180,0.2)">⚙️</div>
                Platform Settings
            </a>
            <a href="/admin/support" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(255,220,0,0.15)">🎧</div>
                Support Tickets
            </a>
            <a href="/admin/login" class="sk-nav-link">
                <div class="sk-nav-icon" style="background:rgba(255,60,60,0.2)">🔐</div>
                Admin Login
            </a>

            <div class="sk-divider"></div>
            <div class="sk-creds">
                <div class="sk-creds-title">🔐 Admin Credentials</div>
                <div class="sk-cred-row">
                    <span>Email</span>
                    <span class="sk-cred-val">sam@samkart.com</span>
                </div>
                <div class="sk-cred-row">
                    <span>Password</span>
                    <span class="sk-cred-val">admin123</span>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // Functions
    window.skToggle = function() {
        document.getElementById('sk-panel').classList.toggle('open');
        document.getElementById('sk-overlay').classList.toggle('open');
    };
    window.skClose = function() {
        document.getElementById('sk-panel').classList.remove('open');
        document.getElementById('sk-overlay').classList.remove('open');
    };
})();
