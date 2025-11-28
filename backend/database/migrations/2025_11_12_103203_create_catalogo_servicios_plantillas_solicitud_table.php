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
        Schema::create('catalogo_servicios_plantillas_solicitud', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')
                ->constrained('catalogo_servicios_servicios')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->unsignedSmallInteger('version')->default(1);
            $table->timestamps();

            $table->unique(['service_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_servicios_plantillas_solicitud');
    }
};
