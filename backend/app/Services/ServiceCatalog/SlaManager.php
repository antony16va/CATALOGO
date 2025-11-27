<?php

namespace App\Services\ServiceCatalog;

use App\Models\SlaLevel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Servicio de Gestión de Niveles SLA
 * 
 * Encapsula la lógica de negocio para los Acuerdos de Nivel de Servicio.
 * Los SLA definen los tiempos comprometidos para atender solicitudes.
 * 
 * Tiempos se manejan en MINUTOS:
 * - first_response_minutes: Tiempo máximo para dar primera respuesta
 * - resolution_minutes: Tiempo máximo para resolver la solicitud
 * 
 * Ejemplos típicos:
 * - Crítico: 15 min respuesta, 1 hora resolución
 * - Alto: 30 min respuesta, 4 horas resolución
 * - Normal: 2 horas respuesta, 8 horas resolución
 * - Bajo: 4 horas respuesta, 24 horas resolución
 */
class SlaManager
{
    /**
     * Listar niveles SLA con filtros y paginación
     * 
     * Soporta los siguientes filtros:
     * - active: bool - Filtra por estado activo/inactivo
     * - per_page: int - Elementos por página (default: 15)
     * 
     * @param array $filters Filtros opcionales
     * @return LengthAwarePaginator Niveles SLA paginados
     */
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return SlaLevel::query()
            // Filtro por estado activo (convierte string a booleano)
            ->when($filters['active'] ?? null, fn ($query, $active) => $query->where('active', filter_var($active, FILTER_VALIDATE_BOOL)))
            // Ordena alfabéticamente
            ->orderBy('name')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Crear nuevo nivel SLA
     * 
     * Los tiempos se especifican en minutos.
     * Se recomienda crear SLAs con nombres descriptivos como
     * "Crítico", "Alto", "Normal", "Bajo".
     * 
     * @param array $data Datos validados del SLA
     * @return SlaLevel El nivel SLA creado
     */
    public function store(array $data): SlaLevel
    {
        return SlaLevel::create($data);
    }

    /**
     * Actualizar nivel SLA existente
     * 
     * NOTA: Los cambios afectan solo a futuras solicitudes.
     * Las solicitudes existentes mantienen el SLA con el que fueron creadas.
     * 
     * @param SlaLevel $sla Nivel SLA a actualizar
     * @param array $data Datos validados a actualizar
     * @return SlaLevel El nivel SLA actualizado
     */
    public function update(SlaLevel $sla, array $data): SlaLevel
    {
        $sla->update($data);
        return $sla;
    }

    /**
     * Eliminar nivel SLA
     * 
     * ADVERTENCIA: Si hay servicios usando este SLA, 
     * la eliminación puede fallar por restricción de FK.
     * Primero reasignar los servicios a otro SLA.
     * 
     * @param SlaLevel $sla Nivel SLA a eliminar
     */
    public function delete(SlaLevel $sla): void
    {
        $sla->delete();
    }
}
