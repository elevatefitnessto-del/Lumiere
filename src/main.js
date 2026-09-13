import './styles.css'
import './overrides.css'

const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('lumiere-cart') || '[]'),
  cartOpen: false,
  checkoutOpen: false,
  mobileFilterOpen: false,
  mobileNavOpen: false,
  filters: {
    collection: 'All',
    tier: 'All',
    shape: 'All',
    badge: 'All',
    price: 'All',
  },
  sort: 'featured',
}

const BASE = import.meta.env.BASE_URL
const app = document.querySelector('#app')

const icon = (name, size = 18) => {
  const icons = {
    bag: '<path d="M5 7.5h10l1 10H4l1-10Z"/><path d="M7.5 8V5.8a2.5 2.5 0 0 1 5 0V8"/>',
    search: '<circle cx="10.8" cy="10.8" r="5.8"/><path d="m15.3 15.3 4 4"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M5 5l14 14M19 5 5 19"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`
}

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const asset = (path) => `${BASE}${String(path).replace(/^\//, '')}`
const money = (value) => `$${Number(value).toFixed(0)}`
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const collections = ['French Classic', 'Luxe', 'After Dark', 'Cat Eye']
const tiers = ['Essential', 'Signature', 'Luxe']
const shapes = ['Square', 'Almond', 'Oval', 'Coffin', 'Round', 'Rectangular', 'Pointed', 'Stiletto', 'Statement']
const badges = ['Everyday', 'Statement', 'Value Pick']

function productImage(product, path = product.image) {
  return asset(path || product.image)
}

function saveCart() {
  localStorage.setItem('lumiere-cart', JSON.stringify(state.cart))
}

function cartCount() {
  return state.cart.reduce((sum, line) => sum + line.qty, 0)
}

function getProduct(id) {
  return state.products.find((product) => product.id === id)
}

function addToCart(id, qty = 1) {
  const line = state.cart.find((item) => item.id === id)
  if (line) line.qty += qty
  else state.cart.push({ id, qty })
  saveCart()
  state.cartOpen = true
  render()
  showToast('Added to your Lumiere edit')
}

function updateCart(id, delta) {
  const line = state.cart.find((item) => item.id === id)
  if (!line) return
  line.qty += delta
  if (line.qty < 1) state.cart = state.cart.filter((item) => item.id !== id)
  saveCart()
  render()
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id)
  saveCart()
  render()
}

function showToast(message) {
  const toast = document.querySelector('.toast')
  if (!toast) return
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(window.__lumiereToast)
  window.__lumiereToast = setTimeout(() => toast.classList.remove('show'), 2600)
}

function navigate(hash) {
  state.mobileNavOpen = false
  state.mobileFilterOpen = false
  if (window.location.hash === hash) render()
  else window.location.hash = hash
}

function header() {
  const route = window.location.hash || '#/'
  const shopActive = route.includes('#/shop') || route.includes('#/product') || route.includes('#/collection')
  return `
    <div class="announce">Complimentary shipping on edits over $75 · made to be noticed</div>
    <header class="site-header">
      <div class="header-inner">
        <button class="icon-btn mobile-menu" data-action="toggle-mobile-nav" aria-label="Open menu">${icon(state.mobileNavOpen ? 'close' : 'menu')}</button>
        <a class="brand" href="#/">lumi<em>è</em>re</a>
        <nav class="nav" aria-label="Main navigation">
          <a class="${route === '#/' ? 'active' : ''}" href="#/">Home</a>
          <a class="${shopActive ? 'active' : ''}" href="#/shop">Shop all</a>
          <a href="#/shop?filter=Statement">The edit</a>
        </nav>
        <div class="header-actions">
          <button class="icon-btn search-btn" data-action="search" aria-label="Search">${icon('search')}</button>
          <button class="icon-btn cart-button" data-action="open-cart" aria-label="Open bag">${icon('bag')}<span class="cart-count">${cartCount()}</span></button>
        </div>
      </div>
      ${state.mobileNavOpen ? `<div class="mobile-nav-panel"><a href="#/">Home</a><a href="#/shop">Shop all</a><a href="#/shop?filter=Statement">The edit</a><a href="#/shop?filter=Value%20Pick">Value picks</a></div>` : ''}
    </header>
  `
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="page-shell">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">lumière</div>
            <p class="footer-note">Press-on nails for the main character in every room. Designed to be worn on repeat.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <ul><li><a href="#/shop">Shop all</a></li><li><a href="#/shop?collection=French%20Classic">French Classic</a></li><li><a href="#/shop?collection=Luxe">Luxe</a></li><li><a href="#/shop?collection=After%20Dark">After Dark</a></li></ul>
          </div>
          <div>
            <h3>Good to know</h3>
            <ul><li><a href="#/shop">Fit guide</a></li><li><a href="#/shop">Care & wear</a></li><li><a href="#/shop">Shipping</a></li><li><a href="#/shop">Returns</a></li></ul>
          </div>
          <div>
            <h3>Stay luminous</h3>
            <ul><li><a href="mailto:hello@lumiere.studio">hello@lumiere.studio</a></li><li><a href="#/shop">Instagram / @lumiere</a></li></ul>
          </div>
        </div>
        <div class="footer-bottom"><span>© 2026 Lumiere Studio</span><span>Small batch · big energy</span></div>
      </div>
    </footer>
  `
}

function productCard(product) {
  return `
    <article class="product-card">
      <a href="#/product/${escapeHtml(product.slug)}" aria-label="View ${escapeHtml(product.name)}">
        <div class="product-image">
          <img src="${productImage(product)}" alt="${escapeHtml(product.name)} press-on nail set" loading="lazy" />
          ${product.badges?.length ? `<div class="badge-row">${product.badges.slice(0, 2).map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join('')}</div>` : ''}
          <span class="btn product-quick" data-action="quick-add" data-id="${product.id}">Add to bag ${icon('arrow', 15)}</span>
        </div>
      </a>
      <div class="product-meta">
        <div class="product-meta-top"><h3>${escapeHtml(product.name)}</h3><span class="product-price">${money(product.price)}</span></div>
        <div class="product-subline">${escapeHtml(product.collection)} · ${escapeHtml(product.shape)}</div>
      </div>
    </article>
  `
}

function collectionCard(name, image, number, caption) {
  return `
    <a class="collection-card" href="#/shop?collection=${encodeURIComponent(name)}">
      <img src="${asset(image)}" alt="${escapeHtml(name)} collection" loading="lazy" />
      <div class="collection-info"><span class="number">${number}</span><h3>${escapeHtml(name)}</h3><span>${escapeHtml(caption)} ↗</span></div>
    </a>
  `
}

function renderHome() {
  const featured = ['lum-03', 'lum-08', 'lum-05', 'lum-11'].map(getProduct).filter(Boolean)
  return `
    <main>
      <section class="home-hero">
        <div class="hero-copy">
          <div class="eyebrow-line kicker">The new nail standard</div>
          <h1 class="display">Made for<br><em>your close-up.</em></h1>
          <p>Hand-finished press-ons with an editorial point of view. Find your shape, pick your mood, make an entrance.</p>
          <div class="hero-actions"><a class="btn" href="#/shop">Shop the collection ${icon('arrow', 16)}</a><a class="text-btn" href="#/shop?collection=Luxe">Explore Luxe</a></div>
          <div class="hero-note">18 considered sets · XS–M fit · ready in minutes</div>
        </div>
        <div class="hero-visual"><div class="hero-frame"><img src="${asset('images/lum-hero.jpg')}" alt="Lumiere blush French manicure campaign" /></div><div class="hero-arch"></div><div class="hero-caption"><span>Set<br>the tone.</span><span>Lumiere / studio notes 01</span></div><div class="hero-scroll">Scroll to discover</div></div>
      </section>
      <section class="home-section page-shell">
        <div class="section-heading"><div><div class="kicker">Choose your mood</div><h2 class="display">Four ways to <em>shine.</em></h2></div><p>From everyday French to after-dark drama, the edit is organized around the way you want to feel.</p></div>
        <div class="collection-grid">
          ${collectionCard('French Classic', 'images/lum-rose-french.jpg', '01', 'The everyday icon')}
          ${collectionCard('Luxe', 'images/lum-pearl-atelier.jpg', '02', 'Quietly extra')}
          ${collectionCard('After Dark', 'images/lum-after-dark.jpg', '03', 'Turn up the night')}
          ${collectionCard('Cat Eye', 'images/lum-garnet-moon.jpg', '04', 'Catch the light')}
        </div>
      </section>
      <section class="page-shell"><div class="spotlight"><div class="spotlight-copy"><div class="kicker">The statement edit</div><h2 class="display">A little<br><em>extra.</em></h2><p>For the days that call for a double take. Gloss, texture, charms and a little bit of audacity.</p><a class="text-btn" href="#/shop?filter=Statement">Shop statement sets ${icon('arrow', 15)}</a></div><div class="spotlight-image"><img src="${asset('images/lum-petal-french.jpg')}" alt="Lumiere statement floral nail set" loading="lazy" /></div></div></section>
      <section class="home-section page-shell"><div class="section-heading"><div><div class="kicker">On our radar</div><h2 class="display">The <em>shortlist.</em></h2></div><a class="text-btn" href="#/shop">See all 18 sets ${icon('arrow', 15)}</a></div><div class="featured-grid">${featured.map(productCard).join('')}</div></section>
      <section class="newsletter"><div class="kicker">A note from the studio</div><h2 class="display">Stay in the <em>light.</em></h2><p>New drops, styling notes and the occasional excuse to treat yourself — straight to your inbox.</p><form class="newsletter-form" data-action="newsletter"><input name="email" type="email" placeholder="Your email address" aria-label="Your email address" required /><button type="submit">Sign me up ${icon('arrow', 14)}</button></form></section>
    </main>
  `
}

function countFor(field, value) {
  return state.products.filter((product) => {
    if (field === 'badge') return product.badges?.includes(value)
    if (field === 'price') return product.price === Number(value)
    return product[field.toLowerCase()] === value
  }).length
}

function currentFiltersFromHash() {
  const query = new URLSearchParams((window.location.hash.split('?')[1] || ''))
  const collection = query.get('collection')
  const filter = query.get('filter')
  if (collection && collections.includes(collection)) state.filters.collection = collection
  if (filter && (badges.includes(filter) || tiers.includes(filter))) {
    if (badges.includes(filter)) state.filters.badge = filter
    else state.filters.tier = filter
  }
  const search = query.get('search') || ''
  return search
}

function filterButton(field, value, label = value) {
  const key = field.toLowerCase()
  const selected = state.filters[key] === value
  const count = value === 'All' ? (key === 'collection' ? state.products.length : '') : countFor(key, value)
  return `<button class="filter-option ${selected ? 'selected' : ''}" data-action="filter" data-field="${key}" data-value="${escapeHtml(value)}"><span><span class="check">${selected ? icon('check', 11) : ''}</span>${escapeHtml(label)}</span>${count !== '' ? `<small>${count}</small>` : ''}</button>`
}

function filterGroup(title, field, values, labels = {}) {
  return `<div class="filter-group"><h3>${title}</h3>${filterButton(field, 'All', 'All')} ${values.map((value) => filterButton(field, value, labels[value] || value)).join('')}</div>`
}

function filteredProducts() {
  let products = [...state.products]
  const f = state.filters
  if (f.collection !== 'All') products = products.filter((p) => p.collection === f.collection)
  if (f.tier !== 'All') products = products.filter((p) => p.tier === f.tier)
  if (f.shape !== 'All') products = products.filter((p) => p.shape === f.shape)
  if (f.badge !== 'All') products = products.filter((p) => p.badges?.includes(f.badge))
  if (f.price !== 'All') products = products.filter((p) => p.price === Number(f.price))
  const search = currentFiltersFromHash().trim().toLowerCase()
  if (search) products = products.filter((p) => `${p.name} ${p.collection} ${p.description}`.toLowerCase().includes(search))
  if (state.sort === 'price-low') products.sort((a, b) => a.price - b.price)
  if (state.sort === 'price-high') products.sort((a, b) => b.price - a.price)
  if (state.sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name))
  return products
}

function renderShop() {
  const search = currentFiltersFromHash()
  const products = filteredProducts()
  return `
    <main class="page-shell">
      <section class="shop-header"><div class="kicker">The Lumiere archive</div><h1 class="display">Shop <em>the edit.</em></h1><p>18 sets, four moods, one very good reason to change your nails.</p></section>
      <div class="shop-toolbar"><span class="result-count">${products.length} ${products.length === 1 ? 'set' : 'sets'}${search ? ` for “${escapeHtml(search)}”` : ''}</span><div class="toolbar-actions"><button class="mobile-filter-btn" data-action="toggle-filters">Filter + refine</button><label class="muted" for="sort" style="font-size: 10px; text-transform: uppercase; letter-spacing: .12em;">Sort by</label><select id="sort" class="sort-select" data-action="sort"><option value="featured" ${state.sort === 'featured' ? 'selected' : ''}>Featured</option><option value="price-low" ${state.sort === 'price-low' ? 'selected' : ''}>Price: low to high</option><option value="price-high" ${state.sort === 'price-high' ? 'selected' : ''}>Price: high to low</option><option value="name" ${state.sort === 'name' ? 'selected' : ''}>Name</option></select></div></div>
      <div class="shop-layout">
        <aside class="filter-panel ${state.mobileFilterOpen ? 'open' : ''}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:27px;"><span class="kicker">Refine</span><button class="icon-btn" data-action="toggle-filters" aria-label="Close filters">${icon('close', 16)}</button></div>${filterGroup('Collection', 'collection', collections)}${filterGroup('Tier / price', 'tier', tiers, { Essential: 'Essential · $18', Signature: 'Signature · $24', Luxe: 'Luxe · $32' })}${filterGroup('Shape', 'shape', shapes)}${filterGroup('Badge', 'badge', badges)}${filterGroup('Price', 'price', ['18', '24', '32'], { '18': '$18', '24': '$24', '32': '$32' })}<button class="clear-filters" data-action="clear-filters">Clear all</button></aside>
        <section class="shop-grid">${products.length ? products.map(productCard).join('') : `<div class="empty-state"><h2 class="display">Nothing here <em>yet.</em></h2><p>Try easing up on the filters — there is more to love.</p><button class="btn" data-action="clear-filters">Clear filters</button></div>`}</section>
      </div>
    </main>
  `
}

function renderProduct(slug) {
  const product = state.products.find((item) => item.slug === slug) || state.products[0]
  if (!product) return '<main class="page-shell"><p>Loading…</p></main>'
  const related = state.products.filter((item) => item.id !== product.id && (item.collection === product.collection || item.tier === product.tier)).slice(0, 4)
  return `
    <main class="page-shell">
      <div class="breadcrumbs"><a href="#/shop">Shop all</a> <span> / </span> <a href="#/shop?collection=${encodeURIComponent(product.collection)}">${escapeHtml(product.collection)}</a> <span> / </span> ${escapeHtml(product.name)}</div>
      <section class="product-layout">
        <div class="product-gallery"><div class="gallery-image"><img src="${productImage(product)}" alt="${escapeHtml(product.name)} nail set" /></div>${product.additional_images.map((image) => `<div class="gallery-image"><img src="${productImage(product, image)}" alt="${escapeHtml(product.name)} detail" loading="lazy" /></div>`).join('')}</div>
        <div class="product-detail"><div class="kicker">${escapeHtml(product.collection)} / ${escapeHtml(product.tier)}</div><h1 class="display">${escapeHtml(product.name)}</h1><p class="lead">${escapeHtml(product.description)}</p><div class="detail-price">${money(product.price)}</div><div class="detail-tags">${product.badges.map((badge) => `<span class="detail-tag">${escapeHtml(badge)}</span>`).join('')}<span class="detail-tag">${escapeHtml(product.shape)}</span><span class="detail-tag">${escapeHtml(product.variant.split('/')[0].trim())}</span></div><div class="detail-divider"></div><div class="detail-field"><strong>Fit</strong><span>${escapeHtml(product.size_range)} · ${escapeHtml(product.variant)}</span></div><div class="detail-field"><strong>Availability</strong><span class="${product.inventory_status === 'low stock' ? 'stock-note' : ''}" style="margin:0;">${product.inventory_status === 'low stock' ? 'Almost gone' : 'Ready to ship'}</span></div><div class="size-choice"><label>Choose your size</label><a class="size-guide" href="#/shop">View fit guide ↗</a></div><div class="size-options"><button class="size-button selected" data-size="XS">XS</button><button class="size-button" data-size="S">S</button><button class="size-button" data-size="M">M</button></div><div class="add-row"><div class="quantity"><button data-action="pdp-qty" data-delta="-1" aria-label="Decrease quantity">${icon('minus', 14)}</button><output id="pdp-quantity">1</output><button data-action="pdp-qty" data-delta="1" aria-label="Increase quantity">${icon('plus', 14)}</button></div><button class="btn" data-action="add-pdp" data-id="${product.id}">Add to bag ${icon('arrow', 16)}</button></div><div class="stock-note">${product.inventory_status === 'low stock' ? 'Only a few sets left in the studio.' : 'In stock · ships in 1–2 business days.'}</div><div class="accordion"><div class="accordion-item open"><button class="accordion-trigger" data-action="accordion">Details <span>−</span></button><div class="accordion-copy">A considered set for your current mood. Each order includes the nails and essentials you need to apply at home. Designed to be worn your way, from a first date to a regular Tuesday.</div></div><div class="accordion-item"><button class="accordion-trigger" data-action="accordion">Care & removal <span>+</span></button><div class="accordion-copy">${escapeHtml(product.care_instructions)} To remove, gently loosen with warm soapy water and an orangewood stick — never force the nail.</div></div><div class="accordion-item"><button class="accordion-trigger" data-action="accordion">Shipping & returns <span>+</span></button><div class="accordion-copy">Complimentary shipping starts at $75. Unworn sets can be returned within 14 days of delivery.</div></div></div></div>
      </section>
      <section class="related-section"><div class="kicker">Keep browsing</div><h2 class="display">You may also <em>like.</em></h2><div class="featured-grid">${related.map(productCard).join('')}</div></section>
    </main>
  `
}

function cartDrawer() {
  const subtotal = state.cart.reduce((sum, line) => sum + (getProduct(line.id)?.price || 0) * line.qty, 0)
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 7
  return `
    <div class="cart-backdrop ${state.cartOpen ? 'open' : ''}" data-action="close-cart"></div>
    <aside class="cart-drawer ${state.cartOpen ? 'open' : ''}" aria-label="Shopping bag">
      <div class="cart-header"><h2>Your bag <span style="font-family:'DM Sans';font-size:12px;color:var(--muted);">(${cartCount()})</span></h2><button class="icon-btn" data-action="close-cart" aria-label="Close bag">${icon('close')}</button></div>
      <div class="cart-items">${state.cart.length ? state.cart.map((line) => { const product = getProduct(line.id); if (!product) return ''; return `<div class="cart-item"><div class="cart-item-image"><img src="${productImage(product)}" alt="${escapeHtml(product.name)}" /></div><div class="cart-item-info"><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.collection)} · ${money(product.price)}</p><div class="cart-qty"><button data-action="cart-qty" data-id="${product.id}" data-delta="-1">−</button><span>${line.qty}</span><button data-action="cart-qty" data-id="${product.id}" data-delta="1">+</button></div><button class="cart-remove" data-action="remove-cart" data-id="${product.id}">Remove</button></div><div class="cart-item-total">${money(product.price * line.qty)}</div></div>` }).join('') : `<div class="cart-empty"><p>Your bag is waiting for a little light.</p><a class="btn btn-secondary" href="#/shop" data-action="close-cart">Browse sets ${icon('arrow', 15)}</a></div>`}</div>
      ${state.cart.length ? `<div class="cart-summary"><div class="summary-line"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="summary-line"><span>Shipping</span><span>${shipping ? money(shipping) : 'Complimentary'}</span></div><p class="shipping-note">${shipping ? `Add ${money(75 - subtotal)} more for complimentary shipping.` : 'You unlocked complimentary shipping.'}</p><div class="summary-line summary-total"><span>Total</span><span>${money(subtotal + shipping)}</span></div><button class="btn btn-wide" data-action="checkout">Continue to checkout ${icon('arrow', 15)}</button></div>` : ''}
    </aside>
  `
}

function checkoutModal() {
  if (!state.checkoutOpen) return ''
  const subtotal = state.cart.reduce((sum, line) => sum + (getProduct(line.id)?.price || 0) * line.qty, 0)
  return `<div class="checkout-backdrop"><div class="checkout-modal"><button class="icon-btn checkout-close" data-action="close-checkout" aria-label="Close checkout">${icon('close')}</button><div class="kicker">Secure checkout</div><h2 class="display">Make it <em>yours.</em></h2><p class="muted">A payment-ready checkout shell for your Lumiere order.</p><form data-action="checkout-form"><label>First name<input name="first" required placeholder="Your first name" /></label><label>Email<input name="email" type="email" required placeholder="you@example.com" /></label><label>Shipping address<input name="address" required placeholder="Street, city, postal code" /></label><div class="checkout-total"><span>Order total</span><strong>${money(subtotal + (subtotal >= 75 ? 0 : 7))}</strong></div><button class="btn btn-wide" type="submit">Place order ${icon('arrow', 15)}</button><small>This demo is ready to connect to Stripe Checkout.</small></form></div></div>`
}

function render() {
  if (!state.products.length) {
    app.innerHTML = `${header()}<main class="page-shell" style="padding:100px 0;">Loading the studio…</main>${footer()}${cartDrawer()}<div class="toast"></div>`
    return
  }
  const hash = window.location.hash || '#/'
  const route = hash.split('?')[0]
  let content = ''
  if (route.startsWith('#/product/')) content = renderProduct(decodeURIComponent(route.replace('#/product/', '')))
  else if (route.startsWith('#/shop') || route.startsWith('#/collection')) content = renderShop()
  else content = renderHome()
  app.innerHTML = `${header()}${content}${footer()}${cartDrawer()}${checkoutModal()}<div class="toast"></div>`
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const action = element.dataset.action
      if (['quick-add', 'filter', 'cart-qty', 'remove-cart', 'add-pdp', 'pdp-qty', 'accordion', 'toggle-filters', 'toggle-mobile-nav', 'search', 'newsletter', 'checkout-form'].includes(action)) event.stopPropagation()
      if (action === 'open-cart') { state.cartOpen = true; render() }
      if (action === 'close-cart') { state.cartOpen = false; render() }
      if (action === 'toggle-mobile-nav') { state.mobileNavOpen = !state.mobileNavOpen; render() }
      if (action === 'toggle-filters') { state.mobileFilterOpen = !state.mobileFilterOpen; render() }
      if (action === 'quick-add') { event.preventDefault(); addToCart(element.dataset.id) }
      if (action === 'add-pdp') addToCart(element.dataset.id, Number(document.querySelector('#pdp-quantity')?.value || document.querySelector('#pdp-quantity')?.textContent || 1))
      if (action === 'pdp-qty') {
        const output = document.querySelector('#pdp-quantity')
        const next = Math.max(1, Number(output?.textContent || 1) + Number(element.dataset.delta))
        if (output) output.textContent = next
      }
      if (action === 'cart-qty') updateCart(element.dataset.id, Number(element.dataset.delta))
      if (action === 'remove-cart') removeFromCart(element.dataset.id)
      if (action === 'clear-filters') { state.filters = { collection: 'All', tier: 'All', shape: 'All', badge: 'All', price: 'All' }; navigate('#/shop') }
      if (action === 'filter') { state.filters[element.dataset.field] = element.dataset.value; state.mobileFilterOpen = false; render() }
      if (action === 'accordion') {
        const item = element.closest('.accordion-item')
        item.classList.toggle('open')
        element.querySelector('span:last-child').textContent = item.classList.contains('open') ? '−' : '+'
      }
      if (action === 'search') {
        const query = window.prompt('Search the Lumiere edit')
        if (query?.trim()) navigate(`#/shop?search=${encodeURIComponent(query.trim())}`)
      }
      if (action === 'checkout') { state.checkoutOpen = true; render() }
      if (action === 'close-checkout') { state.checkoutOpen = false; render() }
    })
  })
  document.querySelectorAll('[data-size]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-size]').forEach((item) => item.classList.remove('selected'))
    button.classList.add('selected')
  }))
  const sort = document.querySelector('[data-action="sort"]')
  sort?.addEventListener('change', (event) => { state.sort = event.target.value; render() })
  document.querySelector('[data-action="newsletter"]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    showToast('You’re on the list. Stay luminous.')
    event.target.reset()
  })
  document.querySelector('[data-action="checkout-form"]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    state.checkoutOpen = false
    state.cart = []
    saveCart()
    render()
    showToast('Order received — your Lumiere edit is on its way.')
  })
}

window.addEventListener('hashchange', () => { state.mobileNavOpen = false; render() })

fetch(`${BASE}products.json`)
  .then((response) => response.json())
  .then((products) => { state.products = products; render(); bindEvents() })
  .catch(() => { app.innerHTML = '<main class="page-shell" style="padding:100px 0;">Unable to load the catalog.</main>' })

const originalRender = render
function renderAndBind() { originalRender(); bindEvents() }
render = renderAndBind
