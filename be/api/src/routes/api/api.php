<?php
require_once __DIR__ . '/../../index.php';
$appkey = getenv('APP_KEY');
if (!$appkey) {
    sendError(500, 'App key not found.');
}

$apiurl = getenv('API_URL');
if (!$apiurl) {
    sendError(500, 'API URL not found.');
}

// Temporary values for testing
$username = getenv('LOG_USER');
if (!$username) {
    sendError(500, 'Username not found.');
}
$password = getenv('PASS');
if (!$password) {
    sendError(500, 'Password not found.');
}


function sendPostRequest($url, array $data = []) {
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

function sendGetRequest($url, array $data = []) {
    $content = http_build_query($data);
    $header = "Content-type: application/x-www-form-urlencoded\r\n";

    $options = array(
        'http' => array(
            'header' => $header,
            'method' => 'GET',
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

function buildMethodUrl($apiurl, $method, $appkey, $cookie) {
    return $apiurl . $method . '/AppKey/' . $appkey . '/Key/' . $cookie;
}

function getMatchesColab($apiurl, $appkey, $cookie) {
    $url = buildMethodUrl($apiurl, 'getMatchesColab', $appkey, $cookie);
    $response = sendGetRequest($url);
    return $response;
}

function getMatchLiveInfo($apiurl, $appkey, $cookie, $matchId) {
    $url = buildMethodUrl($apiurl, 'getMatchLiveInfo/MathchID/' . $matchId, $appkey, $cookie);
    $response = sendGetRequest($url);
    return $response;
}

function getTeamLive($apiurl, $appkey, $cookie, $matchId, $teamId) {
    $url = buildMethodUrl($apiurl, 'getTeamLive/MathchID/' . $matchId . '/TeamID/' . $teamId, $appkey, $cookie);
    $response = sendGetRequest($url);
    return $response;
}

// Example usage

/*
$loginResponse = login($apiurl, $appkey, $username, $password);
if ($loginResponse) {
    $responseData = json_decode($loginResponse, true);
    if (isset($responseData['data'])) {
        $cookie = $responseData['data']['Cookie'];
        $matchesColabResponse = getMatchesColab($apiurl, $appkey, $cookie);
        echo $matchesColabResponse;
    } else {
        echo "Login failed: " . json_encode($responseData);
    }
} else {
    echo "Login request failed.";
}
*/

?>