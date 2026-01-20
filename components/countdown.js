// components/countdown.js
export function createCountdown({
  target, // Date o string ej: '2026-01-15T00:00:00-06:00'
  bgSrc = "./images/countdown-bg.png",

  // Mantengo el objeto pill por compatibilidad,
  // pero ya NO usamos radius/paddingInline/gapDigits para los números-imagen
  pill = {
    height: "56px",
    minWidth: "88px",
    radius: "999px",
    color: "#ede2f0",
    paddingInline: "16px",
    gapDigits: "6px",
  },

  gapBetweenPills = "16px",
  scaleWidth = "min(92vw, 720px)",

  // ya no se usa (pero lo dejamos para que no truene tu llamada)
  digitsPath = (d) => `./digits/${d}.svg`,

  zeroPad = { days: 2, hours: 2, minutes: 2, seconds: 2 },

  labels = ["Días", "Horas", "Minutos", "Segundos"],
  showLabels = false,

  // ✅ NUEVO: título opcional arriba (como "FALTAN")
  titleText = "FALTAN",
  showTitle = false,
} = {}) {
  // Raíz
  const root = document.createElement("div");
  root.className = "cd-root";
  root.style.setProperty("--cd-width", scaleWidth);
  root.style.setProperty("--cd-gap-pills", gapBetweenPills);
  root.style.setProperty("--cd-pill-h", pill.height);
  root.style.setProperty("--cd-pill-minw", pill.minWidth);
  root.style.setProperty("--cd-pill-radius", pill.radius);
  root.style.setProperty("--cd-pill-color", pill.color);
  root.style.setProperty("--cd-pill-padx", pill.paddingInline);
  root.style.setProperty("--cd-digits-gap", pill.gapDigits);

  // dentro de createCountdown, tras crear 'root'
  const DESIGN_W = 720; // ancho base con el que hiciste el layout
  function setScale() {
    const w = root.clientWidth || DESIGN_W;
    const k = Math.max(0.5, Math.min(2, w / DESIGN_W)); // límites opcionales
    root.style.setProperty("--cd-scale", k);
  }

  // observa cambios de tamaño del componente
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(setScale);
    ro.observe(root);
  } else {
    window.addEventListener("resize", setScale);
  }
  setScale();

  // Fondo
  const bg = document.createElement("img");
  bg.className = "cd-bg";
  bg.src = bgSrc;
  bg.alt = "";

  bg.onload = () => {
    const w = bg.naturalWidth || 720;
    const h = bg.naturalHeight || 430;
    root.style.setProperty("--cd-ar", `${w} / ${h}`);

    root.style.setProperty("--cd-box-left", "8");
    root.style.setProperty("--cd-box-right", "8");
    root.style.setProperty("--cd-box-top", "43");
    root.style.setProperty("--cd-box-bottom", "35");
  };

  root.appendChild(bg);

  // ✅ NUEVO: título opcional (no afecta tu layout si está apagado)
  if (showTitle) {
    const title = document.createElement("div");
    title.className = "cd-title";
    title.textContent = titleText;
    root.appendChild(title);
  }

  // Capa de UI (píldoras + dígitos) — centrada sobre el fondo
  const layer = document.createElement("div");
  layer.className = "cd-layer";
  root.appendChild(layer);

  // 4 contenedores (píldoras)
  const slots = ["days", "hours", "minutes", "seconds"].map(() => {
    const pillEl = document.createElement("div");
    pillEl.className = "cd-pill";
    pillEl.setAttribute("role", "group");
    pillEl.style.userSelect = "none";
    pillEl.style.webkitUserDrag = "none";

    // En vez de imágenes, metemos un texto
    const span = document.createElement("span");
    span.className = "cd-value";
    span.textContent = "00";
    pillEl.appendChild(span);

    layer.appendChild(pillEl);
    return pillEl;
  });

  // Etiquetas (si no vienen en tu imagen de fondo)
  if (showLabels) {
    const labelsRow = document.createElement("div");
    labelsRow.className = "cd-labels";
    labels.forEach((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      labelsRow.appendChild(span);
    });
    root.appendChild(labelsRow);
  }

  // Render de un número (texto CSS) con padding
  function renderNumber(pillEl, n, padTo) {
    const str = String(Math.max(0, n)).padStart(padTo, "0");
    const span = pillEl.querySelector(".cd-value");
    if (span) span.textContent = str.slice(-padTo); // asegura 2 dígitos si padTo=2
  }

  // Lógica de tiempo
  const targetTime =
    target instanceof Date ? target.getTime() : new Date(target).getTime();

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, targetTime - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    // Importante: tú pediste 2 dígitos, así que mostramos 2 siempre.
    // Si días supera 99, se mostrará los últimos 2 dígitos (ej. 123 -> "23").
    // Si quieres "99" fijo o "99+", dímelo y lo cambio.
    renderNumber(slots[0], days, zeroPad.days ?? 2);
    renderNumber(slots[1], hours, zeroPad.hours ?? 2);
    renderNumber(slots[2], minutes, zeroPad.minutes ?? 2);
    renderNumber(slots[3], seconds, zeroPad.seconds ?? 2);

    if (targetTime - now <= 0) clearInterval(timer);
  }

  const timer = setInterval(tick, 1000);
  tick();

  return root;
}

// —— CSS una sola vez
const STYLE_ID = "cd-style";
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.cd-root{
  position: relative;
  width: var(--cd-width, min(80vw, calc(var(--device-w, 430px) * 0.80)));
  margin-inline: auto;
  display: block;
  user-select: none;
  aspect-ratio: var(--cd-ar, 720 / 430);
  --k: var(--cd-scale, 1);
}

.cd-bg{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

/* ✅ Título opcional "FALTAN" (no rompe nada porque está absolute) */
.cd-title{
  position: absolute;
  left: 50%;
  top: calc(var(--k) * 18px);
  transform: translateX(-50%);
  z-index: 3;

  color: #0B46A6; /* azul como el arte */
  font-family: Georgia, "Times New Roman", Times, serif;
  font-weight: 700;
  letter-spacing: calc(var(--k) * 6px);
  font-size: calc(var(--k) * 22px);
  line-height: 1;
  text-transform: uppercase;
  pointer-events: none;
}

/* Capa con las pastillas centrada (MISMO layout que tu original) */
.cd-layer{
  position: absolute;
  left: 50%;
  top: var(--cd-layer-top, 50%);
  transform: translate(-50%, -50%);
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--k) * 16px);   /* 👈 igual que antes */
  max-width: 86%;
}

/* ✅ SOLO CAMBIO: antes eran óvalos; ahora “cuadraditos” como la imagen
   OJO: NO cambiamos min-width/min-height del layout (se quedan iguales) */
/* ✅ Contenedor del número (cuadro blanco) — mismo tamaño, mismo layout */
.cd-pill{
  min-width: calc(var(--k) * 90px);
  min-height: calc(var(--k) * 90px);

  /* lo dejo igual (solo forma), no afecta tamaño */
  border-radius: calc(var(--k) * 12px);

  padding-inline: calc(var(--k) * 0px);

  /* ✅ como la imagen: cuadro blanco */
  background: rgba(255, 255, 255, 0.92);

  display:flex;
  align-items: center;
  justify-content: center;

  /* ✅ borde y sombra sutiles como tarjeta */
  border: 1px solid rgba(0,0,0,.08);
  box-shadow:
    0 10px 22px rgba(0,0,0,.12),
    inset 0 1px 0 rgba(255,255,255,.85);

  position: relative;
  overflow: hidden;
}

/* ✅ IMPORTANTE: quita el brillo azul anterior */
.cd-pill::before{
  content: none;
}

/* ✅ Número estilo “digital” gris (como la imagen) */
.cd-value{
  position: relative;
  z-index: 1;

  color: rgba(40, 40, 40, 0.85);

  /* intenta fuentes tipo 7-seg si existen; si no, cae a monospace */
  font-family: "DSEG7 Classic", "Digital-7", "DS-Digital", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;

  font-weight: 400;
  letter-spacing: calc(var(--k) * 1px);

  /* NO cambio tamaño */
  font-size: calc(var(--k) * 40px);
  line-height: 1;

  /* sombra sutil tipo “tinta” */
  text-shadow: 0 1px 0 rgba(255,255,255,.35);
}


/* Mantengo tus estilos de labels para no mover nada */
.cd-labels{
  display:flex;
  justify-content:center;
  gap: clamp(calc(var(--k) * 12px), 5vmin, calc(var(--k) * 40px));
  margin-top: calc(var(--k) * 10px);
  font: 600 clamp(calc(var(--k) * 12px), 3.2vmin, calc(var(--k) * 16px))
        ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  opacity:.9;
}
  `;
  document.head.appendChild(style);
}
