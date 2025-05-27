<?php

if (session_status() == PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => 'localhost', // Set to your domain
        'secure' => false, // Set to true in production over HTTPS
        'httponly' => true,
        'samesite' => 'Lax' // Use 'None' + 'secure' for cross-site if needed
    ]);
    session_start();
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
    if ($result === false){
        return json_encode(['error' => 'Request failed']);
    }
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
    if ($result === false){
        return json_encode(['error' => 'Request failed']);
    }
    return $result;
}

function login($username, $password) {

    $apiurl = getenv('API_URL');
    $appkey = getenv('APP_KEY');
    $url = $apiurl . 'authUser/AppKey/' . $appkey;
    $data = [
        'username' => $username,
        'password' => $password
    ];

    $response = sendPostRequest($url, $data);
    $result = json_decode($response, true);

    if (session_status() == PHP_SESSION_NONE){
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => 'localhost', // Set to domain
            'secure' => false, // Set to true in production over HTTPS
            'httponly' => true,
            'samesite' => 'Lax' // Use 'None' + 'secure' for cross-site if needed
        ]);
        session_start();
    }
    if (isset($result['data']['Cookie'])) {
        $_SESSION['api_cookie'] = $result['data']['Cookie'];
        
    } else {
        return json_encode(['error' => 'Login failed']);
    }
    return $response;
    //return json_encode(['success' => true]);
}

function buildMethodUrl($apiurl, $method, $appkey, $cookie) {
    return $apiurl . $method . '/AppKey/' . $appkey . '/Key/' . $cookie;
}

function getMatchesColab() {
    $apiurl = getenv('API_URL');
    $appkey = getenv('APP_KEY');
    $cookie = $_SESSION['api_cookie'] ?? null;
    if (is_null($cookie)) {
        return false;
    }
    $url = buildMethodUrl($apiurl, 'getMatchesColab', $appkey, $cookie);
    $response = sendGetRequest($url);
    return $response;
}

function getMatchLiveInfo($matchId) {
    $apiurl = getenv('API_URL');
    $appkey = getenv('APP_KEY');
    $cookie = $_SESSION['api_cookie'] ?? null;
    if (is_null($cookie)) {
        return json_encode(['error' => 'Cookie not found']);
    }
    $url = buildMethodUrl($apiurl, 'getMatchLiveInfo/MatchID/' . $matchId, $appkey, $cookie);
    $response = sendGetRequest($url);
    return $response;
}

function getTeamLive($matchId,$teamId) {
    $apiurl = getenv('API_URL');
    $appkey = getenv('APP_KEY');
    $cookie = $_SESSION['api_cookie'] ?? null;
    if (is_null($cookie)) {
        return json_encode(['error' => 'Cookie not found']);
    }
    $url = buildMethodUrl($apiurl, 'getTeamLive'.'/MatchID/'. $matchId . '/TeamID/' . $teamId, $appkey, $cookie);
    $response = sendGetRequest($url);
    return $response;
}

function getAllowColab($matchId) {
    $apiurl = getenv('API_URL');
    $appkey = getenv('APP_KEY');
    $cookie = $_SESSION['api_cookie'] ?? null;
    if (is_null($cookie)) {
        ['allowColab' => false];
    }
    $url = $apiurl . 'allowColab'. '/AppKey/'. $appkey. '/key/' . $cookie . '/fk_jogo/' . $matchId;
    $response = sendGetRequest($url);
    $result = json_decode($response, true);
    if (isset($result['data']['Data'])) {
        if ($result['data']['Data'] == 'sucess') {
            return ['allowColab' => true];
        }
    }
    return ['allowColab' => false];
}

function authUserSocial($authToken){
    $apiurl = getenv('API_URL');
    $appkey = getenv('APP_KEY');
    $url = $apiurl . 'authUserSocial/AppKey/' . $appkey;
    $data = [
        'type' => 'zerozero',
        'oauth_token' => $authToken
    ];
    $response = sendPostRequest($url, $data);
    $result = json_decode($response, true);

    if (session_status() == PHP_SESSION_NONE){
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => 'localhost', // Set to domain
            'secure' => false, // Set to true in production over HTTPS
            'httponly' => true,
            'samesite' => 'Lax' // Use 'None' + 'secure' for cross-site if needed
        ]);
        session_start();
    }
    if (isset($result['data']['Cookie'])) {
        $_SESSION['api_cookie'] = $result['data']['Cookie'];
        $_SESSION['username'] = $result['data']['UserData']['username'] ?? null;
    } else {
        return json_encode(['success' => false]);
    }
    
    //return $response;
    return json_encode(
        [
            'success' => true,
            'username' => $_SESSION['username'],
        ]
    );
}

function checkAuth(){
    if (session_status() == PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => 'localhost', // or your domain
            'secure' => false, // Set to true in production over HTTPS
            'httponly' => true,
            'samesite' => 'Lax' // Use 'None' + 'secure' for cross-site if needed
        ]);
        session_start();
    }
    $isLoggedIn = isset($_SESSION['api_cookie']) && !empty($_SESSION['api_cookie']);
    if ($isLoggedIn) {
        return json_encode(['success' => true, 'username' => $_SESSION['username'] ?? null]);
    }
    return json_encode(['success' => false]);
}

function logout() {
    if (isset($_SESSION['api_cookie'])) {
        unset($_SESSION['api_cookie']);
    }
    if (isset($_SESSION['username'])) {
        unset($_SESSION['username']);
    }
    if (session_status() == PHP_SESSION_ACTIVE) {
        session_destroy();
    }
    return json_encode(['success' => true]);
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