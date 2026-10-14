# CodePOS MX — Menú digital estilo hacienda (QR + NFC)

Plantilla responsive para que los clientes consulten un menú desde el celular. Incluye búsqueda, categorías, fotos opcionales, precios MXN y un panel administrativo privado para gestionar productos, categorías y textos del restaurante.

**No incluye pedidos, carrito, pagos ni comandas.** El menú de muestra y sus precios son ficticios y deben sustituirse antes de publicar.

## Archivos

- `index.html`: menú público.
- `styles.css`: diseño visual responsive.
- `menu.js`: renderizado, búsqueda, menú demo y conexión de lectura a Supabase.
- `admin.html`, `admin.css`, `admin.js`: panel privado de administración.
- `supabase-schema.sql`: tablas, políticas de seguridad (RLS) y datos de demostración.
- `assets/`: carpeta para fotografías propias optimizadas.

## 1. Probar localmente

Abre `index.html` en el navegador para ver el menú de demostración. Para probar el panel con seguridad real necesitas conectar Supabase siguiendo los pasos siguientes. No se recomienda publicar el panel sin configurar la autenticación y las políticas de base de datos.

## 2. Configurar el panel privado con Supabase

La web pública es estática, pero un panel realmente privado necesita autenticación y permisos en el servidor. Esta plantilla usa Supabase (plan gratuito disponible según límites y condiciones vigentes).

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. En **SQL Editor**, abre una consulta nueva, copia `supabase-schema.sql` y ejecútala.
3. En **Authentication → Providers**, confirma que Email esté habilitado. En **Authentication → Users**, crea un usuario para el administrador. No habilites registros públicos de usuarios para clientes.
4. Copia el UUID del usuario creado. En SQL Editor ejecuta:
   ```sql
   insert into public.menu_admins (user_id)
   values ('UUID-DEL-USUARIO-ADMIN')
   on conflict do nothing;
   ```
   Sustituye `UUID-DEL-USUARIO-ADMIN` por el UUID real. Alternativamente, descomenta y ajusta la consulta de autorización al final de `supabase-schema.sql`.
5. En **Project Settings → API** (o **Data API**, según la interfaz), copia la **Project URL** y la clave pública **anon/publishable**. No uses la clave `service_role` ni ninguna clave secreta en el navegador.
6. Abre `menu.js` y `admin.js`. En ambos, al inicio, configura los mismos valores:
   ```js
   window.CODEPOS_CONFIG = {
     supabaseUrl: "https://TU-PROYECTO.supabase.co",
     supabaseAnonKey: "TU_CLAVE_PUBLICA_ANON"
   };
   ```
   Sustituye los valores por los de tu proyecto. La clave pública está diseñada para estar en el navegador; la seguridad la aplican las políticas RLS del SQL. **Nunca publiques la clave `service_role`.**
7. En la configuración de autenticación de Supabase, agrega la URL pública del sitio a las URL permitidas. Si vas a probar localmente, permite también la URL local correspondiente.
8. Sube los archivos a un hosting y abre `admin.html`. Inicia sesión con el usuario que creaste. Si no aparece autorizado, revisa que su UUID exista en `public.menu_admins`.
9. En **Authentication → Settings**, desactiva los registros públicos si la opción está habilitada. Crea y autoriza nuevas cuentas administrativas manualmente.

### Qué puede hacer el panel

- Crear, editar y eliminar productos.
- Cambiar precio, descripción, foto, categoría, etiqueta, orden y disponibilidad.
- Crear, editar, ordenar, mostrar u ocultar categorías.
- Cambiar el nombre y los textos del restaurante.

La tabla `menu_admins` define quién puede escribir. Los visitantes solo pueden leer categorías activas, productos disponibles y la información pública del negocio. Revisa las políticas antes de usar datos reales.

## 3. Publicar gratis con GitHub Pages

1. Crea una cuenta en [GitHub](https://github.com/) e inicia un repositorio nuevo, por ejemplo `menu-hacienda`.
2. Sube **todos** los archivos de esta carpeta a la raíz del repositorio (incluye `admin.html`, `admin.css`, `admin.js` y `supabase-schema.sql`).
3. En el repositorio abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**, selecciona la rama `main` y la carpeta `/(root)`, y guarda.
5. Espera la publicación y abre la URL que GitHub Pages te indique. Será similar a `https://TU-USUARIO.github.io/menu-hacienda/`, pero la URL exacta depende de tu cuenta.
6. Prueba el menú público desde un teléfono y confirma que `admin.html` solicita iniciar sesión.
7. En Supabase, agrega la URL pública del menú a las URL permitidas de autenticación. Si usas dominio propio, configura HTTPS y actualiza esa URL.

**Importante:** GitHub Pages publica los archivos estáticos; no hace privado el archivo `admin.html`. La privacidad real de los datos la proporciona Supabase Auth + RLS. No basta con ocultar un enlace o poner una contraseña solo en JavaScript.

## 4. Crear el QR para mesas, mostrador o entrada

1. Primero publica el sitio y confirma que la URL pública funcione sin iniciar sesión.
2. Copia la URL del menú público, no la de `admin.html`.
3. Genera un QR estático que contenga exactamente esa URL. Puedes usar un generador de QR de confianza o una herramienta de diseño.
4. Descarga el QR en SVG o PNG de alta resolución. Deja un margen blanco alrededor y evita colocarlo sobre fondos con poco contraste.
5. Imprime una prueba y escanéala con varios teléfonos antes de imprimir todos los soportes.
6. Añade una indicación breve, por ejemplo: **“Escanea para consultar el menú”**.

Un QR estático seguirá funcionando mientras la URL no cambie. Actualizar precios en el panel no requiere cambiar el QR. Si cambias de URL, tendrás que reimprimir el QR o usar un enlace de redirección bajo tu control.

## 5. Conectar etiquetas NFC

1. Compra etiquetas NFC reescribibles compatibles con teléfonos comunes (por ejemplo, NTAG213/215/216; comprueba la compatibilidad del teléfono y la etiqueta).
2. Instala una aplicación de escritura NFC de confianza en un teléfono compatible.
3. Escribe un registro de tipo **URL/URI** con la misma URL pública del menú (no la dirección del panel administrativo).
4. Lee la etiqueta con el teléfono para verificar que abra el menú correcto. Bloquear la etiqueta contra escritura es opcional y debe hacerse solo después de probarla.
5. Coloca la etiqueta en un soporte de mesa. Si el soporte es metálico, usa etiquetas diseñadas para metal o un separador adecuado.
6. Mantén el QR impreso junto a la etiqueta NFC para que los clientes puedan elegir.

NFC no necesita batería: la etiqueta pasiva responde al acercar un teléfono compatible. Algunos teléfonos requieren desbloquear la pantalla o activar NFC.

## 6. Buenas prácticas antes de usar en un restaurante real

- Sustituye todos los platillos y precios de demostración por datos confirmados.
- Usa fotografías propias o imágenes con licencia para uso comercial.
- No subas contraseñas ni claves secretas al repositorio.
- Usa contraseñas únicas, limita los administradores y mantén una copia del menú.
- Comprueba el menú con datos móviles y en pantallas pequeñas.
- Actualiza los datos desde el panel; conserva la misma URL para que QR y NFC sigan funcionando.
- Si en el futuro necesitas pedidos, pagos, reservas o control de mesas, se deberá ampliar la solución por separado.

## Personalización rápida

El diseño está inspirado en una hacienda contemporánea, sin reproducir el nombre ni la identidad gráfica de un negocio existente. Cambia la identidad desde el panel cuando Supabase esté configurado. Para las imágenes, pega una URL HTTPS en el campo de cada producto; también puedes guardar fotos optimizadas en `assets/` y usar su ruta pública.
