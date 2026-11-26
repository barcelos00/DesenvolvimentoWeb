<?php
require_once __DIR__ . '/../../includes/api.php';

api_require_method('GET', 'POST', 'PUT', 'DELETE');
api_require_admin();
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $users = $pdo->query(
        'SELECT id, nome, email, perfil, criado_em
         FROM usuarios
         ORDER BY criado_em DESC, id DESC'
    )->fetchAll();
    api_json(['usuarios' => $users]);
}

api_verify_csrf();

if ($method === 'DELETE') {
    $id = api_valid_id($_GET['id'] ?? null);
    if ($id === null) {
        api_error('Informe um identificador de conta válido.', 400);
    }

    $currentUser = api_current_user();
    if ($id === (int) $currentUser['id']) {
        api_error('Você não pode excluir a própria conta.', 409);
    }

    $check = $pdo->prepare('SELECT id FROM usuarios WHERE id = :id');
    $check->execute(['id' => $id]);
    if ($check->fetchColumn() === false) {
        api_error('Conta não encontrada.', 404);
    }

    try {
        $pdo->prepare('DELETE FROM usuarios WHERE id = :id')->execute(['id' => $id]);
    } catch (PDOException $exception) {
        if ($exception->getCode() !== '23000') {
            throw $exception;
        }
        api_error('Contas com simulações de pagamento vinculadas não podem ser excluídas.', 409);
    }

    api_json(['message' => 'Conta removida.']);
}

$data = api_json_body();
$id = null;
if ($method === 'PUT') {
    $id = api_valid_id($_GET['id'] ?? $data['id'] ?? null);
    if ($id === null) {
        api_error('Informe a conta a atualizar.', 400);
    }
    $check = $pdo->prepare('SELECT id FROM usuarios WHERE id = :id');
    $check->execute(['id' => $id]);
    if ($check->fetchColumn() === false) {
        api_error('Conta não encontrada.', 404);
    }
}

$name = trim((string) ($data['nome'] ?? ''));
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['senha'] ?? '');
$role = (string) ($data['perfil'] ?? '');

if ($name === '' || strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($email) > 190) {
    api_error('Informe nome e e-mail válidos.', 400);
}
if ($method === 'POST' && strlen($password) < 6) {
    api_error('A senha precisa ter pelo menos 6 caracteres.', 400);
}
if ($method === 'PUT' && $password !== '' && strlen($password) < 6) {
    api_error('A senha precisa ter pelo menos 6 caracteres.', 400);
}
if (!in_array($role, ['cliente', 'admin'], true)) {
    api_error('Selecione cliente ou administrador.', 400);
}

try {
    if ($method === 'PUT') {
        $values = ['id' => $id, 'nome' => $name, 'email' => $email, 'perfil' => $role];
        $sql = 'UPDATE usuarios SET nome = :nome, email = :email, perfil = :perfil';
        if ($password !== '') {
            $sql .= ', senha_hash = :senha_hash';
            $values['senha_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }
        $pdo->prepare($sql . ' WHERE id = :id')->execute($values);

        if ($id === (int) api_current_user()['id']) {
            $_SESSION['user']['nome'] = $name;
            $_SESSION['user']['email'] = $email;
            $_SESSION['user']['perfil'] = $role;
        }

        api_json(['message' => 'Conta atualizada.']);
    }

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