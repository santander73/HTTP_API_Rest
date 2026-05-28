import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Configuración necesaria para obtener la ruta del archivo usando ES Modules (import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware para entender JSON en el body de las peticiones
app.use(express.json());

// Funciones ayudantes para leer y escribir de forma segura
const leerDatos = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer el archivo JSON:", error);
        return [];
    }
};

const guardarDatos = (datos) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error al escribir en el archivo JSON:", error);
        throw error;
    }
};

// ==================== RUTAS API REST (AE-6) ====================

// 1. GET: Obtener todas las maquinarias
app.get('/maquinarias', (req, res) => {
    try {
        const maquinarias = leerDatos();
        return res.status(200).json(maquinarias);
    } catch (error) {
        console.error("Error en GET /maquinarias:", error);
        return res.status(500).json({ mensaje: "Error interno del servidor al obtener los datos" });
    }
});

// 2. GET: Obtener una maquinaria por ID
app.get('/maquinarias/:id', (req, res) => {
    try {
        const maquinarias = leerDatos();
        const id = parseInt(req.params.id);
        const maquinaria = maquinarias.find(m => m.id === id);

        if (!maquinaria) {
            return res.status(404).json({ mensaje: "Registro no encontrado" });
        }

        return res.status(200).json(maquinaria);
    } catch (error) {
        console.error(`Error en GET /maquinarias/${req.params.id}:`, error);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// 3. POST: Agregar una nueva maquinaria
app.post('/maquinarias', (req, res) => {
    try {
        const maquinarias = leerDatos();
        const nuevaMaquinaria = req.body;

        if (!nuevaMaquinaria || Object.keys(nuevaMaquinaria).length === 0) {
            return res.status(400).json({ mensaje: "El cuerpo de la petición no puede estar vacío" });
        }

        // Generar ID incremental automáticamente
        const nuevoId = maquinarias.length > 0 ? Math.max(...maquinarias.map(m => m.id)) + 1 : 1;
        const registroCompleto = { id: nuevoId, ...nuevaMaquinaria };

        maquinarias.push(registroCompleto);
        guardarDatos(maquinarias);

        return res.status(201).json({ mensaje: "Registro agregado con éxito", data: registroCompleto });
    } catch (error) {
        console.error("Error en POST /maquinarias:", error);
        return res.status(500).json({ mensaje: "Error interno del servidor al guardar el registro" });
    }
});

// 4. PUT: Editar un registro existente por ID
app.put('/maquinarias/:id', (req, res) => {
    try {
        const maquinarias = leerDatos();
        const id = parseInt(req.params.id);
        const index = maquinarias.findIndex(m => m.id === id);

        if (index === -1) {
            return res.status(404).json({ mensaje: "Registro no encontrado para editar" });
        }

        // Mantiene el ID original y actualiza el resto
        maquinarias[index] = { id, ...req.body };
        guardarDatos(maquinarias);

        return res.status(200).json({ mensaje: "Registro actualizado con éxito", data: maquinarias[index] });
    } catch (error) {
        console.error(`Error en PUT /maquinarias/${req.params.id}:`, error);
        return res.status(500).json({ mensaje: "Error interno del servidor al actualizar" });
    }
});

// 5. DELETE: Eliminar un registro por ID
app.delete('/maquinarias/:id', (req, res) => {
    try {
        const maquinarias = leerDatos();
        const id = parseInt(req.params.id);
        const index = maquinarias.findIndex(m => m.id === id);

        if (index === -1) {
            return res.status(404).json({ mensaje: "Registro no encontrado para eliminar" });
        }

        const maquinariasFiltradas = maquinarias.filter(m => m.id !== id);
        guardarDatos(maquinariasFiltradas);

        return res.status(200).json({ mensaje: `Registro con ID ${id} eliminado correctamente` });
    } catch (error) {
        console.error(`Error en DELETE /maquinarias/${req.params.id}:`, error);
        return res.status(500).json({ mensaje: "Error interno del servidor al eliminar" });
    }
});

// Levantar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});