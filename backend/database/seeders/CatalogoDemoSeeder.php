<?php

namespace Database\Seeders;

use App\Enums\RequestStatus;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\ServiceTemplate;
use App\Models\SlaLevel;
use App\Models\Subcategory;
use App\Models\TemplateField;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CatalogoDemoSeeder extends Seeder
{
    /**
     * Ejecuta la carga completa de datos de demostración.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $admin = User::updateOrCreate(
                ['email' => 'avalencia@gmail.com'],
                [
                    'full_name' => 'Administrador General',
                    'username' => 'admin',
                    'password' => Hash::make('12345Va'),
                    'role' => 'Administrador',
                    'active' => true,
                ],
            );

            $analyst = User::updateOrCreate(
                ['email' => 'antony@gmail.com'],
                [
                    'full_name' => 'Analista de Servicios',
                    'username' => 'analista',
                    'password' => Hash::make('12345Va'),
                    'role' => 'Administrador',
                    'active' => true,
                ],
            );

            $employee = User::updateOrCreate(
                ['email' => 'antony16va@gmail.com'],
                [
                    'full_name' => 'Usuario Demo',
                    'username' => 'usuario.demo',
                    'password' => Hash::make('12345Va'),
                    'role' => 'Usuario',
                    'active' => true,
                ],
            );

            $categoriesMap = [];
            $subcategoriesMap = [];

            $iconPalette = ['💻', '🏗️', '🤝', '📡', '🧠', '📦'];
            $colorPalette = [
                'from-blue-500 to-cyan-500',
                'from-emerald-500 to-teal-500',
                'from-amber-500 to-orange-500',
                'from-indigo-500 to-purple-500',
                'from-rose-500 to-red-500',
                'from-slate-500 to-slate-600',
            ];

            $catalog = [
                'Tecnología' => [
                    'description' => 'Servicios de TI, soporte y automatización.',
                    'subcategories' => [
                        'Soporte y Mesa de Ayuda' => 'Atención de incidencias y requerimientos de usuarios.',
                        'Infraestructura' => 'Gestión de hardware, redes y data center.',
                        'Automatización' => 'Bots, RPA y scripts de productividad.',
                    ],
                ],
                'Operaciones' => [
                    'description' => 'Servicios operativos internos.',
                    'subcategories' => [
                        'Recursos Humanos' => 'Procesos de onboarding, payroll y beneficios.',
                        'Compras' => 'Gestión de proveedores y adquisiciones.',
                    ],
                ],
                'Servicios al Cliente' => [
                    'description' => 'Servicios que impactan la experiencia del cliente final.',
                    'subcategories' => [
                        'Plataformas' => 'Gestión de herramientas de atención.',
                        'Comunicaciones' => 'Materiales, notificaciones y campañas.',
                    ],
                ],
            ];

            $categoryIndex = 0;
            foreach ($catalog as $categoryName => $categoryData) {
                $icon = $iconPalette[$categoryIndex % count($iconPalette)];
                $color = $colorPalette[$categoryIndex % count($colorPalette)];

                $category = Category::updateOrCreate(
                    ['name' => $categoryName],
                    [
                        'description' => $categoryData['description'],
                        'active' => true,
                        'icon' => $icon,
                        'color' => $color,
                    ],
                );

                $categoriesMap[$categoryName] = $category;
                $categoryIndex++;

                foreach ($categoryData['subcategories'] as $subName => $subDescription) {
                    $subcategory = Subcategory::updateOrCreate(
                        [
                            'category_id' => $category->id,
                            'name' => $subName,
                        ],
                        [
                            'description' => $subDescription,
                            'active' => true,
                        ],
                    );

                    $subcategoriesMap[$subName] = $subcategory;
                }
            }

            $slaMap = [];
            $slaDefinitions = [
                [
                    'name' => 'Respuesta Crítica 24/7',
                    'first_response_minutes' => 30,
                    'resolution_minutes' => 240,
                    'description' => 'Incidencias graves que afectan la operación completa.',
                    'pause_conditions' => 'Se pausa cuando se espera confirmación de terceros.',
                ],
                [
                    'name' => 'Soporte Estándar',
                    'first_response_minutes' => 120,
                    'resolution_minutes' => 720,
                    'description' => 'Requerimientos operativos de prioridad media.',
                    'pause_conditions' => 'Se pausa cuando falta información del usuario.',
                ],
                [
                    'name' => 'Mejoras Evolutivas',
                    'first_response_minutes' => 480,
                    'resolution_minutes' => 1440,
                    'description' => 'Solicitudes planificadas de mejora continua.',
                    'pause_conditions' => 'Sin pausa automática.',
                ],
            ];

            foreach ($slaDefinitions as $definition) {
                $sla = SlaLevel::updateOrCreate(
                    ['name' => $definition['name']],
                    [
                        'description' => $definition['description'],
                        'first_response_minutes' => $definition['first_response_minutes'],
                        'resolution_minutes' => $definition['resolution_minutes'],
                        'pause_conditions' => $definition['pause_conditions'],
                        'active' => true,
                    ],
                );

                $slaMap[$definition['name']] = $sla;
            }

            $servicesMap = [];
            $services = [
                [
                    'code' => 'SRV-CA-001',
                    'name' => 'Mesa de Ayuda TI Global',
                    'category' => 'Tecnología',
                    'subcategory' => 'Soporte y Mesa de Ayuda',
                    'sla' => 'Respuesta Crítica 24/7',
                    'priority' => 'Alta',
                    'description' => 'Atiende incidentes críticos y tickets de alta prioridad de todos los países.',
                    'keywords' => 'mesa de ayuda, soporte, crítico, incidentes',
                ],
                [
                    'code' => 'SRV-CA-002',
                    'name' => 'Gestión de Hardware & Periféricos',
                    'category' => 'Tecnología',
                    'subcategory' => 'Infraestructura',
                    'sla' => 'Soporte Estándar',
                    'priority' => 'Media',
                    'description' => 'Solicitud de laptops, celulares, upgrade de memoria y periféricos.',
                    'keywords' => 'hardware, laptop, celular, periféricos',
                ],
                [
                    'code' => 'SRV-OP-101',
                    'name' => 'Onboarding de Colaboradores',
                    'category' => 'Operaciones',
                    'subcategory' => 'Recursos Humanos',
                    'sla' => 'Mejoras Evolutivas',
                    'priority' => 'Media',
                    'description' => 'Coordinación integral del ingreso de nuevas personas (cuentas, accesos, kit de bienvenida).',
                    'keywords' => 'onboarding, ingreso, rrhh, accesos',
                ],
                [
                    'code' => 'SRV-CLI-050',
                    'name' => 'Configuración de Plataforma de Atención',
                    'category' => 'Servicios al Cliente',
                    'subcategory' => 'Plataformas',
                    'sla' => 'Soporte Estándar',
                    'priority' => 'Alta',
                    'description' => 'Ajustes, creaciones de campañas y automatizaciones en la plataforma omnicanal.',
                    'keywords' => 'plataforma, contact center, campañas',
                ],
            ];

            foreach ($services as $serviceData) {
                $category = $categoriesMap[$serviceData['category']];
                $subcategory = $subcategoriesMap[$serviceData['subcategory']];
                $sla = $slaMap[$serviceData['sla']];

                $service = Service::updateOrCreate(
                    ['code' => $serviceData['code']],
                    [
                        'name' => $serviceData['name'],
                        'description' => $serviceData['description'],
                        'category_id' => $category->id,
                        'subcategory_id' => $subcategory->id,
                        'sla_id' => $sla->id,
                        'priority' => $serviceData['priority'],
                        'status' => 'Publicado',
                        'keywords' => $serviceData['keywords'],
                        'metadata' => ['owner' => $category->name],
                        'published_at' => now()->subDays(rand(5, 40)),
                        'created_by_id' => $admin->id,
                        'updated_by_id' => $analyst->id,
                    ],
                );

                $servicesMap[$service->code] = $service;

                $template = ServiceTemplate::updateOrCreate(
                    [
                        'service_id' => $service->id,
                        'name' => 'Formulario principal',
                    ],
                    [
                        'description' => 'Plantilla base para recepción de solicitudes.',
                        'active' => true,
                        'version' => 1,
                    ],
                );

                $fields = [
                    [
                        'field_name' => 'titulo',
                        'label' => 'Título / Resumen',
                        'type' => 'texto',
                        'order' => 1,
                        'required' => true,
                        'placeholder' => 'Ej. Restablecer acceso VPN',
                        'help_text' => 'Resume el motivo principal de la solicitud.',
                    ],
                    [
                        'field_name' => 'descripcion',
                        'label' => 'Descripción detallada',
                        'type' => 'textarea',
                        'order' => 2,
                        'required' => true,
                        'placeholder' => 'Describe el problema o solicitud con fechas y responsables',
                        'help_text' => 'Incluye antecedentes, responsables y fechas importantes.',
                    ],
                    [
                        'field_name' => 'impacto',
                        'label' => 'Impacto',
                        'type' => 'select',
                        'order' => 3,
                        'required' => true,
                        'options' => ['Alto', 'Medio', 'Bajo'],
                        'error_message' => 'Selecciona un impacto válido',
                        'help_text' => 'Indica cómo afecta esta solicitud al negocio.',
                    ],
                    [
                        'field_name' => 'adjuntos',
                        'label' => 'Adjuntos',
                        'type' => 'archivo',
                        'order' => 4,
                        'required' => false,
                        'help_text' => 'Agrega evidencia o archivos de soporte (opcional).',
                    ],
                ];

                foreach ($fields as $field) {
                    TemplateField::updateOrCreate(
                        [
                            'template_id' => $template->id,
                            'field_name' => $field['field_name'],
                        ],
                        $field,
                    );
                }
            }

            $requests = [
                [
                    'service' => 'SRV-CA-001',
                    'code' => 'REQ-0001',
                    'status' => RequestStatus::Resolved->value,
                    'payload' => [
                        'titulo' => 'Caída de VPN regional',
                        'descripcion' => 'VPN fuera de servicio desde las 08:30. Usuarios sin acceso a SAP.',
                        'impacto' => 'Alto',
                    ],
                ],
                [
                    'service' => 'SRV-CA-002',
                    'code' => 'REQ-0002',
                    'status' => RequestStatus::InProgress->value,
                    'payload' => [
                        'titulo' => 'Laptop para nuevo gerente comercial',
                        'descripcion' => 'Equipo con 32 GB RAM, 1 TB SSD. Entrega antes de inducción.',
                        'impacto' => 'Medio',
                    ],
                ],
                [
                    'service' => 'SRV-OP-101',
                    'code' => 'REQ-0003',
                    'status' => RequestStatus::Pending->value,
                    'payload' => [
                        'titulo' => 'Onboarding regional mayo',
                        'descripcion' => 'Coordinación de acceso y kit para 12 ingresos en Lima y Bogotá.',
                        'impacto' => 'Medio',
                    ],
                ],
            ];

            foreach ($requests as $requestData) {
                $service = $servicesMap[$requestData['service']];
                $sla = $service->sla;

                ServiceRequest::updateOrCreate(
                    ['code' => $requestData['code']],
                    [
                        'service_id' => $service->id,
                        'user_id' => $employee->id,
                        'template_id' => $service->templates()->value('id'),
                        'form_payload' => $requestData['payload'],
                        'status' => $requestData['status'],
                        'submitted_at' => now()->subDays(rand(1, 10)),
                        'redirected_at' => null,
                        'sla_snapshot' => [
                            'name' => $sla->name,
                            'first_response_minutes' => $sla->first_response_minutes,
                            'resolution_minutes' => $sla->resolution_minutes,
                        ],
                        'service_snapshot' => [
                            'code' => $service->code,
                            'name' => $service->name,
                            'priority' => $service->priority,
                        ],
                    ],
                );
            }

            $logEntries = [
                [
                    'module' => 'Servicios',
                    'action' => 'Publicar',
                    'description' => 'Se publicó el catálogo Mesa de Ayuda TI Global.',
                    'user' => $admin,
                ],
                [
                    'module' => 'Solicitudes',
                    'action' => 'Crear',
                    'description' => 'REQ-0002 fue registrado por Usuario Demo.',
                    'user' => $employee,
                ],
            ];

            foreach ($logEntries as $entry) {
                AuditLog::create([
                    'user_id' => $entry['user']->id,
                    'module' => $entry['module'],
                    'action' => $entry['action'],
                    'description' => $entry['description'],
                    'affected_table' => 'catalogo_servicios_servicios',
                    'affected_id' => null,
                    'changes' => null,
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Seeder/CLI',
                ]);
            }
        });
    }
}
