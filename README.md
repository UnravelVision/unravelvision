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
- **Tema morado:** todo el reequilibrio vive en el bloque `TEMA MORADO` al final de `assets/css/styles.css`. Ahí se redefinen los tokens de fondo, los textos sobre morado, el header (logo blanco) y las tarjetas. Para volver a un esquema más claro basta con quitar ese bloque.
- **Ilustración de portada:** el símbolo redondo del logo (`logo-mark-white.png`) ocupa el centro del panel, con anillos, retícula y píldoras alrededor. Antes era una esfera generada con CSS.
- **Tipografías:** Space Grotesk (títulos) e Inter (texto).
- **Recursos:** retículas geométricas, numeración de secciones, formas 3D/orgánicas en CSS, animaciones suaves de aparición y respeto por `prefers-reduced-motion`.
- **Accesibilidad:** enlace "saltar al contenido", foco visible, contraste AAA en texto, `aria-label` en navegación e iconos, y menú móvil operable con teclado (Escape para cerrar).

Auditorías con Lighthouse: **Accesibilidad 1.0 · Buenas prácticas 1.0 · SEO 1.0** en las páginas revisadas.

## Contenido: criterios aplicados

- No se inventaron clientes, premios, métricas, ingresos, certificaciones ni funcionalidades.
- Cada proyecto muestra su **estado real** (prototipo, en expansión, fanmade, en planificación).
- `Don't Hug Me I'm Scared VR` se declara explícitamente como **fanmade y sin fines comerciales**, y no afiliado a los creadores de la serie.
- La simulación de primeros auxilios aclara que **no reemplaza una certificación profesional**.
- Los proyectos provienen del canal de YouTube `@UnravelVision` (miniaturas descargadas a `assets/img/proyectos/`).

## Personalización rápida

| Qué | Dónde |
| --- | --- |
| Colores y tipografías | `assets/css/styles.css`, bloque `:root` |
| Logo del encabezado, del pie y del menú móvil | `assets/img/logo-white.png` (versión blanca, para fondos morados) |
| Símbolo redondo de la portada | `assets/img/logo-mark-white.png` |
| Favicon | `assets/img/favicon.png` |
| Foto de los fundadores | `assets/img/equipo.png` |
| Textos | Directamente en cada `.html` |
| Redes sociales | En el pie, el menú móvil y `contacto.html` |

Los logos originales (variantes A–F) siguen en la raíz del proyecto por si prefieres otra versión:
`A/C/E` son oscuras (para fondos claros), `B/D/F` son blancas (para fondos morados u oscuros).

## Pendientes sugeridos

1. **Correo de contacto:** hoy no se publica uno. Si lo tienes, se agrega en `contacto.html` y en el pie de todas las páginas.
2. **Formulario de contacto:** al ser un sitio estático, requiere un servicio externo (Formspree, Netlify Forms o similar). Se puede integrar cuando definas el correo de destino.
3. **Más material visual:** renders, capturas de pantalla o fotos de procesos para reemplazar las miniaturas de YouTube en las fichas.
4. **Proyectos no incluidos:** Textil 4.0, Runka y Happy Bee / Tu Aventura Dental (mencionados en el brief) no se publicaron porque el usuario indicó mostrar los del canal. Se pueden sumar como fichas o como "líneas de trabajo".
5. **Versión en inglés** y **dominio propio** (para agregar `canonical`, `sitemap.xml` y `og:url` absolutos).
6. **Analítica** (si la necesitas) y verificación de Google Search Console.
