# Unravel Vision — Sitio web

Sitio estático (HTML, CSS y JavaScript sin dependencias) para **Unravel Vision SpA**, Valdivia, Chile.

## Estructura

```
UnravelVision/
├─ index.html              Inicio
├─ servicios.html          Servicios (9 líneas de trabajo)
├─ proyectos.html          Proyectos (con filtros)
├─ nosotros.html           Equipo, principios y enfoque
├─ talleres.html           Talleres y método
├─ contacto.html           Canales de contacto
├─ proyectos/              Fichas de cada proyecto
│  ├─ ecos-de-valdivia.html
│  ├─ planetario-vr.html
│  ├─ museo-inmersivo.html
│  ├─ guardianes-del-mito.html
│  ├─ primeros-auxilios.html
│  ├─ through-the-deep.html
│  ├─ tide-and-trinket.html
│  ├─ dont-hug-me.html
│  └─ laboratorio-inmersivo.html
└─ assets/
   ├─ css/styles.css       Sistema de diseño completo
   ├─ js/main.js           Menú, animaciones, filtros, año
   └─ img/                 Logos, favicon, equipo y miniaturas
      └─ proyectos/        Imágenes de cada proyecto
```

## Cómo verlo

**Opción 1 — abrir directo:** haz doble clic en `index.html`.
Funciona sin servidor. Solo las tipografías (Google Fonts) y los enlaces externos necesitan internet.

**Opción 2 — servidor local** (recomendado para probar todo igual que en producción):

```powershell
# desde la carpeta del proyecto
powershell -NoProfile -Command "$l=New-Object System.Net.HttpListener; $l.Prefixes.Add('http://localhost:8787/'); $l.Start(); while($l.IsListening){ $c=$l.GetContext(); $p=$c.Request.Url.LocalPath.TrimStart('/'); if(-not $p){$p='index.html'}; $f=Join-Path (Get-Location) ($p -replace '/','\'); if(Test-Path $f -PathType Leaf){ $b=[IO.File]::ReadAllBytes($f); $c.Response.ContentType='text/html; charset=utf-8'; $c.Response.ContentLength64=$b.Length; $c.Response.OutputStream.Write($b,0,$b.Length) } else { $c.Response.StatusCode=404 }; $c.Response.OutputStream.Close() }"
```

Luego abre `http://localhost:8787/`.

## Cómo publicarlo (gratis)

- **Netlify Drop:** entra a `app.netlify.com/drop` y arrastra la carpeta completa. Es lo más rápido.
- **GitHub Pages:** sube el contenido a un repositorio y activa Pages en la rama principal.
- **Vercel:** importa el repositorio o sube la carpeta.
- No requiere build, instalación ni compilación.

## Diseño

- **Paleta (orden de predominancia):** primero los dos morados (`#8c52ff` y `#5e17eb`) como base del sitio, en segundo lugar el blanco (tarjetas, botones, píldoras y texto sobre morado) y en tercer lugar el negro, que solo aparece como tinta de texto dentro de las superficies blancas.
- **Tema morado:** el reequilibrio vive en el bloque `TEMA MORADO` al final de `assets/css/styles.css` (tokens de fondo, textos sobre morado, header con logo blanco y tarjetas).
- **Menos cajas:** sobre ese tema hay un segundo bloque, `MENOS CAJAS + TEXTURA + INTERACCIONES`. Ahí las retículas de texto (disciplinas, proceso, talleres, equipo, principios, notas de contacto) dejaron de ser tarjetas blancas y pasaron a ser columnas abiertas con líneas finas. El blanco quedó para botones, píldoras y etiquetas, y las imágenes de proyecto y el demo reel van sin marco, solo con sombra y esquinas redondeadas.
- **Ilustración de portada:** el símbolo redondo del logo (`logo-mark-white.png`) ocupa el centro del panel, con anillos, retícula y píldoras alrededor. Antes era una esfera generada con CSS.
- **Textura de fondo:** retícula fina enmascarada, grano suave y viñeta, hechos con CSS y un SVG en línea (`body::before`, `body::after` y `html::after`). Son detalles de baja opacidad que no interfieren con la lectura.
- **Fundadores:** la fotografía (`fundadores.jpg`, 3:2 en `object-fit: cover`, con degradado al morado para que la etiqueta se lea bien) va en la sección *Origen* y la ilustración (`equipo.png`, PNG transparente) acompaña el encabezado de *Quiénes somos*. Las dos versiones conviven, cada una en su lugar.
- **Tipografías:** Space Grotesk (títulos) e Inter (texto).
- **Interacciones:** barra de progreso de lectura, foco que sigue al cursor en la portada, inclinación leve en las tarjetas de proyecto, botones con seguimiento suave del cursor, brillo al pasar el mouse, subrayado animado en enlaces y latido del punto en las secciones. Todo se desactiva con `prefers-reduced-motion` o con punteros táctiles.
- **Recursos:** retículas geométricas, numeración de secciones, formas orgánicas en CSS y animaciones suaves de aparición.
- **Accesibilidad:** enlace "saltar al contenido", foco visible, contraste AAA en texto, `aria-label` en navegación e iconos, y menú móvil operable con teclado (Escape para cerrar).

Auditorías con Lighthouse: **Accesibilidad 1.0 · Buenas prácticas 1.0 · SEO 1.0** en las páginas revisadas.

## Contenido: criterios aplicados

- No se inventaron clientes, premios, métricas, ingresos, certificaciones ni funcionalidades.
- Cada proyecto muestra su **estado real** (prototipo, en expansión, fanmade, en planificación).
- `Don't Hug Me I'm Scared VR` se declara explícitamente como **fanmade y sin fines comerciales**, y no afiliado a los creadores de la serie.
- La simulación de primeros auxilios aclara que **no reemplaza una certificación profesional**.
- Los proyectos provienen del canal de YouTube `@UnravelVision` (miniaturas descargadas a `assets/img/proyectos/`).
- `proyectos.html` muestra cinco proyectos: **Ecos de Valdivia, Planetario VR, Museo inmersivo, Guardianes del Mito y Don't Hug Me I'm Scared VR**. Los filtros corresponden a esas categorías (realidad virtual, videojuegos, juegos de mesa y cultural).
- La ficha del **Museo inmersivo** incluye una **convocatoria abierta** a artistas locales (pequeños y grandes) para prestar sus obras y exhibirlas en el espacio virtual, con llamados a la acción a `contacto.html` y a Beacons.

## Personalización rápida

| Qué | Dónde |
| --- | --- |
| Colores y tipografías | `assets/css/styles.css`, bloque `:root` |
| Logo del encabezado, del pie y del menú móvil | `assets/img/logo-white.png` (versión blanca, para fondos morados) |
| Símbolo redondo de la portada | `assets/img/logo-mark-white.png` |
| Favicon | `assets/img/favicon.png` |
| Foto de los fundadores | `assets/img/fundadores.jpg` (versión optimizada, 1600 px de ancho) |
| Ilustración de los fundadores | `assets/img/equipo.png` |
| Textos | Directamente en cada `.html` |
| Redes sociales | En el pie, el menú móvil y `contacto.html` |

Los logos originales (variantes A–F) siguen en la raíz del proyecto por si prefieres otra versión:
`A/C/E` son oscuras (para fondos claros), `B/D/F` son blancas (para fondos morados u oscuros).

## Pendientes sugeridos

1. **Correo de contacto:** es `unravelvisioncontact@gmail.com` y ya aparece en el canal de correo y en la nota "Dónde estamos" de `contacto.html`, además del formulario y el pie de las páginas.
2. **Formulario de contacto:** está construido en `contacto.html` (`#formulario`) y **ya conectado a Formspree** (`action="https://formspree.io/f/xyekqwdl"`), con validación en el navegador y estilos propios. Al enviar, los mensajes llegan al correo con el que se creó ese formulario en Formspree, sin recargar la página.
   - Si algún día cambias de servicio: reemplaza la URL del `action` del `<form data-contact-form>`. Alternativas: **Netlify Forms** (agregar `netlify` y `name="contacto"` al `<form>`, sin `action`), **Web3Forms** o **EmailJS** con clave pública.
   - Si el `action` queda vacío, el formulario **no finge** un envío: valida los campos y muestra un aviso con las alternativas (correo y Beacons).
   - Para evitar spam, Formspree tiene su propio filtro; si aparece basura, se puede activar reCAPTCHA desde el panel de Formspree.
3. **Más material visual:** renders, capturas de pantalla o fotos de procesos para reemplazar las miniaturas de YouTube en las fichas.
4. **Proyectos no incluidos:** Textil 4.0, Runka y Happy Bee / Tu Aventura Dental (mencionados en el brief) no se publicaron porque el usuario indicó mostrar los del canal. Se pueden sumar como fichas o como "líneas de trabajo".
5. **Versión en inglés** y **dominio propio** (para agregar `canonical`, `sitemap.xml` y `og:url` absolutos).
6. **Analítica** (si la necesitas) y verificación de Google Search Console.
7. **Fichas archivadas:** `proyectos/primeros-auxilios.html`, `proyectos/through-the-deep.html`, `proyectos/tide-and-trinket.html` y `proyectos/laboratorio-inmersivo.html` siguen en disco y se siguen entre ellas, pero ya no se enlazan desde el sitio (quedaron fuera de la lista pública). Se pueden borrar o volver a publicar cuando quieras.
