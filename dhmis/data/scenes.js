/**
 * Configuración de Escenarios y Hotspots Interactivos
 * DHMIS 360 - Proyecto Fanmade por Unravel Vision
 *
 * ¡PUEDES AGREGAR CUALQUIER HABITACIÓN AQUÍ!
 * Los botones para cambiar de sala aparecerán AUTOMÁTICAMENTE en la aplicación.
 */

const SCENES_DATA = {
  // --------------------------------------------------------------------------
  // ESCENARIO 1: LA COCINA (Episodio 1: Creatividad)
  // --------------------------------------------------------------------------
  cocina: {
    id: "cocina",
    name: "La Cocina",
    episode: "Episodio 1: Creatividad",
    panorama: "cocina/panorama.png",
    initialView: {
      yaw: -18.5,  // Orientado exactamente hacia la libreta en la mesa
      pitch: -13,  // Ángulo cómodo hacia la mesa
      fov: 75
    },
    hotspots: [
      {
        id: "libreta",
        title: "La Libreta (Maestra de la Creatividad)",
        subtitle: "Episodio 1 • Objeto Principal",
        category: "Maestro",
        icon: "fa-pencil-alt",
        // Coordenadas esféricas calculadas exactamente sobre la libreta en la mesa
        yaw: -18.5,
        pitch: -16.5,
        isPrimary: true,
        image: "cocina/libreta.png",
        quote: "What's your favorite idea? Mine is being creative!",
        warning: "El verde NO es un color creativo.",
        description: `Es el primer personaje tutor que se presenta en Don't Hug Me I'm Scared. Cobra vida sorpresivamente sobre la mesa de la cocina e invita a los protagonistas a explorar su imaginación a través de una pegajosa canción infantil.

A pesar de su apariencia amigable y su sonrisa dibujada, sus conceptos pedagógicos pronto se tornan autoritarios y perturbadores:
• Desecha violentamente las ideas de los demás cuando no encajan con su visión.
• Declara tajantemente que "el verde no es un color creativo".
• Conduce la lección hacia una espiral caótica de vísceras, corazones reales, pasteles de carne y horror surrealista.

Frases icónicas:
• "What's your favorite idea? Mine is being creative!"
• "I use my hair to express myself."
• "Now let's all agree, to never be creative again."`
      }
    ]
  },

  // --------------------------------------------------------------------------
  // ESCENARIO 2: LA SALA (Episodio 2: Tiempo)
  // --------------------------------------------------------------------------
  sala: {
    id: "sala",
    name: "La Sala",
    episode: "Episodio 2: Tiempo",
    panorama: "sala/panorama.png",
    initialView: {
      yaw: -84.5, // Enfoca directamente a Tony el Reloj sobre el televisor
      pitch: 10,
      fov: 75
    },
    hotspots: [
      {
        id: "reloj-sala",
        title: "Tony el Reloj",
        subtitle: "Maestro del Tiempo • Episodio 2",
        category: "Maestro",
        icon: "fa-clock",
        // Coordenadas esféricas calculadas exactamente sobre el reloj en la pared
        yaw: -84.5,
        pitch: 12.8,
        isPrimary: true,
        image: "recursos/ref1.png",
        quote: "Time is a tool you can put on the wall, or wear it on your wrist!",
        warning: "El tiempo eventualmente te convertirá en polvo.",
        description: `Tony the Talking Clock es el maestro del Episodio 2 de Don't Hug Me I'm Scared.

Cobra vida en la pared de la sala justo sobre el televisor para cantar sobre los minutos, los días y el paso inexorable del tiempo, acelerando los segundos hasta que la carne de los protagonistas se pudre de vejez en un clímax terrorífico.

Frases icónicas:
• "Time is a tool you can put on the wall, or wear it on your wrist!"
• "An old man dies..."
• "Time is going fast!"`
      }
    ]
  }
};
