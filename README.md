# Plantilla de menú digital — CodePOS MX

Menú responsive de estilo elegante oscuro, pensado para consulta de platillos y precios desde un QR. No tiene carrito, pagos ni pedidos.

## Archivos
- `index.html`: estructura del menú.
- `styles.css`: diseño y adaptación a celulares.
- `menu.js`: nombre del negocio, categorías, productos y precios.
- `assets/`: carpeta para guardar fotos del negocio.

## Personalizar un restaurante
1. Abre `menu.js`.
2. Cambia `businessName`, `tagline`, `description` y los textos de bienvenida.
3. Dentro de `categories`, cambia categorías y productos.
4. Cada producto usa:
   - `name`: nombre del platillo.
   - `description`: descripción breve.
   - `price`: precio numérico (sin `$`).
   - `image`: ruta de foto, por ejemplo `assets/tacos.jpg`; deja `""` si no tienes foto.
   - `tag`: etiqueta opcional, como `Favorito`; deja `""` para ocultarla.
5. Guarda y abre `index.html` en el navegador para revisar.

**Importante:** los platillos y precios incluidos son datos de ejemplo. Sustitúyelos por la información real del negocio antes de publicarlo.

## Publicar gratis en GitHub Pages
1. Inicia sesión o crea una cuenta en GitHub.
2. Crea un repositorio nuevo, por ejemplo `menu-la-casa`.
3. Sube `index.html`, `styles.css`, `menu.js` y la carpeta `assets` si la usas. `index.html` debe estar en la raíz del repositorio.
4. Abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Selecciona la rama `main` y la carpeta `/(root)`, y guarda.
7. Espera a que GitHub Pages publique el sitio. La dirección será parecida a `https://TU-USUARIO.github.io/menu-la-casa/`.

La URL exacta depende de tu usuario y del nombre del repositorio. No inventes ni imprimas el QR hasta confirmar que la URL publicada funciona en un teléfono.

## Crear el QR
Cuando el menú esté publicado:
1. Abre la URL pública del menú.
2. Genera un QR estático que apunte a esa URL.
3. Escanéalo desde otro teléfono y prueba que cargue sin iniciar sesión.
4. Imprime el QR.

Un QR estático no cambia cuando editas el contenido, siempre que conserves la misma URL. Actualiza los archivos en GitHub para modificar el menú. No renombres el repositorio ni cambies la ruta pública después de imprimir el QR.

## Fotos
Usa fotos propias o imágenes con licencia que permita su uso comercial. Para cargar fotos locales, colócalas dentro de `assets/` y escribe la ruta en `image`, por ejemplo `assets/hamburguesa.jpg`. Optimiza las fotos para que carguen rápido en datos móviles.
