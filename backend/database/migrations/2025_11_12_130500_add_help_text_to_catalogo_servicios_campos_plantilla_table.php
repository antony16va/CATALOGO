<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Disable transactions for this migration
     */
    public $withinTransaction = false;

{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('catalogo_servicios_campos_plantilla', function (Blueprint $table) {
            $table->text('help_text')->nullable()->after('options');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalogo_servicios_campos_plantilla', function (Blueprint $table) {
            $table->dropColumn('help_text');
        });
    }
};
