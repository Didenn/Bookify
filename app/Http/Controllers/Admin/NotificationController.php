<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\FirebaseMessagingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private readonly FirebaseMessagingService $firebaseMessagingService
    ) {
    }

    public function index(Request $request): Response
    {
        $drafts = Notification::query()
            ->where('status', 'draft')
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'message', 'status', 'created_at'])
            ->map(fn (Notification $n) => $this->serialize($n));

        $sent = Notification::query()
            ->where('status', 'sent')
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'message', 'status', 'created_at'])
            ->map(fn (Notification $n) => $this->serialize($n));

        return Inertia::render('Admin/Notifications/Index', [
            'drafts' => $drafts,
            'sent' => $sent,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        Notification::create([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'status' => 'draft',
        ]);

        return redirect()->route('admin.notifications.index');
    }

    public function update(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft notifications can be edited.',
                'errors' => ['status' => ['Only draft notifications can be edited.']],
            ], 422);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'sent'])],
        ]);

        unset($validated['status']);

        $notification->fill($validated);
        $notification->save();

        return response()->json(['data' => $this->serialize($notification)]);
    }

    public function send(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft notifications can be sent.',
                'errors' => ['status' => ['Only draft notifications can be sent.']],
            ], 422);
        }

        $sent = $this->firebaseMessagingService->sendToAllUsers(
            $notification->title,
            $notification->message,
            ['source' => 'admin-manual']
        );

        if (!$sent) {
            return response()->json([
                'message' => 'Notification could not be sent to Firebase.',
                'errors' => ['firebase' => ['Notification could not be sent to Firebase.']],
            ], 502);
        }

        $notification->status = 'sent';
        $notification->save();

        return response()->json(['data' => $this->serialize($notification)]);
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        $notification->delete();

        return response()->json(['ok' => true]);
    }

    public function data(Request $request): JsonResponse
    {
        $notifications = Notification::query()
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'message', 'status', 'created_at'])
            ->map(fn (Notification $n) => $this->serialize($n));

        return response()->json(['data' => $notifications]);
    }

    private function serialize(Notification $n): array
    {
        return [
            'id' => $n->id,
            'title' => $n->title,
            'message' => $n->message,
            'status' => $n->status,
            'createdAt' => optional($n->created_at)->format('Y-m-d H:i'),
        ];
    }
}
