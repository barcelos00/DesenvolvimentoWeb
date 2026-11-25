<?php
require_once __DIR__ . '/../../includes/api.php';

api_require_method('GET', 'POST');
api_require_admin();
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $users = $pdo->query(
        'SELECT id, nome, email, perfil, criado_em
         FROM usuarios
         ORDER BY criado_em DESC, id DESC'
    )->fetchAll();
    api_json(['usuarios' => $users]);
}

api_verify_csrf();
$data = api_json_body();
$name = trim((string) ($data['nome'] ?? ''));
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['senha'] ?? '');
$role = (string) ($data['perfil'] ?? '');

if ($name === '' || strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($email) > 190) {
    api_error('Informe nome e e-mail válidos.', 400);
}
if (strlen($password) < 6) {
    api_error('A senha precisa ter pelo menos 6 caracteres.', 400);
}
if (!in_array($role, ['cliente', 'admin'], true)) {
    api_error('Selecione cliente ou administrador.', 400);
}

try {
    $insert = $pdo->prepare(
        'INSERT INTO usuarios (nome, email, senha_hash, perfil)
         VALUES (:nome, :email, :senha_hash, :perfil)'
    );
    $insert->execute([
        'nome' => $name,
        'email' => $email,
        'senha_hash' => password_hash($password, PASSWORD_DEFAULT),
        'perfil' => $role,
    ]);
} catch (PDOException $exception) {
    if ($exception->getCode() !== '23000') {
        throw $exception;
    }
    api_error('Este e-mail já está cadastrado.', 409);
}

api_json(['message' => 'Conta criada com sucesso.', 'usuarioId' => (int) $pdo->lastInsertId()], 201);
