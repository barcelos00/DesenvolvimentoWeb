<?php
require_once __DIR__ . '/../includes/api.php';
api_require_method('POST');
$user = api_require_login();
api_verify_csrf();
$data = api_json_body();
$vehicleId = api_valid_id($data['veiculoId'] ?? null);
$method = (string) ($data['forma'] ?? '');

if ($vehicleId === null || !in_array($method, ['pix', 'cartao', 'financiamento'], true)) {
    api_error('Veículo ou forma de pagamento inválidos.', 400);
}

$pdo = db();
$vehicleQuery = $pdo->prepare(
    "SELECT preco FROM veiculos WHERE id = :id AND disponibilidade = 'disponivel'"
);
$vehicleQuery->execute(['id' => $vehicleId]);
$price = $vehicleQuery->fetchColumn();
if ($price === false) {
    api_error('Veículo não encontrado ou indisponível.', 404);
}

$insert = $pdo->prepare(
    "INSERT INTO pagamentos (usuario_id, veiculo_id, valor, forma, status)
     VALUES (:usuario_id, :veiculo_id, :valor, :forma, 'simulado')"
);
$insert->execute([
    'usuario_id' => (int) $user['id'],
    'veiculo_id' => $vehicleId,
    'valor' => $price,
    'forma' => $method,
]);

api_json(['message' => 'Simulação registrada. Nenhuma cobrança foi realizada.'], 201);
