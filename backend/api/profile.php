<?php
require_once __DIR__ . '/../includes/api.php';

$user = api_require_login();
$pdo = db();
$userId = (int) $user['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = $pdo->prepare('SELECT nome, email FROM usuarios WHERE id = :id');
    $query->execute(['id' => $userId]);
    $profile = $query->fetch();
    if ($profile === false) {
        api_error('Usuário não encontrado.', 404);
    }

    $history = $pdo->prepare(
        'SELECT p.id, p.valor, p.forma, p.status, p.criado_em, v.modelo, m.nome AS marca
         FROM pagamentos p
         JOIN veiculos v ON v.id = p.veiculo_id
         JOIN marcas m ON m.id = v.marca_id
         WHERE p.usuario_id = :usuario_id
         ORDER BY p.criado_em DESC'
    );
    $history->execute(['usuario_id' => $userId]);
    api_json(['usuario' => $profile, 'pagamentos' => $history->fetchAll()]);
}

api_require_method('PUT');
api_verify_csrf();
$data = api_json_body();
$name = trim((string) ($data['nome'] ?? ''));
$email = strtolower(trim((string) ($data['email'] ?? '')));
$newPassword = (string) ($data['novaSenha'] ?? '');

if ($name === '' || strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
    api_error('Informe nome e e-mail válidos.', 400);
}
if ($newPassword !== '' && strlen($newPassword) < 6) {
    api_error('A nova senha precisa ter pelo menos 6 caracteres.', 400);
}

try {
    $sql = 'UPDATE usuarios SET nome = :nome, email = :email';
    $values = ['nome' => $name, 'email' => $email, 'id' => $userId];
    if ($newPassword !== '') {
        $sql .= ', senha_hash = :senha_hash';
        $values['senha_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
    }
    $update = $pdo->prepare($sql . ' WHERE id = :id');
    $update->execute($values);
} catch (PDOException $exception) {
    if ($exception->getCode() !== '23000') {
        throw $exception;
    }
    api_error('Este e-mail já está vinculado a outra conta.', 409);
}

$_SESSION['user']['nome'] = $name;
$_SESSION['user']['email'] = $email;
api_json(['usuario' => api_current_user(), 'message' => 'Perfil atualizado com sucesso.']);
