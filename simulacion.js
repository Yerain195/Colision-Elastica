const carrito1 = document.getElementById("carrito1");
const carrito2 = document.getElementById("carrito2");
const inicio1 = -2.7;
const inicio2 = 2.7;
const escala = 1.5;
const dt = 0.016;
const umbralColision = 0.6;

let intervalo = null;

// Ocultar panel de resultados y overlay al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("panelResultados").style.display = "none";
  document.getElementById("overlayResultados").style.display = "none";
  document.getElementById("reiniciarBtn").disabled = true;

  // Esperar a que A-Frame esté listo
  const scene = document.querySelector('a-scene');
  if (scene.hasLoaded) {
    inicializarGrafico();
  } else {
    scene.addEventListener('loaded', inicializarGrafico);
  }
});

function inicializarGrafico() {
  // Dibujar gráficos iniciales vacíos
  dibujarGraficoInicial();
  inicializarGraficoPanel();
  
  // Esperar un poco más para que A-Frame esté completamente listo
  setTimeout(() => {
    actualizarTextura();
  }, 1000);
}

// ============ FUNCIONES PARA EL GRÁFICO DEL PANEL ============

function inicializarGraficoPanel() {
  const canvas = document.getElementById("graficoPanel");
  if (!canvas) {
    console.error("Canvas del panel no encontrado");
    return;
  }
  
  // Asegurar dimensiones correctas del canvas
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  dibujarGraficoPanelInicial();
}

function dibujarGraficoPanelInicial() {
  const canvas = document.getElementById("graficoPanel");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // Fondo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Bordes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);

  // Texto de espera
  ctx.fillStyle = '#9ca3af';
  ctx.font = '12px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Esperando simulación...', width / 2, height / 2);

  // Título
  ctx.fillStyle = '#4b5563';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('Gráfico de Velocidades vs Tiempo', width / 2, 15);
}

function dibujarGraficoPanel(v1i, v1f, v2i, v2f) {
  const canvas = document.getElementById("graficoPanel");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // Fondo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Márgenes
  const margin = { top: 25, right: 10, bottom: 25, left: 10 };
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  // Escalas
  const tiempoMax = 4; // segundos
  const colisionTime = 2; // momento de colisión
  
  // Encontrar el rango máximo de velocidades
  const maxVel = Math.max(Math.abs(v1i), Math.abs(v1f), Math.abs(v2i), Math.abs(v2f));
  const velRange = Math.max(maxVel * 1.2, 2); // Mínimo rango de 2 m/s

  // Función para mapear coordenadas
  function mapX(tiempo) {
    return margin.left + (tiempo / tiempoMax) * graphWidth;
  }

  function mapY(velocidad) {
    return margin.top + graphHeight/2 - (velocidad / velRange) * (graphHeight/2);
  }

  // === DIBUJAR REJILLA ===
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  
  // Líneas verticales
  for (let t = 0; t <= tiempoMax; t += 0.5) {
    const x = mapX(t);
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + graphHeight);
    ctx.stroke();
  }
  
  // Líneas horizontales
  for (let v = -velRange; v <= velRange; v += velRange/2) {
    const y = mapY(v);
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(margin.left + graphWidth, y);
    ctx.stroke();
  }

  // === LÍNEA DE VELOCIDAD CERO ===
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(margin.left, mapY(0));
  ctx.lineTo(margin.left + graphWidth, mapY(0));
  ctx.stroke();
  ctx.setLineDash([]);

  // === LÍNEA DE COLISIÓN ===
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(mapX(colisionTime), margin.top);
  ctx.lineTo(mapX(colisionTime), margin.top + graphHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  // Etiqueta de colisión
  ctx.fillStyle = '#ef4444';
  ctx.font = '9px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Colisión', mapX(colisionTime), margin.top - 5);

  // === DIBUJAR LÍNEA CARRITO AZUL ===
  ctx.strokeStyle = '#3498db';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(52, 152, 219, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Antes de colisión
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(v1i));
  ctx.lineTo(mapX(colisionTime), mapY(v1i));
  ctx.stroke();

  // Después de colisión
  ctx.beginPath();
  ctx.moveTo(mapX(colisionTime), mapY(v1f));
  ctx.lineTo(mapX(tiempoMax), mapY(v1f));
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Puntos del carrito azul
  ctx.fillStyle = '#3498db';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  
  const puntosAzul = [
    [mapX(0), mapY(v1i)],
    [mapX(colisionTime), mapY(v1i)],
    [mapX(colisionTime), mapY(v1f)],
    [mapX(tiempoMax), mapY(v1f)]
  ];

  puntosAzul.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });

  // === DIBUJAR LÍNEA CARRITO ROJO ===
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(231, 76, 60, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Antes de colisión
  ctx.beginPath();
  ctx.moveTo(mapX(0), mapY(v2i));
  ctx.lineTo(mapX(colisionTime), mapY(v2i));
  ctx.stroke();

  // Después de colisión
  ctx.beginPath();
  ctx.moveTo(mapX(colisionTime), mapY(v2f));
  ctx.lineTo(mapX(tiempoMax), mapY(v2f));
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Puntos del carrito rojo
  ctx.fillStyle = '#e74c3c';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  
  const puntosRojo = [
    [mapX(0), mapY(v2i)],
    [mapX(colisionTime), mapY(v2i)],
    [mapX(colisionTime), mapY(v2f)],
    [mapX(tiempoMax), mapY(v2f)]
  ];
  
  puntosRojo.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });

  // === ETIQUETAS DE EJES ===
  ctx.fillStyle = '#6b7280';
  ctx.font = '9px Arial, sans-serif';
  ctx.textAlign = 'center';
  
  // Eje X - Tiempo
  for (let t = 0; t <= tiempoMax; t += 1) {
    ctx.fillText(t + 's', mapX(t), margin.top + graphHeight + 12);
  }
  
  // Eje Y - Velocidad
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let v = -velRange; v <= velRange; v += velRange/2) {
    if (v !== 0) {
      ctx.fillText(v.toFixed(1) + ' m/s', margin.left - 5, mapY(v));
    }
  }

  // Título
  ctx.fillStyle = '#4b5563';
  ctx.font = 'bold 11px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Velocidad vs Tiempo', width / 2, 5);

  // Leyenda
  const legendY = margin.top + 5;
  
  // Carrito Azul
  ctx.fillStyle = '#3498db';
  ctx.fillRect(width - 80, legendY, 10, 2);
  ctx.beginPath();
  ctx.arc(width - 75, legendY + 1, 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#4b5563';
  ctx.font = '9px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Carrito Azul', width - 70, legendY - 3);

  // Carrito Rojo
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(width - 80, legendY + 12, 10, 2);
  ctx.beginPath();
  ctx.arc(width - 75, legendY + 13, 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#4b5563';
  ctx.fillText('Carrito Rojo', width - 70, legendY + 8);
}

// Asegurar que el canvas tenga las dimensiones correctas al redimensionar
window.addEventListener('resize', function() {
  const canvas = document.getElementById("graficoPanel");
  if (canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    dibujarGraficoPanelInicial();
  }
});

function simular() {
  const m1 = parseFloat(document.getElementById("masa1").value);
  const v1i = parseFloat(document.getElementById("vel1").value);
  const m2 = parseFloat(document.getElementById("masa2").value);
  const v2i = parseFloat(document.getElementById("vel2").value);

  let x1 = inicio1;
  let x2 = inicio2;

  let v1 = v1i;
  let v2 = v2i;

  const v1f = ((m1 - m2) / (m1 + m2)) * v1i + ((2 * m2) / (m1 + m2)) * v2i;
  const v2f = ((2 * m1) / (m1 + m2)) * v1i + ((m2 - m1) / (m1 + m2)) * v2i;

  const Ec1i = 0.5 * m1 * v1i * v1i;
  const Ec2i = 0.5 * m2 * v2i * v2i;
  const Ec1f = 0.5 * m1 * v1f * v1f;
  const Ec2f = 0.5 * m2 * v2f * v2f;

  let colisionado = false;

  document.getElementById("panelResultados").style.display = "none";
  document.getElementById("overlayResultados").style.display = "none";
  document.getElementById("simularBtn").disabled = true;
  document.getElementById("reiniciarBtn").disabled = true;

  // Actualizar gráfico del panel con las velocidades
  dibujarGraficoPanel(v1i, v1f, v2i, v2f);

  intervalo = setInterval(() => {
    x1 += v1 * dt * escala;
    x2 += v2 * dt * escala;

    if (!colisionado && Math.abs(x1 - x2) <= umbralColision) {
      colisionado = true;

      const medio = (x1 + x2) / 2;
      x1 = medio - umbralColision / 2;
      x2 = medio + umbralColision / 2;

      v1 = v1f;
      v2 = v2f;

      const tbody = document.getElementById("tablaResultadosBody");
      const filas = tbody.querySelectorAll("tr");

      filas[0].cells[1].innerText = m1.toFixed(2);
      filas[0].cells[2].innerText = m2.toFixed(2);
      filas[1].cells[1].innerText = v1i.toFixed(2);
      filas[1].cells[2].innerText = v2i.toFixed(2);
      filas[2].cells[1].innerText = v1f.toFixed(2);
      filas[2].cells[2].innerText = v2f.toFixed(2);
      filas[3].cells[1].innerText = Ec1i.toFixed(2);
      filas[3].cells[2].innerText = Ec2i.toFixed(2);
      filas[4].cells[1].innerText = Ec1f.toFixed(2);
      filas[4].cells[2].innerText = Ec2f.toFixed(2);

      document.getElementById("panelResultados").style.display = "flex";
      document.getElementById("overlayResultados").style.display = "block";

      // Graficar en la pizarra al momento de la colisión
      dibujarGraficoPizarra(v1i, v1f, v2i, v2f, m1, m2);
      
      // Reproducir sonido de choque
      const sonidoChoque = document.querySelector('#choque');
      if (sonidoChoque) {
        sonidoChoque.components.sound.playSound();
      }
    }

    carrito1.setAttribute("position", `${x1} 1.67 -3`);
    carrito2.setAttribute("position", `${x2} 1.67 -3`);

    if (Math.abs(x1) > 20 && Math.abs(x2) > 20) {
      clearInterval(intervalo);
      document.getElementById("simularBtn").disabled = false;
      document.getElementById("reiniciarBtn").disabled = false;
    }
  }, dt * 1000);
}

function reiniciar() {
  clearInterval(intervalo);

  const duracion = 1000;
  const fps = 60;
  const frames = (duracion / 1000) * fps;

  let frame = 0;

  let pos1 = carrito1.getAttribute("position").x;
  let pos2 = carrito2.getAttribute("position").x;

  const delta1 = (inicio1 - pos1) / frames;
  const delta2 = (inicio2 - pos2) / frames;

  function animar() {
    if (frame < frames) {
      pos1 += delta1;
      pos2 += delta2;
      carrito1.setAttribute("position", `${pos1} 1.67 -3`);
      carrito2.setAttribute("position", `${pos2} 1.67 -3`);
      frame++;
      requestAnimationFrame(animar);
    } else {
      carrito1.setAttribute("position", `${inicio1} 1.67 -3`);
      carrito2.setAttribute("position", `${inicio2} 1.67 -3`);

      document.getElementById("panelResultados").style.display = "none";
      document.getElementById("overlayResultados").style.display = "none";

      document.getElementById("simularBtn").disabled = false;
      document.getElementById("reiniciarBtn").disabled = true;
      
      // Dibujar gráficos iniciales
      dibujarGraficoInicial();
      dibujarGraficoPanelInicial();
    }
  }

  animar();
}

document.getElementById("cerrarResultadosBtn").addEventListener("click", () => {
  document.getElementById("panelResultados").style.display = "none";
  document.getElementById("overlayResultados").style.display = "none";
});

document.getElementById("exportarExcelBtn").addEventListener("click", async () => {
  try {
    const m1 = parseFloat(document.getElementById("masa1").value);
    const v1i = parseFloat(document.getElementById("vel1").value);
    const m2 = parseFloat(document.getElementById("masa2").value);
    const v2i = parseFloat(document.getElementById("vel2").value);

    const v1f = ((m1 - m2) / (m1 + m2)) * v1i + ((2 * m2) / (m1 + m2)) * v2i;
    const v2f = ((2 * m1) / (m1 + m2)) * v1i + ((m2 - m1) / (m1 + m2)) * v2i;

    // Preparar datos para el backend
    const datosParaBackend = [
      {
        carrito: "Carrito Azul",
        masa: m1,
        vel_inicial: v1i,
        vel_final: v1f
      },
      {
        carrito: "Carrito Rojo", 
        masa: m2,
        vel_inicial: v2i,
        vel_final: v2f
      }
    ];

    // Enviar al backend Flask
    const response = await fetch('http://localhost:5000/exportar_excel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datos: datosParaBackend })
    });

    if (response.ok) {
      // Descargar el archivo generado por Flask
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'resultados_colision_completo.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      throw new Error('Error del servidor');
    }

  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar el archivo Excel. Asegúrate de que el servidor Flask esté ejecutándose.');
  }
});

document.getElementById("simularBtn").addEventListener("click", simular);
document.getElementById("reiniciarBtn").addEventListener("click", reiniciar);

// ============ FUNCIÓN PARA DIBUJAR GRÁFICO INICIAL ESTILO VERNIER ============
function dibujarGraficoInicial() {
  const canvas = document.getElementById("graficoCanvas");
  if (!canvas) {
    console.error("Canvas no encontrado");
    return;
  }
  
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // Fondo degradado profesional
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#F8F9FA');
  gradient.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Márgenes
  const marginLeft = 120;
  const marginRight = 100;
  const marginTop = 100;
  const marginBottom = 100;

  const graphWidth = width - marginLeft - marginRight;
  const graphHeight = height - marginTop - marginBottom;

  // === SOMBRA DEL ÁREA DE GRÁFICO ===
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(marginLeft, marginTop, graphWidth, graphHeight);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // === REJILLA PROFESIONAL ===
  ctx.lineWidth = 0.8;
  
  // Líneas verticales principales (más gruesas cada 5)
  for (let i = 0; i <= 20; i++) {
    let x = marginLeft + (graphWidth * i) / 20;
    ctx.strokeStyle = i % 5 === 0 ? '#CCCCCC' : '#E8E8E8';
    ctx.lineWidth = i % 5 === 0 ? 1.2 : 0.6;
    ctx.beginPath();
    ctx.moveTo(x, marginTop);
    ctx.lineTo(x, marginTop + graphHeight);
    ctx.stroke();
  }

  // Líneas horizontales principales
  for (let i = 0; i <= 12; i++) {
    let y = marginTop + (graphHeight * i) / 12;
    ctx.strokeStyle = i % 3 === 0 ? '#CCCCCC' : '#E8E8E8';
    ctx.lineWidth = i % 3 === 0 ? 1.2 : 0.6;
    ctx.beginPath();
    ctx.moveTo(marginLeft, y);
    ctx.lineTo(marginLeft + graphWidth, y);
    ctx.stroke();
  }

  // === EJES PRINCIPALES CON FLECHAS ===
  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 3;

  // Eje Y con flecha
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop + graphHeight);
  ctx.lineTo(marginLeft, marginTop - 10);
  ctx.stroke();
  
  // Flecha Y
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop - 10);
  ctx.lineTo(marginLeft - 6, marginTop + 5);
  ctx.lineTo(marginLeft + 6, marginTop + 5);
  ctx.closePath();
  ctx.fillStyle = '#2C3E50';
  ctx.fill();

  // Eje X con flecha
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop + graphHeight);
  ctx.lineTo(width - marginRight + 10, marginTop + graphHeight);
  ctx.stroke();
  
  // Flecha X
  ctx.beginPath();
  ctx.moveTo(width - marginRight + 10, marginTop + graphHeight);
  ctx.lineTo(width - marginRight + 5, marginTop + graphHeight - 6);
  ctx.lineTo(width - marginRight + 5, marginTop + graphHeight + 6);
  ctx.closePath();
  ctx.fillStyle = '#2C3E50';
  ctx.fill();

  // === TÍTULO PRINCIPAL CON SOMBRA ===
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#1A252F';
  ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Análisis de Colisión Elástica', width / 2, 50);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // === SUBTÍTULO ===
  ctx.fillStyle = '#5A6C7D';
  ctx.font = '18px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Gráfico Velocidad vs Tiempo - Esperando datos de simulación', width / 2, 80);

  // === ETIQUETAS EJES CON ESTILO ===
  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  
  // Etiqueta eje X
  ctx.textAlign = 'center';
  ctx.fillText('Tiempo (s)', marginLeft + graphWidth / 2, height - 35);

  // Etiqueta eje Y
  ctx.save();
  ctx.translate(35, marginTop + graphHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Velocidad (m/s)', 0, 0);
  ctx.restore();

  // === MARCAS Y NÚMEROS EN LOS EJES ===
  ctx.fillStyle = '#34495E';
  ctx.font = '15px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#2C3E50';

  // Marcas eje Y (solo principales)
  for (let i = 0; i <= 12; i++) {
    if (i % 3 === 0) {
      let y = marginTop + (graphHeight * i) / 12;
      ctx.beginPath();
      ctx.moveTo(marginLeft - 12, y);
      ctx.lineTo(marginLeft, y);
      ctx.stroke();
    }
  }

  // Marcas eje X (solo principales)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= 10; i++) {
    if (i % 2 === 0) {
      let x = marginLeft + (graphWidth * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, marginTop + graphHeight);
      ctx.lineTo(x, marginTop + graphHeight + 12);
      ctx.stroke();
    }
  }

  // === ÁREA DE INFORMACIÓN ===
  const infoX = marginLeft + 20;
  const infoY = marginTop + 20;

  // Fondo con sombra
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#3498DB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(infoX, infoY, 280, 100, 8);
  ctx.fill();
  ctx.stroke();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Texto informativo
  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Estado del Sistema', infoX + 15, infoY + 28);
  
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#5A6C7D';
  ctx.fillText('• Configurar parámetros', infoX + 20, infoY + 52);
  ctx.fillText('• Presionar "Iniciar"', infoX + 20, infoY + 72);
  ctx.fillText('• Observar la colisión', infoX + 20, infoY + 92);

  // === LOGO ESTILO PROFESIONAL ===
  ctx.fillStyle = '#3498DB';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('⚛ PhysicsLab Pro', 20, 25);
  
  ctx.fillStyle = '#95A5A6';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Laboratorio Virtual de Física', 20, 45);

  // Actualizar textura
  actualizarTextura();
}

// ============ FUNCIÓN PARA DIBUJAR GRÁFICO TIPO VERNIER ============
function dibujarGraficoPizarra(v1i, v1f, v2i, v2f, m1, m2) {
  const canvas = document.getElementById("graficoCanvas");
  if (!canvas) {
    console.error("Canvas no encontrado");
    return;
  }
  
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  // Limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // Fondo degradado profesional
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#F0F4F8');
  gradient.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Márgenes optimizados
  const marginLeft = 120;
  const marginRight = 100;
  const marginTop = 100;
  const marginBottom = 100;

  const graphWidth = width - marginLeft - marginRight;
  const graphHeight = height - marginTop - marginBottom;

  // === SOMBRA DEL ÁREA DE GRÁFICO ===
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(marginLeft, marginTop, graphWidth, graphHeight);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // === TÍTULO CON EFECTO ===
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#1A252F';
  ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Análisis de Colisión Elástica', width / 2, 50);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // === INFORMACIÓN DE LA SIMULACIÓN ===
  ctx.fillStyle = '#34495E';
  ctx.font = '16px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`m₁ = ${m1} kg  |  m₂ = ${m2} kg  |  Colisión Perfectamente Elástica`, width / 2, 78);

  // === DETERMINAR RANGO DE VELOCIDADES ===
  const maxVelAbs = Math.max(Math.abs(v1i), Math.abs(v1f), Math.abs(v2i), Math.abs(v2f));
  const velRange = Math.ceil(maxVelAbs * 1.3);
  const velStep = velRange / 6;

  // === REJILLA ===
  ctx.lineWidth = 0.8;
  
  // Líneas verticales
  for (let i = 0; i <= 20; i++) {
    let x = marginLeft + (graphWidth * i) / 20;
    ctx.strokeStyle = i % 5 === 0 ? '#CCCCCC' : '#E8E8E8';
    ctx.lineWidth = i % 5 === 0 ? 1.2 : 0.6;
    ctx.beginPath();
    ctx.moveTo(x, marginTop);
    ctx.lineTo(x, marginTop + graphHeight);
    ctx.stroke();
  }

  // Líneas horizontales
  for (let i = 0; i <= 12; i++) {
    let y = marginTop + (graphHeight * i) / 12;
    ctx.strokeStyle = i % 3 === 0 ? '#CCCCCC' : '#E8E8E8';
    ctx.lineWidth = i % 3 === 0 ? 1.2 : 0.6;
    ctx.beginPath();
    ctx.moveTo(marginLeft, y);
    ctx.lineTo(marginLeft + graphWidth, y);
    ctx.stroke();
  }

  // === LÍNEA DE VELOCIDAD CERO ===
  const yZero = marginTop + graphHeight / 2;
  ctx.strokeStyle = '#95A5A6';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.moveTo(marginLeft, yZero);
  ctx.lineTo(marginLeft + graphWidth, yZero);
  ctx.stroke();
  ctx.setLineDash([]);

  // === EJES PRINCIPALES CON FLECHAS ===
  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 3;

  // Eje Y
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop + graphHeight);
  ctx.lineTo(marginLeft, marginTop - 10);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop - 10);
  ctx.lineTo(marginLeft - 6, marginTop + 5);
  ctx.lineTo(marginLeft + 6, marginTop + 5);
  ctx.closePath();
  ctx.fillStyle = '#2C3E50';
  ctx.fill();

  // Eje X
  ctx.beginPath();
  ctx.moveTo(marginLeft, marginTop + graphHeight);
  ctx.lineTo(width - marginRight + 10, marginTop + graphHeight);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(width - marginRight + 10, marginTop + graphHeight);
  ctx.lineTo(width - marginRight + 5, marginTop + graphHeight - 6);
  ctx.lineTo(width - marginRight + 5, marginTop + graphHeight + 6);
  ctx.closePath();
  ctx.fillStyle = '#2C3E50';
  ctx.fill();

  // === ETIQUETAS Y NÚMEROS EJES ===
  ctx.fillStyle = '#34495E';
  ctx.font = '15px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#2C3E50';

  // Números eje Y
  for (let i = 0; i <= 12; i++) {
    if (i % 3 === 0) {
      let y = marginTop + (graphHeight * i) / 12;
      const vel = (velRange - (velRange * 2 * i) / 12).toFixed(1);
      
      ctx.beginPath();
      ctx.moveTo(marginLeft - 12, y);
      ctx.lineTo(marginLeft, y);
      ctx.stroke();
      
      ctx.fillText(vel, marginLeft - 18, y);
    }
  }

  // Números eje X
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= 10; i++) {
    if (i % 2 === 0) {
      let x = marginLeft + (graphWidth * i) / 10;
      const tiempo = (i * 0.2).toFixed(1);
      
      ctx.beginPath();
      ctx.moveTo(x, marginTop + graphHeight);
      ctx.lineTo(x, marginTop + graphHeight + 12);
      ctx.stroke();
      
      ctx.fillText(tiempo, x, marginTop + graphHeight + 18);
    }
  }

  // === TÍTULOS DE EJES ===
  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tiempo (s)', marginLeft + graphWidth / 2, height - 35);

  ctx.save();
  ctx.translate(35, marginTop + graphHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Velocidad (m/s)', 0, 0);
  ctx.restore();

  // === FUNCIÓN PARA ESCALAR VELOCIDADES ===
  function escalarVel(vel) {
    return marginTop + graphHeight / 2 - (vel / velRange) * (graphHeight / 2);
  }

  // === MOMENTOS DE TIEMPO ===
  const t0 = marginLeft + graphWidth * 0.2;
  const tColision = marginLeft + graphWidth * 0.5;
  const t1 = marginLeft + graphWidth * 0.8;

  // === LÍNEA VERTICAL DE COLISIÓN CON EFECTO ===
  ctx.strokeStyle = '#E74C3C';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 6]);
  
  ctx.shadowColor = 'rgba(231, 76, 60, 0.4)';
  ctx.shadowBlur = 8;
  
  ctx.beginPath();
  ctx.moveTo(tColision, marginTop);
  ctx.lineTo(tColision, marginTop + graphHeight);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Etiqueta de colisión con fondo
  ctx.fillStyle = '#E74C3C';
  ctx.strokeStyle = '#C0392B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(tColision - 55, marginTop - 35, 110, 28, 6);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COLISIÓN', tColision, marginTop - 15);

  // === DIBUJAR LÍNEA CARRITO AZUL CON GRADIENTE ===
  const gradientAzul = ctx.createLinearGradient(0, 0, 0, height);
  gradientAzul.addColorStop(0, '#3498DB');
  gradientAzul.addColorStop(1, '#2980B9');
  
  ctx.strokeStyle = gradientAzul;
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(52, 152, 219, 0.5)';
  ctx.shadowBlur = 8;

  // Antes de colisión
  ctx.beginPath();
  ctx.moveTo(t0, escalarVel(v1i));
  ctx.lineTo(tColision, escalarVel(v1i));
  ctx.stroke();

  // Después de colisión
  ctx.beginPath();
  ctx.moveTo(tColision, escalarVel(v1f));
  ctx.lineTo(t1, escalarVel(v1f));
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Puntos con anillo
  ctx.fillStyle = '#3498DB';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  
  const puntosAzul = [
    [t0, escalarVel(v1i)],
    [tColision, escalarVel(v1i)],
    [tColision, escalarVel(v1f)],
    [t1, escalarVel(v1f)]
  ];

  puntosAzul.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });

  // === DIBUJAR LÍNEA CARRITO ROJO CON GRADIENTE ===
  const gradientRojo = ctx.createLinearGradient(0, 0, 0, height);
  gradientRojo.addColorStop(0, '#E74C3C');
  gradientRojo.addColorStop(1, '#C0392B');
  
  ctx.strokeStyle = gradientRojo;
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(231, 76, 60, 0.5)';
  ctx.shadowBlur = 8;

  // Antes de colisión
  ctx.beginPath();
  ctx.moveTo(t0, escalarVel(v2i));
  ctx.lineTo(tColision, escalarVel(v2i));
  ctx.stroke();

  // Después de colisión
  ctx.beginPath();
  ctx.moveTo(tColision, escalarVel(v2f));
  ctx.lineTo(t1, escalarVel(v2f));
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Puntos con anillo
  ctx.fillStyle = '#E74C3C';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  
  const puntosRojo = [
    [t0, escalarVel(v2i)],
    [tColision, escalarVel(v2i)],
    [tColision, escalarVel(v2f)],
    [t1, escalarVel(v2f)]
  ];
  
  puntosRojo.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });

  // === LEYENDA CON SOMBRA ===
  const legendX = width - marginRight - 220;
  const legendY = marginTop + 20;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#BDC3C7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(legendX, legendY, 210, 160, 10);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Título de leyenda
  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Datos del Sistema', legendX + 15, legendY + 25);

  // Línea separadora
  ctx.strokeStyle = '#ECF0F1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(legendX + 15, legendY + 35);
  ctx.lineTo(legendX + 195, legendY + 35);
  ctx.stroke();

  // Carrito Azul
  ctx.strokeStyle = '#3498DB';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(legendX + 15, legendY + 55);
  ctx.lineTo(legendX + 50, legendY + 55);
  ctx.stroke();
  
  ctx.fillStyle = '#3498DB';
  ctx.beginPath();
  ctx.arc(legendX + 32.5, legendY + 55, 5, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Carrito Azul', legendX + 60, legendY + 60);
  
  ctx.font = '13px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#5A6C7D';
  ctx.fillText(`Inicial: ${v1i.toFixed(2)} m/s`, legendX + 25, legendY + 78);
  ctx.fillText(`Final: ${v1f.toFixed(2)} m/s`, legendX + 25, legendY + 95);

  // Carrito Rojo
  ctx.strokeStyle = '#E74C3C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(legendX + 15, legendY + 115);
  ctx.lineTo(legendX + 50, legendY + 115);
  ctx.stroke();
  
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.arc(legendX + 32.5, legendY + 115, 5, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Carrito Rojo', legendX + 60, legendY + 120);
  
  ctx.font = '13px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#5A6C7D';
  ctx.fillText(`Inicial: ${v2i.toFixed(2)} m/s`, legendX + 25, legendY + 138);
  ctx.fillText(`Final: ${v2f.toFixed(2)} m/s`, legendX + 25, legendY + 155);

  // === PANEL DE CONSERVACIÓN ===
  const infoX = marginLeft + 20;
  const infoY = marginTop + graphHeight - 100;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#27AE60';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(infoX, infoY, 280, 95, 10);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const p1i = m1 * v1i;
  const p2i = m2 * v2i;
  const p1f = m1 * v1f;
  const p2f = m2 * v2f;
  const pTotal = p1i + p2i;
  const pTotalF = p1f + p2f;
  
  const Ek1i = 0.5 * m1 * v1i * v1i;
  const Ek2i = 0.5 * m2 * v2i * v2i;
  const Ek1f = 0.5 * m1 * v1f * v1f;
  const Ek2f = 0.5 * m2 * v2f * v2f;
  const EkTotal = Ek1i + Ek2i;
  const EkTotalF = Ek1f + Ek2f;
  
  const conservaMomento = Math.abs(pTotal) < 0.001 ? 100 : ((pTotalF/pTotal)*100);
  const conservaEnergia = Math.abs(EkTotal) < 0.001 ? 100 : ((EkTotalF/EkTotal)*100);
  
  ctx.fillStyle = '#27AE60';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('✓ Leyes de Conservación', infoX + 15, infoY + 25);
  
  ctx.strokeStyle = '#ECF0F1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(infoX + 15, infoY + 33);
  ctx.lineTo(infoX + 265, infoY + 33);
  ctx.stroke();
  
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#2C3E50';
  ctx.fillText(`Momento lineal:`, infoX + 20, infoY + 53);
  ctx.fillText(`Energía cinética:`, infoX + 20, infoY + 75);
  
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = conservaMomento >= 99 ? '#27AE60' : '#E67E22';
  ctx.textAlign = 'right';
  ctx.fillText(`${conservaMomento.toFixed(2)}%`, infoX + 260, infoY + 53);
  
  ctx.fillStyle = conservaEnergia >= 99 ? '#27AE60' : '#E67E22';
  ctx.fillText(`${conservaEnergia.toFixed(2)}%`, infoX + 260, infoY + 75);

  // === MARCADORES DE TIEMPO ===
  ctx.textAlign = 'center';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  
  // t0
  ctx.fillStyle = '#7F8C8D';
  ctx.fillText('t₀', t0, marginTop + graphHeight + 40);
  
  // t final
  ctx.fillText('tf', t1, marginTop + graphHeight + 40);

  // === LOGO PROFESIONAL ===
  ctx.fillStyle = '#3498DB';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('⚛ PhysicsLab Pro', 20, 25);
  
  ctx.fillStyle = '#95A5A6';
  ctx.font = '12px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Simulación de Colisión Elástica', 20, 45);

  // Actualizar textura inmediatamente
  actualizarTextura();
}

// === FUNCIÓN PARA ACTUALIZAR TEXTURA EN A-FRAME ===
function actualizarTextura() {
  const canvas = document.getElementById("graficoCanvas");
  if (!canvas) {
    console.error("Canvas no encontrado");
    return;
  }
  
  const planoGrafico = document.querySelector('a-plane[material*="graficoCanvas"]');
  
  if (!planoGrafico) {
    console.warn('No se encontró el plano del gráfico');
    return;
  }

  // Método CORRECTO para A-Frame: Actualizar el asset y forzar actualización
  const assets = document.querySelector('a-assets');
  const existingCanvasAsset = document.querySelector('#graficoCanvas');
  
  if (existingCanvasAsset) {
    assets.removeChild(existingCanvasAsset);
  }

  // Crear nuevo elemento canvas en assets
  const newCanvasAsset = document.createElement('canvas');
  newCanvasAsset.id = 'graficoCanvas';
  newCanvasAsset.width = 1200;
  newCanvasAsset.height = 600;
  
  // Copiar el contenido del canvas actual al nuevo
  const newCtx = newCanvasAsset.getContext('2d');
  newCtx.drawImage(canvas, 0, 0);
  
  assets.appendChild(newCanvasAsset);

  // Forzar la actualización del material
  setTimeout(() => {
    planoGrafico.setAttribute('material', {
      shader: 'flat',
      src: '#graficoCanvas'
    });
    
    // Método alternativo: usar el sistema de materiales de A-Frame directamente
    const materialSystem = planoGrafico.sceneEl.systems.material;
    if (materialSystem) {
      materialSystem.updateMaterials(planoGrafico);
    }
  }, 100);
}

// Polyfill para roundRect si no existe
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  };
}