// ======================================
// DOGMY 2.5 - MULTI-PASEADOR
// PARTE 1/3
// ======================================

// ---------- DATOS INICIALES ----------
function inicializarDatos() {
    if (!localStorage.getItem("paseadores")) {
        const paseadoresIniciales = [
            { id: 1, nombre: "Diego", telefono: "5551234567", usuario: "Diego", contrasena: "12345", activo: false, lat: null, lon: null, horaInicio: null }
        ];
        localStorage.setItem("paseadores", JSON.stringify(paseadoresIniciales));
    }
}

inicializarDatos();

// ======================================
// LOGIN UNIFICADO
// ======================================
const btnIngresar = document.getElementById("btnIngresar");
if (btnIngresar) {
    btnIngresar.addEventListener("click", function () {
        const usuario = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();

        // ADMIN
        if (usuario === "admin" && contrasena === "1234") {
            localStorage.setItem("sesionActiva", "admin");
            localStorage.setItem("usuarioActual", "admin");
            window.location.href = "admin.html";
            return;
        }

        // PASEADOR
        const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
        const paseador = paseadores.find(p => p.usuario === usuario && p.contrasena === contrasena);
        if (paseador) {
            localStorage.setItem("sesionActiva", "paseador");
            localStorage.setItem("paseadorActual", JSON.stringify(paseador));
            localStorage.setItem("usuarioActual", paseador.usuario);
            window.location.href = "paseador.html";
            return;
        }

        // CLIENTE
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const cliente = clientes.find(c => c.usuario === usuario && c.contrasena === contrasena);
        if (cliente) {
            localStorage.setItem("sesionActiva", "cliente");
            localStorage.setItem("clienteActual", JSON.stringify(cliente));
            localStorage.setItem("usuarioActual", cliente.usuario);
            window.location.href = "cliente.html";
            return;
        }

        alert("❌ Usuario o contraseña incorrectos.");
    });
}

// ======================================
// PANEL ADMINISTRADOR
// ======================================
if (document.getElementById("resumenAdmin")) {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const perros = JSON.parse(localStorage.getItem("perros")) || [];
    const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
    const paseosActivos = paseadores.filter(p => p.activo).length;

    document.getElementById("totalPerros").textContent = perros.length;
    document.getElementById("totalClientes").textContent = clientes.length;
    document.getElementById("totalPaseadores").textContent = paseadores.length;
    document.getElementById("paseosActivos").textContent = paseosActivos;

    const listaPaseadores = document.getElementById("listaPaseadoresActivos");
    const activos = paseadores.filter(p => p.activo);

    if (activos.length === 0) {
        listaPaseadores.innerHTML = "<p>🟢 Ningún paseo en curso.</p>";
    } else {
        listaPaseadores.innerHTML = activos.map(p => {
            const tiempo = p.horaInicio ? calcularTiempo(p.horaInicio) : "0:00";
            return `
            <div style="background:#fff3cd;padding:10px;border-radius:8px;margin-bottom:8px;text-align:left;">
                <p><b>🚶 ${p.nombre}</b> - 🟡 En paseo</p>
                <p>⏱️ Tiempo: ${tiempo}</p>
                <p>📍 ${p.lat ? `Lat: ${p.lat.toFixed(4)}, Lon: ${p.lon.toFixed(4)}` : "Ubicación no disponible"}</p>
            </div>`;
        }).join("");
    }

    setInterval(() => location.reload(), 10000);
}

function calcularTiempo(horaInicio) {
    const inicio = new Date(horaInicio);
    const ahora = new Date();
    const diff = Math.floor((ahora - inicio) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ======================================
// PANEL PASEADOR - CON CRONOMETRO
// ======================================
if (document.getElementById("nombrePaseador")) {
    const paseadorActual = JSON.parse(localStorage.getItem("paseadorActual"));
    if (!paseadorActual) {
        window.location.href = "index.html";
    } else {
        document.getElementById("nombrePaseador").textContent = `Hola, ${paseadorActual.nombre}`;
    }

    const btnPaseo = document.getElementById("btnPaseo");
    const estado = document.getElementById("estado");
    const cronometroBox = document.getElementById("cronometroBox");
    const cronometroDisplay = document.getElementById("cronometro");

    let intervaloCronometro;
    const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
    const miIndex = paseadores.findIndex(p => p.id === paseadorActual.id);
    const miPaseador = paseadores[miIndex];

    if (miPaseador && miPaseador.activo) {
        btnPaseo.innerHTML = "⏹ Finalizar Paseo";
        estado.innerHTML = "🟡 Paseo en curso";
        cronometroBox.style.display = "block";
        iniciarCronometro(miPaseador.horaInicio);
    }

    btnPaseo.addEventListener("click", function () {
        const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
        const index = paseadores.findIndex(p => p.id === paseadorActual.id);

        if (btnPaseo.innerHTML.includes("Iniciar")) {
            btnPaseo.innerHTML = "⏹ Finalizar Paseo";
            estado.innerHTML = "🟡 Paseo en curso";
            cronometroBox.style.display = "block";

            const horaInicio = new Date().toISOString();
            paseadores[index].activo = true;
            paseadores[index].horaInicio = horaInicio;
            localStorage.setItem("paseadores", JSON.stringify(paseadores));
            localStorage.setItem("horaInicioPaseo", horaInicio);

            iniciarCronometro(horaInicio);
            alert("🐶 Paseo iniciado. El cliente puede ver tu ubicación.");

        } else {
            btnPaseo.innerHTML = "🐶 Iniciar Paseo";
            estado.innerHTML = "🟢 Disponible";
            cronometroBox.style.display = "none";

            paseadores[index].activo = false;
            paseadores[index].horaInicio = null;
            paseadores[index].lat = null;
            paseadores[index].lon = null;
            localStorage.setItem("paseadores", JSON.stringify(paseadores));
            localStorage.removeItem("horaInicioPaseo");

            if (intervaloCronometro) clearInterval(intervaloCronometro);
            cronometroDisplay.textContent = "00:00:00";

            alert("✅ Paseo finalizado.");
        }
    });

    function iniciarCronometro(horaInicio) {
        if (intervaloCronometro) clearInterval(intervaloCronometro);

        function actualizar() {
            const inicio = new Date(horaInicio);
            const ahora = new Date();
            const diff = Math.floor((ahora - inicio) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            cronometroDisplay.textContent =
                `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }

        actualizar();
        intervaloCronometro = setInterval(actualizar, 1000);
    }
}
// ======================================
// DOGMY 2.5 - PARTE 2/3
// ======================================

// ======================================
// REGISTRO UNIFICADO (Paseador o Cliente+Perro)
// ======================================
const guardarRegistro = document.getElementById("guardarRegistro");
if (guardarRegistro) {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo") || "cliente";

    const titulo = document.getElementById("tituloRegistro");
    const subtitulo = document.getElementById("subtituloRegistro");
    const seccionPaseador = document.getElementById("seccionPaseador");
    const seccionCliente = document.getElementById("seccionCliente");
    const btnVolverAdmin = document.getElementById("btnVolverAdmin");
    const btnVolverPaseador = document.getElementById("btnVolverPaseador");

    // Cargar paseadores en el select
    const selectPaseador = document.getElementById("paseadorAsignado");
    if (selectPaseador) {
        const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
        paseadores.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.nombre;
            selectPaseador.appendChild(opt);
        });
    }

    if (tipo === "paseador") {
        titulo.textContent = "➕ Registrar Paseador";
        subtitulo.textContent = "Nuevo paseador";
        seccionPaseador.style.display = "block";
        seccionCliente.style.display = "none";
        btnVolverAdmin.style.display = "inline-block";
        btnVolverPaseador.style.display = "none";
    } else {
        titulo.textContent = "➕ Registrar Cliente + Perro";
        subtitulo.textContent = "Nuevo cliente y su mascota";
        seccionPaseador.style.display = "none";
        seccionCliente.style.display = "block";
        btnVolverAdmin.style.display = "inline-block";
        btnVolverPaseador.style.display = "none";
    }

    guardarRegistro.addEventListener("click", function () {
        if (tipo === "paseador") {
            // GUARDAR PASEADOR
            const paseador = {
                id: Date.now(),
                nombre: document.getElementById("nombrePaseadorReg").value.trim(),
                telefono: document.getElementById("telefonoPaseador").value.trim(),
                usuario: document.getElementById("usuarioPaseador").value.trim(),
                contrasena: document.getElementById("contrasenaPaseador").value.trim(),
                activo: false,
                lat: null,
                lon: null,
                horaInicio: null
            };

            if (!paseador.nombre || !paseador.telefono || !paseador.usuario || !paseador.contrasena) {
                alert("❌ Complete todos los datos del paseador.");
                return;
            }

            const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
            paseadores.push(paseador);
            localStorage.setItem("paseadores", JSON.stringify(paseadores));

            alert("✅ Paseador registrado: " + paseador.usuario);
            window.location.href = "admin.html";

        } else {
            // GUARDAR CLIENTE + PERRO
            const cliente = {
                id: Date.now(),
                nombre: document.getElementById("nombre").value.trim(),
                telefono: document.getElementById("telefono").value.trim(),
                direccion: document.getElementById("direccion").value.trim(),
                usuario: document.getElementById("nuevoUsuario").value.trim(),
                contrasena: document.getElementById("nuevaContrasena").value.trim()
            };

            if (!cliente.nombre || !cliente.telefono || !cliente.direccion || !cliente.usuario || !cliente.contrasena) {
                alert("❌ Complete todos los datos del cliente.");
                return;
            }

            const dias = [];
            if (document.getElementById("lunes").checked) dias.push("Lunes");
            if (document.getElementById("martes").checked) dias.push("Martes");
            if (document.getElementById("miercoles").checked) dias.push("Miércoles");
            if (document.getElementById("jueves").checked) dias.push("Jueves");
            if (document.getElementById("viernes").checked) dias.push("Viernes");
            if (document.getElementById("sabado").checked) dias.push("Sábado");
            if (document.getElementById("domingo").checked) dias.push("Domingo");

            const perro = {
                id: Date.now() + 1,
                clienteId: cliente.id,
                cliente: cliente.nombre,
                paseadorId: document.getElementById("paseadorAsignado").value || null,
                nombre: document.getElementById("nombrePerro").value.trim(),
                raza: document.getElementById("raza").value.trim(),
                edad: document.getElementById("edad").value.trim(),
                color: document.getElementById("color").value.trim(),
                tamano: document.getElementById("tamano").value.trim(),
                observaciones: document.getElementById("observaciones").value.trim(),
                dias: dias,
                hora: document.getElementById("hora").value
            };

            if (!perro.nombre || !perro.raza || !perro.edad) {
                alert("❌ Complete los datos del perro (nombre, raza, edad).");
                return;
            }

            const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
            clientes.push(cliente);
            localStorage.setItem("clientes", JSON.stringify(clientes));

            const perros = JSON.parse(localStorage.getItem("perros")) || [];
            perros.push(perro);
            localStorage.setItem("perros", JSON.stringify(perros));

            alert("✅ Cliente y perro registrados.");
            window.location.href = "lista_clientes.html";
        }
    });
}

// ======================================
// AGENDA - Filtrar por paseador
// ======================================
const listaAgenda = document.getElementById("listaAgenda");
if (listaAgenda) {
    const perros = JSON.parse(localStorage.getItem("perros")) || [];
    const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];

    const filtroPaseador = document.getElementById("filtroPaseador");
    if (filtroPaseador) {
        paseadores.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.nombre;
            filtroPaseador.appendChild(opt);
        });
    }

    function mostrarAgenda(filtroId) {
        listaAgenda.innerHTML = "";
        const filtrados = filtroId ? perros.filter(p => p.paseadorId == filtroId) : perros;

        if (filtrados.length === 0) {
            listaAgenda.innerHTML = "<p>🐶 Sin paseos registrados.</p>";
            return;
        }

        filtrados.forEach(function (perro) {
            const paseador = paseadores.find(p => p.id == perro.paseadorId);
            const diasTexto = perro.dias && perro.dias.length > 0 ? perro.dias.join(", ") : "Sin asignar";
            const horaTexto = perro.hora && perro.hora !== "" ? perro.hora : "Sin horario";

            listaAgenda.innerHTML += `
            <div class="tarjeta" style="margin-bottom:15px;text-align:left;">
                <h3>🐶 ${perro.nombre}</h3>
                <p><b>👤 Cliente:</b> ${perro.cliente}</p>
                <p><b>🐕 Raza:</b> ${perro.raza}</p>
                <p><b>🎂 Edad:</b> ${perro.edad} años</p>
                <p><b>📅 Días:</b> ${diasTexto}</p>
                <p><b>🕒 Hora:</b> ${horaTexto}</p>
                <p><b>🚶 Paseador:</b> ${paseador ? paseador.nombre : "Sin asignar"}</p>
                <hr>
            </div>`;
        });
    }

    mostrarAgenda(null);

    window.filtrarAgenda = function () {
        mostrarAgenda(filtroPaseador.value);
    };
}

// ======================================
// LISTA DE CLIENTES
// ======================================
const listaClientes = document.getElementById("listaClientes");
if (listaClientes) {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const perros = JSON.parse(localStorage.getItem("perros")) || [];

    listaClientes.innerHTML = "";

    if (clientes.length === 0) {
        listaClientes.innerHTML = `<p>👥 No hay clientes registrados.</p>`;
    } else {
        clientes.forEach(function (cliente) {
            const perrosCliente = perros.filter(p => p.clienteId === cliente.id);

            listaClientes.innerHTML += `
            <div class="tarjeta" style="margin-bottom:15px;text-align:left;">
                <h3>👤 ${cliente.nombre}</h3>
                <p>📞 ${cliente.telefono}</p>
                <p>📍 ${cliente.direccion}</p>
                <p>👤 Usuario: ${cliente.usuario}</p>
                <button onclick="verPerrosCliente(${cliente.id})" style="margin-top:8px;">
                    🐶 Ver Perros (${perrosCliente.length})
                </button>
                <button onclick="editarCliente(${cliente.id})" style="background:#ff9800;">
                    ✏️ Editar
                </button>
                <button onclick="eliminarCliente(${cliente.id})" style="background:#d32f2f;">
                    🔴 Dar de baja
                </button>
            </div>`;
        });
    }
}
// ======================================
// DOGMY 2.5 - PARTE 3/3 (FINAL)
// ======================================

// ======================================
// FUNCIONES DE CLIENTES
// ======================================
function verPerrosCliente(clienteId) {
    const perros = JSON.parse(localStorage.getItem("perros")) || [];
    const perrosCliente = perros.filter(p => p.clienteId === clienteId);

    if (perrosCliente.length === 0) {
        alert("Este cliente no tiene perros registrados.");
        return;
    }

    let mensaje = "🐶 Perros registrados:\n\n";
    perrosCliente.forEach(p => {
        mensaje += "• " + p.nombre + " (" + p.raza + ", " + p.edad + " años)\n";
        mensaje += "  Días: " + (p.dias.join(", ") || "Ninguno") + " | Hora: " + (p.hora || "Sin hora") + "\n\n";
    });
    alert(mensaje);
}

function editarCliente(id) {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    const nuevoNombre = prompt("Nuevo nombre:", cliente.nombre);
    if (nuevoNombre === null) return;
    const nuevoTelefono = prompt("Nuevo teléfono:", cliente.telefono);
    const nuevaDireccion = prompt("Nueva dirección:", cliente.direccion);

    if (nuevoNombre) cliente.nombre = nuevoNombre.trim();
    if (nuevoTelefono) cliente.telefono = nuevoTelefono.trim();
    if (nuevaDireccion) cliente.direccion = nuevaDireccion.trim();

    localStorage.setItem("clientes", JSON.stringify(clientes));
    alert("✅ Cliente actualizado.");
    location.reload();
}

function eliminarCliente(id) {
    if (!confirm("¿Eliminar este cliente y todos sus perros?")) return;

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const cliente = clientes.find(c => c.id === id);
    clientes = clientes.filter(c => c.id !== id);
    localStorage.setItem("clientes", JSON.stringify(clientes));

    let perros = JSON.parse(localStorage.getItem("perros")) || [];
    perros = perros.filter(p => p.clienteId !== id);
    localStorage.setItem("perros", JSON.stringify(perros));

    alert("✅ Cliente y sus perros eliminados.");
    location.reload();
}

// ======================================
// PANEL DEL CLIENTE - RASTREO
// ======================================
const nombreCliente = document.getElementById("nombreCliente");
if (nombreCliente) {
    const clienteActual = JSON.parse(localStorage.getItem("clienteActual"));
    if (!clienteActual) {
        window.location.href = "index.html";
    } else {
        nombreCliente.textContent = "Hola, " + clienteActual.nombre;

        const misDatos = document.getElementById("misDatos");
        misDatos.innerHTML = `
            <p><b>📞 Teléfono:</b> ${clienteActual.telefono}</p>
            <p><b>📍 Dirección:</b> ${clienteActual.direccion}</p>
            <p><b>👤 Usuario:</b> ${clienteActual.usuario}</p>
        `;

        const perros = JSON.parse(localStorage.getItem("perros")) || [];
        const misPerrosLista = perros.filter(p => p.clienteId === clienteActual.id);
        const misPerros = document.getElementById("misPerros");

        if (misPerrosLista.length === 0) {
            misPerros.innerHTML = "<p>No tienes perros registrados.</p>";
        } else {
            misPerros.innerHTML = "";
            misPerrosLista.forEach(p => {
                misPerros.innerHTML += `
                <div style="background:#f5f5f5;padding:10px;border-radius:8px;margin-bottom:8px;">
                    <p><b>🐶 ${p.nombre}</b> (${p.raza})</p>
                    <p>Edad: ${p.edad} años | Tamaño: ${p.tamano || "N/A"}</p>
                    <p>📅 ${p.dias.join(", ") || "Sin días"} | 🕒 ${p.hora || "Sin hora"}</p>
                </div>`;
            });
        }

        actualizarEstadoCliente();
        setInterval(actualizarEstadoCliente, 5000);
    }
}

function actualizarEstadoCliente() {
    const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
    const perros = JSON.parse(localStorage.getItem("perros")) || [];
    const clienteActual = JSON.parse(localStorage.getItem("clienteActual"));

    const misPerros = perros.filter(p => p.clienteId === clienteActual.id);
    const paseadorAsignado = misPerros.length > 0 ? misPerros[0].paseadorId : null;
    const paseadorActivo = paseadores.find(p => p.id == paseadorAsignado && p.activo);

    const estadoPaseo = document.getElementById("estadoPaseo");
    const infoUbicacion = document.getElementById("infoUbicacion");
    const mapaCliente = document.getElementById("mapaCliente");

    if (paseadorActivo) {
        estadoPaseo.className = "estado-paseo en-curso";
        estadoPaseo.innerHTML = "🟡 ¡Tu perro está en paseo!";
        infoUbicacion.innerHTML = "📍 Paseador: <b>" + paseadorActivo.nombre + "</b><br>Compartiendo ubicación...";
        mapaCliente.innerHTML = "🗺️<br><small>Rastreando...</small>";

        const tiempo = paseadorActivo.horaInicio ? calcularTiempo(paseadorActivo.horaInicio) : "00:00:00";
        infoUbicacion.innerHTML += "<br>⏱️ Tiempo: " + tiempo;

        if (paseadorActivo.lat && paseadorActivo.lon) {
            infoUbicacion.innerHTML += "<br>📍 Coordenadas: " + paseadorActivo.lat.toFixed(4) + ", " + paseadorActivo.lon.toFixed(4);
        }
    } else {
        estadoPaseo.className = "estado-paseo disponible";
        estadoPaseo.innerHTML = "🟢 Tu perro está en casa";
        infoUbicacion.innerHTML = "Esperando inicio de paseo...";
        mapaCliente.innerHTML = "🏠";
    }
}

// ======================================
// FUNCIONES ADICIONALES DEL PASEADOR
// ======================================
function compartirUbicacion() {
    if (!navigator.geolocation) {
        alert("❌ Tu dispositivo no soporta geolocalización.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const paseadores = JSON.parse(localStorage.getItem("paseadores")) || [];
            const paseadorActual = JSON.parse(localStorage.getItem("paseadorActual"));
            const index = paseadores.findIndex(p => p.id === paseadorActual.id);

            if (index !== -1) {
                paseadores[index].lat = lat;
                paseadores[index].lon = lon;
                localStorage.setItem("paseadores", JSON.stringify(paseadores));
            }

            alert("📍 Ubicación actualizada:\nLat: " + lat.toFixed(4) + "\nLon: " + lon.toFixed(4));
        },
        function () {
            alert("❌ No se pudo obtener la ubicación. Verifica los permisos.");
        }
    );
}

function tomarFoto() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const fotos = JSON.parse(localStorage.getItem("fotosPaseo")) || [];
                fotos.push({
                    imagen: event.target.result,
                    fecha: new Date().toISOString(),
                    paseador: JSON.parse(localStorage.getItem("paseadorActual")).nombre
                });
                localStorage.setItem("fotosPaseo", JSON.stringify(fotos));
                alert("📷 Foto guardada del paseo.");
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function verHistorial() {
    const fotos = JSON.parse(localStorage.getItem("fotosPaseo")) || [];
    const paseadorActual = JSON.parse(localStorage.getItem("paseadorActual"));
    const misFotos = fotos.filter(f => f.paseador === paseadorActual.nombre);

    if (misFotos.length === 0) {
        alert("📊 No hay fotos en tu historial.");
        return;
    }
    alert("📊 Tu historial: " + misFotos.length + " foto(s) guardada(s).");
}