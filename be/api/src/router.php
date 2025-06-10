<?php
header('Content-Type: application/json');

$config = [
    'routesDirectory' => 'routes',
    'defaultRoute' => 'index.php',
    'notFoundRoute' => '404.php'
];


function listFilesWithPaths($dir, $basePath = '') {
    $files = [];
    if (!is_dir($dir)) {
        return $files;
    }
    
    $items = array_diff(scandir($dir), ['.', '..']);

    foreach ($items as $item) {
        $fullPath = "$dir/$item";
        $relativePath = trim("$basePath/$item", "/");

        if (is_dir($fullPath)) {
            $files = array_merge($files, listFilesWithPaths($fullPath, $relativePath));
        } else {
            $files[] = $relativePath;
        }
    }
    return $files;
}


function sendError($code, $message) {
    global $config;
    http_response_code($code);
    
    // Try to include custom error page if it exists
    $errorFile = $config['routesDirectory'] . '/' . $code . '.php';
    if (file_exists($errorFile)) {
        require $errorFile;
        exit;
    }
    
    // Otherwise return JSON error
    echo json_encode([
        'status' => 'error',
        'code' => $code,
        'message' => $message
    ]);
    exit;
}

$routes = listFilesWithPaths($config['routesDirectory']);

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestPath = trim($requestUri, '/');

if (empty($requestPath)) {
    $requestPath = str_replace('.php', '', $config['defaultRoute']);
}

$requestFile = (substr($requestPath, -4) === '.php') 
    ? $requestPath 
    : $requestPath . '.php';

if (in_array($requestFile, $routes)) {
    // Route found, include the file
    try {
        require $config['routesDirectory'] . '/' . $requestFile;
    } catch (Exception $e) {
        sendError(500, 'Internal server error: ' . $e->getMessage());
    }
} else {
    // Check if we have a route without .php extension
    $alternativeRoute = $requestPath . '.php';
    if (in_array($alternativeRoute, $routes)) {
        require $config['routesDirectory'] . '/' . $alternativeRoute;
    } else {
        // Route not found
        sendError(404, 'Route not found: ' . $requestPath);
    }
}
?>