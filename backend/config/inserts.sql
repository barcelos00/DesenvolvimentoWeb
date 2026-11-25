USE softcar;

ALTER TABLE veiculos MODIFY imagem VARCHAR(2048) NULL;

UPDATE veiculos v
JOIN marcas m ON m.id = v.marca_id
SET v.imagem = CASE
    WHEN m.nome = 'BMW' AND v.modelo = 'M2' THEN
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80'
    WHEN m.nome = 'Porsche' AND v.modelo = 'Taycan' THEN
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80'
    WHEN m.nome = 'Porsche' AND v.modelo = '911 GT3' THEN
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
    WHEN m.nome = 'Honda' AND v.modelo = 'Civic Type R' THEN
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
    WHEN m.nome = 'Fiat' AND v.modelo = 'Palio Attractive 1.0' THEN
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'
    ELSE NULL
END
WHERE v.imagem LIKE 'imagens/imagens_ex/%';

INSERT IGNORE INTO marcas (nome) VALUES
    ('Porsche'), ('Ford'), ('Chevrolet'), ('Fiat'), ('Volkswagen');

INSERT IGNORE INTO categorias (nome) VALUES
    ('Esportivos'), ('Hatches'), ('Usados');

INSERT INTO veiculos (
    marca_id, categoria_id, modelo, descricao, motor, aceleracao_0_100,
    preco, quilometragem, ano, disponibilidade, imagem, link_oficial
)
SELECT
    m.id, c.id, d.modelo, d.descricao, d.motor, d.aceleracao_0_100,
    d.preco, d.quilometragem, d.ano, 'disponivel', d.imagem, d.link_oficial
FROM (
    SELECT
        'Porsche' AS marca, 'Esportivos' AS categoria,
        '911 Carrera' AS modelo, 'Cupê esportivo de alto desempenho.' AS descricao,
        '3.0 Boxer biturbo' AS motor, 4.1 AS aceleracao_0_100,
        950000.00 AS preco, 8500 AS quilometragem, 2024 AS ano,
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80' AS imagem,
        'https://www.porsche.com/brazil/pt/' AS link_oficial

    UNION ALL SELECT
        'Ford', 'Esportivos', 'Mustang GT',
        'Cupê esportivo com motor V8.',
        '5.0 V8', 4.3, 520000.00, 12000, 2024,
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://www.ford.com.br/'

    UNION ALL SELECT
        'Chevrolet', 'Esportivos', 'Camaro SS',
        'Esportivo com motor V8 e desempenho elevado.',
        '6.2 V8', 4.0, 480000.00, 15000, 2023,
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
        'https://www.chevrolet.com.br/'

    UNION ALL SELECT
        'Fiat', 'Usados', 'Uno 1.0',
        'Carro compacto popular para uso urbano.',
        '1.0 Flex', 14.0, 35000.00, 72000, 2016,
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
        'https://www.fiat.com.br/'

    UNION ALL SELECT
        'Volkswagen', 'Hatches', 'Gol 1.0',
        'Hatch compacto popular, econômico e versátil.',
        '1.0 Flex', 13.0, 55000.00, 48000, 2022,
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
        'https://www.vw.com.br/'

    UNION ALL SELECT
        'Chevrolet', 'Hatches', 'Onix LT',
        'Hatch compacto para uso diário.',
        '1.0 Turbo Flex', 10.5, 90000.00, 18000, 2024,
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
        'https://www.chevrolet.com.br/'
) AS d
JOIN marcas m ON m.nome = d.marca
JOIN categorias c ON c.nome = d.categoria
ON DUPLICATE KEY UPDATE
    categoria_id = VALUES(categoria_id),
    descricao = VALUES(descricao),
    motor = VALUES(motor),
    aceleracao_0_100 = VALUES(aceleracao_0_100),
    preco = VALUES(preco),
    quilometragem = VALUES(quilometragem),
    ano = VALUES(ano),
    disponibilidade = VALUES(disponibilidade),
    imagem = VALUES(imagem),
    link_oficial = VALUES(link_oficial);
