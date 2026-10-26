/**
 * DON'T HUG ME I'M SCARED - RECORRIDO 360°
 * Lógica principal del visor WebGL, hotspots 3D interactivos y controles táctiles/ratón
 * Desarrollado para Unravel Vision
 */

class DHMISViewer {
  constructor() {
    this.currentSceneId = "cocina";
    this.currentScene = SCENES_DATA[this.currentSceneId];

    // Parámetros de Cámara y Órbita
    this.yaw = this.currentScene.initialView.yaw || 0;
    this.pitch = this.currentScene.initialView.pitch || 0;
    this.targetYaw = this.yaw;
    this.targetPitch = this.pitch;
    this.fov = this.currentScene.initialView.fov || 75;
    this.targetFov = this.fov;

    // Estados de interacción
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.touchStartDistance = 0;
    this.isAutoRotating = false;
    this.autoRotateSpeed = 0.08;
    this.gyroEnabled = false;
    this.soundEnabled = true;

    // Referencias DOM
    this.container = document.getElementById("viewer-container");
    this.canvas = document.getElementById("webgl-canvas");
    this.hotspotsLayer = document.getElementById("hotspots-layer");
    this.modal = document.getElementById("info-modal");
    this.hotspotsDrawer = document.getElementById("hotspots-drawer");
    this.splashScreen = document.getElementById("splash-screen");
    this.toast = document.getElementById("toast-notification");

    // Hotspots en memoria
    this.hotspotElements = [];

    // Audio se inicializa en la primera interacción del usuario (requerido en Android)
    this.audioCtx = null;

    // Inicializaciones
    this.initThree();
    this.loadScene(this.currentScene);
    this.initHotspotsDOM();
    this.initDrawer();
    this.initRoomsUI();
    this.bindEvents();
    this.animate();
    // Bucle de renderizado robusto para iframes: setInterval no se acelera
    // tan agresivamente como requestAnimationFrame cuando el iframe no est�
    // en el viewport, y sigue funcionando cuando el navegador lo oculta.
    this._renderTimer = setInterval(() => this.animate(), 33);
  }

  /* ------------------------------------------------------------------------
     SISTEMA DE AUDIO SINTETIZADO (Web Audio API)
     ------------------------------------------------------------------------ */
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API no soportada en este navegador:", e);
      this.audioCtx = null;
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    // Inicializar AudioContext la primera vez que se llama (requiere gesto del usuario en Android)
    if (!this.audioCtx) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      } catch (e) {
        console.warn("Web Audio API no soportada:", e);
        this.soundEnabled = false;
        return;
      }
    }
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (type === 'pop') {
      // Sonido pop caricaturesco al hacer clic
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

    } else if (type === 'modal-open') {
      // Arpegio lúdico e inquietante de marioneta (acorde disminuido/juguetón)
      const freqs = [330, 415, 523, 659];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });

    } else if (type === 'modal-close') {
      // Tono descendente al cerrar
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  /* ------------------------------------------------------------------------
     INICIALIZACIÓN THREE.JS
     ------------------------------------------------------------------------ */
  initThree() {
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(this.fov, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Esfera panorámica invertida
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invierte la esfera para verla desde el interior

    this.sphereMaterial = new THREE.MeshBasicMaterial();
    this.sphereMesh = new THREE.Mesh(geometry, this.sphereMaterial);
    this.scene.add(this.sphereMesh);
  }

  /* ------------------------------------------------------------------------
     CARGA DE ESCENA PANORÁMICA
     ------------------------------------------------------------------------ */
  loadScene(sceneData) {
    this.currentScene = sceneData;
    this.showToast(`Cargando ${sceneData.name}...`);
    if (window.location.protocol === "file:") {
      window.__dhmisTexError = "file-protocol";
      // Aviso prominente: el entorno 360° no puede cargarse desde file://
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(10,8,15,0.92);color:#fff;font-family:var(--font-dhmis-body,sans-serif);text-align:center;padding:24px;";
      overlay.innerHTML = "<div style='max-width:460px;'><h2 style='font-size:1.6rem;margin:0 0 12px;color:#fed200;'>El entorno 360° necesita un servidor</h2><p style='margin:0 0 16px;line-height:1.6;opacity:.85;'>El navegador bloquea la carga de la panorámica cuando se abre la página con doble clic. Para ver el recorrido, abre el sitio con el servidor local (<code style='background:rgba(255,255,255,.12);padding:2px 6px;border-radius:4px;'>serve.ps1</code>) o súbelo a tu hosting.</p><button onclick='this.parentElement.parentElement.remove()' style='padding:10px 22px;border:0;border-radius:999px;background:#fed200;color:#16151c;font-weight:700;cursor:pointer;'>Cerrar aviso</button></div>";
      document.body.appendChild(overlay);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const texture = new THREE.Texture(img);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      this.sphereMaterial.map = texture;
      this.sphereMaterial.needsUpdate = true;
      window.__dhmisTexOk = true;
      this.animate();
      this.showToast(`¡Explora ${sceneData.name}! Arrastra para mirar`);
    };
    img.onerror = () => {
      console.error("Error al cargar la textura panorámica:", sceneData.panorama);
      window.__dhmisTexError = sceneData.panorama;
      this.showToast("Error al cargar la imagen panorámica.");
    };
    img.src = sceneData.panorama;
  }

  /* ------------------------------------------------------------------------
     GENERACIÓN DE HOTSPOTS 3D PROYECTADOS
     ------------------------------------------------------------------------ */
  initHotspotsDOM() {
    this.hotspotsLayer.innerHTML = '';
    this.hotspotElements = [];

    this.currentScene.hotspots.forEach((spot) => {
      // Elemento contenedor
      const el = document.createElement("div");
      el.className = `hotspot-element ${spot.isPrimary ? 'is-primary' : ''}`;
      el.dataset.id = spot.id;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("title", spot.title);

      // Icono insignia
      const badge = document.createElement("div");
      badge.className = "hotspot-badge";
      const icon = document.createElement("i");
      icon.className = `fa-solid ${spot.icon || 'fa-eye'}`;
      badge.appendChild(icon);

      // Etiqueta de texto
      const label = document.createElement("div");
      label.className = "hotspot-label";
      label.textContent = spot.title;

      el.appendChild(badge);
      el.appendChild(label);

      // Evento de clic en hotspot
      const triggerAction = (e) => {
        e.stopPropagation();
        this.playSound('pop');
        this.openModal(spot);
      };

      el.addEventListener("click", triggerAction);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerAction(e);
        }
      });

      this.hotspotsLayer.appendChild(el);

      // Calcular vector 3D en la esfera a partir de yaw y pitch
      const phi = THREE.MathUtils.degToRad(90 - spot.pitch);
      const theta = THREE.MathUtils.degToRad(spot.yaw + 180);
      const radius = 460;

      const position3D = new THREE.Vector3(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );

      this.hotspotElements.push({
        data: spot,
        domElement: el,
        position3D: position3D
      });
    });
  }

  /* ------------------------------------------------------------------------
     ACTUALIZAR PROYECCIÓN DE HOTSPOTS EN CADA FRAME
     ------------------------------------------------------------------------ */
  updateHotspots() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.hotspotElements.forEach((item) => {
      const p = item.position3D.clone();
      p.project(this.camera);

      // Si el punto está detrás de la cámara (p.z > 1), ocultarlo
      if (p.z > 1) {
        item.domElement.style.opacity = '0';
        item.domElement.style.pointerEvents = 'none';
        return;
      }

      // Convertir coordenadas normalizadas [-1, 1] a píxeles
      const screenX = (p.x * 0.5 + 0.5) * width;
      const screenY = (-p.y * 0.5 + 0.5) * height;

      item.domElement.style.left = `${screenX}px`;
      item.domElement.style.top = `${screenY}px`;
      item.domElement.style.opacity = '1';
      item.domElement.style.pointerEvents = 'auto';
    });
  }

  /* ------------------------------------------------------------------------
     VENTANA MODAL SOBREPUESTA (OVERLAY DE INFORMACIÓN)
     ------------------------------------------------------------------------ */
  openModal(spot) {
    this.playSound('modal-open');

    // Asignar datos del hotspot
    document.getElementById("modal-category").textContent = spot.category ? spot.category.toUpperCase() : "OBJETO DE LECCIÓN";
    document.getElementById("modal-title").textContent = spot.title;
    document.getElementById("modal-subtitle").textContent = spot.subtitle || "";
    
    const imgEl = document.getElementById("modal-image");
    imgEl.src = spot.image || "cocina/libreta.png";
    imgEl.alt = spot.title;
    imgEl.onerror = () => {
      imgEl.src = "recursos/ref1.png";
    };

    document.getElementById("modal-image-caption").textContent = spot.isPrimary ? (spot.subtitle || "ARCHIVO DHMIS") : "ARCHIVO DHMIS";

    // Cita
    const quoteBox = document.getElementById("modal-quote-box");
    if (spot.quote) {
      document.getElementById("modal-quote-text").textContent = spot.quote;
      quoteBox.style.display = "flex";
    } else {
      quoteBox.style.display = "none";
    }

    // Advertencia sobre el verde u otra
    const warningBox = document.getElementById("modal-warning-box");
    if (spot.warning) {
      document.getElementById("modal-warning-text").textContent = spot.warning;
      warningBox.style.display = "flex";
    } else {
      warningBox.style.display = "none";
    }

    // Descripción
    const descContainer = document.getElementById("modal-description");
    descContainer.innerHTML = '';
    const paragraphs = spot.description.split('\n\n');
    paragraphs.forEach((pText) => {
      const p = document.createElement("p");
      p.style.marginBottom = "8px";
      p.textContent = pText;
      descContainer.appendChild(p);
    });

    // Mostrar modal
    this.modal.classList.add("active");
    this.modal.setAttribute("aria-hidden", "false");
    
    // Pausar giro automático mientras el modal esté abierto
    this._wasAutoRotating = this.isAutoRotating;
    this.isAutoRotating = false;
  }

  closeModal() {
    if (!this.modal.classList.contains("active")) return;
    this.playSound('modal-close');
    this.modal.classList.remove("active");
    this.modal.setAttribute("aria-hidden", "true");

    if (this._wasAutoRotating) {
      this.isAutoRotating = true;
    }
  }

  /* ------------------------------------------------------------------------
     PANEL LATERAL / DRAWER DE OBJETOS
     ------------------------------------------------------------------------ */
  initDrawer() {
    const drawerTitle = document.getElementById("drawer-room-title");
    if (drawerTitle) drawerTitle.textContent = this.currentScene.name;

    const list = document.getElementById("drawer-items-list");
    list.innerHTML = '';

    if (!this.currentScene.hotspots || this.currentScene.hotspots.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.style.fontSize = "12px";
      emptyLi.style.color = "#777";
      emptyLi.style.fontStyle = "italic";
      emptyLi.textContent = "No hay objetos en esta sala aún.";
      list.appendChild(emptyLi);
      return;
    }

    this.currentScene.hotspots.forEach((spot) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = `drawer-item-btn ${spot.isPrimary ? 'is-primary' : ''}`;

      btn.innerHTML = `
        <div class="drawer-item-icon">
          <i class="fa-solid ${spot.icon || 'fa-eye'}"></i>
        </div>
        <div class="drawer-item-info">
          <span class="drawer-item-name">${spot.title}</span>
          <span class="drawer-item-sub">${spot.subtitle || spot.category || ''}</span>
        </div>
      `;

      btn.addEventListener("click", () => {
        this.hotspotsDrawer.classList.remove("active");
        this.lookAt(spot.yaw, spot.pitch);
        setTimeout(() => {
          this.openModal(spot);
        }, 500);
      });

      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------------
     SISTEMA AUTOMÁTICO DE HABITACIONES (Lee dinámicamente SCENES_DATA)
     ------------------------------------------------------------------------ */
  initRoomsUI() {
    const dropdownList = document.getElementById("room-dropdown-list");
    const drawerRoomsList = document.getElementById("drawer-rooms-list");
    const currentRoomBtn = document.getElementById("current-room-btn");
    const roomWrapper = document.getElementById("room-selector-wrapper");

    if (dropdownList) dropdownList.innerHTML = '';
    if (drawerRoomsList) drawerRoomsList.innerHTML = '';

    const sceneKeys = Object.keys(SCENES_DATA);

    sceneKeys.forEach((key) => {
      const scene = SCENES_DATA[key];
      const isActive = (key === this.currentSceneId);

      // 1. Elemento en el menú desplegable superior
      if (dropdownList) {
        const item = document.createElement("button");
        item.className = `room-dropdown-item ${isActive ? 'active' : ''}`;
        item.innerHTML = `
          <div class="dropdown-item-left">
            <span class="dropdown-item-name">${scene.name}</span>
            <span class="dropdown-item-sub">${scene.episode || ''}</span>
          </div>
          ${isActive ? '<span class="dropdown-item-badge">ACTUAL</span>' : '<i class="fa-solid fa-arrow-right" style="font-size:11px;color:#888;"></i>'}
        `;

        item.addEventListener("click", (e) => {
          e.stopPropagation();
          if (roomWrapper) roomWrapper.classList.remove("open");
          this.switchScene(key);
        });

        dropdownList.appendChild(item);
      }

      // 2. Elemento en la sección del panel lateral
      if (drawerRoomsList) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.className = `drawer-room-btn ${isActive ? 'active' : ''}`;
        btn.innerHTML = `
          <div class="drawer-room-left">
            <i class="fa-solid fa-door-open" style="font-size: 13px;"></i>
            <span class="drawer-room-name">${scene.name}</span>
          </div>
          ${isActive ? '<span class="drawer-room-badge">AQUÍ</span>' : '<i class="fa-solid fa-chevron-right" style="font-size:11px;color:#888;"></i>'}
        `;

        btn.addEventListener("click", () => {
          this.hotspotsDrawer.classList.remove("active");
          this.switchScene(key);
        });

        li.appendChild(btn);
        drawerRoomsList.appendChild(li);
      }
    });

    // Evento de apertura/cierre del dropdown superior
    if (currentRoomBtn && roomWrapper && !this._roomBtnBound) {
      this._roomBtnBound = true;
      currentRoomBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.playSound('pop');
        roomWrapper.classList.toggle("open");
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest("#room-selector-wrapper")) {
          roomWrapper.classList.remove("open");
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     CAMBIAR DE ESCENARIO / HABITACIÓN
     ------------------------------------------------------------------------ */
  switchScene(sceneKey) {
    if (!SCENES_DATA[sceneKey]) {
      console.warn(`La escena "${sceneKey}" no existe en SCENES_DATA.`);
      return;
    }

    if (this.currentSceneId === sceneKey) {
      this.showToast(`Ya estás en ${SCENES_DATA[sceneKey].name}`);
      return;
    }

    this.playSound('modal-open');
    this.currentSceneId = sceneKey;
    this.currentScene = SCENES_DATA[sceneKey];

    // Actualizar nombre en la interfaz superior y drawer
    const roomNameEl = document.getElementById("room-name-display");
    if (roomNameEl) roomNameEl.textContent = this.currentScene.name;

    const drawerRoomTitle = document.getElementById("drawer-room-title");
    if (drawerRoomTitle) drawerRoomTitle.textContent = this.currentScene.name;

    // Cambiar vista de cámara a la inicial del nuevo escenario
    if (this.currentScene.initialView) {
      this.targetYaw = this.currentScene.initialView.yaw || 0;
      this.targetPitch = this.currentScene.initialView.pitch || 0;
      this.targetFov = this.currentScene.initialView.fov || 75;
    }

    // Cargar nueva textura 360
    this.loadScene(this.currentScene);

    // Regenerar hotspots de la nueva escena
    this.initHotspotsDOM();

    // Regenerar lista de objetos en el drawer
    this.initDrawer();

    // Refrescar estado activo en los menús de habitaciones
    this.initRoomsUI();
  }

  lookAt(targetYaw, targetPitch) {
    this.targetYaw = targetYaw;
    this.targetPitch = targetPitch;
  }

  /* ------------------------------------------------------------------------
     NOTIFICACIÓN TOAST
     ------------------------------------------------------------------------ */
  showToast(msg, duration = 3000) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add("active");
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toast.classList.remove("active");
    }, duration);
  }

  /* ------------------------------------------------------------------------
     MANEJO DE EVENTOS (RATÓN, TOUCH, TECLADO, BOTONES)
     ------------------------------------------------------------------------ */
  bindEvents() {
    // Redimensionamiento
    window.addEventListener("resize", () => this.onResize());

    // --- EVENTOS DE RATÓN (PC) ---
    this.container.addEventListener("mousedown", (e) => {
      if (e.target.closest('.hotspot-element')) return;
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      // Invertido horizontalmente para comportamiento natural/intuitivo
      this.targetYaw += deltaX * 0.15;
      this.targetPitch += deltaY * 0.15;

      // Limitar pitch vertical para no volcar la cámara
      this.targetPitch = Math.max(-85, Math.min(85, this.targetPitch));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // Zoom con rueda de ratón
    this.container.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.targetFov += e.deltaY * 0.05;
      this.targetFov = Math.max(35, Math.min(95, this.targetFov));
    }, { passive: false });

    // --- EVENTOS TÁCTILES (TELÉFONOS Y TABLETS) ---
    this.container.addEventListener("touchstart", (e) => {
      if (e.target.closest('.hotspot-element')) return;

      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        // Inicio de gesto pellizco para zoom
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchStartDistance = Math.hypot(dx, dy);
      }
    }, { passive: true });

    this.container.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        // Invertido horizontalmente para comportamiento natural/intuitivo en móvil/tablet
        this.targetYaw += deltaX * 0.22;
        this.targetPitch += deltaY * 0.22;
        this.targetPitch = Math.max(-85, Math.min(85, this.targetPitch));

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        // Pellizco para zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);

        if (this.touchStartDistance > 0) {
          const factor = (this.touchStartDistance - currentDistance) * 0.15;
          this.targetFov += factor;
          this.targetFov = Math.max(35, Math.min(95, this.targetFov));
        }
        this.touchStartDistance = currentDistance;
      }
    }, { passive: true });

    this.container.addEventListener("touchend", () => {
      this.isDragging = false;
      this.touchStartDistance = 0;
    });

    // --- TECLADO (FLECHAS / WASD / ESPACIO) ---
    window.addEventListener("keydown", (e) => {
      if (this.modal.classList.contains("active")) {
        if (e.key === "Escape") this.closeModal();
        return;
      }

      const step = 8;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          this.targetYaw += step;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          this.targetYaw -= step;
          break;
        case "ArrowUp":
        case "w":
        case "W":
          this.targetPitch = Math.min(85, this.targetPitch + step);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          this.targetPitch = Math.max(-85, this.targetPitch - step);
          break;
        case " ":
          e.preventDefault();
          this.resetView();
          break;
        case "+":
        case "=":
          this.targetFov = Math.max(35, this.targetFov - 5);
          break;
        case "-":
        case "_":
          this.targetFov = Math.min(95, this.targetFov + 5);
          break;
      }
    });

    // --- BOTONES DEL HUD INFERIOR ---
    document.getElementById("btn-zoom-in").addEventListener("click", () => {
      this.playSound('pop');
      this.targetFov = Math.max(35, this.targetFov - 10);
    });

    document.getElementById("btn-zoom-out").addEventListener("click", () => {
      this.playSound('pop');
      this.targetFov = Math.min(95, this.targetFov + 10);
    });

    document.getElementById("btn-reset-view").addEventListener("click", () => {
      this.playSound('pop');
      this.resetView();
    });

    const autoRotateBtn = document.getElementById("btn-autorotate");
    autoRotateBtn.addEventListener("click", () => {
      this.playSound('pop');
      this.isAutoRotating = !this.isAutoRotating;
      autoRotateBtn.classList.toggle("active", this.isAutoRotating);
      this.showToast(this.isAutoRotating ? "Giro automático activado" : "Giro automático desactivado");
    });

    const gyroBtn = document.getElementById("btn-gyro");
    gyroBtn.addEventListener("click", () => {
      this.playSound('pop');
      this.toggleGyroscope(gyroBtn);
    });

    const soundBtn = document.getElementById("btn-sound");
    soundBtn.addEventListener("click", () => {
      this.soundEnabled = !this.soundEnabled;
      soundBtn.classList.toggle("active", this.soundEnabled);
      soundBtn.innerHTML = this.soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
      this.showToast(this.soundEnabled ? "Efectos de sonido activados" : "Sonido silenciado");
      if (this.soundEnabled) this.playSound('pop');
    });

    const roomsBtn = document.getElementById("btn-rooms-menu");
    if (roomsBtn) {
      roomsBtn.addEventListener("click", () => {
        this.playSound('pop');
        const roomWrapper = document.getElementById("room-selector-wrapper");
        if (roomWrapper) roomWrapper.classList.toggle("open");
      });
    }

    const hotspotsMenuBtn = document.getElementById("btn-hotspots-menu");
    hotspotsMenuBtn.addEventListener("click", () => {
      this.playSound('pop');
      this.hotspotsDrawer.classList.toggle("active");
    });

    document.getElementById("close-drawer-btn").addEventListener("click", () => {
      this.playSound('pop');
      this.hotspotsDrawer.classList.remove("active");
    });

    document.getElementById("btn-fullscreen").addEventListener("click", () => {
      this.playSound('pop');
      this.toggleFullscreen();
    });

    // --- BOTONES DEL MODAL ---
    document.getElementById("modal-close-btn").addEventListener("click", () => this.closeModal());
    document.getElementById("modal-ok-btn").addEventListener("click", () => this.closeModal());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // --- PANTALLA DE BIENVENIDA (SPLASH) ---
    const startBtn = document.getElementById("splash-start-btn");
    if (startBtn) {
      const onStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dismissSplash();
      };
      startBtn.addEventListener("click", onStart);
      startBtn.addEventListener("touchend", onStart, { passive: false });
      startBtn.addEventListener("pointerup", onStart);
    }
  }

  dismissSplash() {
    this.playSound('modal-open');
    if (this.splashScreen) {
      this.splashScreen.classList.add("hidden");
      this.splashScreen.style.display = "none";
    }
  }

  resetView() {
    this.targetYaw = this.currentScene.initialView.yaw || 0;
    this.targetPitch = this.currentScene.initialView.pitch || 0;
    this.targetFov = this.currentScene.initialView.fov || 75;
    this.showToast("Vista reestablecida");
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  toggleGyroscope(btn) {
    if (this.gyroEnabled) {
      this.gyroEnabled = false;
      btn.classList.remove("active");
      window.removeEventListener("deviceorientation", this._boundGyroHandler);
      this.showToast("Giroscopio desactivado");
      return;
    }

    // Permisos en iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            this.enableGyro(btn);
          } else {
            this.showToast("Permiso de orientación denegado.");
          }
        })
        .catch((err) => {
          console.warn("Error pidiendo permiso de orientación:", err);
          this.showToast("Giroscopio no disponible.");
        });
    } else if ('ondeviceorientation' in window) {
      this.enableGyro(btn);
    } else {
      this.showToast("Tu dispositivo no soporta sensor de orientación.");
    }
  }

  enableGyro(btn) {
    this.gyroEnabled = true;
    btn.classList.add("active");
    this.showToast("¡Giroscopio activado! Mueve tu dispositivo.");

    let initialAlpha = null;
    this._boundGyroHandler = (e) => {
      if (!this.gyroEnabled || e.alpha === null) return;
      if (initialAlpha === null) initialAlpha = e.alpha;

      const alpha = e.alpha; // Rotación Z
      const beta = e.beta;   // Inclinación X (-180 a 180)

      this.targetYaw = -(alpha - initialAlpha);
      this.targetPitch = Math.max(-85, Math.min(85, beta - 45));
    };

    window.addEventListener("deviceorientation", this._boundGyroHandler);
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /* ------------------------------------------------------------------------
     CICLO DE ANIMACIÓN PRINCIPAL (LOOP)
     ------------------------------------------------------------------------ */
  animate() {
    // Auto-rotación
    if (this.isAutoRotating && !this.isDragging) {
      this.targetYaw += this.autoRotateSpeed;
    }

    // Interpolación suave (damping / inercia)
    this.yaw += (this.targetYaw - this.yaw) * 0.12;
    this.pitch += (this.targetPitch - this.pitch) * 0.12;

    if (Math.abs(this.fov - this.targetFov) > 0.05) {
      this.fov += (this.targetFov - this.fov) * 0.15;
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }

    // Convertir Yaw y Pitch a vector de mira esférica de la cámara
    const phi = THREE.MathUtils.degToRad(90 - this.pitch);
    const theta = THREE.MathUtils.degToRad(this.yaw + 180);

    const targetX = 500 * Math.sin(phi) * Math.sin(theta);
    const targetY = 500 * Math.cos(phi);
    const targetZ = 500 * Math.sin(phi) * Math.cos(theta);

    this.camera.lookAt(targetX, targetY, targetZ);

    // Renderizar escena Three.js
    this.renderer.render(this.scene, this.camera);

    // Proyectar hotspots 2D
    this.updateHotspots();
  }
}

// Inicializar la aplicación — compatible con WebView de Android donde DOMContentLoaded
// puede ya haber disparado antes de que el script se evalúe
function initDHMIS() {
  if (window.dhmisApp) return;
  window.dhmisApp = new DHMISViewer();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDHMIS);
} else {
  initDHMIS();
}
