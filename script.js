// ======================================
// CONFIGURACIÓN DEL CONSULTORIO
// ======================================

const HORA_INICIO = 8;
const HORA_FIN = 18;
const INTERVALO = 30;

// ======================================
// ELEMENTOS DEL HTML
// ======================================

const nombreInput = document.getElementById("nombre");
const fechaInput = document.getElementById("fecha");
const horarioSelect = document.getElementById("horario");
const especialidadSelect = document.getElementById("especialidad");
const guardarBtn = document.getElementById("guardarTurno");
const mensaje = document.getElementById("mensaje");
const listaTurnos = document.getElementById("listaTurnos");
const sinTurnos = document.getElementById("sinTurnos");

// ======================================
// ARRAY DE TURNOS
// ======================================

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

// ======================================
// FECHA DE HOY
// ======================================

function obtenerFechaHoy() {
    const hoy = new Date();

    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}

// La fecha mínima es hoy
fechaInput.min = obtenerFechaHoy();

// Coloca automáticamente hoy
fechaInput.value = obtenerFechaHoy();

// ======================================
// GENERAR HORARIOS CADA 30 MINUTOS
// ======================================

function generarHorarios() {

    horarioSelect.innerHTML = `
        <option value="">Seleccionar horario</option>
    `;

    for (
        let minutos = HORA_INICIO * 60;
        minutos < HORA_FIN * 60;
        minutos += INTERVALO
    ) {

        const hora = Math.floor(minutos / 60);
        const minuto = minutos % 60;

        const horaTexto = String(hora).padStart(2, "0");
        const minutoTexto = String(minuto).padStart(2, "0");

        const horario = `${horaTexto}:${minutoTexto}`;

        const option = document.createElement("option");

        option.value = horario;
        option.textContent = horario;

        horarioSelect.appendChild(option);
    }
}

generarHorarios();

// ======================================
// MOSTRAR MENSAJES
// ======================================

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    mensaje.className =
        tipo === "error"
            ? "mensaje-error"
            : "mensaje-exito";

    setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "";
    }, 3000);
}

// ======================================
// GUARDAR TURNOS EN LOCALSTORAGE
// ======================================

function guardarEnLocalStorage() {
    localStorage.setItem("turnos", JSON.stringify(turnos));
}

// ======================================
// VERIFICAR SI UN TURNO ESTÁ OCUPADO
// ======================================

function turnoOcupado(fecha, horario) {

    return turnos.some(turno =>
        turno.fecha === fecha &&
        turno.horario === horario
    );
}

// ======================================
// GUARDAR TURNO
// ======================================

guardarBtn.addEventListener("click", function () {

    const nombre = nombreInput.value.trim();
    const fecha = fechaInput.value;
    const horario = horarioSelect.value;
    const especialidad = especialidadSelect.value;

    // Validar nombre
    if (nombre === "") {
        mostrarMensaje(
            "Debe ingresar el nombre del paciente.",
            "error"
        );
        return;
    }

    // Validar fecha
    if (fecha === "") {
        mostrarMensaje(
            "Debe seleccionar una fecha.",
            "error"
        );
        return;
    }

    // Verificar que la fecha no sea anterior a hoy
    const hoy = obtenerFechaHoy();

    if (fecha < hoy) {
        mostrarMensaje(
            "No se pueden reservar turnos en fechas anteriores a hoy.",
            "error"
        );
        return;
    }

    // Validar horario
    if (horario === "") {
        mostrarMensaje(
            "Debe seleccionar un horario.",
            "error"
        );
        return;
    }

    // Validar especialidad
    if (especialidad === "") {
        mostrarMensaje(
            "Debe seleccionar una especialidad.",
            "error"
        );
        return;
    }

    // Verificar si el horario ya está ocupado
    if (turnoOcupado(fecha, horario)) {
        mostrarMensaje(
            "Ese horario ya está ocupado.",
            "error"
        );
        return;
    }

    // Crear turno
    const nuevoTurno = {
        id: Date.now(),
        nombre: nombre,
        fecha: fecha,
        horario: horario,
        especialidad: especialidad
    };

    turnos.push(nuevoTurno);

    guardarEnLocalStorage();

    mostrarTurnos();

    mostrarMensaje(
        "Turno guardado correctamente.",
        "exito"
    );

    // Limpiar algunos campos
    nombreInput.value = "";
    horarioSelect.value = "";
    especialidadSelect.value = "";
});

// ======================================
// MOSTRAR LOS TURNOS
// ======================================

function mostrarTurnos() {

    listaTurnos.innerHTML = "";

    if (turnos.length === 0) {
        sinTurnos.style.display = "block";
        return;
    }

    sinTurnos.style.display = "none";

    // Ordenar por fecha y horario
    turnos.sort((a, b) => {

        const fechaA = `${a.fecha} ${a.horario}`;
        const fechaB = `${b.fecha} ${b.horario}`;

        return fechaA.localeCompare(fechaB);
    });

    turnos.forEach(turno => {

        const div = document.createElement("div");
        div.classList.add("turno");

        div.innerHTML = `
            <div class="info-turno">
                <h3>${turno.nombre}</h3>
                <p><strong>Fecha:</strong> ${formatearFecha(turno.fecha)}</p>
                <p><strong>Hora:</strong> ${turno.horario}</p>
                <p><strong>Especialidad:</strong> ${turno.especialidad}</p>
            </div>

            <button 
                class="eliminar"
                onclick="eliminarTurno(${turno.id})"
            >
                Eliminar
            </button>
        `;

        listaTurnos.appendChild(div);
    });
}

// ======================================
// FORMATEAR FECHA
// ======================================

function formatearFecha(fecha) {

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ======================================
// ELIMINAR TURNO
// ======================================

function eliminarTurno(id) {

    const confirmar = confirm(
        "¿Está seguro de que desea eliminar este turno?"
    );

    if (!confirmar) {
        return;
    }

    turnos = turnos.filter(turno => turno.id !== id);

    guardarEnLocalStorage();

    mostrarTurnos();

    mostrarMensaje(
        "Turno eliminado correctamente.",
        "exito"
    );
}

// ======================================
// MOSTRAR TURNOS AL CARGAR LA PÁGINA
// ======================================

mostrarTurnos();