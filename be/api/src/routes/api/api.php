<?php
require_once __DIR__ . '/../../index.php';
$appkey = getenv('APP_KEY');
if (!$appkey) {
    sendError(500, 'App key not found.');
}
$username = getenv('LOG_USER');
if (!$username) {
    sendError(500, 'Username not found.');
}
$password = getenv('PASS');
if (!$password) {
    sendError(500, 'Password not found.');
}
$apiurl = getenv('API_URL');
if (!$apiurl) {
    sendError(500, 'API URL not found.');
}

function sendPostRequest($url, array $data) {
    $content = http_build_query($data);
    $header = "Content-type: application/x-www-form-urlencoded\r\n";

    $options = array(
        'http' => array(
            'header' => $header,
            'method' => 'POST',
            'content' => $content
        )
    );
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    return $result;
}

function login($apiurl, $appkey, $username, $password) {
    $url = $apiurl . 'authUser/AppKey/' . $appkey;
    $data = [
        'username' => $username,
        'password' => $password
    ];

    $response = sendPostRequest($url, $data);
    
    return $response;
}



// Example usage
$result = login($apiurl, $appkey, $username, $password);
echo json_encode($result);
?>