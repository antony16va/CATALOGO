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
        Schema::create('catalogo_servicios_solicitudes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')
                ->constrained('catalogo_servicios_servicios')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('catalogo_servicios_usuarios')
                ->nullOnDelete();
            $table->foreignId('template_id')
                ->nullable()
                ->constrained('catalogo_servicios_plantillas_solicitud')
                ->nullOnDelete();
            $table->string('code', 30)->unique();
            $table->text('form_payload')->comment('JSON formatted data');
            $table->enum('status', ['Pendiente', 'En Proceso', 'Resuelta', 'Cancelada'])->default('Pendiente');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('redirected_at')->nullable();
            $table->text('sla_snapshot')->nullable()->comment('JSON formatted data');
            $table->text('service_snapshot')->nullable()->comment('JSON formatted data');
            $table->timestamps();

            $table->index(['service_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_servicios_solicitudes');
    }
};
