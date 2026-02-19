-- ======================================================
-- 1. ESTRUCTURA COMPLETA
-- ======================================================
DROP DATABASE IF EXISTS recetas;
CREATE DATABASE recetas;
USE recetas;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    es_premium BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paquetes_recetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL
);

CREATE TABLE compras_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    paquete_id INT,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paquete_id) REFERENCES paquetes_recetas(id) ON DELETE CASCADE
);

CREATE TABLE categorias_ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias_ingredientes(id) ON DELETE SET NULL
);

CREATE TABLE recetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    instrucciones TEXT NOT NULL,
    url_imagen VARCHAR(255),
    porciones INT DEFAULT 1,
    es_sistema BOOLEAN DEFAULT TRUE,
    usuario_id INT NULL,
    paquete_id INT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (paquete_id) REFERENCES paquetes_recetas(id) ON DELETE SET NULL
);

CREATE TABLE ingredientes_receta (
    receta_id INT,
    ingrediente_id INT,
    cantidad DECIMAL(10, 2),
    unidad VARCHAR(20),
    PRIMARY KEY (receta_id, ingrediente_id),
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id) ON DELETE CASCADE
);

CREATE TABLE planificacion_semanal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    receta_id INT,
    fecha DATE NOT NULL,
    tipo_comida ENUM('desayuno', 'almuerzo', 'cena', 'snack'),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE
);

CREATE TABLE lista_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    ingrediente_id INT,
    cantidad_total DECIMAL(10, 2),
    unidad VARCHAR(20),
    comprado BOOLEAN DEFAULT FALSE,
    es_manual BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id) ON DELETE CASCADE
);

-- ======================================================
-- 2. VISTAS
-- ======================================================

CREATE VIEW vista_recetas_disponibles AS
SELECT r.*, u.id AS espectador_id
FROM recetas r
CROSS JOIN usuarios u
WHERE r.paquete_id IS NULL 
   OR r.usuario_id = u.id 
   OR r.paquete_id IN (
        SELECT paquete_id 
        FROM compras_usuarios 
        WHERE usuario_id = u.id
   );

-- ======================================================
-- 3. PROCEDIMIENTO
-- ======================================================

DROP PROCEDURE IF EXISTS generar_lista_semanal;

DELIMITER $$

CREATE PROCEDURE generar_lista_semanal(
    IN p_usuario_id INT, 
    IN p_fecha_inicio DATE, 
    IN p_fecha_fin DATE
)
BEGIN
    DELETE FROM lista_compra 
    WHERE usuario_id = p_usuario_id 
      AND comprado = FALSE 
      AND es_manual = FALSE;

    INSERT INTO lista_compra (usuario_id, ingrediente_id, cantidad_total, unidad, es_manual)
    SELECT ps.usuario_id, ir.ingrediente_id, SUM(ir.cantidad), ir.unidad, FALSE
    FROM planificacion_semanal ps
    JOIN ingredientes_receta ir ON ps.receta_id = ir.receta_id
    WHERE ps.usuario_id = p_usuario_id 
      AND ps.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY ir.ingrediente_id, ir.unidad;
END $$

DELIMITER ;

-- ======================================================
-- 4. CARGA MASIVA DE DATOS
-- ======================================================

-- Categorías
INSERT INTO categorias_ingredientes (nombre) VALUES 
('Verduras'), ('Carnes'), ('Pescados'), ('Lácteos'), ('Frutas'), ('Despensa'), ('Especias');

-- Ingredientes
INSERT INTO ingredientes (nombre, categoria_id) VALUES 
('Pechuga de Pollo', 2), ('Tomate', 1), ('Cebolla', 1), ('Huevo', 4), ('Leche de Almendras', 4), 
('Sal', 7), ('Arroz Integral', 6), ('Aguacate', 5), ('Pasta', 6), ('Salmón', 3), 
('Avena', 6), ('Nueces', 6), ('Yogur Griego', 4), ('Espinacas', 1), ('Miel', 6);

-- Usuarios
INSERT INTO usuarios (nombre_usuario, email, contrasena, es_premium) VALUES 
('jose_velazquez', 'jose@test.com', '$2b$10$eDW37EVpPopI9TXtrig0zudDIZ4BE2RIANBaxQXUCyJykBLFzaX.K', FALSE),
('maria_fitness', 'maria@test.com', '$2b$10$eDW37EVpPopI9TXtrig0zudDIZ4BE2RIANBaxQXUCyJykBLFzaX.K', TRUE),
('pablo_cocinillas', 'pablo@test.com', '$2b$10$eDW37EVpPopI9TXtrig0zudDIZ4BE2RIANBaxQXUCyJykBLFzaX.K', FALSE);

-- Packs
INSERT INTO paquetes_recetas (nombre, descripcion, precio) VALUES 
('Pack Hiperproteico', 'Para ganar masa muscular.', 12.00),
('Cocina Vegana', '100% libre de crueldad.', 8.50),
('Dieta Mediterránea', 'El clásico saludable.', 9.00);

-- Compras
INSERT INTO compras_usuarios (usuario_id, paquete_id) VALUES 
(1, 3), 
(2, 1);

-- Recetas
INSERT INTO recetas (titulo, instrucciones, es_sistema, paquete_id) VALUES 
('Bowl de Avena y Miel', 'Mezclar avena con leche y añadir miel.', TRUE, NULL),
('Pollo con Arroz', 'Hacer el pollo a la plancha y cocer arroz.', TRUE, NULL),
('Ensalada de Salmón', 'Salmón al horno sobre cama de espinacas.', TRUE, 1),
('Tostada de Aguacate', 'Pan con aguacate machacado y huevo.', TRUE, NULL),
('Tortilla de Espinacas', 'Saltear espinacas y cuajar con huevo.', TRUE, NULL),
('Pasta al Pesto', 'Cocer pasta y añadir salsa.', TRUE, NULL);

-- Ingredientes de Recetas
INSERT INTO ingredientes_receta VALUES 
(1, 11, 60, 'gramos'), 
(1, 5, 200, 'ml'), 
(1, 15, 10, 'gramos'),

(2, 1, 150, 'gramos'), 
(2, 7, 80, 'gramos'), 
(2, 3, 0.5, 'unidad'),

(4, 4, 1, 'unidad'), 
(4, 8, 0.5, 'unidad');

-- Planificación semanal
INSERT INTO planificacion_semanal (usuario_id, receta_id, fecha, tipo_comida) VALUES 
(1, 1, '2026-02-16', 'desayuno'),
(1, 2, '2026-02-16', 'almuerzo'),
(1, 4, '2026-02-17', 'desayuno'),
(1, 2, '2026-02-17', 'almuerzo');
