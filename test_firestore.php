<?php
try {
    $db = \Kreait\Laravel\Firebase\Facades\Firebase::firestore()->database();
    echo "OK\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
