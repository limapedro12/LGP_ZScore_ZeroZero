<?php
// Set proper content type header for JSON responses
header('Content-Type: application/json');

// Configuration
$config = [
    'routesDirectory' => 'routes',
    'defaultRoute' => 'index.php',
    'notFoundRoute' => '404.php'
];

/**
 * Recursively list all files in a directory
 * @param string $dir Directory to scan
 * @param string $basePath Base path for relative paths
 * @return array List of files with relative paths
 */
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

/**
 * Handle HTTP errors
 * @param int $code HTTP status code
 * @param string $message Error message
 */
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

// Get all available routes
$routes = listFilesWithPaths($config['routesDirectory']);

// Parse the requested URL
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestPath = trim($requestUri, '/');

// Handle empty request (root path)
if (empty($requestPath)) {
    $requestPath = str_replace('.php', '', $config['defaultRoute']);
}

// Determine if we need to append .php or if it's already there
$requestFile = (substr($requestPath, -4) === '.php') 
    ? $requestPath 
    : $requestPath . '.php';

// Check if requested route exists
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