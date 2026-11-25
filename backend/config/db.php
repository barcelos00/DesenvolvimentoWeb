<?php
declare(strict_types=1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function db(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require __DIR__ . '/database.config.php';
    if (!is_array($config)) {
        throw new RuntimeException('Confira o arquivo database.config.php.');
    }

    $host = getenv('SOFTCAR_DB_HOST') ?: ($config['host'] ?? '127.0.0.1');
    $portValue = getenv('SOFTCAR_DB_PORT') ?: ($config['port'] ?? 3306);
    $port = filter_var($portValue, FILTER_VALIDATE_INT);
    $name = getenv('SOFTCAR_DB_NAME') ?: ($config['name'] ?? 'softcar');
    $user = getenv('SOFTCAR_DB_USER') ?: ($config['user'] ?? 'root');
    $password = getenv('SOFTCAR_DB_PASSWORD');
    $password = $password === false ? ($config['password'] ?? '') : $password;

    if ($port === false || $port < 1 || $port > 65535) {
        throw new RuntimeException('A porta MySQL deve estar entre 1 e 65535.');
    }

    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    return $pdo;
}
