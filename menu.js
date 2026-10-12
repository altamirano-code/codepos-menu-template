/*
  CODEPOS MX — EDITA ESTE ARCHIVO PARA PERSONALIZAR EL MENÚ.
  Puedes duplicar objetos de productos y cambiar nombre, descripción, precio e imagen.
  Para no usar fotos, deja image: "".
*/
const MENU_CONFIG = {
  businessName: "La Casa del Sabor",
  tagline: "COCINA HONESTA · BUENOS MOMENTOS",
  description: "Ingredientes frescos, recetas que reconfortan y sabor en cada detalle.",
  updatedLabel: "TEMPORADA ACTUAL",
  visitTitle: "El buen sabor se comparte.",
  visitNote: "Pregunta a nuestro equipo por los especiales del día.",
  currency: "MXN",
  locale: "es-MX",
  categories: [
    {
      id: "entradas",
      name: "Para comenzar",
      note: "ENTRADAS",
      items: [
        { name: "Guacamole de la casa", description: "Aguacate fresco, cilantro, cebolla morada y totopos crujientes.", price: 95, image: "", tag: "Favorito" },
        { name: "Queso fundido", description: "Mezcla de quesos al horno, acompañado de tortillas calientes.", price: 115, image: "", tag: "" },
        { name: "Elote tatemado", description: "Elote a la parrilla con crema, queso y un toque de chile.", price: 78, image: "", tag: "" },
        { name: "Sopa del día", description: "Preparada diariamente con ingredientes de temporada.", price: 85, image: "", tag: "De temporada" }
      ]
    },
    {
      id: "fuertes",
      name: "Platos principales",
      note: "DE LA COCINA",
      items: [
        { name: "Arrachera a la parrilla", description: "Arrachera marinada, papas cambray y vegetales asados.", price: 265, image: "", tag: "Especialidad" },
        { name: "Pollo al limón", description: "Pechuga a la plancha con mantequilla de limón y hierbas.", price: 198, image: "", tag: "" },
        { name: "Tacos de costilla", description: "Tres tacos de costilla suave, cebolla, cilantro y salsa de la casa.", price: 175, image: "", tag: "" },
        { name: "Hamburguesa clásica", description: "Carne de res, queso, lechuga, jitomate y papas a la francesa.", price: 189, image: "", tag: "Favorito" }
      ]
    },
    {
      id: "bebidas",
      name: "Bebidas",
      note: "PARA ACOMPAÑAR",
      items: [
        { name: "Limonada mineral", description: "Limón recién exprimido, agua mineral y hielo.", price: 55, image: "", tag: "" },
        { name: "Agua fresca del día", description: "Pregunta por el sabor preparado hoy.", price: 42, image: "", tag: "" },
        { name: "Café de olla", description: "Café aromático con canela y piloncillo.", price: 48, image: "", tag: "" },
        { name: "Chocolate caliente", description: "Chocolate cremoso, preparado al momento.", price: 58, image: "", tag: "" }
      ]
    },
    {
      id: "postres",
      name: "Algo dulce",
      note: "POSTRES",
      items: [
        { name: "Pastel de chocolate", description: "Bizcocho de cacao con ganache y frutos rojos.", price: 89, image: "", tag: "" },
        { name: "Flan de la casa", description: "Flan cremoso con caramelo hecho en casa.", price: 72, image: "", tag: "Clásico" }
      ]
    }
  ]
};

const money = new Intl.NumberFormat(MENU_CONFIG.locale, {
  style: "currency", currency: MENU_CONFIG.currency, maximumFractionDigits: 2
});

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderMenu() {
  document.title = `Menú | ${MENU_CONFIG.businessName}`;
  document.getElementById("business-name").textContent = MENU_CONFIG.businessName;
  document.getElementById("business-tagline").textContent = MENU_CONFIG.tagline;
  document.getElementById("business-description").textContent = MENU_CONFIG.description;
  document.getElementById("menu-updated").textContent = MENU_CONFIG.updatedLabel;
  document.getElementById("visit-title").textContent = MENU_CONFIG.visitTitle;
  document.getElementById("visit-note").textContent = MENU_CONFIG.visitNote;
  document.getElementById("footer-business").textContent = MENU_CONFIG.businessName;

  const nav = document.getElementById("category-nav");
  const content = document.getElementById("menu-content");
  nav.innerHTML = MENU_CONFIG.categories.map((category, index) =>
    `<button class="category-button${index === 0 ? " active" : ""}" type="button" data-category="${safeText(category.id)}">${safeText(category.name)}</button>`
  ).join("");

  content.innerHTML = MENU_CONFIG.categories.map(category => `
    <section class="menu-section" id="section-${safeText(category.id)}">
      <div class="menu-section-heading"><h3>${safeText(category.name)}</h3><span></span><small>${safeText(category.note || "MENÚ")}</small></div>
      <div class="menu-grid">
        ${category.items.map(item => `
          <article class="menu-item">
            ${item.image
              ? `<img class="item-image" src="${safeText(item.image)}" alt="${safeText(item.name)}" loading="lazy" onerror="this.style.display='none'">`
              : `<div class="item-image item-image-placeholder" aria-hidden="true">✦</div>`}
            <div class="item-copy">
              <div class="item-top"><h4 class="item-name">${safeText(item.name)}</h4><span class="item-price">${money.format(item.price)}</span></div>
              <p class="item-description">${safeText(item.description || "")}</p>
              ${item.tag ? `<span class="item-tag">${safeText(item.tag)}</span>` : ""}
            </div>
          </article>`).join("")}
      </div>
    </section>`).join("");

  nav.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      nav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === button));
      document.getElementById(`section-${button.dataset.category}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
renderMenu();
