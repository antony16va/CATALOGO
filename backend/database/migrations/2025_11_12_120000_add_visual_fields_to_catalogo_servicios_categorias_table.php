<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('catalogo_servicios_categorias', function (Blueprint $table) {
            $table->string('icon', 20)->default('📦')->after('description');
            $table->string('color', 60)->default('from-blue-500 to-cyan-500')->after('icon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalogo_servicios_categorias', function (Blueprint $table) {
            $table->dropColumn(['icon', 'color']);
        });
    }
};
