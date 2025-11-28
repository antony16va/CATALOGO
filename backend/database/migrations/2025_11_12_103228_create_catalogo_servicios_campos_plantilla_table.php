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
        Schema::create('catalogo_servicios_campos_plantilla', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')
                ->constrained('catalogo_servicios_plantillas_solicitud')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('field_name', 100);
            $table->string('label', 150);
            $table->enum('type', ['texto', 'textarea', 'email', 'numero', 'fecha', 'select', 'checkbox', 'archivo']);
            $table->text('options')->nullable()->comment('JSON formatted data');
            $table->boolean('required')->default(false);
            $table->string('validation_pattern')->nullable();
            $table->string('error_message')->nullable();
            $table->string('placeholder', 150)->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['template_id', 'field_name'], 'campos_tpl_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_servicios_campos_plantilla');
    }
};
