<?php

$directory = "routes"; // Change this to your directory path
$fileList = [];
function listFilesWithPaths($dir, $basePath = '') {
    $files = [];
    $items = array_diff(scandir($dir), ['.', '..']); // Remove '.' and '..'

    foreach ($items as $item) {
        $fullPath = "$dir/$item"; // Absolute path
        $relativePath = trim("$basePath/$item", "/"); // Relative path

        if (is_dir($fullPath)) {
            // If it's a directory, recursively get files inside it
            $files = array_merge($files, listFilesWithPaths($fullPath, $relativePath));
        } else {
            // If it's a file, add it to the list
            $files[] = $relativePath;
        }
    }
    return $files;
}

// Usage
if (is_dir($directory)) {
    $fileList = listFilesWithPaths($directory);
} else {
    echo json_encode(["error" => "Directory not found"]);
}

// Get the requested URL
$request = trim($_SERVER['REQUEST_URI'], '/') . ".php";
// Route requests to specific files
if(in_array($request, $fileList)){
    require "routes/".$request;
}else{
    http_response_code(404);
    echo json_encode(["error" => "Route not found"]);
}


?>
