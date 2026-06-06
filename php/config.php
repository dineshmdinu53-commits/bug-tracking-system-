<?php
/*
 * Central app configuration.
 * Values can be provided through environment variables in production.
 */

// Simple .env parser for local development
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $name = trim($parts[0]);
            $value = trim($parts[1]);
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

function bugTrackerEnv(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return $value;
}

define('APP_ENV', bugTrackerEnv('APP_ENV', 'production'));
define('DB_HOST', bugTrackerEnv('BUG_TRACKER_DB_HOST', '127.0.0.1'));
define('DB_PORT', bugTrackerEnv('BUG_TRACKER_DB_PORT', '3306'));
define('DB_NAME', bugTrackerEnv('BUG_TRACKER_DB_NAME', 'bug_tracker'));
define('DB_USER', bugTrackerEnv('BUG_TRACKER_DB_USER', 'root'));
define('DB_PASS', bugTrackerEnv('BUG_TRACKER_DB_PASS', ''));
define('GEMINI_API_KEY', bugTrackerEnv('BUG_TRACKER_GEMINI_API_KEY', ''));
?>
