// Configuración de Firebase (Versión Compatible con los SDKs de tus HTML)
const firebaseConfig = {
    apiKey: "AIzaSyA6uMhHPtXKAqCbtaQgmOAKMXSBNhrkKUg",
    authDomain: "oxfordpropedeutico-hub.firebaseapp.com",
    projectId: "oxfordpropedeutico-hub",
    storageBucket: "oxfordpropedeutico-hub.firebasestorage.app",
    messagingSenderId: "146352999077",
    appId: "1:146352999077:web:cd873f77a45cc2a4fa9b4c",
    measurementId: "G-V16SWN1TWZ"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
// Banco de reactivos oficiales estilo CENEVAL
const bancoPreguntasCeneval = {
    "Biología EXANI-I": [
        {
            pregunta: "¿Cuál es la unidad estructural y funcional básica de todos los organismos vivos?",
            opciones: ["A) El tejido", "B) La célula", "C) El ADN", "D) El órgano"],
            correcta: 1,
            retro: "La célula es la unidad de origen, estructura y función de todos los seres vivos."
        },
        {
            pregunta: "¿Qué organelo celular se encarga de la respiración celular y la producción de energía (ATP)?",
            opciones: ["A) Ribosoma", "B) Cloroplasto", "C) Mitocondria", "D) Aparato de Golgi"],
            correcta: 2,
            retro: "Las mitocondrias son los centros energéticos de la célula donde se produce el ATP."
        }
    ],
    "Física EXANI-I": [
        {
            pregunta: "De acuerdo con la primera ley de Newton, un cuerpo permanece en reposo o movimiento rectilíneo uniforme a menos que...",
            opciones: ["A) Su masa sea cero", "B) Se aplique una fuerza externa neta sobre él", "C) Su velocidad disminuya por la gravedad", "D) Su energía cinética aumente"],
            correcta: 1,
            retro: "La inercia establece que un objeto requiere de una fuerza externa neta para cambiar su estado de movimiento."
        },
        {
            pregunta: "¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional (SI)?",
            opciones: ["A) Joule", "B) Watt", "C) Newton", "D) Pascal"],
            correcta: 2,
            retro: "El Newton (N) es la unidad de fuerza derivada en el SI."
        }
    ],
    "Química EXANI-I": [
        {
            pregunta: "¿Cómo se le llama a la columna vertical en la tabla periódica de los elementos?",
            opciones: ["A) Periodo", "B) Grupo o Familia", "C) Órbita", "D) Bloque"],
            correcta: 1,
            retro: "Los grupos o familias corresponden a las columnas verticales y comparten propiedades químicas similares."
        }
    ],
    "general": [
        {
            pregunta: "Pregunta clave de práctica estándar estilo CENEVAL para este módulo de estudio:",
            opciones: ["A) Opción de análisis lógico A", "B) Opción de resolución teórica B", "C) Opción de aplicación práctica C", "D) Opción de conclusión D"],
            correcta: 2,
            retro: "En el examen CENEVAL se evalúa la aplicación del conocimiento a situaciones analíticas."
        }
    ]
};

// Login Logic
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        try {
            
            const userCredential = await auth.signInWithEmailAndPassword(email, pass);
            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            
            if (userDoc.exists) {
                const role = userDoc.data().role;
                if (role === 'admin') window.location.href = 'admin.html';
                else if (role === 'profesor') window.location.href = 'profesor.html';
                else window.location.href = 'alumno.html';
            } else {
                errorEl.textContent = "Usuario sin rol asignado en la base de datos.";
                errorEl.classList.remove('hidden');
            }
        } catch (error) {
            errorEl.textContent = "Error al iniciar sesión: " + error.message;
            errorEl.classList.remove('hidden');
        }
    });
}

// Logout Logic
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await auth.signOut();
        window.location.href = 'index.html';
    });
}

// Admin Register User
const registerUserForm = document.getElementById('register-user-form');
if (registerUserForm) {
    registerUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('new-user-email').value;
        const pass = document.getElementById('new-user-pass').value;
        const role = document.getElementById('new-user-role').value;

        try {
            // Nota: En producción real se usa Firebase Admin SDK, aquí registramos y guardamos en Firestore
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            await db.collection('users').doc(res.user.uid).set({
                email: email,
                role: role,
                createdAt: new Date()
            });
            document.getElementById('invite-link-box').classList.remove('hidden');
            registerUserForm.reset();
            cargarUsuariosAdmin();
        } catch (err) {
            alert("Error al registrar: " + err.message);
        }
    });
}

// Cargar usuarios en Admin
async function cargarUsuariosAdmin() {
    const tbody = document.getElementById('users-table-body');
    const totalProf = document.getElementById('total-profesores');
    const totalAlum = document.getElementById('total-alumnos');
    if (!tbody) return;

    tbody.innerHTML = '';
    let pCount = 0, aCount = 0;

    const snapshot = await db.collection('users').get();
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === 'profesor') pCount++;
        if (data.role === 'alumno') aCount++;

        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 font-medium">${data.email}</td>
                <td class="p-3 uppercase text-xs font-bold text-indigo-600">${data.role}</td>
                <td class="p-3"><span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Activo</span></td>
            </tr>
        `;
    });
    if(totalProf) totalProf.textContent = pCount;
    if(totalAlum) totalAlum.textContent = aCount;
}

if (document.getElementById('users-table-body')) {
    cargarUsuariosAdmin();
}

// Profesor: Crear Simulador
const createSimForm = document.getElementById('create-simulator-form');
if (createSimForm) {
    createSimForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const materia = document.getElementById('sim-materia').value;
        const dificultad = document.getElementById('sim-dificultad').value;
        const numPreguntas = document.getElementById('sim-num-preguntas').value;

        try {
            await db.collection('simuladores').add({
                materia,
                dificultad,
                numPreguntas,
                creadoPor: auth.currentUser ? auth.currentUser.email : 'admin',
                createdAt: new Date()
            });
            alert("¡Simulador tipo Ceneval creado y asignado con éxito!");
            createSimForm.reset();
            cargarSimuladoresProfesor(); // <--- Esta línea actualiza la lista al instante
        } catch (err) {
            alert("Error al crear simulador: " + err.message);
        }
    });
}

// Función para mostrar los simuladores en el panel del profesor
async function cargarSimuladoresProfesor() {
    const contenedor = document.getElementById('lista-simuladores-profesor');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const snap = await db.collection('simuladores').get();
    if (snap.empty) {
        contenedor.innerHTML = `<p class="text-sm text-gray-500 italic">No hay simuladores creados todavía.</p>`;
        return;
    }

    snap.forEach(doc => {
        const data = doc.data();
        contenedor.innerHTML += `
            <div class="p-3 bg-gray-50 border rounded-lg flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-sm text-gray-800">${data.materia}</h4>
                    <p class="text-xs text-gray-500">Dificultad: ${data.dificultad} | Preguntas: ${data.numPreguntas}</p>
                </div>
                <span class="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded font-bold">Activo</span>
            </div>
        `;
    });
}

// Ejecutar al cargar la página del profesor si existe la lista
if (document.getElementById('lista-simuladores-profesor')) {
    cargarSimuladoresProfesor();
}
// Alumno: Cambiar Vistas
function cambiarVistaAlumno(vista) {
    document.getElementById('vista-temarios').classList.add('hidden');
    document.getElementById('vista-simuladores').classList.add('hidden');
    document.getElementById('vista-resultados').classList.add('hidden');

    const titulo = document.getElementById('alumno-titulo-vista');

    if (vista === 'temarios') {
        document.getElementById('vista-temarios').classList.remove('hidden');
        titulo.textContent = "Temarios Desarrollados (EXANI I & II)";
    } else if (vista === 'simuladores') {
        document.getElementById('vista-simuladores').classList.remove('hidden');
        titulo.textContent = "Simuladores Asignados";
        cargarSimuladoresAlumno();
    } else if (vista === 'resultados') {
        document.getElementById('vista-resultados').classList.remove('hidden');
        titulo.textContent = "Tus Resultados y Retroalimentación con IA";
    }
}

async function cargarSimuladoresAlumno() {
    const contenedor = document.getElementById('lista-simuladores-alumno');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const snap = await db.collection('simuladores').get();
    if (snap.empty) {
        contenedor.innerHTML = `<p class="text-sm text-gray-500 italic">No hay simuladores asignados en este momento.</p>`;
        return;
    }

    snap.forEach(doc => {
        const data = doc.data();
        contenedor.innerHTML += `
            <div class="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
                <div>
                    <span class="text-xs font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded">${data.dificultad}</span>
                    <h4 class="font-bold text-lg text-gray-800 mt-2">${data.materia}</h4>
                    <p class="text-xs text-gray-500 mt-1">Preguntas: ${data.numPreguntas} reactivos estilo Ceneval</p>
                </div>
                <button onclick="alert('Iniciando simulador interactivo...')" class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition">Resolver Simulador</button>
            </div>
        `;
    });
}

function verLeccion(materia) {
    alert(`Abriendo el contenido teórico desarrollado y lecciones interactivas para: ${materia}. ¡Próximamente con recursos multimedia tipo Khan Academy!`);
}

// Alumno: Cargar y resolver simuladores interactivos
async function cargarSimuladoresAlumno() {
    const contenedor = document.getElementById('lista-simuladores-alumno');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const snap = await db.collection('simuladores').get();
    if (snap.empty) {
        contenedor.innerHTML = `<p class="text-sm text-gray-500 italic">No hay simuladores asignados en este momento.</p>`;
        return;
    }

    snap.forEach(doc => {
        const data = doc.data();
        const simId = doc.id;
        // Limpiamos el texto de la materia para evitar errores con comillas en JavaScript
        const materiaLimpia = data.materia.replace(/'/g, "");
        
        contenedor.innerHTML += `
            <div class="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
                <div>
                    <span class="text-xs font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded">${data.dificultad}</span>
                    <h4 class="font-bold text-lg text-gray-800 mt-2">${data.materia}</h4>
                    <p class="text-xs text-gray-500 mt-1">Preguntas: ${data.numPreguntas} reactivos estilo Ceneval</p>
                </div>
                <button onclick="iniciarSimulador('${simId}', '${materiaLimpia}')" class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition">Resolver Simulador</button>
            </div>
        `;
    });
}

// Interfaz para resolver el examen interactivo
function iniciarSimulador(id, materia) {
    const mainArea = document.querySelector('main');
    const preguntasMateria = bancoPreguntasCeneval[materia] || bancoPreguntasCeneval["general"];
    
    let htmlPreguntas = '';
    preguntasMateria.forEach((item, index) => {
        htmlPreguntas += `
            <div class="bg-white p-6 rounded-xl shadow mb-4 border border-gray-100">
                <p class="font-bold text-gray-800 mb-3">${index + 1}. ${item.pregunta}</p>
                <div class="space-y-2">
                    ${item.opciones.map((opt, i) => `
                        <label class="block p-3 rounded-lg border hover:bg-indigo-50 cursor-pointer">
                            <input type="radio" name="p_${index}" value="${i}" class="mr-2"> ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });

    mainArea.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-6">
            <div class="flex justify-between items-center bg-indigo-900 text-white p-4 rounded-xl">
                <h3 class="font-bold text-lg">Simulador CENEVAL: ${materia}</h3>
                <button onclick="location.reload()" class="bg-pink-600 px-3 py-1 rounded text-xs font-bold">Salir del Simulador</button>
            </div>
            <form id="form-resolver-simulador" onsubmit="evaluarSimulador(event, '${materia}')">
                ${htmlPreguntas}
                <button type="submit" class="w-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg mt-4">Calcalcular Calificación y Ver Retroalimentación</button>
            </form>
        </div>
    `;
}

// Evaluar respuestas y mostrar retroalimentación
function evaluarSimulador(e, materia) {
    e.preventDefault();
    const preguntasMateria = bancoPreguntasCeneval[materia] || bancoPreguntasCeneval["general"];
    let aciertos = 0;
    
    preguntasMateria.forEach((item, index) => {
        const seleccionada = document.querySelector(`input[name="p_${index}"]:checked`);
        if (seleccionada && parseInt(seleccionada.value) === item.correcta) {
            aciertos++;
        }
    });

    const calificacion = ((aciertos / preguntasMateria.length) * 100).toFixed(0);
    const mainArea = document.querySelector('main');

    let retroMensaje = calificacion >= 80 ? "¡Excelente desempeño! Estás muy cerca del nivel requerido por CENEVAL." : "Te recomendamos repasar los conceptos teóricos y realizar más ejercicios en este módulo.";

    mainArea.innerHTML = `
        <div class="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
            <span class="text-5xl">📊</span>
            <h3 class="text-3xl font-black text-gray-800">Resultado del Simulador</h3>
            <div class="bg-indigo-50 p-6 rounded-xl">
                <span class="text-4xl font-extrabold text-indigo-600">${calificacion}% de aciertos</span>
                <p class="text-sm text-gray-600 mt-2">${aciertos} de ${preguntasMateria.length} reactivos correctos.</p>
            </div>
            <div class="bg-pink-50 p-4 rounded-xl text-left border border-pink-100">
                <h4 class="font-bold text-pink-700 text-sm mb-1">Retroalimentación con Inteligencia Artificial:</h4>
                <p class="text-xs text-gray-700">${retroMensaje}</p>
            </div>
            <button onclick="location.reload()" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow">Volver al Panel Principal</button>
        </div>
    `;
}
// Interfaz para resolver el examen interactivo
function iniciarSimulador(id, materia) {
    const mainArea = document.querySelector('main');
    const preguntasMateria = bancoPreguntasCeneval[materia] || bancoPreguntasCeneval["general"];
    
    let htmlPreguntas = '';
    preguntasMateria.forEach((item, index) => {
        htmlPreguntas += `
            <div class="bg-white p-6 rounded-xl shadow mb-4 border border-gray-100">
                <p class="font-bold text-gray-800 mb-3">${index + 1}. ${item.pregunta}</p>
                <div class="space-y-2">
                    ${item.opciones.map((opt, i) => `
                        <label class="block p-3 rounded-lg border hover:bg-indigo-50 cursor-pointer">
                            <input type="radio" name="p_${index}" value="${i}" class="mr-2"> ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });

    mainArea.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-6">
            <div class="flex justify-between items-center bg-indigo-900 text-white p-4 rounded-xl">
                <h3 class="font-bold text-lg">Simulador CENEVAL: ${materia}</h3>
                <button onclick="location.reload()" class="bg-pink-600 px-3 py-1 rounded text-xs font-bold">Salir del Simulador</button>
            </div>
            <form id="form-resolver-simulador" onsubmit="evaluarSimulador(event, '${materia}')">
                ${htmlPreguntas}
                <button type="submit" class="w-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg mt-4">Calcular Calificación y Ver Retroalimentación</button>
            </form>
        </div>
    `;
}

// Evaluar respuestas y mostrar retroalimentación con IA pedagógica
function evaluarSimulador(e, materia) {
    e.preventDefault();
    const preguntasMateria = bancoPreguntasCeneval[materia] || bancoPreguntasCeneval["general"];
    let aciertos = 0;
    
    preguntasMateria.forEach((item, index) => {
        const seleccionada = document.querySelector(`input[name="p_${index}"]:checked`);
        if (seleccionada && parseInt(seleccionada.value) === item.correcta) {
            aciertos++;
        }
    });

    const calificacion = ((aciertos / preguntasMateria.length) * 100).toFixed(0);
    const mainArea = document.querySelector('main');

    let retroMensaje = calificacion >= 80 ? "¡Excelente desempeño! Estás muy cerca del nivel requerido por CENEVAL." : "Te recomendamos repasar los conceptos teóricos y realizar más ejercicios en este módulo.";

    mainArea.innerHTML = `
        <div class="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
            <span class="text-5xl">📊</span>
            <h3 class="text-3xl font-black text-gray-800">Resultado del Simulador</h3>
            <div class="bg-indigo-50 p-6 rounded-xl">
                <span class="text-4xl font-extrabold text-indigo-600">${calificacion}% de aciertos</span>
                <p class="text-sm text-gray-600 mt-2">${aciertos} de ${preguntasMateria.length} reactivos correctos.</p>
            </div>
            <div class="bg-pink-50 p-4 rounded-xl text-left border border-pink-100">
                <h4 class="font-bold text-pink-700 text-sm mb-1">Retroalimentación con Inteligencia Artificial:</h4>
                <p class="text-xs text-gray-700">${retroMensaje}</p>
            </div>
            <button onclick="location.reload()" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow">Volver al Panel Principal</button>
        </div>
    `;
}

