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
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, [
        'Content-Type: multipart/form-data',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate, br',
        'Content-Length: ' . strlen(http_build_query($data)),
    ]);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($curl, CURLOPT_HEADER, true);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);

    $response = curl_exec($curl);
    if (curl_errno($curl)) {
        $error_msg = curl_error($curl);
        curl_close($curl);
        return ['error' => true, 'message' => $error_msg];
    }

    curl_close($curl);
    
    return $response;
}

function login($username, $password, $appkey, $apiurl) {
    $url = $apiurl . 'authUser/Appkey/' . $appkey;
    $data = [
        'username' => $username,
        'password' => $password
    ];

    $response = sendPostRequest($url, $data);
    
    return $response;
}



// Example usage
$result = login($username, $password, $appkey, $apiurl);
echo json_encode($result);
?>