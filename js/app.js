// Función para calcular la distancia de Levenshtein entre dos cadenas
function levenshteinDistance(a, b) {
    const matrix = [];

    // Inicializa la primera columna y fila de la matriz
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Llena la matriz con los costos de transformación
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }

    return matrix[b.length][a.length];
}

// Clase BKTree para realizar búsquedas aproximadas
class BKTree {
    constructor() {
        this.tree = null;
    }

    // Método para añadir una palabra al árbol
    add(word) {
        if (!this.tree) {
            this.tree = { word: word, children: {} };
        } else {
            let node = this.tree;
            while (true) {
                const dist = levenshteinDistance(word, node.word);
                if (!node.children[dist]) {
                    node.children[dist] = { word: word, children: {} };
                    break;
                } else {
                    node = node.children[dist];
                }
            }
        }
    }

    // Método para buscar palabras similares
    search(query, maxDist) {
        if (!this.tree) return [];
        const results = [];
        const stack = [this.tree];
        while (stack.length > 0) {
            const node = stack.pop();
            const dist = levenshteinDistance(query, node.word);
            if (dist <= maxDist) results.push(node.word);
            for (let i = Math.max(1, dist - maxDist); i <= dist + maxDist; i++) {
                if (node.children[i]) stack.push(node.children[i]);
            }
        }
        return results;
    }
}

// Lista de nombres de ejemplo
const names = ["juan", "wilder", "cristian", "alberto", "brayan", "daniel", "ernesto", "camilo","camila", "felipe", "gabriel", "heinsenberg", "juanito", "john", "jane", "julia"];
const tree = new BKTree();
names.forEach(name => tree.add(name));

// Función para sugerir nombres similares
function suggestSimilarNames(inputName, maxDistance) {
    return tree.search(inputName, maxDistance);
}

// Función para manejar el evento de sugerir nombres
function suggestNames() {
    const inputName = document.getElementById('nameInput').value.trim();
    const suggestionsList = document.getElementById('suggestionsList');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const maxDistance = parseInt(document.getElementById('distanceSelect').value);
    
    // Validación del campo de entrada
    if (!inputName) {
        errorMessage.textContent = 'Por favor, introduce un nombre.';
        errorMessage.classList.remove('d-none');
        suggestionsList.innerHTML = '';
        loadingSpinner.classList.add('d-none');
        return;
    }
    
    // Mostrar spinner de carga
    loadingSpinner.classList.remove('d-none');
    
    // Búsqueda de nombres similares
    setTimeout(() => {
        const suggestions = suggestSimilarNames(inputName, maxDistance);
        
        // Ocultar spinner de carga
        loadingSpinner.classList.add('d-none');
        
        // Mostrar resultados
        if (suggestions.length === 0) {
            errorMessage.textContent = 'No se encontraron sugerencias.';
            errorMessage.classList.remove('d-none');
            suggestionsList.innerHTML = '';
        } else {
            errorMessage.classList.add('d-none');
            suggestionsList.innerHTML = '';
            suggestions.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                li.className = 'list-group-item';
                suggestionsList.appendChild(li);
            });
        }

        // Guardar en historial
        saveToHistory(inputName, suggestions);
    }, 500); // Simula un retraso en la búsqueda
}

// Añade un event listener al campo de entrada para sugerencias automáticas
document.getElementById('nameInput').addEventListener('input', suggestNames);

// Guardar en historial y persistencia de datos
function saveToHistory(inputName, suggestions) {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('nameHistory')) || [];
    history.push({ name: inputName, suggestions: suggestions });
    localStorage.setItem('nameHistory', JSON.stringify(history));
    updateHistoryList();
}

// Actualizar la lista de historial
function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('nameHistory')) || [];
    historyList.innerHTML = '';
    history.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `<strong>${entry.name}:</strong> ${entry.suggestions.join(', ')}`;
        historyList.appendChild(li);
    });
}

// Cargar historial al inicio
window.onload = function() {
    updateHistoryList();
    setLanguage('es'); // Establecer idioma por defecto a español
};

// Función para cambiar el idioma de la aplicación
function setLanguage(lang) {
    const elements = {
        title: {
            es: 'Corrección de Nombres',
            en: 'Name Correction'
        },
        distanceLabel: {
            es: 'Distancia máxima:',
            en: 'Maximum Distance:'
        },
        historyTitle: {
            es: 'Historial de Búsqueda',
            en: 'Search History'
        }
    };
    
    Object.keys(elements).forEach(id => {
        document.getElementById(id).textContent = elements[id][lang];
    });
}

// Cambiar idioma según la selección del usuario (puedes añadir un selector de idioma en el HTML)
document.getElementById('languageSelect').addEventListener('change', (event) => {
    setLanguage(event.target.value);
});
