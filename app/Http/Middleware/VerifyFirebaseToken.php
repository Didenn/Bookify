<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class VerifyFirebaseToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?: $request->query('token');

        if (!$token) {
            return response()->json(['error' => 'Unauthorized - No Token Provided'], 401);
        }

        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return response()->json(['error' => 'Unauthorized - Invalid Token Format'], 401);
            }

            $payload = json_decode(base64_decode($parts[1]), true);
            
            if (!$payload || !isset($payload['user_id'])) {
                return response()->json(['error' => 'Unauthorized - Invalid Token Payload'], 401);
            }

            $email = $payload['email'] ?? ($payload['user_id'] . '@firebase.local');
            $name = $payload['name'] ?? 'Mobile User';

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => bcrypt(str()->random(16)),
                    'role' => 'customer'
                ]
            );

            // Set the user in the Request natively
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
        } catch (\Exception $e) {
            Log::error('Firebase Token Decode Error: ' . $e->getMessage());
            return response()->json(['error' => 'Unauthorized - Internal Error'], 401);
        }

        return $next($request);
    }
}
