window.CODEPOS_CONFIG = window.CODEPOS_CONFIG || { supabaseUrl: "", supabaseAnonKey: "" };
const cfg = window.CODEPOS_CONFIG;
const $ = id => document.getElementById(id);
const ui = {
  client: null, user: null, categories: [], items: [], settings: null,
  message(text, error=false) { $("dashboard-message").textContent = text || ""; $("dashboard-message").style.color = error ? "#9a4f37" : "#3f6339"; },
  loginMessage(text, error=false) { $("login-message").textContent = text || ""; $("login-message").style.color = error ? "#9a4f37" : "#3f6339"; }
};
function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
function showLogin() { $("login-panel").hidden = false; $("dashboard").hidden = true; }
function showDashboard() { $("login-panel").hidden = true; $("dashboard").hidden = false; }
function configured() {
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
    $("setup-notice").hidden = false;
    $("login-form").querySelector("button").disabled = true;
    $("login-form").querySelector("button").textContent = "Configura Supabase primero";
    ui.loginMessage("El panel privado necesita Supabase configurado.", true);
    return false;
  }
  ui.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  return true;
}
async function checkSession() {
  if (!ui.client) return;
  const { data, error } = await ui.client.auth.getSession();
  if (error) { ui.loginMessage(error.message, true); return; }
  if (data.session) {
    ui.user = data.session.user;
    await verifyAdmin();
  } else showLogin();
}
async function verifyAdmin() {
  const { data, error } = await ui.client.from("menu_admins").select("user_id").eq("user_id", ui.user.id).maybeSingle();
  if (error || !data) {
    await ui.client.auth.signOut();
    ui.user = null; showLogin();
    ui.loginMessage("Esta cuenta no está autorizada para administrar el menú. Pide al responsable que la habilite en Supabase.", true);
    return;
  }
  showDashboard();
  await loadAll();
}
async function loadAll() {
  ui.message("Cargando datos…");
  const results = await Promise.all([
    ui.client.from("menu_categories").select("*").order("sort_order"),
    ui.client.from("menu_items").select("*").order("sort_order"),
    ui.client.from("site_settings").select("*").eq("id", 1).maybeSingle()
  ]);
  const err = results.find(r => r.error);
  if (err) { ui.message(`No se pudieron cargar los datos: ${err.error.message}`, true); return; }
  ui.categories = results[0].data || [];
  ui.items = results[1].data || [];
  ui.settings = results[2].data || {};
  renderItems(); renderCategories(); fillCategorySelect(); fillSettings();
  ui.message("");
}
function renderItems() {
  const tbody = $("items-table");
  if (!ui.items.length) { tbody.innerHTML = '<tr><td colspan="5">Todavía no hay productos. Usa “Nuevo producto”.</td></tr>'; return; }
  tbody.innerHTML = ui.items.map(item => {
    const cat = ui.categories.find(c => c.id === item.category_id);
    return `<tr><td><strong>${esc(item.name)}</strong><br><small>${esc(item.description || "")}</small></td><td>${esc(cat?.name || "Sin categoría")}</td><td>${new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(Number(item.price)||0)}</td><td><span class="state-pill ${item.is_available ? "" : "off"}">${item.is_available ? "Visible" : "Oculto"}</span></td><td><div class="row-actions"><button class="small-action" data-edit-item="${item.id}">Editar</button><button class="small-action danger" data-delete-item="${item.id}">Eliminar</button></div></td></tr>`;
  }).join("");
  tbody.querySelectorAll("[data-edit-item]").forEach(b => b.addEventListener("click", () => editItem(b.dataset.editItem)));
  tbody.querySelectorAll("[data-delete-item]").forEach(b => b.addEventListener("click", () => deleteItem(b.dataset.deleteItem)));
}
function renderCategories() {
  $("categories-list").innerHTML = ui.categories.map(cat => `<div class="category-row"><div><strong>${esc(cat.name)}</strong><small>${esc(cat.note || "Sin descripción")} · ${cat.is_active ? "Visible" : "Oculta"}</small></div><div class="row-actions"><button class="small-action" data-edit-category="${cat.id}">Editar</button><button class="small-action danger" data-toggle-category="${cat.id}">${cat.is_active ? "Ocultar" : "Mostrar"}</button></div></div>`).join("") || "<p>No hay categorías creadas.</p>";
  $("categories-list").querySelectorAll("[data-edit-category]").forEach(b => b.addEventListener("click", () => editCategory(b.dataset.editCategory)));
  $("categories-list").querySelectorAll("[data-toggle-category]").forEach(b => b.addEventListener("click", () => toggleCategory(b.dataset.toggleCategory)));
}
function fillCategorySelect(selected="") {
  $("item-category").innerHTML = ui.categories.filter(c=>c.is_active).map(c => `<option value="${c.id}" ${c.id===selected?"selected":""}>${esc(c.name)}</option>`).join("");
}
function fillSettings() {
  const s=ui.settings || {};
  $("setting-name").value=s.business_name||"";
  $("setting-tagline").value=s.tagline||"";
  $("setting-description").value=s.description||"";
  $("setting-updated").value=s.updated_label||"";
  $("setting-visit-title").value=s.visit_title||"";
  $("setting-visit-note").value=s.visit_note||"";
  $("setting-disclaimer").value=s.disclaimer||"";
}
function showTab(name) {
  document.querySelectorAll(".admin-tab").forEach(el => el.hidden = el.id !== `tab-${name}`);
  document.querySelectorAll(".tab-button").forEach(el => el.classList.toggle("active", el.dataset.tab===name));
}
function resetItemForm() { $("item-form").reset(); $("item-id").value=""; $("item-order").value=String(ui.items.length+1); $("item-available").checked=true; $("item-form-title").textContent="Nuevo producto"; fillCategorySelect(); $("item-form").hidden=true; }
function editItem(id) {
  const item=ui.items.find(x=>x.id===id); if(!item) return;
  $("item-id").value=item.id; $("item-name").value=item.name; fillCategorySelect(item.category_id);
  $("item-price").value=item.price; $("item-tag").value=item.tag||""; $("item-image").value=item.image_url||"";
  $("item-description").value=item.description||""; $("item-order").value=item.sort_order||0; $("item-available").checked=!!item.is_available;
  $("item-form-title").textContent="Editar producto"; $("item-form").hidden=false; $("item-form").scrollIntoView({behavior:"smooth",block:"start"});
}
async function deleteItem(id) {
  const item=ui.items.find(x=>x.id===id); if(!item || !confirm(`¿Eliminar “${item.name}”? Esta acción no se puede deshacer.`)) return;
  const {error}=await ui.client.from("menu_items").delete().eq("id",id);
  if(error) ui.message(error.message,true); else { ui.message("Producto eliminado."); await loadAll(); }
}
function resetCategoryForm() { $("category-form").reset(); $("category-id").value=""; $("category-order").value=String(ui.categories.length+1); $("category-active").checked=true; $("category-form-title").textContent="Nueva categoría"; $("category-form").hidden=true; }
function editCategory(id) {
  const c=ui.categories.find(x=>x.id===id); if(!c) return;
  $("category-id").value=c.id; $("category-name").value=c.name; $("category-note").value=c.note||"";
  $("category-order").value=c.sort_order||0; $("category-active").checked=!!c.is_active;
  $("category-form-title").textContent="Editar categoría"; $("category-form").hidden=false; $("category-form").scrollIntoView({behavior:"smooth",block:"start"});
}
async function toggleCategory(id) {
  const c=ui.categories.find(x=>x.id===id); if(!c) return;
  const {error}=await ui.client.from("menu_categories").update({is_active:!c.is_active}).eq("id",id);
  if(error) ui.message(error.message,true); else { ui.message("Categoría actualizada."); await loadAll(); }
}
$("login-form").addEventListener("submit", async e => {
  e.preventDefault(); if(!ui.client) return;
  ui.loginMessage("Verificando acceso…");
  const {data,error}=await ui.client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error) { ui.loginMessage("No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.",true); return; }
  ui.user=data.user; await verifyAdmin();
});
$("logout-button").addEventListener("click", async()=>{ await ui.client.auth.signOut(); ui.user=null; showLogin(); ui.loginMessage("Sesión cerrada."); });
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
$("new-item-button").addEventListener("click",()=>{ if(!ui.categories.some(c=>c.is_active)){ui.message("Primero crea o activa una categoría.",true);showTab("categories");return;} resetItemForm(); $("item-form").hidden=false; $("item-form").scrollIntoView({behavior:"smooth",block:"start"}); });
$("cancel-item-button").addEventListener("click",resetItemForm);
$("item-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=$("item-id").value;
  const payload={name:$("item-name").value.trim(),category_id:$("item-category").value,price:Number($("item-price").value),tag:$("item-tag").value.trim()||null,image_url:$("item-image").value.trim()||null,description:$("item-description").value.trim(),sort_order:Number($("item-order").value)||0,is_available:$("item-available").checked};
  if(!payload.category_id){ui.message("Selecciona una categoría activa.",true);return;}
  const result=id ? await ui.client.from("menu_items").update(payload).eq("id",id) : await ui.client.from("menu_items").insert(payload);
  if(result.error){ui.message(`No se pudo guardar: ${result.error.message}`,true);return;}
  resetItemForm(); ui.message("Producto guardado correctamente."); await loadAll();
});
$("new-category-button").addEventListener("click",()=>{resetCategoryForm();$("category-form").hidden=false;$("category-form").scrollIntoView({behavior:"smooth",block:"start"});});
$("cancel-category-button").addEventListener("click",resetCategoryForm);
$("category-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=$("category-id").value, name=$("category-name").value.trim();
  const payload={name,note:$("category-note").value.trim(),sort_order:Number($("category-order").value)||0,is_active:$("category-active").checked};
  const result=id ? await ui.client.from("menu_categories").update(payload).eq("id",id) : await ui.client.from("menu_categories").insert(payload);
  if(result.error){ui.message(`No se pudo guardar: ${result.error.message}`,true);return;}
  resetCategoryForm(); ui.message("Categoría guardada."); await loadAll();
});
$("settings-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const payload={id:1,business_name:$("setting-name").value.trim(),tagline:$("setting-tagline").value.trim(),description:$("setting-description").value.trim(),updated_label:$("setting-updated").value.trim(),visit_title:$("setting-visit-title").value.trim(),visit_note:$("setting-visit-note").value.trim(),disclaimer:$("setting-disclaimer").value.trim()};
  const result=await ui.client.from("site_settings").upsert(payload,{onConflict:"id"});
  if(result.error){ui.message(`No se pudo guardar: ${result.error.message}`,true);return;}
  ui.settings=payload; ui.message("Identidad del restaurante guardada.");
});
if(configured()) checkSession();
