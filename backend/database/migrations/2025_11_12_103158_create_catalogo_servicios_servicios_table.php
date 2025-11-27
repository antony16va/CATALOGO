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
        Schema::create('catalogo_servicios_servicios', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 150);
            $table->string('slug', 160)->unique();
            $table->text('description');
            $table->foreignId('category_id')
                ->constrained('catalogo_servicios_categorias')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('subcategory_id')
                ->nullable()
                ->constrained('catalogo_servicios_subcategorias')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreignId('sla_id')
                ->nullable()
                ->constrained('catalogo_servicios_sla_niveles')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->enum('priority', ['Baja', 'Media', 'Alta', 'Crítica'])->default('Media');
            $table->enum('status', ['Borrador', 'Publicado', 'Inactivo'])->default('Borrador');
            $table->text('keywords')->nullable();
            $table->text('metadata')->nullable()->comment('JSON formatted data');
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by_id')
                ->nullable()
                ->constrained('catalogo_servicios_usuarios')
                ->nullOnDelete();
            $table->foreignId('updated_by_id')
                ->nullable()
                ->constrained('catalogo_servicios_usuarios')
                ->nullOnDelete();
            $table->timestamps();

            // FULLTEXT index removed for MySQL 5.5 compatibility
            // Use regular index instead
            $table->index('keywords');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalogo_servicios_servicios');
    }
};
