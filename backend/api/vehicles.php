<?php
require_once __DIR__ . '/../includes/api.php';

function vehicleSelect(): string
{
    return 'SELECT v.id, v.modelo, v.descricao, v.motor, v.aceleracao_0_100,
                   v.preco, v.quilometragem, v.ano, v.disponibilidade, v.imagem,
                   v.link_oficial, m.nome AS marca, c.nome AS categoria
            FROM veiculos v
            JOIN marcas m ON m.id = v.marca_id
            JOIN categorias c ON c.id = v.categoria_id';
}

function vehicleReferenceId(PDO $pdo, string $table, string $name): int
{
    $pdo->prepare("INSERT IGNORE INTO {$table} (nome) VALUES (:nome)")
        ->execute(['nome' => $name]);
    $query = $pdo->prepare("SELECT id FROM {$table} WHERE nome = :nome");
    $query->execute(['nome' => $name]);
    return (int) $query->fetchColumn();
}

function vehicleImage(array $data, ?string $currentImage): array
{
    $file = $_FILES['imagemArquivo'] ?? ['error' => UPLOAD_ERR_NO_FILE];
    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        if (!empty($data['removerImagem'])) {
            return [null, null];
        }

        $image = array_key_exists('imagem', $data) ? $data['imagem'] : $currentImage;
        if ($image === null || $image === '') {
            return [null, null];
        }
        if (!is_string($image) || strlen($image) > 2048) {
            api_error('Informe um caminho ou URL de imagem válido.', 400);
        }

        $isLocalImage = strpos($image, '..') === false &&
            preg_match('~^imagens/[A-Za-z0-9._ /-]+$~', $image) === 1;
        $urlParts = parse_url($image);
        $isHttpsImage = filter_var($image, FILTER_VALIDATE_URL) !== false &&
            is_array($urlParts) &&
            strtolower($urlParts['scheme'] ?? '') === 'https' &&
            !empty($urlParts['host']) &&
            !isset($urlParts['user']) &&
            !isset($urlParts['pass']);
        if (!$isLocalImage && !$isHttpsImage) {
            api_error('Use um caminho local ou uma URL HTTPS válida para a imagem.', 400);
        }
        return [$image, null];
    }

    if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 5 * 1024 * 1024) {
        api_error('O upload falhou ou a imagem excede 5 MB.', 400);
    }

    $imageInfo = getimagesize($file['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = is_array($imageInfo) ? ($imageInfo['mime'] ?? '') : '';
    if (!isset($extensions[$mime])) {
        api_error('Envie uma imagem JPG, PNG ou WEBP válida.', 400);
    }

    $directory = dirname(__DIR__, 2) . '/frontend/imagens/uploads';
    if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
        api_error('Não foi possível criar a pasta de imagens.', 500);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    $path = $directory . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $path)) {
        api_error('Não foi possível salvar a imagem.', 500);
    }

    return ['imagens/uploads/' . $filename, $path];
}

function removeUploadedVehicleImage(?string $image): void
{
    if ($image === null ||
        !preg_match('~^imagens/uploads/([a-f0-9]{32}\.(?:jpg|png|webp))$~', $image, $matches)) {
        return;
    }

    $path = dirname(__DIR__, 2) . '/frontend/imagens/uploads/' . $matches[1];
    if (is_file($path) && !unlink($path)) {
        error_log('Não foi possível remover o arquivo de imagem: ' . $path);
    }
}

api_require_method('GET', 'POST', 'PUT', 'DELETE');
$method = $_SERVER['REQUEST_METHOD'];

// Leitura exige login; alterações exigem perfil de administrador.
if ($method === 'GET') {
    api_require_login();
    $pdo = db();
    $id = isset($_GET['id']) ? api_valid_id($_GET['id']) : null;

    if ($id === null && isset($_GET['id'])) {
        api_error('Identificador de veículo inválido.', 400);
    }
    if ($id === null) {
        api_json(['veiculos' => $pdo->query(vehicleSelect() . ' ORDER BY v.id')->fetchAll()]);
    }

    $query = $pdo->prepare(vehicleSelect() . ' WHERE v.id = :id');
    $query->execute(['id' => $id]);
    $vehicle = $query->fetch();
    if ($vehicle === false) {
        api_error('Veículo não encontrado.', 404);
    }
    api_json(['veiculo' => $vehicle]);
}

api_require_admin();
api_verify_csrf();

if ($method === 'DELETE') {
    $id = api_valid_id($_GET['id'] ?? null);
    if ($id === null) {
        api_error('Informe um identificador de veículo válido.', 400);
    }

    $pdo = db();
    $imageQuery = $pdo->prepare('SELECT imagem FROM veiculos WHERE id = :id');
    $imageQuery->execute(['id' => $id]);
    $image = $imageQuery->fetchColumn();
    if ($image === false) {
        api_error('Veículo não encontrado.', 404);
    }

    try {
        $delete = $pdo->prepare('DELETE FROM veiculos WHERE id = :id');
        $delete->execute(['id' => $id]);
    } catch (PDOException $exception) {
        if ($exception->getCode() !== '23000') {
            throw $exception;
        }
        api_error('Veículos com pagamentos vinculados não podem ser excluídos.', 409);
    }

    removeUploadedVehicleImage(is_string($image) ? $image : null);
    api_json(['message' => 'Veículo removido do catálogo.']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$data = $method === 'POST' && strpos($contentType, 'multipart/form-data') !== false
    ? $_POST
    : api_json_body();
$idValue = $method === 'PUT' ? ($_GET['id'] ?? $data['id'] ?? null) : ($data['id'] ?? null);
$id = $idValue === null || $idValue === '' ? null : api_valid_id($idValue);
if ($idValue !== null && $idValue !== '' && $id === null) {
    api_error('Identificador de veículo inválido.', 400);
}
if ($method === 'PUT' && $id === null) {
    api_error('Informe o veículo a atualizar.', 400);
}

$requiredFields = ['marca', 'categoria', 'modelo', 'descricao', 'motor'];
$fields = [];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || !is_string($data[$field]) || trim($data[$field]) === '') {
        api_error('Preencha marca, categoria, modelo, descrição e motor.', 400);
    }
    $fields[$field] = trim($data[$field]);
}
if (strlen($fields['marca']) > 80 || strlen($fields['categoria']) > 80 ||
    strlen($fields['modelo']) > 120 || strlen($fields['motor']) > 100) {
    api_error('Um dos campos de texto excede o tamanho permitido.', 400);
}

$price = $data['preco'] ?? null;
$mileage = filter_var($data['quilometragem'] ?? null, FILTER_VALIDATE_INT);
$year = filter_var($data['ano'] ?? null, FILTER_VALIDATE_INT);
$acceleration = $data['aceleracao_0_100'] ?? '';
$availability = $data['disponibilidade'] ?? '';
$officialLink = $data['link_oficial'] ?? '';
if ($acceleration === null) {
    $acceleration = '';
}
if ($officialLink === null) {
    $officialLink = '';
}

if (!is_numeric($price) || (float) $price < 0 ||
    $mileage === false || $mileage < 0 ||
    $year === false || $year < 1886 || $year > (int) date('Y') + 2) {
    api_error('Preço, quilometragem ou ano inválidos.', 400);
}
if ($acceleration !== '' && (!is_numeric($acceleration) || $acceleration < 0 || $acceleration > 99.9)) {
    api_error('A aceleração precisa estar entre 0 e 99,9 segundos.', 400);
}
if (!in_array($availability, ['disponivel', 'indisponivel'], true)) {
    api_error('Disponibilidade inválida.', 400);
}
if ($officialLink !== '' && (
    !is_string($officialLink) ||
    !filter_var($officialLink, FILTER_VALIDATE_URL) ||
    !in_array(parse_url($officialLink, PHP_URL_SCHEME), ['http', 'https'], true)
)) {
    api_error('O link oficial precisa ser uma URL HTTP ou HTTPS válida.', 400);
}

$pdo = db();
$oldImage = null;
if ($id !== null) {
    $query = $pdo->prepare('SELECT imagem FROM veiculos WHERE id = :id');
    $query->execute(['id' => $id]);
    $oldImage = $query->fetchColumn();
    if ($oldImage === false) {
        api_error('Veículo não encontrado.', 404);
    }
}

[$image, $uploadedPath] = vehicleImage($data, $oldImage === false ? null : $oldImage);
$isNew = $id === null;

try {
    // As referências e o veículo são salvos juntos para preservar a integridade.
    $pdo->beginTransaction();
    $brandId = vehicleReferenceId($pdo, 'marcas', $fields['marca']);
    $categoryId = vehicleReferenceId($pdo, 'categorias', $fields['categoria']);
    $values = [
        'marca_id' => $brandId,
        'categoria_id' => $categoryId,
        'modelo' => $fields['modelo'],
        'descricao' => $fields['descricao'],
        'motor' => $fields['motor'],
        'aceleracao_0_100' => $acceleration === '' ? null : $acceleration,
        'preco' => $price,
        'quilometragem' => $mileage,
        'ano' => $year,
        'disponibilidade' => $availability,
        'imagem' => $image,
        'link_oficial' => $officialLink === '' ? null : $officialLink,
    ];

    if ($isNew) {
        $query = $pdo->prepare(
            'INSERT INTO veiculos (
                marca_id, categoria_id, modelo, descricao, motor, aceleracao_0_100,
                preco, quilometragem, ano, disponibilidade, imagem, link_oficial
             ) VALUES (
                :marca_id, :categoria_id, :modelo, :descricao, :motor, :aceleracao_0_100,
                :preco, :quilometragem, :ano, :disponibilidade, :imagem, :link_oficial
             )'
        );
        $query->execute($values);
        $id = (int) $pdo->lastInsertId();
    } else {
        $values['id'] = $id;
        $query = $pdo->prepare(
            'UPDATE veiculos SET
                marca_id = :marca_id, categoria_id = :categoria_id, modelo = :modelo,
                descricao = :descricao, motor = :motor, aceleracao_0_100 = :aceleracao_0_100,
                preco = :preco, quilometragem = :quilometragem, ano = :ano,
                disponibilidade = :disponibilidade, imagem = :imagem, link_oficial = :link_oficial
             WHERE id = :id'
        );
        $query->execute($values);
    }
    $pdo->commit();
    if ($oldImage !== false && $oldImage !== $image && is_string($oldImage)) {
        removeUploadedVehicleImage($oldImage);
    }
} catch (PDOException $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if ($uploadedPath !== null && is_file($uploadedPath)) {
        unlink($uploadedPath);
    }
    if ($exception->getCode() === '23000') {
        api_error('Já existe um veículo com essa marca e modelo.', 409);
    }
    throw $exception;
}

api_json([
    'message' => $isNew ? 'Veículo cadastrado.' : 'Veículo atualizado.',
    'veiculoId' => $id,
], $isNew ? 201 : 200);
