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
        Schema::create('catalogo_servicios_auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('catalogo_servicios_usuarios')
                ->nullOnDelete();
            $table->string('module', 100);
            $table->string('action', 100);
            $table->string('description', 255)->nullable();
            $table->string('affected_table', 100)->nullable();
            $table->unsignedBigInteger('affected_id')->nullable();
            $table->text('changes')->nullable()->comment('JSON formatted data');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['module', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_servicios_auditoria');
    }
};
