

-- Script de inicialización de la base de datos
-- Se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Insertar datos de ejemplo (solo si no existen)
INSERT INTO users (id, name, email, password, role, is_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@example.com', '$2b$10$rM3D9Z5P7yYXhYxXhYxXhe5P7yYXhYxXhYxXhe5P7yYXhYxXhYxXh', 'admin', true),
    ('550e8400-e29b-41d4-a716-446655440001', 'Regular User', 'user@example.com', '$2b$10$rM3D9Z5P7yYXhYxXhYxXhe5P7yYXhYxXhYxXhe5P7yYXhYxXhYxXh', 'user', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, stock, category, user_id)
VALUES 
    ('Laptop Dell XPS 15', 'High-performance laptop with 16GB RAM', 1299.99, 10, 'electronics', '550e8400-e29b-41d4-a716-446655440000'),
    ('iPhone 15 Pro', 'Latest iPhone with A17 chip', 999.99, 15, 'electronics', '550e8400-e29b-41d4-a716-446655440000'),
    ('Nike Air Max', 'Comfortable running shoes', 149.99, 30, 'shoes', '550e8400-e29b-41d4-a716-446655440001'),
    ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 50, 'electronics', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Database initialized successfully';
    RAISE NOTICE '📊 Tables created: users, products';
    RAISE NOTICE '📝 Sample data inserted';
END $$;