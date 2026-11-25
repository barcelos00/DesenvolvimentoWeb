CREATE DATABASE IF NOT EXISTS softcar
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE softcar;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marcas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_marcas_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categorias (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categorias_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS veiculos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    marca_id INT UNSIGNED NOT NULL,
    categoria_id INT UNSIGNED NOT NULL,
    modelo VARCHAR(120) NOT NULL,
    descricao TEXT NOT NULL,
    motor VARCHAR(100) NOT NULL,
    aceleracao_0_100 DECIMAL(4, 1) NULL,
    preco DECIMAL(12, 2) NOT NULL,
    quilometragem INT UNSIGNED NOT NULL DEFAULT 0,
    ano SMALLINT UNSIGNED NOT NULL,
    disponibilidade ENUM('disponivel', 'indisponivel') NOT NULL DEFAULT 'disponivel',
    imagem VARCHAR(2048) NULL,
    link_oficial VARCHAR(500) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_veiculos_marca_modelo (marca_id, modelo),
    KEY idx_veiculos_categoria (categoria_id),
    CONSTRAINT fk_veiculos_marca FOREIGN KEY (marca_id)
        REFERENCES marcas (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_veiculos_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE veiculos MODIFY imagem VARCHAR(2048) NULL;

CREATE TABLE IF NOT EXISTS pagamentos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    veiculo_id BIGINT UNSIGNED NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    forma ENUM('pix', 'cartao', 'financiamento') NOT NULL,
    status ENUM('simulado') NOT NULL DEFAULT 'simulado',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pagamentos_usuario (usuario_id),
    KEY idx_pagamentos_veiculo (veiculo_id),
    CONSTRAINT fk_pagamentos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pagamentos_veiculo FOREIGN KEY (veiculo_id)
        REFERENCES veiculos (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO marcas (nome) VALUES
    ('BMW'), ('Porsche'), ('Ferrari'), ('Mercedes-Benz'), ('Honda'),
    ('Maserati'), ('Audi'), ('Fiat'), ('Ford'), ('Peugeot'), ('Renault');

INSERT IGNORE INTO categorias (nome) VALUES
    ('Esportivos'), ('Premium'), ('Hatches'), ('Sedãs'), ('Usados');

INSERT INTO usuarios (nome, email, senha_hash, perfil)
VALUES (
    'Administrador SOFTCAR',
    'admin@softcar.local',
    '$2y$10$tmjgpCwRMGqiqaZaoZPpruLlOs34CSQkK0HY04hkI3j4czaYsP8bO',
    'admin'
)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO veiculos (
    marca_id, categoria_id, modelo, descricao, motor, aceleracao_0_100,
    preco, quilometragem, ano, disponibilidade, imagem, link_oficial
)
SELECT m.id, c.id, 'M2', 'Cupê esportivo com motor potente e tecnologia de condução.',
       '3.0 TwinPower Turbo', 4.1, 620000.00, 18500, 2025, 'disponivel',
       'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
       'https://www.bmw.com.br/'
FROM marcas m JOIN categorias c ON c.nome = 'Esportivos'
WHERE m.nome = 'BMW'
UNION ALL
SELECT m.id, c.id, 'Taycan', 'Esportivo elétrico com foco em desempenho e conforto.',
       'Elétrico', 2.8, 850000.00, 12300, 2025, 'disponivel',
       'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
       'https://www.porsche.com/brazil/pt/'
FROM marcas m JOIN categorias c ON c.nome = 'Premium'
WHERE m.nome = 'Porsche'
UNION ALL
SELECT m.id, c.id, '911 GT3', 'Esportivo de alto desempenho inspirado em carros de pista.',
       '4.0 Boxer', 3.2, 2450000.00, 8700, 2026, 'disponivel',
       'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
       'https://www.porsche.com/brazil/pt/'
FROM marcas m JOIN categorias c ON c.nome = 'Esportivos'
WHERE m.nome = 'Porsche'
UNION ALL
SELECT m.id, c.id, 'Civic Type R', 'Hatch esportivo com motor turbo e câmbio manual.',
       '2.0 Turbo', 5.4, 429900.00, 8500, 2025, 'disponivel',
       'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
       'https://www.honda.com.br/automoveis/'
FROM marcas m JOIN categorias c ON c.nome = 'Hatches'
WHERE m.nome = 'Honda'
UNION ALL
SELECT m.id, c.id, 'Palio Attractive 1.0', 'Hatch compacto econômico para uso urbano.',
       '1.0 Flex', 14.5, 35000.00, 72400, 2016, 'disponivel',
       'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
       'https://www.fiat.com.br/'
FROM marcas m JOIN categorias c ON c.nome = 'Usados'
WHERE m.nome = 'Fiat'
ON DUPLICATE KEY UPDATE imagem = VALUES(imagem);
