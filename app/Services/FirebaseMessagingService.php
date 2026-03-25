<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FirebaseMessagingService
{
    private const DEFAULT_TOPIC = 'all-users';

    public function sendToAllUsers(string $title, string $body, array $data = []): bool
    {
        return $this->sendToTopic(self::DEFAULT_TOPIC, $title, $body, $data);
    }

    public function sendToTopic(string $topic, string $title, string $body, array $data = []): bool
    {
        try {
            $messaging = app('firebase.messaging');

            $message = CloudMessage::withTarget('topic', $topic)
                ->withNotification(Notification::create($title, $body));

            if (!empty($data)) {
                $message = $message->withData(
                    collect($data)->map(fn ($value) => (string) $value)->all()
                );
            }

            $messaging->send($message);
            return true;
        } catch (\Throwable $e) {
            Log::error('FCM send failed', [
                'topic' => $topic,
                'title' => $title,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}

