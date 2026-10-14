/*
 * CODEPOS MX · MENÚ DIGITAL TIPO HACIENDA
 * Para activar datos en la nube, configura supabaseUrl y supabaseAnonKey.
 * La clave anon es pública por diseño; la seguridad depende de RLS en Supabase.
 */
window.CODEPOS_CONFIG = window.CODEPOS_CONFIG || {
  supabaseUrl: "",
  supabaseAnonKey: ""
};

const DEMO_MENU = {
  settings: {
    business_name: "La Hacienda del Sabor",
    tagline: "SABORES QUE INVITAN A QUEDARSE",
    description: "Recetas para compartir, ingredientes frescos y el gusto de comer sin prisa.",
    updated_label: "MENÚ DE DEMOSTRACIÓN",
    visit_title: "El buen sabor se comparte.",
    visit_note: "Pregunta a nuestro equipo por los especiales del día.",
    disclaimer: "Menú y precios de demostración. Sustituye estos datos por la información real antes de publicar."
  },
  categories: [
    { id: "desayunos", name: "Desayunos", note: "PARA EMPEZAR EL DÍA", sort_order: 1, items: [
      { name: "Chilaquiles de la casa", description: "Totopos bañados en salsa verde o roja, crema, queso y cebolla.", price: 135, tag: "Favorito", image_url: "", sort_order: 1 },
      { name: "Huevos al gusto", description: "Preparados al gusto, acompañados de frijoles y tortillas.", price: 115, tag: "", image_url: "", sort_order: 2 },
      { name: "Hot cakes tradicionales", description: "Esponjosos hot cakes con mantequilla y miel.", price: 98, tag: "", image_url: "", sort_order: 3 }
    ]},
    { id: "entradas", name: "Entradas y sopas", note: "AL CENTRO DE LA MESA", sort_order: 2, items: [
      { name: "Guacamole con totopos", description: "Aguacate, cilantro, cebolla y totopos crujientes.", price: 105, tag: "Para compartir", image_url: "", sort_order: 1 },
      { name: "Sopa de tortilla", description: "Caldo de jitomate, tortilla crujiente, aguacate y queso.", price: 89, tag: "", image_url: "", sort_order: 2 },
      { name: "Queso fundido", description: "Queso gratinado para compartir con tortillas calientes.", price: 125, tag: "", image_url: "", sort_order: 3 }
    ]},
    { id: "antojitos", name: "Antojitos mexicanos", note: "RECETAS CON TRADICIÓN", sort_order: 3, items: [
      { name: "Enchiladas tradicionales", description: "Tortillas rellenas, salsa de la casa, crema y queso.", price: 148, tag: "Especialidad", image_url: "", sort_order: 1 },
      { name: "Huarache con costilla", description: "Masa de maíz, frijoles, costilla y guarnición.", price: 185, tag: "", image_url: "", sort_order: 2 }
    ]},
    { id: "pizzas", name: "Pizzas", note: "PARA COMPARTIR", sort_order: 4, items: [
      { name: "Pizza de cuatro quesos", description: "Mezcla de quesos sobre nuestra base horneada.", price: 219, tag: "Favorita", image_url: "", sort_order: 1 },
      { name: "Pizza de la huerta", description: "Vegetales de temporada, queso y salsa de tomate.", price: 199, tag: "", image_url: "", sort_order: 2 }
    ]},
    { id: "fuertes", name: "Carnes y platos fuertes", note: "EL PLATO PRINCIPAL", sort_order: 5, items: [
      { name: "Arrachera a la parrilla", description: "Arrachera con guarnición de temporada.", price: 289, tag: "Especialidad", image_url: "", sort_order: 1 },
      { name: "Pollo al limón", description: "Pechuga a la plancha con limón y hierbas.", price: 198, tag: "", image_url: "", sort_order: 2 },
      { name: "Hamburguesa hawaiana", description: "Carne, queso, piña asada, vegetales y papas.", price: 189, tag: "", image_url: "", sort_order: 3 }
    ]},
    { id: "bebidas", name: "Bebidas", note: "ALGO PARA ACOMPAÑAR", sort_order: 6, items: [
      { name: "Agua fresca del día", description: "Pregunta por el sabor disponible.", price: 42, tag: "", image_url: "", sort_order: 1 },
      { name: "Café de olla", description: "Café aromático con canela.", price: 48, tag: "", image_url: "", sort_order: 2 },
      { name: "Limonada natural", description: "Limón recién preparado.", price: 52, tag: "", image_url: "", sort_order: 3 }
    ]},
    { id: "postres", name: "Postres", note: "UN DULCE FINAL", sort_order: 7, items: [
      { name: "Flan de la casa", description: "Flan cremoso con caramelo.", price: 75, tag: "", image_url: "", sort_order: 1 },
      { name: "Helado", description: "Pregunta por los sabores disponibles.", price: 68, tag: "", image_url: "", sort_order: 2 }
    ]}
  ]
};

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const state = { menu: DEMO_MENU, activeCategory: "all", query: "" };
const $ = (id) => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function safeImage(url) {
  if (!url) return "";
  try { const u = new URL(url, location.href); return ["http:", "https:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
}
function applySettings(s) {
  $("business-name").innerHTML = escapeHTML(s.business_name || "La Hacienda del Sabor").replace(/ del Sabor$/, " <em>del Sabor</em>");
  $("business-tagline").textContent = s.tagline || "SABORES QUE INVITAN A QUEDARSE";
  $("business-description").textContent = s.description || "";
  $("updated-label").textContent = s.updated_label || "MENÚ DIGITAL";
  $("visit-title").textContent = s.visit_title || "El buen sabor se comparte.";
  $("visit-note").textContent = s.visit_note || "";
  $("menu-disclaimer").textContent = s.disclaimer || "Los precios y la disponibilidad pueden cambiar. Confirma cualquier duda con nuestro personal.";
  $("footer-business").textContent = s.business_name || "La Hacienda del Sabor";
  const emblem = (s.business_name || "H").trim().charAt(0).toUpperCase();
  $("brand-emblem").textContent = emblem; $("footer-emblem").textContent = emblem;
  document.title = `Menú | ${s.business_name || "La Hacienda del Sabor"}`;
}
function flattenCategories() {
  return state.menu.categories.map(cat => ({
    ...cat,
    items: (cat.items || []).filter(item => item.is_available !== false)
      .sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0))
  })).filter(cat => cat.items.length);
}
function renderCategories(categories) {
  const nav = $("category-nav");
  const all = [{ id: "all", name: "Todo el menú" }, ...categories];
  nav.innerHTML = all.map(cat => `<button type="button" class="category-chip ${state.activeCategory === cat.id ? "active" : ""}" data-category="${escapeHTML(cat.id)}">${escapeHTML(cat.name)}</button>`).join("");
  nav.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click", () => {
    state.activeCategory = button.dataset.category; render();
    if (state.activeCategory !== "all") document.getElementById(`cat-${state.activeCategory}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}
function renderDish(item) {
  const img = safeImage(item.image_url || item.image);
  const photo = img
    ? `<div class="dish-photo"><img loading="lazy" src="${escapeHTML(img)}" alt="${escapeHTML(item.name)}" onerror="this.parentElement.innerHTML='<div class=&quot;photo-placeholder&quot;>✦</div>'"></div>`
    : `<div class="dish-photo"><div class="photo-placeholder" aria-hidden="true">✦</div></div>`;
  return `<article class="dish-card">${photo}<div class="dish-copy"><div class="dish-top"><h3 class="dish-name">${escapeHTML(item.name)}</h3><span class="dish-price">${money.format(Number(item.price) || 0)}</span></div><p class="dish-description">${escapeHTML(item.description || "")}</p>${item.tag ? `<span class="dish-tag">${escapeHTML(item.tag)}</span>` : ""}</div></article>`;
}
function render() {
  const categories = flattenCategories();
  const q = state.query.trim().toLocaleLowerCase("es-MX");
  const filtered = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => `${item.name} ${item.description || ""} ${item.tag || ""}`.toLocaleLowerCase("es-MX").includes(q))
  })).filter(cat => cat.items.length && (state.activeCategory === "all" || cat.id === state.activeCategory));
  renderCategories(categories);
  $("clear-search").hidden = !state.query;
  $("menu-status").textContent = state.query ? `${filtered.reduce((n,c) => n+c.items.length,0)} resultado(s)` : "";
  $("menu-content").innerHTML = filtered.length ? filtered.map(cat => `
    <section class="menu-section" id="cat-${escapeHTML(cat.id)}">
      <div class="menu-section-head"><div><p class="section-kicker">${escapeHTML(cat.note || "NUESTRO MENÚ")}</p><h2>${escapeHTML(cat.name)}</h2></div><span class="menu-section-note">${cat.items.length} ${cat.items.length === 1 ? "opción" : "opciones"}</span></div>
      <div class="menu-grid">${cat.items.map(renderDish).join("")}</div>
    </section>`).join("") : `<div class="empty-state"><strong>No encontramos resultados</strong>Prueba otra búsqueda o cambia de categoría.</div>`;
}
async function loadRemoteMenu() {
  const cfg = window.CODEPOS_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return;
  try {
    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const [settingsRes, categoriesRes, itemsRes] = await Promise.all([
      client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      client.from("menu_categories").select("*").eq("is_active", true).order("sort_order"),
      client.from("menu_items").select("*").eq("is_available", true).order("sort_order")
    ]);
    if (settingsRes.error || categoriesRes.error || itemsRes.error) throw settingsRes.error || categoriesRes.error || itemsRes.error;
    if (!categoriesRes.data?.length) return;
    const itemsByCategory = {};
    for (const item of (itemsRes.data || [])) (itemsByCategory[item.category_id] ||= []).push(item);
    state.menu = {
      settings: settingsRes.data || DEMO_MENU.settings,
      categories: categoriesRes.data.map(cat => ({ ...cat, id: cat.id, items: itemsByCategory[cat.id] || [] })).filter(cat => cat.items.length)
    };
    state.activeCategory = "all";
    applySettings(state.menu.settings); render();
  } catch (error) {
    console.warn("No se pudo cargar el menú en la nube. Se muestra la demo local.", error);
    $("menu-status").textContent = "Mostrando menú de demostración; la conexión al menú en línea requiere configuración.";
  }
}
$("menu-search").addEventListener("input", e => { state.query = e.target.value; state.activeCategory = "all"; render(); });
$("clear-search").addEventListener("click", () => { state.query = ""; $("menu-search").value = ""; render(); $("menu-search").focus(); });
applySettings(DEMO_MENU.settings);
render();
loadRemoteMenu();
