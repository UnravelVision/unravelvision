# Don't Hug Me I'm Scared - Recorrido 360° (Fanmade)
**Desarrollado para Unravel Vision**

Una experiencia web panorámica interactiva en 360° inspirada en el universo de la aclamada serie de YouTube **Don't Hug Me I'm Scared** (DHMIS), desarrollada con estética retro de títeres, recortes de papel, humor negro y elementos interactivos.

---

## 🚀 Cómo Iniciar la Aplicación

Para disfrutar de la experiencia completa con aceleración WebGL y sin bloqueos de seguridad del navegador:

1. **Opción Rápida (Windows):**
   - Haz **doble clic en el archivo `iniciar_recorrido.bat`**.
   - Se abrirá automáticamente una ventana y tu navegador predeterminado en `http://localhost:8080/`.

2. **Opción Servidor PowerShell:**
   - Clic derecho en `servidor_local.ps1` > *Ejecutar con PowerShell*.

---

## 🎮 Controles y Navegación

### En Computadora (PC / Mac):
- **Girar la vista:** Haz clic izquierdo y arrastra el ratón en cualquier dirección.
- **Acercar / Alejar (Zoom):** Usa la rueda de desplazamiento del ratón o las teclas `+` y `-`.
- **Navegación por teclado:** Usa las flechas de dirección (`←`, `↑`, `→`, `↓`) o las teclas `W`, `A`, `S`, `D`.
- **Centrar la vista:** Presiona la tecla `Espacio` o el botón con el icono de mira en la barra inferior.
- **Inspeccionar objetos:** Haz clic sobre los círculos interactivos pulsantes.

### En Teléfonos Móviles y Tablets:
- **Girar la vista:** Desliza un dedo por la pantalla.
- **Zoom (Pellizco):** Acerca o separa dos dedos sobre la pantalla táctil.
- **Modo Giroscopio:** Toca el botón con el icono de teléfono en la barra inferior para mover la cámara físicamente girando tu dispositivo.
- **Inspeccionar objetos:** Toca cualquier hotspot o usa el menú flotante de "Objetos".

---

## 🎨 Características del Proyecto

- **Estética Fiel a DHMIS:**
  - Paleta de colores primaria de Yellow Guy, Red Guy y Duck.
  - Tipografías estilo recortable y retro infantil.
  - Insignia de fecha eterna: **19 de Junio**.
  - Advertencia canónica: *"El verde NO es un color creativo"*.
  - Efectos de sonido sintetizados en tiempo real mediante Web Audio API (sin descargas externas).
- **Branding Dual:**
  - Logotipo oficial de **Unravel Vision** (desarrollo e innovación) en el encabezado, pantalla de bienvenida y fichas.
  - Tipografía y banner de **Don't Hug Me I'm Scared** con indicador de proyecto Fanmade.
- **Escenario 1: La Cocina:**
  - Textura panorámica equirectangular en 360°.
  - **Item Principal:** **La Libreta / Paige (Maestra de la Creatividad)** con ventana modal sobrepuesta calibrada sobre la mesa, foto polaroid, cinta adhesiva, cita célebre y descripción completa.
- **Escenario 2: La Sala (Tiempo):**
  - Textura panorámica del Episodio 2 con **Tony el Reloj** calibrado sobre la pared del televisor.
- **Sistema Automático de Habitaciones:**
  - Los botones de navegación se generan de forma **100% automática** leyendo `data/scenes.js`.
  - Acceso desde el menú desplegable en la barra superior, el botón "Salas" en la barra inferior y el panel lateral.

---

## 🛠️ Cómo agregar nuevas habitaciones tú mismo (¡100% Automático!)

**¡No necesitas pedirlo cada vez ni tocar HTML o CSS!** Cada vez que agregues un bloque en [`data/scenes.js`](data/scenes.js), la aplicación detectará la habitación y creará los botones para viajar a ella automáticamente:

```javascript
SCENES_DATA["dormitorio"] = {
  id: "dormitorio",
  name: "El Dormitorio",
  episode: "Episodio 3: Amor",
  panorama: "3 escenario (amor)/panoramica amor.png",
  initialView: { yaw: 0, pitch: 0, fov: 75 },
  hotspots: [
    {
      id: "mariposa",
      title: "Shrignold la Mariposa",
      subtitle: "Maestro del Amor",
      category: "Maestro",
      icon: "fa-heart",
      yaw: 15,
      pitch: -5,
      isPrimary: true,
      image: "3 escenario (amor)/mariposa.png",
      quote: "This is a story of Michael, the ugliest boy in town...",
      warning: "No adores a Malcom, el rey del amor.",
      description: "Descripción de la lección del amor..."
    }
  ]
};
```
Guarda el archivo y al refrescar el navegador (`F5`), el nuevo botón aparecerá solo.
