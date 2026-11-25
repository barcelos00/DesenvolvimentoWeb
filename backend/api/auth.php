<?php
require_once __DIR__ . '/../includes/api.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = api_current_user();
    api_json([
        'user' => $user ? api_public_user($user) : null,
        'csrfToken' => api_csrf_token(),
    ]);
}

api_require_method('POST');
api_verify_csrf();
$data = api_json_body();
$action = $_GET['acao'] ?? $_GET['action'] ?? $data['action'] ?? '';
$pdo = db();

switch ($action) {
    case 'login':
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['senha'] ?? $data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            api_error('Informe um e-mail e uma senha.', 400);
        }

        $query = $pdo->prepare(
            'SELECT id, nome, email, senha_hash, perfil FROM usuarios WHERE email = :email'
        );
        $query->execute(['email' => $email]);
        $user = $query->fetch();

        if ($user === false || !password_verify($password, $user['senha_hash'])) {
            api_error('E-mail ou senha incorretos.', 401);
        }

        api_json(api_sign_in($user));

    case 'cadastro':
    case 'register':
        $name = trim((string) ($data['nome'] ?? $data['name'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['senha'] ?? $data['password'] ?? '');
        $confirmation = (string) ($data['confirmarSenha'] ?? $password);

        if ($name === '' || strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            api_error('Informe nome e e-mail válidos.', 400);
        }
        if (strlen($password) < 6 || $password !== $confirmation) {
            api_error('Confira a senha e sua confirmação (mínimo de 6 caracteres).', 400);
        }

        try {
            $query = $pdo->prepare(
                "INSERT INTO usuarios (nome, email, senha_hash, perfil)
                 VALUES (:nome, :email, :senha_hash, 'cliente')"
            );
            $query->execute([
                'nome' => $name,
                'email' => $email,
                'senha_hash' => password_hash($password, PASSWORD_DEFAULT),
            ]);
        } catch (PDOException $exception) {
            if ($exception->getCode() !== '23000') {
                throw $exception;
            }
            api_error('Este e-mail já está cadastrado.', 409);
        }

        $user = [
            'id' => (int) $pdo->lastInsertId(),
            'nome' => $name,
            'email' => $email,
            'perfil' => 'cliente',
        ];
        api_json(api_sign_in($user), 201);

    case 'sair':
    case 'logout':
        api_require_login();
        $_SESSION = [];
        $cookie = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path' => $cookie['path'],
            'secure' => $cookie['secure'],
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_destroy();
        api_json(['message' => 'Sessão encerrada.']);

    default:
        api_error('Ação inválida. Use login, register ou logout.', 400);
}
