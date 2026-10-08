
const DISTRICTS = ["Bengaluru Urban", "Hubballi-Dharwad", "Mysuru", "Belagavi", "Mangaluru", "Kalaburagi", "Shivamogga", "Udupi", "Ballari", "Davanagere", "Hassan", "Vijayapura", "Tumakuru", "Bagalkote", "Chitradurga", "Mandya", "Raichur", "Bidar", "Kolar", "Kodagu"];
const CATEGORIES = ["Sweets & Snacks", "Masalas & Podis", "Tiffin & Meals", "Home Bakery", "Handicrafts & Tailoring","Organic Produce", "Dairy & Ghee", "Tech & Digital Services", "Custom Services"];

const DEFAULT_SELLERS = [
    { id: "s-1", slug: "renuka-dharwad-sweets", name: "Renuka Patil", shop_name: "Renuka's Dharwad Sweets & Savouries", phone: "9845100001", district: "Hubballi-Dharwad", ward: "Line Bazaar", category: "Sweets & Snacks", upi_id: "9845100001@upi", bio: "Authentic Dharwad pedha, hand-rolled shenga holige, and crunchy benne murukku.", rating: 4.9, theme: { color: "#E8A317" }, listings: [{ id: "l-1", title: "Dharwad Pedha (500g Box)", price: 280, unit: "box", available: true }, { id: "l-2", title: "Shenga Holige (Pack of 10)", price: 220, unit: "pack", available : true }, { id: "l-3", title: "Kadak Jowar Rotti (Pack of 15)", price: 150, unit: "pack", available: true }] },
    { id: "s-2", slug: "bhagya-mysuru-masalas", name: "Bhagyamma K", shop_name: "Bhagya Mysuru Special Masala Works", phone: "9845200002", district: "Mysuru", ward: "Kuvempunagar", category: "Masalas & Podis", upi_id: "9845200002@upi", bio: "Stone-ground traditional Bisi Bele Bath powder and Kalyana Rasam podi.", rating: 5.0, theme: { color: "#C8553D" }, listings: [{ id: "l-4", title: "Authentic Mysore Bisi Bele Bath Podi (250g)", price: 160, unit: "pack", available: true }, { id: "l-5", title: "Kalyana Rasam Powder (500g)", price: 240, unit: "pack", available: true }] },
    { id: "s-3", slug: "shweta-bengaluru-bakery", name: "Shweta Rao", shop_name: "Shweta's Bengaluru Millet Bakes", phone: "9845300003", district: "Bengaluru Urban", ward: "Malleshwaram", category: "Home Bakery", upi_id: "shwetabakes@okaxis", bio: "Refined sugar-free Ragi brownies and roasted Chikmagalur filter coffee powder.", rating: 4.8, theme: { color: "#1F5E4B" }, listings: [{ id: "l-6", title: "Ragi Dark Chocolate Brownies (Box of 6)", price: 320, unit: "box", available: true }, { id: "l-7", title: "Chikmagalur Filter Coffee Powder (500g)", price: 290, unit: "pack", available: true }] },
    { id: "s-4", slug: "kavitha-belagavi-crafts", name: "Kavitha Kulkarni", shop_name: "Kavitha Belagavi Ilkal & Crafts", phone: "9845400004", district: "Belagavi", ward: "Tilakwadi", category: "Handicrafts & Tailoring", upi_id: "kavitha@upi", bio: "Custom tailored Ilkal saree blouses and Kasuti embroidery dupattas.", rating: 4.9, theme: { color: "#7E22CE" }, listings: [{ id: "l-8", title: "Handmade Kasuti Embroidery Dupatta", price: 850, unit: "piece", available: true }, { id: "l-9", title: "Custom Ilkal Blouse Tailoring Service", price: 650, unit: "service", available: true }] }
];
const DEFAULT_ORDERS = [
  { id: "DHW-8821", seller_slug: "renuka-dharwad-sweets", buyer_name: "Suresh Gowda", buyer_phone: "9880011223", items: [{ title: "Dharwad Pedha (500g Box)", price: 280, qty: 2 }], amount: 560, status: "delivered", fulfilment: "rider", delivery_address: "Kalyan Nagar, Bengaluru", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "DHW-8822", seller_slug: "renuka-dharwad-sweets", buyer_name: "Ananya Hegde", buyer_phone: "9740055443", items: [{ title: "Shenga Holige (Pack of 10)", price: 220, qty: 1 }], amount: 220, status: "ready", fulfilment: "pickup", created_at: new Date(Date.now() - 1800000).toISOString() }
];

const getSellers = () => {
    try {
      const s = JSON.parse(localStorage.getItem('dhwani_sellers'));
      if (Array.isArray(s) && s.length) return s.map(x=> ({ ...x, listings: x.listings || x.items || []}));
    } catch (e) { }
    return DEFAULT_SELLERS;
};
const saveSellers = d => { try {localStorage.setItem('dhwani_sellers', JSON.stringify(d));} catch (e) { } };
const getOrders = () => { try { const o = JSON.parse(localStorage.getItem('dhwani_orders')); if (Array.isArray(o) && o.length) return o; } catch (e) { } return DEFAULT_ORDERS; };
const saveOrders = d => { try { localStorage.setItem('dhwani_orders', JSON.stringify(d)); } catch (e) { } };

const realtime = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('dhwani_realtime') : null;
let audioCtx = null;
function playAudio(t = 'success') {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx && AC) audioCtx = new AC();
        if(audioCtx?.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime, osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);//added as ref now
        osc.type = t === 'order' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(t === 'order' ? 587 : 440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (t === 'order' ? 0.5 : 0.25));
        osc.start(now); osc.stop(now + 0.5);
    
  } catch (e) { }
}

function showToast(title, msg = '', type = 'info') {

    const c = document.getElementById('toasts'); if (!c) return;

      const t = document.createElement('div'), bg = { success: 'bg-[#1F5E4B] text-white', order: 'bg-[#E8A317] text-[#2B2B2B]', error: 'bg-[#C8553D] text-white' }[type] || 'bg-white text-[#2B2B2B] border border-[#E8DFD1]';

        t.className = `flex items-start gap-3 p-4 rounded-[20px] shadow-lg animate-pop-in pointer-events-auto ${bg}`;

          t.innerHTML = `<div class="flex-1 font-bold text-xs"><div>${title}</div>${msg ? `<div class="text-[11px] opacity-80 font-normal">${msg}</div>` : ''}</div><button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100">✕</button>`;

            c.appendChild(t); setTimeout(() => { t.classList.add('opacity-0', 'transition-opacity'); setTimeout(() => t.remove(), 300); }, 4000);

}



function getArtwork(cat = '') {

    const c = (cat || '').toLowerCase();

      if (c.includes('sweet') || c.includes('holige') || c.includes('pedha')) return `<svg viewBox="0 0 100 100" class="w-full h-full text-[#E8A317] fill-current"><circle cx="50" cy="50" r="38" fill="#FEF3C7" stroke="#E8A317" stroke-width="4"/><ellipse cx="50" cy="50" rx="28" ry="20" fill="#FDE68A"/><circle cx="42" cy="46" r="3" fill="#B45309"/></svg>`;

        if (c.includes('masala') || c.includes('podi') || c.includes('rasam')) return `<svg viewBox="0 0 100 100" class="w-full h-full text-[#C8553D] fill-current"><circle cx="50" cy="50" r="38" fill="#FBEBE8" stroke="#C8553D" stroke-width="4"/><path d="M30 65 Q50 78 70 65 L65 42 L35 42 Z" fill="#C8553D"/></svg>`;

          if (c.includes('craft') || c.includes('tailor') || c.includes('silk')) return `<svg viewBox="0 0 100 100" class="w-full h-full text-purple-700 fill-current"><circle cx="50" cy="50" r="38" fill="#F3E8FF" stroke="#7E22CE" stroke-width="4"/><path d="M35 35 L65 35 L70 70 L30 70 Z" fill="#A855F7" fill-opacity="0.6"/></svg>`;

            return `<svg viewBox="0 0 100 100" class="w-full h-full text-[#1F5E4B] fill-current"><circle cx="50" cy="50" r="38" fill="#E6F4F1" stroke="#1F5E4B" stroke-width="4"/><circle cx="50" cy="50" r="26" fill="#1F5E4B" fill-opacity="0.1"/></svg>`;

}



function parseVoice(text = '', name = '', dist = 'Bengaluru Urban') {
 const clean = text.toLowerCase();

   let cat = 'Sweets & Snacks', col = '#1F5E4B';

     if (clean.includes('tech') || clean.includes('software')) { cat = 'Tech & Digital Services'; col = '#0284C7'; }

       else if (clean.includes('masala') || clean.includes('podi')) { cat = 'Masalas & Podis'; col = '#C8553D'; }

         else if (clean.includes('tailor') || clean.includes('silk')) { cat = 'Handicrafts & Tailoring'; col = '#7E22CE'; }

           else if (clean.includes('bake') || clean.includes('brownie')) { cat = 'Home Bakery'; col = '#D97706'; }

          const clauses = clean.split(/[,;\.\n]+|\band\b|\bmattu\b|\baur\b/gi).map(s => s.trim()).filter(Boolean);

          const items = clauses.map((c, idx) => {

          const num = c.match(/\d+/), p = num ? parseInt(num[0], 10) : 200;

          const t = c.replace(/\d+|rupees?|rs\.?|kg|pack|box|\/-/gi, '').trim() || `Special Item ${idx + 1}`;

          return { id: `item-${Date.now()}-${idx}`, title: t.charAt(0).toUpperCase() + t.slice(1), price: p, unit: 'pack' };

                  });

                    return { shop_name: name ? `${name}'s ${cat.split('&')[0].trim()} Store` : `Dhwani ${cat.split('&')[0].trim()} Store`, category: cat, district: dist, theme: { color: col }, items: items.length ? items : [{ id: 'i-1', title: 'Specialty Product', price: 200, unit: 'pack' }] };

                }



                const openModal = h => { const el = document.getElementById('modal-container'); if (el) el.innerHTML = `<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"><div class="bg-white rounded-[30px] max-w-md w-full p-6 space-y-4 shadow-2xl animate-pop-in text-left border border-[#E8DFD1]">${h}</div></div>`; };

                const closeModal = () => { const el = document.getElementById('modal-container'); if (el) el.innerHTML = ''; };


                const App = {
                  cart: {},
                  sellState: { lang: 'kn-IN', recording: false, transcript: '', items: [], name: '', phone: '', district: 'Bengaluru Urban', ward: 'Indiranagar', upi: '' },

                  home() {
                    const sellers = getSellers().slice(0, 4);
                    return `
                    <div class="space-y-10 text-left">
                    <div class="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#FFF8EC] via-white to-[#FEF3C7]/30 border border-[#E8DFD1] p-6 sm:p-12 shadow-soft text-center space-y-5">
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8DFD1] text-xs font-bold text-[#1F5E4B]">
                    <span class="soundwave-bar h-3 bg-[#E8A317] animate-pulse"></span><span class="soundwave-bar h-5 bg-[#C8553D] animate-pulse"></span><span class="soundwave-bar h-3 bg-[#1F5E4B] animate-pulse"></span>
                    <span>Voice-First Micro-Commerce for Karnataka</span>
                    </div>
                    <h1 class="text-4xl sm:text-6xl font-bold tracking-tight font-serif-heading">
                    <span class="text-[#1F5E4B] block">Just speak.</span>
                    <span class="bg-gradient-to-r from-[#C8553D] to-[#E8A317] bg-clip-text text-transparent">Your online storefront is ready!</span>
                    </h1>
                    <p class="text-xs sm:text-sm text-[#6B7280] max-w-xl mx-auto">No GST needed, zero platform fees. Speak in Kannada or English to launch your storefront and take direct UPI payments.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                    <a href="#/sell" class="p-5 bg-gradient-to-br from-[#1F5E4B] to-[#154134] text-white rounded-[20px] shadow-card hover:shadow-glow transition block">
                    <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-2 font-bold">🎙️</div>
                    <h3 class="font-bold text-base">I Want to Sell</h3>
                    <p class="text-xs text-white/80 mt-1">Speak about homemade foods, spices, or tailoring.</p>
                    </a>
                    <a href="#/discover" class="p-5 bg-white text-[#2B2B2B] border border-[#E8DFD1] rounded-[20px] shadow-soft hover:border-[#E8A317] transition block">
                    <div class="w-10 h-10 rounded-xl bg-[#FFF8EC] flex items-center justify-center mb-2 font-bold text-[#C8553D]">🛍️</div>
                    <h3 class="font-bold text-base">I'm Buying</h3>
                    <p class="text-xs text-[#6B7280] mt-1">Discover authentic home stores across Karnataka.</p>
                    </a>
                    </div>
                    </div>

                    <div class="space-y-4">
                    <div class="flex items-center justify-between"><h2 class="text-2xl font-bold font-serif-heading">Featured Karnataka Stores</h2><a href="#/discover" class="text-xs font-bold text-[#1F5E4B] hover:underline">All Stores →</a></div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${sellers.map(s => `
                      <div class="bg-white rounded-[20px] border border-[#E8DFD1] p-4 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                      <div class="flex justify-between items-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8EC] text-[#1F5E4B]">📍 ${s.district}</span><span class="text-xs font-bold text-amber-600">★ ${s.rating}</span></div>
                      <h4 class="font-bold text-sm mt-2 truncate">${s.shop_name}</h4>
                      <p class="text-xs text-[#6B7280] line-clamp-2 mt-1">${s.bio}</p>
                      </div>
                      <div class="pt-2 border-t border-[#E8DFD1]/50 flex justify-between items-center text-xs font-bold">
                      <a href="#/shop/${s.slug}" class="text-[#1F5E4B] hover:underline">Visit Shop →</a>
                      <a href="#/passport/${s.slug}" class="text-[#C8553D] hover:underline">Passport</a>
                      </div>
                      </div>
                      `).join('')}
                      </div>
                      </div>
                      </div>
                      `;
                    },

                discover(query = '', district = 'all', category = 'all') {
                  const sellers = getSellers().filter(s => {
                    const d = district === 'all' || s.district.toLowerCase().includes(district.toLowerCase());
                    const c = category === 'all' || s.category.toLowerCase().includes(category.toLowerCase());
                    const q = !query || [s.shop_name, s.name, s.district, s.bio].join(' ').toLowerCase().includes(query.toLowerCase());
                    return d && c && q;
                  });

                  return `
                  <div class="space-y-6 text-left">
                  <div class="bg-white p-6 sm:p-8 rounded-[30px] border border-[#E8DFD1] shadow-soft space-y-4">
                  <div><span class="text-xs font-bold text-[#1F5E4B] uppercase">Karnataka Micro-Commerce</span><h1 class="text-2xl sm:text-3xl font-bold font-serif-heading">Discover Home Stores & Services</h1></div>
                  <input type="text" id="disc-q" value="${query}" placeholder="Search shops, items (Holige, Masala, Coffee), districts..." oninput="App.onDiscoverFilter()" class="w-full text-xs sm:text-sm font-bold bg-[#FFF8EC] border border-[#E8DFD1] rounded-[20px] px-4 py-3 focus:outline-none" />
                  <div class="space-y-1"><span class="text-xs font-bold text-[#6B7280]">District:</span><div class="flex gap-2 overflow-x-auto pb-1">${['all', ...DISTRICTS].map(d => `<button onclick="App.onDiscoverFilter('${d}', null)" class="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap border ${district === d ? 'bg-[#1F5E4B] text-white border-[#1F5E4B]' : 'bg-[#FFF8EC] text-[#2B2B2B] border-[#E8DFD1]'}">${d === 'all' ? 'All Karnataka' : d}</button>`).join('')}</div></div>
                  <div class="space-y-1"><span class="text-xs font-bold text-[#6B7280]">Category:</span><div class="flex gap-2 overflow-x-auto pb-1">${['all', ...CATEGORIES].map(c => `<button onclick="App.onDiscoverFilter(null, '${c}')" class="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap border ${category === c ? 'bg-[#E8A317] text-white border-[#C7890C]' : 'bg-[#FFF8EC] text-[#2B2B2B] border-[#E8DFD1]'}">${c === 'all' ? 'All Categories' : c}</button>`).join('')}</div></div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  ${sellers.length === 0 ? `<div class="col-span-full bg-white p-12 rounded-[30px] border border-[#E8DFD1] text-center font-bold text-sm">No shops found matching filters.</div>` : sellers.map(s => `
                    <div class="bg-white rounded-[30px] border border-[#E8DFD1] p-5 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                    <div class="flex justify-between"><span class="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFF8EC] text-[#1F5E4B]">📍 ${s.district}</span><span class="text-xs font-bold text-amber-600">★ ${s.rating}</span></div>
                    <h3 class="font-bold text-base mt-2 font-serif-heading">${s.shop_name}</h3>
                    <p class="text-xs text-[#6B7280] line-clamp-2 mt-1">${s.bio}</p>
                    <div class="text-[11px] text-[#6B7280] mt-1">Founder: <strong class="text-[#2B2B2B]">${s.name}</strong></div>
                    </div>
                    <div class="pt-3 border-t border-[#E8DFD1] flex justify-between items-center text-xs font-bold"><a href="#/shop/${s.slug}" class="py-2 px-4 rounded-xl bg-[#1F5E4B] text-white">Visit Shop →</a><a href="#/passport/${s.slug}" class="text-[#C8553D]">Passport</a></div>
                    </div>
                    `).join('')}
                    </div>
                    </div>
                    `;
                  },
                  
                  sell() {
                    const s = App.sellState;
                    return `
                    <div class="max-w-5xl mx-auto space-y-6 text-left">
                    <div class="text-center space-y-1"><span class="px-3 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#C7890C] border border-[#E8A317]/40">🎙️ Voice Studio</span><h1 class="text-3xl font-bold font-serif-heading">Create Storefront with Voice</h1></div>
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div class="lg:col-span-5 bg-white p-6 rounded-[30px] border border-[#E8DFD1] shadow-soft text-center space-y-4">
                    <div class="flex gap-1 bg-[#FFF8EC] p-1 rounded-xl border border-[#E8DFD1] text-xs font-bold justify-center">${[['kn-IN', 'ಕನ್ನಡ'], ['en-IN', 'English'], ['hi-IN', 'हिन्दी']].map(([c, l]) => `<button onclick="App.setVoiceLang('${c}')" class="px-3 py-1 rounded-lg ${s.lang === c ? 'bg-[#1F5E4B] text-white' : ''}">${l}</button>`).join('')}</div>
                    <div class="relative py-2 flex items-center justify-center">
                    ${s.recording ? '<div class="absolute w-36 h-36 rounded-full bg-[#E8A317]/30 animate-pulse-ring"></div>' : ''}
                    <button onclick="App.toggleRecording()" class="relative z-10 w-24 h-24 rounded-full text-white shadow-glow flex items-center justify-center text-3xl transition ${s.recording ? 'bg-red-600 scale-105' : 'bg-gradient-to-tr from-[#E8A317] to-[#C8553D]'}">🎙️</button>
                    </div>
                    <div class="text-xs font-bold text-[#6B7280]">${s.recording ? 'Listening... Speak now (Tap again to finish)' : 'Tap to Speak (Voice Studio)'}</div>
                    <textarea id="voice-txt" rows="3" placeholder="Speak or type items & prices..." oninput="App.sellState.transcript = this.value" class="w-full text-xs bg-[#FFF8EC] border border-[#E8DFD1] rounded-xl p-3 focus:outline-none">${s.transcript}</textarea>
                    <div class="flex gap-2"><button onclick="App.parseTranscript()" class="flex-1 py-2 bg-[#1F5E4B] text-white text-xs font-bold rounded-xl shadow-xs">Parse Items</button><button onclick="App.useTestPrompt()" class="py-2 px-3 bg-[#FFF8EC] text-[#1F5E4B] text-xs font-bold rounded-xl border border-[#E8DFD1]">✨ Test Prompt</button></div>
                    </div>
                    <div class="lg:col-span-7 space-y-6">
                    <div class="bg-white p-6 rounded-[30px] border border-[#E8DFD1] shadow-soft space-y-3">
                    <div class="flex justify-between items-center pb-2 border-b border-[#E8DFD1]"><h3 class="font-bold text-sm">Extracted Products (${s.items.length})</h3><button onclick="App.showAddItemModal()" class="px-3 py-1 bg-[#1F5E4B] text-white text-xs font-bold rounded-xl">+ Add Item</button></div>
                    <div class="space-y-2">
                    ${s.items.length === 0 ? `<div class="p-6 bg-[#FFF8EC]/50 rounded-2xl text-center text-xs text-[#6B7280]">Speak using mic or click "+ Add Item"</div>` : s.items.map((it, idx) => `
                      <div class="bg-[#FFF8EC]/70 p-3 rounded-2xl border border-[#E8DFD1] flex items-center justify-between text-xs">
                      <div class="w-10 h-10 rounded-xl bg-white p-1 border mr-2">${getArtwork(it.title)}</div>
                      <div class="flex-1 truncate"><strong>${it.title}</strong><div class="text-[#1F5E4B] font-bold">₹${it.price}</div></div>
                      <button onclick="App.sellState.items.splice(${idx},1); App.render();" class="text-red-500 font-bold px-2">✕</button>
                      </div>
                      `).join('')}
                      </div>
                      </div>
                      <div class="bg-white p-6 rounded-[30px] border border-[#E8DFD1] shadow-soft space-y-3 text-xs font-bold">
                      <h3 class="text-sm border-b pb-2">Store Profile</h3>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label class="block mb-1">Owner Name *</label><input type="text" value="${s.name}" oninput="App.sellState.name = this.value" placeholder="e.g. Renuka Patil" class="w-full bg-[#FFF8EC] border rounded-xl p-2" /></div>
                      <div><label class="block mb-1">Phone (10 Digits) *</label><input type="tel" maxlength="10" value="${s.phone}" oninput="App.sellState.phone = this.value" placeholder="9845012345" class="w-full bg-[#FFF8EC] border rounded-xl p-2" /></div>
                      <div><label class="block mb-1">District *</label><select onchange="App.sellState.district = this.value" class="w-full bg-[#FFF8EC] border rounded-xl p-2">${DISTRICTS.map(d => `<option value="${d}" ${s.district === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
                      <div><label class="block mb-1">UPI ID *</label><input type="text" value="${s.upi}" oninput="App.sellState.upi = this.value" placeholder="yourname@upi" class="w-full bg-[#FFF8EC] border rounded-xl p-2 font-mono text-[#1F5E4B]" /></div>
                      </div>
                      <button onclick="App.publishStore()" class="w-full py-3.5 bg-gradient-to-r from-[#1F5E4B] to-[#154134] text-white rounded-2xl text-xs font-bold shadow-card">Publish Storefront & Go Live</button>
                      </div>
                      </div>
                      </div>
                      </div>
                      `;
                    },
                    
                    shop(slug) {
                      const sellers = getSellers();
                      const s = sellers.find(x => x.slug === slug || x.id === slug) || sellers[0] || DEFAULT_SELLERS[0];
                      const listings = s.listings || s.items || [];
                      const cartCount = Object.values(App.cart).reduce((a, b) => a + b, 0);
                      const cartTotal = Object.entries(App.cart).reduce((sum, [id, qty]) => { const it = listings.find(l => l.id === id); return sum + (it ? it.price * qty : 0); }, 0);
                      return `
                      <div class="max-w-4xl mx-auto space-y-6 pb-20 text-left">
                      <div class="rounded-[30px] text-white p-6 sm:p-8 shadow-card" style="background: linear-gradient(135deg, ${s.theme?.color || '#1F5E4B'}, #154134)">
                      <div class="flex justify-between items-center"><span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20">📍 ${s.district}</span><span class="text-xs bg-emerald-900/40 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-bold">Direct UPI Verified ✓</span></div>
                      <h1 class="text-2xl sm:text-4xl font-bold font-serif-heading mt-2">${s.shop_name}</h1>
                      <p class="text-xs sm:text-sm opacity-90 mt-1">${s.bio}</p>
                      <div class="pt-3 border-t border-white/20 flex gap-4 text-xs font-semibold mt-3"><span>Founder: <strong>${s.name}</strong></span><span>•</span><a href="#/passport/${s.slug}" class="underline text-[#E8A317]">View Business Passport →</a></div>
                      </div>
                      <div class="space-y-4">
                      <h3 class="font-bold text-lg">Products & Specialties</h3>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      ${listings.map(it => {
                        const qty = App.cart[it.id] || 0;
                        return `
                        <div class="bg-white rounded-[20px] border border-[#E8DFD1] p-4 shadow-xs flex items-start gap-3">
                        <div class="w-14 h-14 rounded-2xl bg-[#FFF8EC] p-1 border flex-shrink-0">${getArtwork(it.title)}</div>
                        <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-sm truncate">${it.title}</h4>
                        <div class="pt-2 flex justify-between items-center">
                        <span class="text-base font-bold text-[#1F5E4B]">₹${it.price} <span class="text-[10px] text-[#6B7280] font-normal">/${it.unit || 'pack'}</span></span>
                        ${it.available !== false ? `<div class="flex items-center gap-2 bg-[#FFF8EC] rounded-xl p-1 border text-xs font-bold"><button onclick="App.updateCart('${it.id}', -1)" class="w-6 h-6 rounded-lg bg-white shadow-xs">-</button><span class="px-1">${qty}</span><button onclick="App.updateCart('${it.id}', 1)" class="w-6 h-6 rounded-lg bg-[#1F5E4B] text-white shadow-xs">+</button></div>` : '<span class="text-xs text-[#6B7280]">Out of Stock</span>'}
                        </div>
                        </div>
                        </div>
                        `;
                      }).join('')}
                      </div>
                      </div>
                      ${cartCount > 0 ? `<div class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DFD1] p-4 shadow-2xl animate-pop-in"><div class="max-w-4xl mx-auto flex justify-between items-center"><div><span class="text-xs text-[#6B7280]">${cartCount} item(s)</span><div class="text-xl font-bold text-[#1F5E4B]">₹${cartTotal}</div></div><button onclick="App.openCheckout('${s.slug}')" class="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#1F5E4B] to-[#154134] text-white font-bold text-xs shadow-card">Checkout & Pay →</button></div></div>` : ''}
                      </div>
                      `;
                    },
                  
                    dashboard(activeId) {
                      const sellers = getSellers(), active = sellers.find(s => activeId && (s.id === activeId || s.slug === activeId)) || sellers[0] || DEFAULT_SELLERS[0];
                      const listings = active.listings || active.items || [];
                      const orders = getOrders().filter(o => o.seller_slug === active.slug || !o.seller_slug);
                      const earnings = orders.filter(o => ['paid', 'ready', 'delivered'].includes(o.status)).reduce((s, o) => s + Number(o.amount), 0);

                      return `
                      <div class="space-y-6 text-left">
                      <div class="bg-white p-6 rounded-[30px] border border-[#E8DFD1] shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                      <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span class="text-xs font-bold text-[#1F5E4B] uppercase">Seller Dashboard</span></div>
                      <h1 class="text-2xl font-bold font-serif-heading mt-1">${active.shop_name}</h1>
                      <p class="text-xs text-[#6B7280]">Owner: <strong>${active.name}</strong> • 📍 ${active.district} • UPI: <span class="font-mono text-[#1F5E4B] font-bold">${active.upi_id}</span></p>
                      </div>
                      <div class="flex items-center gap-2">
                      <select onchange="App.navigate('/dashboard', this.value)" class="text-xs font-bold bg-[#FFF8EC] border rounded-xl p-2">${sellers.map(s => `<option value="${s.id}" ${s.id === active.id ? 'selected' : ''}>${s.shop_name}</option>`).join('')}</select>
                      <a href="#/shop/${active.slug}" class="px-3 py-2 bg-[#FFF8EC] border rounded-xl text-xs font-bold text-[#1F5E4B]">Store ↗</a>
                      <a href="#/passport/${active.slug}" class="px-3 py-2 bg-[#C8553D] text-white rounded-xl text-xs font-bold">Passport</a>
                      </div>
                      </div>
                      
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                      <div class="bg-white p-4 rounded-2xl border shadow-xs"><span class="text-xs text-[#6B7280] font-bold">Today Revenue</span><div class="text-2xl font-bold text-[#1F5E4B] mt-1">₹${earnings}</div></div>
                      <div class="bg-white p-4 rounded-2xl border shadow-xs"><span class="text-xs text-[#6B7280] font-bold">Total Orders</span><div class="text-2xl font-bold mt-1">${orders.length}</div></div>
                      <div class="bg-white p-4 rounded-2xl border shadow-xs"><span class="text-xs text-[#6B7280] font-bold">Catalogue Items</span><div class="text-2xl font-bold text-amber-600 mt-1">${listings.length}</div></div>
                      <div class="bg-white p-4 rounded-2xl border shadow-xs"><span class="text-xs text-[#6B7280] font-bold">Passport Score</span><div class="text-2xl font-bold text-[#C8553D] mt-1">94/100</div></div>
                      </div>
                      
                      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div class="lg:col-span-7 space-y-3">
                      <h3 class="font-bold text-base">Live Order Stream</h3>
                      ${orders.map(o => `
                        <div class="bg-white p-4 rounded-2xl border shadow-xs space-y-2">
                        <div class="flex justify-between font-bold text-xs"><span>${o.buyer_name} (${o.buyer_phone})</span><span class="text-[#1F5E4B] text-sm">₹${o.amount}</span></div>
                        <div class="text-xs text-[#6B7280]">${(o.items || []).map(i => `${i.qty}x ${i.title}`).join(', ')}</div>
                        <div class="flex justify-between items-center pt-2 border-t text-xs">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : o.status === 'ready' ? 'bg-indigo-100 text-indigo-800' : 'bg-sky-100 text-sky-800'}">${o.status}</span>
                        <div class="flex gap-1.5">
                        ${o.status === 'new' ? `<button onclick="App.updateStatus('${o.id}', 'paid')" class="px-2 py-1 bg-sky-600 text-white rounded-lg font-bold text-[11px]">Mark Paid</button>` : ''}
                        ${o.status === 'paid' ? `<button onclick="App.updateStatus('${o.id}', 'ready')" class="px-2 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px]">Mark Ready</button>` : ''}
                        ${o.status === 'ready' ? `<button onclick="App.updateStatus('${o.id}', 'delivered')" class="px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]">Mark Delivered</button>` : ''}
                        ${o.status === 'delivered' ? `<span class="text-emerald-700 font-bold">Delivered ✓</span>` : ''}
                        </div>
                        </div>
                        </div>
                        `).join('')}
                        </div>
                        <div class="lg:col-span-5 space-y-3">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-base">Product Catalogue</h3><button onclick="App.showAddCatModal('${active.id}')" class="px-3 py-1 bg-[#1F5E4B] text-white rounded-xl text-xs font-bold">+ Add</button></div>
                        <div class="space-y-2">
                        ${listings.map(it => `
                          <div class="bg-white p-3 rounded-2xl border shadow-xs flex justify-between items-center text-xs">
                          <div><strong>${it.title}</strong><div class="text-[#1F5E4B] font-bold">₹${it.price}</div></div>
                          <div class="flex items-center gap-1.5">
                          <button onclick="App.toggleStock('${active.id}', '${it.id}')" class="px-2 py-1 rounded-lg border font-bold text-[10px] ${it.available !== false ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-500'}">${it.available !== false ? 'In Stock' : 'Out of Stock'}</button>
                          <button onclick="App.deleteItem('${active.id}', '${it.id}')" class="text-red-500 font-bold p-1">✕</button>
                          </div>
                          </div>
                          `).join('')}
                          </div>
                          </div>
                          </div>
                          </div>
                          `;
                        },
                    
                      passport(slug) {
                        const sellers = getSellers(), s = sellers.find(x => x.slug === slug || x.id === slug) || sellers[0] || DEFAULT_SELLERS[0];
                        setTimeout(() => {
                          const c = document.getElementById('pass-chart');
                          if (c && window.Chart) new window.Chart(c, { type: 'bar', data: { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'], datasets: [{ data: [1200, 1800, 1500, 2200, 2100, 2600, 3100, 2800, 3500, 3900, 4200, 4800], backgroundColor: '#1F5E4B', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
                        }, 50);

                        return `
                        <div class="max-w-4xl mx-auto space-y-6 text-left">
                        <div id="print-certificate-area" class="bg-white p-6 sm:p-10 rounded-[30px] border-2 border-[#E8DFD1] shadow-card space-y-6">
                        <div class="flex justify-between items-start border-b pb-4">
                        <div><span class="text-xs font-bold text-[#1F5E4B] uppercase">Official Record</span><h1 class="text-2xl sm:text-3xl font-bold font-serif-heading">${s.shop_name}</h1><p class="text-xs text-[#6B7280]">Proprietor: <strong>${s.name}</strong> • 📍 ${s.district}, Karnataka</p></div>
                        <div class="text-center bg-[#FFF8EC] p-3 rounded-2xl border"><div class="text-2xl font-bold text-[#C8553D]">94<span class="text-xs">/100</span></div><span class="text-[10px] font-bold text-emerald-700">Lender Verified</span></div>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div class="p-3 bg-[#FFF8EC] rounded-2xl border"><span class="text-[#6B7280]">Active History</span><div class="text-xl font-bold mt-1">3 Months</div></div>
                        <div class="p-3 bg-[#FFF8EC] rounded-2xl border"><span class="text-[#6B7280]">Total Gross Sales</span><div class="text-xl font-bold text-[#1F5E4B] mt-1">₹33,700</div></div>
                        <div class="p-3 bg-[#FFF8EC] rounded-2xl border"><span class="text-[#6B7280]">Avg Monthly</span><div class="text-xl font-bold mt-1">₹11,230</div></div>
                        <div class="p-3 bg-[#FFF8EC] rounded-2xl border"><span class="text-[#6B7280]">Repeat Rate</span><div class="text-xl font-bold text-[#C8553D] mt-1">68%</div></div>
                        </div>
                        <div class="space-y-2"><h3 class="text-xs font-bold uppercase tracking-wider text-[#6B7280]">12-Week Order Volume Trend</h3><div class="h-60 bg-white border rounded-2xl p-2"><canvas id="pass-chart"></canvas></div></div>
                        <div class="bg-[#FFF8EC] p-4 rounded-2xl border text-xs"><strong class="block mb-1">Consistency Trust Index Formula:</strong><p class="text-[#6B7280] font-mono">Score = 40% (Active Weeks) + 25% (Volume) + 20% (Repeat Rate) + 15% (Growth)</p></div>
                        </div>
                        <div class="no-print text-right"><button onclick="window.print()" class="px-6 py-3 bg-[#1F5E4B] text-white rounded-xl font-bold text-xs shadow-card">Download Verified Certificate (PDF) ↓</button></div>
                        </div>
                        `;
                      },
                      
                      demo() {
                        const s = getSellers()[0] || DEFAULT_SELLERS[0], listings = s.listings || s.items || [], orders = getOrders().slice(0, 6);
                        return `
                        <div class="space-y-6 text-left">
                        <div class="bg-gradient-to-r from-[#1F5E4B] to-[#154134] text-white p-6 rounded-[30px] shadow-card flex justify-between items-center">
                        <div><span class="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8A317] text-[#2B2B2B]">⚡ Realtime Sync</span><h1 class="text-2xl font-bold font-serif-heading mt-1">Live Dual-Phone Sync Demo</h1></div>
                        <button onclick="App.sendDemoOrder('l-1', 'Shenga Holige (10 pcs)', 220)" class="px-4 py-2.5 bg-[#E8A317] text-[#2B2B2B] rounded-xl font-bold text-xs shadow-glow">⚡ Send 1-Tap Order</button>
                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-slate-900 p-5 rounded-[32px] border-4 border-slate-700 space-y-3">
                        <div class="flex justify-between text-xs text-white/80"><span class="font-bold text-[#E8A317]">📱 Seller Phone (${s.name})</span><span class="text-emerald-400">● Live</span></div>
                        <div id="demo-stream" class="bg-[#FFF8EC] rounded-2xl p-3 space-y-2 max-h-[450px] overflow-y-auto">
                        ${orders.map(o => `
                          <div class="bg-white p-3 rounded-xl border text-xs space-y-1 animate-pop-in">
                          <div class="flex justify-between font-bold"><span>${o.buyer_name}</span><span class="text-[#1F5E4B]">₹${o.amount}</span></div>
                          <div class="text-[11px] text-[#6B7280]">${(o.items || []).map(i => `${i.qty}x ${i.title}`).join(', ')}</div>
                          </div>
                          `).join('')}
                          </div>
                          </div>
                          <div class="bg-slate-900 p-5 rounded-[32px] border-4 border-slate-700 space-y-3">
                          <div class="flex justify-between text-xs text-white/80"><span class="font-bold text-emerald-400">📱 Buyer Phone</span><span>1-Tap Ordering</span></div>
                          <div class="bg-white rounded-2xl p-3 space-y-2 max-h-[450px] overflow-y-auto">
                          <div class="bg-gradient-to-r from-[#E8A317] to-[#C8553D] p-3 rounded-xl text-white font-bold text-xs">${s.shop_name}</div>
                          ${listings.map(it => `
                            <div class="bg-[#FFF8EC] p-2.5 rounded-xl border flex justify-between items-center text-xs">
                            <div><strong>${it.title}</strong><div class="text-[#1F5E4B] font-bold">₹${it.price}</div></div>
                            <button onclick="App.sendDemoOrder('${it.id}', '${it.title}', ${it.price})" class="px-3 py-1.5 bg-[#1F5E4B] text-white rounded-lg font-bold">1-Tap Order</button>
                            </div>
                            `).join('')}
                            </div>
                            </div>
                            </div>
                            </div>
                            `;
                          },
                      onDiscoverFilter(d, c) {
                        const q = document.getElementById('disc-q')?.value || '';
                        App.curDist = d !== null && d !== undefined ? d : (App.curDist || 'all');
                        App.curCat = c !== null && c !== undefined ? c : (App.curCat || 'all');
                        const el = document.getElementById('app'); if (el) el.innerHTML = App.discover(q, App.curDist, App.curCat);
                      },

                      setVoiceLang(l) { App.sellState.lang = l; App.render(); },
                      toggleRecording() {
                        playAudio('mic');
                        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (!SR) return showToast('Microphone Unavailable', 'Type text in box instead', 'error');
                        if (!App.rec) {
                          App.rec = new SR(); App.rec.continuous = true; App.rec.interimResults = true;
                          App.rec.onresult = e => { App.sellState.transcript = Array.from(e.results).map(r => r[0].transcript).join(''); const el = document.getElementById('voice-txt'); if (el) el.value = App.sellState.transcript; };
                        }
                        if (!App.sellState.recording) {
                          App.rec.lang = App.sellState.lang;
                          try { App.rec.start(); App.sellState.recording = true; } catch (e) { }
                        } else {
                          try { App.rec.stop(); App.sellState.recording = false; } catch (e) { }
                          App.parseTranscript();
                        }
                        App.render();
                      },
                      parseTranscript() {
                        const res = parseVoice(App.sellState.transcript, App.sellState.name, App.sellState.district);
                        App.sellState.items = res.items;
                        playAudio('success'); showToast('Items Extracted', `${res.items.length} items parsed`, 'success');
                        App.render();
                      },
                      useTestPrompt() {
                        App.sellState.transcript = 'Bengaluru Fresh Ragi Brownies 320 rupees box and Filter Coffee Powder 220 rupees pack';
                        App.parseTranscript();
                      },
                      showAddItemModal() {
                        openModal(`
                          <h3 class="font-bold text-base">Add Product</h3>
                          <input id="new-t" type="text" placeholder="Title" class="w-full text-xs font-bold bg-[#FFF8EC] border rounded-xl p-2.5" />
                          <input id="new-p" type="number" placeholder="Price (₹)" class="w-full text-xs font-bold bg-[#FFF8EC] border rounded-xl p-2.5" />
                          <div class="flex justify-end gap-2 pt-2"><button onclick="closeModal()" class="px-3 py-1 text-xs">Cancel</button><button onclick="App.addItemDirect()" class="px-4 py-2 bg-[#1F5E4B] text-white rounded-xl text-xs font-bold">Add</button></div>
                          `);
                        },
                        addItemDirect() {
                          const t = document.getElementById('new-t')?.value, p = parseFloat(document.getElementById('new-p')?.value) || 200;
                          if (t) App.sellState.items.push({ id: `i-${Date.now()}`, title: t, price: p, unit: 'pack' });
                          closeModal(); App.render();
                        },
                        publishStore() {
                          const s = App.sellState;
                          if (!s.phone || s.phone.length < 10) return showToast('Phone Required', 'Enter 10-digit number', 'error');
                          if (!s.items.length) return showToast('Empty Store', 'Add at least 1 product', 'error');
                          const slug = (s.name || `shop-${s.phone.slice(-4)}`).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          const newSel = { id: `s-${Date.now()}`, slug, name: s.name || 'Seller', shop_name: s.name ? `${s.name}'s Store` : 'Dhwani Store', phone: s.phone, district: s.district, ward: s.ward, category: 'Sweets & Snacks', upi_id: s.upi || `${s.phone}@upi`, bio: `Fresh goods from ${s.district}.`, rating: 5.0, listings: s.items.map((it, i) => ({ id: `l-${Date.now()}-${i}`, title: it.title, price: it.price, unit: 'pack', available: true })) };
                          saveSellers([newSel, ...getSellers()]);
                          playAudio('success'); if (window.confetti) window.confetti({ particleCount: 100, spread: 70 });
                          openModal(`
                            <div class="text-center space-y-3">
                            <h3 class="text-xl font-bold font-serif-heading">🎉 Store is Live!</h3>
                            <div id="pub-qr" class="p-2 bg-[#FFF8EC] border rounded-2xl flex justify-center"></div>
                            <a href="https://wa.me/?text=${encodeURIComponent(`Namaskara! My store is live on Dhwani: ${window.location.origin}/#/shop/${slug}`)}" target="_blank" class="block w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">Share on WhatsApp</a>
                            <button onclick="closeModal(); App.navigate('/shop', '${slug}')" class="w-full py-2.5 bg-[#1F5E4B] text-white font-bold text-xs rounded-xl">Visit Store →</button>
                            </div>
                            `);
                            setTimeout(() => { if (window.QRCode) new window.QRCode(document.getElementById('pub-qr'), { text: `${window.location.origin}/#/shop/${slug}`, width: 120, height: 120, colorDark: '#1F5E4B' }); }, 50);
                          },
                        updateCart(id, delta) {
                          App.cart[id] = Math.max(0, (App.cart[id] || 0) + delta);
                          if (!App.cart[id]) delete App.cart[id];
                          playAudio('mic'); App.render();
                        },
                        openCheckout(slug) {
                          const sellers = getSellers(), s = sellers.find(x => x.slug === slug || x.id === slug) || sellers[0] || DEFAULT_SELLERS[0];
                          const listings = s.listings || s.items || [];
                          const total = Object.entries(App.cart).reduce((sum, [id, qty]) => { const it = listings.find(l => l.id === id); return sum + (it ? it.price * qty : 0); }, 0);
                          openModal(`
                            <h3 class="font-bold text-base pb-2 border-b">Checkout Cart</h3>
                            <div class="space-y-2 text-xs bg-[#FFF8EC] p-3 rounded-xl">
                            ${Object.entries(App.cart).map(([id, qty]) => { const it = listings.find(l => l.id === id); return `<div class="flex justify-between"><span>${qty}x ${it?.title}</span><span class="font-bold">₹${it ? it.price * qty : 0}</span></div>`; }).join('')}
                            <div class="pt-2 border-t font-bold flex justify-between"><span>Total:</span><span class="text-[#1F5E4B]">₹${total}</span></div>
                            </div>
                            <input id="chk-name" type="text" placeholder="Your Name" class="w-full text-xs font-bold bg-[#FFF8EC] border rounded-xl p-2.5" />
                            <input id="chk-phone" type="tel" maxlength="10" placeholder="Mobile Number (10 Digits)" class="w-full text-xs font-bold bg-[#FFF8EC] border rounded-xl p-2.5" />
                            <div id="chk-qr" class="p-2 bg-[#FFF8EC] border rounded-2xl flex justify-center"></div>
                            <button onclick="App.confirmOrder('${s.slug}', ${total})" class="w-full py-3 bg-[#1F5E4B] text-white rounded-2xl font-bold text-xs shadow-card">I have completed payment ✓</button>
                            `);
                            setTimeout(() => { if (window.QRCode) new window.QRCode(document.getElementById('chk-qr'), { text: `upi://pay?pa=${encodeURIComponent(s.upi_id)}&pn=${encodeURIComponent(s.shop_name)}&am=${total}&cu=INR`, width: 110, height: 110, colorDark: '#1F5E4B' }); }, 50);
                          },
                          confirmOrder(slug, amount) {
                            const name = document.getElementById('chk-name')?.value || 'Customer', phone = document.getElementById('chk-phone')?.value || '9845012345';
                            const sellers = getSellers(), s = sellers.find(x => x.slug === slug || x.id === slug) || sellers[0] || DEFAULT_SELLERS[0];
                            const listings = s.listings || s.items || [];
                            const items = Object.entries(App.cart).map(([id, qty]) => { const it = listings.find(l => l.id === id); return { title: it?.title, price: it?.price, qty }; });
                            const ord = { id: 'DHW-' + Math.floor(1000 + Math.random() * 9000), seller_slug: s.slug, buyer_name: name, buyer_phone: phone, items, amount, status: 'paid', created_at: new Date().toISOString() };
                            saveOrders([ord, ...getOrders()]);
                            App.cart = {};
                            if (realtime) realtime.postMessage({ type: 'ORDER', order: ord });
                            playAudio('order'); if (window.confetti) window.confetti({ particleCount: 90, spread: 60 });
                            openModal(`
                              <div class="text-center space-y-3">
                              <h3 class="text-xl font-bold font-serif-heading">Order Placed!</h3>
                              <div class="p-3 bg-[#FFF8EC] rounded-2xl border text-xs text-left">
                              <div class="flex justify-between font-bold"><span>Order #${ord.id}</span><span class="text-[#1F5E4B]">₹${amount}</span></div>
                              <div class="py-2"><div class="text-[10px] font-bold text-emerald-700">Status: 1. Paid ✓</div><div class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1"><div class="bg-emerald-600 h-full w-1/3"></div></div></div>
                              </div>
                              <a href="https://wa.me/91${s.phone}?text=${encodeURIComponent(`Namaskara ${s.name}! Order #${ord.id} placed for ₹${amount}.`)}" target="_blank" class="block w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">WhatsApp Seller</a>
                              <button onclick="closeModal(); App.navigate('/dashboard')" class="w-full py-2.5 bg-[#1F5E4B] text-white font-bold text-xs rounded-xl">Dashboard →</button>
                              </div>
                              `);
                            },
                          updateStatus(id, st) {
                            saveOrders(getOrders().map(o => o.id === id ? { ...o, status: st } : o));
                            playAudio('success'); showToast('Status Updated', st.toUpperCase(), 'success'); App.render();
                          },
                          toggleStock(sId, itId) {
                            saveSellers(getSellers().map(s => s.id === sId ? { ...s, listings: (s.listings || []).map(l => l.id === itId ? { ...l, available: !l.available } : l) } : s));
                            App.render();
                          },
                          deleteItem(sId, itId) {
                            if (confirm('Delete this product?')) {
                              saveSellers(getSellers().map(s => s.id === sId ? { ...s, listings: (s.listings || []).filter(l => l.id !== itId) } : s));
                              App.render();
                            }
                          },
                          showAddCatModal(sId) {
                            openModal(`
                              <h3 class="font-bold text-base">Add Catalogue Product</h3>
                              <input id="cat-t" type="text" placeholder="Title" class="w-full text-xs font-bold bg-[#FFF8EC] border rounded-xl p-2.5" />
                              <input id="cat-p" type="number" placeholder="Price (₹)" class="w-full text-xs font-bold bg-[#FFF8EC] border rounded-xl p-2.5" />
                              <div class="flex justify-end gap-2 pt-2"><button onclick="closeModal()" class="px-3 py-1 text-xs">Cancel</button><button onclick="App.addCatItem('${sId}')" class="px-4 py-2 bg-[#1F5E4B] text-white rounded-xl text-xs font-bold">Add</button></div>
                              `);
                            },
                            addCatItem(sId) {
                              const t = document.getElementById('cat-t')?.value, p = parseFloat(document.getElementById('cat-p')?.value) || 200;
                              if (t) saveSellers(getSellers().map(s => s.id === sId ? { ...s, listings: [...(s.listings || []), { id: `l-${Date.now()}`, title: t, price: p, unit: 'pack', available: true }] } : s));
                              closeModal(); App.render();
                            },
                sendDemoOrder(listingId, title, price) {
                  const s = getSellers()[0] || DEFAULT_SELLERS[0];
                  const ord = { id: 'DHW-' + Math.floor(1000 + Math.random() * 9000), seller_slug: s.slug, buyer_name: 'Praveen Joshi (Live Demo)', buyer_phone: '9845110001', items: [{ title, price, qty: 1 }], amount: price, status: 'paid', created_at: new Date().toISOString() };
                  saveOrders([ord, ...getOrders()]);
                  playAudio('order'); if (window.confetti) window.confetti({ particleCount: 70, spread: 50 });
                  showToast('Order Received!', `₹${price} for ${title}`, 'order'); App.render();
                },

                navigate(path, arg) { window.location.hash = '#' + path + (arg ? '/' + arg : ''); },

                render() {
                  const appEl = document.getElementById('app'); if (!appEl) return;
                  const hash = window.location.hash || '#/';
                  let html = '';
                  if (hash.startsWith('#/shop/')) html = App.shop(hash.replace('#/shop/', ''));
                  else if (hash.startsWith('#/passport/')) html = App.passport(hash.replace('#/passport/', ''));
                  else if (hash.startsWith('#/dashboard')) html = App.dashboard(hash.replace('#/dashboard/', '').replace('#/dashboard', ''));
                  else if (hash === '#/discover') html = App.discover();
                  else if (hash === '#/sell') html = App.sell();
                  else if (hash === '#/demo') html = App.demo();
                  else html = App.home();

                  appEl.innerHTML = html;
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }
              };

              window.addEventListener('hashchange', () => App.render());
              window.addEventListener('load', () => App.render());
              if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => App.render()); } else { App.render(); }

              if (realtime) {
                realtime.onmessage = e => {
                  if (e.data?.type === 'ORDER') {
                    playAudio('order');
                    showToast('New Order Received!', `₹${e.data.order.amount} from ${e.data.order.buyer_name}`, 'order');
                    App.render();
                  }
                };
              }

              function changeLang(code) {
                const lbls = { kn: 'ಕನ್ನಡ', en: 'English', hi: 'हिन्दी', te: 'తెలుగు', ta: 'தமிழ்', mr: 'ಮರಾಠಿ' };
                const curr = document.getElementById('curr-lang'); if (curr) curr.innerText = lbls[code] || 'English';
                document.getElementById('lang-menu')?.classList.add('hidden');
                try {
                  document.cookie = `googtrans=/en/${code}; path=/;`;
                  const sel = document.querySelector('.goog-te-combo');
                  if (sel) { sel.value = code; sel.dispatchEvent(new Event('change', { bubbles: true })); }
                } catch (e) { }
              }

document.getElementById('lang-btn')?.addEventListener('click', e => { e.stopPropagation(); document.getElementById('lang-menu')?.classList.toggle('hidden'); });
document.addEventListener('click', () => document.getElementById('lang-menu')?.classList.add('hidden'));

App.render();