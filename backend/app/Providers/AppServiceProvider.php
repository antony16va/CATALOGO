<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for "Specified key was too long" error in older MySQL versions
        Schema::defaultStringLength(191);
        
        // Deshabilitar el wrapping de recursos en 'data'
        // Esto hace que los JsonResource devuelvan los datos directamente
        JsonResource::withoutWrapping();
    }
}
