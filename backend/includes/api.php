<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
}

function api_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_error(string $message, int $status): never
{
    api_json(['error' => $message], $status);
}

set_exception_handler(static function (Throwable $exception): never {
    error_log($exception->getMessage());
    api_error('Erro interno no servidor.', 500);
});

function api_require_method(string ...$methods): void
{
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        api_error('Método não permitido.', 405);
    }
}

function api_json_body(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
        api_error('Envie um objeto JSON válido.', 400);
    }
    return $body;
}

function api_csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function api_verify_csrf(): void
{
    $submitted = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($submitted) || !hash_equals(api_csrf_token(), $submitted)) {
        api_error('Token CSRF inválido ou sessão expirada.', 403);
    }
}

function api_current_user(): ?array
{
    return isset($_SESSION['user']) && is_array($_SESSION['user'])
        ? $_SESSION['user']
        : null;
}

function api_public_user(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'nome' => $user['nome'],
        'email' => $user['email'],
        'perfil' => $user['perfil'],
    ];
}

function api_sign_in(array $user): array
{
    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['user'] = api_public_user($user);

    return [
        'user' => $_SESSION['user'],
        'csrfToken' => api_csrf_token(),
    ];
}

function api_require_login(): array
{
    $user = api_current_user();
    if ($user === null) {
        api_error('É necessário entrar na conta.', 401);
    }

    return $user;
}

function api_require_admin(): array
{
    $user = api_require_login();
    if ($user['perfil'] !== 'admin') {
        api_error('Acesso restrito à administração.', 403);
    }

    return $user;
}

function api_valid_id(mixed $value): ?int
{
    $id = filter_var($value, FILTER_VALIDATE_INT);
    return $id !== false && $id !== null && $id > 0 ? $id : null;
}
