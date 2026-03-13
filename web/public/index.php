<?php

ini_set('memory_limit', '32M');

const CONF_FILE = '/opt/etc/xkeen_web.conf';
const CONF_DIR = '/opt/etc/xray/configs';

function normalizeString(string $s): string
{
  // Convert all line-endings to UNIX format.
  $s = str_replace(array("\r\n", "\r", "\n"), "\n", $s);

  // Don't allow out-of-control blank lines.
  $s = preg_replace("/\n{3,}/", "\n\n", $s);

  $lastChar = substr($s, -1);
  if ($lastChar !== "\n" && !empty($s)) {
    $s .= "\n";
  }

  return $s;
}

function baseFileName(string $filename): string
{
  return basename($filename);
}

function getFilePath(string $filename): string
{
  return CONF_DIR . '/' . basename($filename);
}

function getFiles(): array
{
  $files = array_filter(glob(CONF_DIR . '/*'), function ($file) {
    return is_file($file) && preg_match('/\.json$/i', $file);
  });

  $baseFiles = array_map(fn($file) => basename($file), $files);
  sort($baseFiles);

  return $baseFiles;
}

function getFileContent(string $filename): string
{
  $path = getFilePath($filename);

  if (file_exists($path)) {
    return file_get_contents($path);
  }
  return '';
}

function saveFile(string $filename, string $content): bool
{
  $path = getFilePath($filename);
  return file_put_contents($path, normalizeString($content)) !== false;
}

function removeFile(string $filename): bool
{
  $path = getFilePath($filename);
  if (file_exists($path)) {
    return unlink($path);
  } else {
    return false;
  }
}

function xkeenServiceStatus(): array
{
  $output = null;
  exec('xkeen -status 2>&1', $output);
  $output = $output ?? [];
  $clean = array_map(fn($line) => preg_replace('/\x1B\[[0-9;]*[a-zA-Z]/', '', $line), $output);
  $running = !empty(array_filter($clean, fn($line) => str_contains($line, 'Прокси-клиент запущен')));
  return array('service' => $running, 'status' => 0);
}

function xkeenServiceAction(string $action): array
{
  $logFile = '/tmp/xkeen_action.log';
  @unlink($logFile);
  exec("xkeen -$action > $logFile 2>&1 &");

  if ($action === 'stop') {
    sleep(2);
    $content = file_exists($logFile) ? file_get_contents($logFile) : '';
    $output = array_values(array_filter(explode("\n", $content), 'trim'));
    return array('output' => $output ?: ['Прокси-клиент остановлен'], 'status' => 0);
  }

  $successMarker = 'Прокси-клиент запущен';
  $failureMarker = 'Failed to start';
  $result = 'timeout';

  for ($i = 0; $i < 10; $i++) {
    sleep(1);
    $raw = file_exists($logFile) ? file_get_contents($logFile) : '';
    $content = preg_replace('/\x1B\[[0-9;]*[a-zA-Z]/', '', $raw);
    if (str_contains($content, $successMarker)) { $result = 'success'; break; }
    if (str_contains($content, $failureMarker)) { $result = 'failure'; break; }
  }

  $lines = explode("\n", preg_replace('/\x1B\[[0-9;]*[a-zA-Z]/', '', file_exists($logFile) ? file_get_contents($logFile) : ''));

  if ($result === 'success') {
    $output = [];
    foreach ($lines as $line) {
      if (trim($line) === '') continue;
      $output[] = $line;
      if (str_contains($line, $successMarker)) break;
    }
  } else {
    $output = array_values(array_filter($lines, 'trim'));
  }

  return array('output' => $output, 'status' => $result === 'success' ? 0 : 1);
}

function authenticate($username, $password): bool
{
  $shadowFile = file_exists('/opt/etc/shadow') ? '/opt/etc/shadow' : (file_exists('/etc/shadow') ? '/etc/shadow' : null);
  $passwdFile = file_exists('/opt/etc/passwd') ? '/opt/etc/passwd' : '/etc/passwd';

  $users = file($shadowFile ?? $passwdFile);
  $user = preg_grep("/^" . preg_quote($username, '/') . ":/", $users);

  if ($user) {
    list(, $passwdInDB) = explode(':', array_pop($user));
    if (empty($passwdInDB)) {
      return empty($password);
    }
    if (hash_equals(crypt($password, $passwdInDB), $passwdInDB)) {
      return true;
    }
  }

  return false;
}

function main(): void
{
  if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(302);
    header('Location: index.html');
    exit();
  }

  $config = parse_ini_file(CONF_FILE, true);
  $authEnabled = $config['auth']['enabled'];

  session_start();
  if ($authEnabled && (!isset($_SESSION['auth']) || !$_SESSION['auth'])) {
    if ($_POST['cmd'] !== 'login' || !isset($_POST['user']) || !isset($_POST['password']) || !authenticate($_POST['user'], $_POST['password'])) {
      http_response_code(401);
      exit();
    } else {
      $_SESSION['auth'] = true;
    }
  }

  switch ($_POST['cmd']) {
    case 'status':
      $status = xkeenServiceStatus();
      $response = array('status' => $status['status'], 'service' => $status['service'], 'nfqws2' => false, 'anonym' => !$authEnabled);
      break;

    case 'filenames':
      $files = getFiles();
      $response = array('status' => 0, 'files' => $files);
      break;

    case 'filecontent':
      $content = getFileContent($_POST['filename']);
      $response = array('status' => 0, 'content' => $content, 'filename' => $_POST['filename']);
      break;

    case 'filesave':
      $result = saveFile($_POST['filename'], $_POST['content']);
      $response = array('status' => $result ? 0 : 1, 'filename' => $_POST['filename']);
      break;

    case 'fileremove':
      $result = removeFile($_POST['filename']);
      $response = array('status' => $result ? 0 : 1, 'filename' => $_POST['filename']);
      break;

    case 'restart':
    case 'stop':
    case 'start':
      $response = xkeenServiceAction($_POST['cmd']);
      break;

    case 'login':
      $response = array('status' => 0);
      break;

    case 'logout':
      $_SESSION['auth'] = false;
      $response = array('status' => 0);
      break;

    default:
      http_response_code(405);
      exit();
  }

  header('Content-Type: application/json; charset=utf-8');
  http_response_code(200);
  echo json_encode($response);
  exit();
}

main();
