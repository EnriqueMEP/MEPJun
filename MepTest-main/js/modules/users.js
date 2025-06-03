// ===== USERS MODULE - ENHANCED =====
// Módulo de Gestión de Usuarios completo con todas las funcionalidades

class UsersModule {
    constructor() {
        this.moduleId = 'users';
        this.currentTab = 'dashboard';
        this.data = {};
        this.isInitialized = false;
        this.users = [];
        this.roles = [];
        this.permissions = [];
        this.auditLogs = [];
        this.filters = {
            search: '',
            role: '',
            status: '',
            department: ''
        };
        this.sortBy = 'created';
        this.sortOrder = 'desc';
        this.currentPage = 1;
        this.itemsPerPage = 25;
        this.selectedUsers = new Set();
    }

    async render(container) {
        try {
            console.log('👥 Renderizando módulo de Usuarios...');

            const usersHTML = `
                <div class="users-module">
                    <!-- Header del módulo -->
                    <div class="module-header">
                        <div class="module-title">
                            <h1>Gestión de Usuarios</h1>
                            <p>Administración de usuarios, roles y permisos del sistema</p>
                        </div>
                        <div class="module-actions">
                            <button class="btn btn-secondary" onclick="window.app.modules.users.refreshData()">
                                <i data-lucide="refresh-cw"></i>
                                Actualizar
                            </button>
                            <button class="btn btn-secondary" onclick="window.app.modules.users.exportUsers()">
                                <i data-lucide="download"></i>
                                Exportar
                            </button>
                            <button class="btn btn-primary" onclick="window.app.modules.users.createUser()">
                                <i data-lucide="user-plus"></i>
                                Nuevo Usuario
                            </button>
                        </div>
                    </div>

                    <!-- Navegación por pestañas -->
                    <div class="users-navigation">
                        <nav class="tab-navigation">
                            <button class="tab-btn active" data-tab="dashboard">
                                <i data-lucide="layout-dashboard"></i>
                                Dashboard
                            </button>
                            <button class="tab-btn" data-tab="users">
                                <i data-lucide="users"></i>
                                Usuarios
                            </button>
                            <button class="tab-btn" data-tab="roles">
                                <i data-lucide="shield"></i>
                                Roles y Permisos
                            </button>
                            <button class="tab-btn" data-tab="audit">
                                <i data-lucide="file-text"></i>
                                Auditoría
                            </button>
                            <button class="tab-btn" data-tab="security">
                                <i data-lucide="lock"></i>
                                Seguridad
                            </button>
                            <button class="tab-btn" data-tab="settings">
                                <i data-lucide="settings"></i>
                                Configuración
                            </button>
                        </nav>
                    </div>

                    <!-- Contenido de las pestañas -->
                    <div class="users-content">
                        <!-- Dashboard Tab -->
                        <div class="tab-panel active" data-panel="dashboard">
                            <div class="users-dashboard">
                                <!-- KPIs principales -->
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-icon">
                                            <i data-lucide="users"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>Total Usuarios</h3>
                                            <div class="stat-value">247</div>
                                            <div class="stat-change positive">+12 este mes</div>
                                        </div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon success">
                                            <i data-lucide="user-check"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>Usuarios Activos</h3>
                                            <div class="stat-value">198</div>
                                            <div class="stat-change positive">80% del total</div>
                                        </div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon warning">
                                            <i data-lucide="clock"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>Últimas 24h</h3>
                                            <div class="stat-value">34</div>
                                            <div class="stat-change positive">+8 vs ayer</div>
                                        </div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">
                                            <i data-lucide="shield"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>Roles Definidos</h3>
                                            <div class="stat-value">8</div>
                                            <div class="stat-change">5 activos</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Widgets del dashboard -->
                                <div class="dashboard-widgets">
                                    <!-- Widget: Distribución por roles -->
                                    <div class="widget">
                                        <div class="widget-header">
                                            <h3>Distribución por Roles</h3>
                                            <button class="btn btn-ghost btn-sm" onclick="window.app.modules.users.switchToTab('roles')">Ver roles</button>
                                        </div>
                                        <div class="widget-content">
                                            <div class="roles-distribution" id="roles-distribution">
                                                <!-- Los datos se cargan dinámicamente -->
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Widget: Usuarios recientes -->
                                    <div class="widget">
                                        <div class="widget-header">
                                            <h3>Usuarios Recientes</h3>
                                            <button class="btn btn-ghost btn-sm" onclick="window.app.modules.users.switchToTab('users')">Ver todos</button>
                                        </div>
                                        <div class="widget-content">
                                            <div class="recent-users" id="recent-users-list">
                                                <!-- Los usuarios se cargan dinámicamente -->
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Widget: Actividad de login -->
                                    <div class="widget">
                                        <div class="widget-header">
                                            <h3>Actividad de Login</h3>
                                            <button class="btn btn-ghost btn-sm" onclick="window.app.modules.users.switchToTab('audit')">Ver auditoría</button>
                                        </div>
                                        <div class="widget-content">
                                            <div class="login-activity" id="login-activity-chart">
                                                <!-- El gráfico se carga dinámicamente -->
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Widget: Seguridad del sistema -->
                                    <div class="widget">
                                        <div class="widget-header">
                                            <h3>Estado de Seguridad</h3>
                                            <button class="btn btn-ghost btn-sm" onclick="window.app.modules.users.switchToTab('security')">Configurar</button>
                                        </div>
                                        <div class="widget-content">
                                            <div class="security-status" id="security-status">
                                                <!-- El estado se carga dinámicamente -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Users Tab -->
                        <div class="tab-panel" data-panel="users">
                            <div class="users-management">
                                <div class="section-header">
                                    <h2>Gestión de Usuarios</h2>
                                    <div class="section-actions">
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.exportUsers()">
                                            <i data-lucide="download"></i>
                                            Exportar
                                        </button>
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.bulkActions()">
                                            <i data-lucide="check-square"></i>
                                            Acciones Masivas
                                        </button>
                                        <button class="btn btn-primary" onclick="window.app.modules.users.createUser()">
                                            <i data-lucide="user-plus"></i>
                                            Nuevo Usuario
                                        </button>
                                    </div>
                                </div>

                                <!-- Filtros y búsqueda -->
                                <div class="users-filters">
                                    <div class="filter-row">
                                        <div class="search-container-enhanced">
                                            <i data-lucide="search" class="search-icon-enhanced"></i>
                                            <input type="text" placeholder="Buscar por nombre, email o departamento..." class="search-input-enhanced" id="user-search">
                                        </div>
                                        <div class="filters-grid">
                                            <select class="filter-select" id="role-filter">
                                                <option value="">Todos los roles</option>
                                            </select>
                                            <select class="filter-select" id="status-filter">
                                                <option value="">Todos los estados</option>
                                                <option value="active">🟢 Activos</option>
                                                <option value="inactive">🔴 Inactivos</option>
                                                <option value="pending">🟡 Pendientes</option>
                                                <option value="suspended">⛔ Suspendidos</option>
                                            </select>
                                            <select class="filter-select" id="department-filter">
                                                <option value="">Todos los departamentos</option>
                                            </select>
                                        </div>
                                        <div class="filter-actions">
                                            <button class="btn btn-secondary" onclick="window.app.modules.users.applyFilters()">
                                                <i data-lucide="filter"></i>
                                                Filtrar
                                            </button>
                                            <button class="btn btn-ghost" onclick="window.app.modules.users.clearFilters()">
                                                <i data-lucide="x"></i>
                                                Limpiar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Quick stats -->
                                <div class="users-quick-stats" id="users-quick-stats">
                                    <!-- Las estadísticas se cargan dinámicamente -->
                                </div>

                                <!-- Vista de usuarios -->
                                <div class="users-view">
                                    <div class="view-controls">
                                        <div class="view-options">
                                            <button class="view-btn active" data-view="table">
                                                <i data-lucide="table"></i>
                                                Tabla
                                            </button>
                                            <button class="view-btn" data-view="grid">
                                                <i data-lucide="grid-3x3"></i>
                                                Tarjetas
                                            </button>
                                        </div>
                                        <div class="sort-options">
                                            <select class="sort-select" id="sort-users">
                                                <option value="created-desc">📅 Más recientes</option>
                                                <option value="created-asc">📅 Más antiguos</option>
                                                <option value="name-asc">🔤 A-Z</option>
                                                <option value="name-desc">🔤 Z-A</option>
                                                <option value="last-login-desc">🔄 Último login</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Tabla de usuarios -->
                                    <div class="users-table-view" id="users-table">
                                        <!-- La tabla se carga dinámicamente -->
                                    </div>

                                    <!-- Vista en tarjetas -->
                                    <div class="users-grid-view" id="users-grid" style="display: none;">
                                        <!-- Las tarjetas se cargan dinámicamente -->
                                    </div>
                                </div>

                                <!-- Paginación -->
                                <div class="pagination-enhanced" id="users-pagination">
                                    <!-- La paginación se genera dinámicamente -->
                                </div>
                            </div>
                        </div>

                        <!-- Roles Tab -->
                        <div class="tab-panel" data-panel="roles">
                            <div class="roles-management">
                                <div class="section-header">
                                    <h2>Roles y Permisos</h2>
                                    <div class="section-actions">
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.exportRoles()">
                                            <i data-lucide="download"></i>
                                            Exportar Roles
                                        </button>
                                        <button class="btn btn-primary" onclick="window.app.modules.users.createRole()">
                                            <i data-lucide="shield-plus"></i>
                                            Nuevo Rol
                                        </button>
                                    </div>
                                </div>

                                <!-- Grid de roles -->
                                <div class="roles-grid" id="roles-grid">
                                    <!-- Los roles se cargan dinámicamente -->
                                </div>

                                <!-- Matriz de permisos -->
                                <div class="permissions-section">
                                    <h3>Matriz de Permisos</h3>
                                    <div class="permissions-matrix" id="permissions-matrix">
                                        <!-- La matriz se carga dinámicamente -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Audit Tab -->
                        <div class="tab-panel" data-panel="audit">
                            <div class="audit-management">
                                <div class="section-header">
                                    <h2>Auditoría del Sistema</h2>
                                    <div class="section-actions">
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.exportAudit()">
                                            <i data-lucide="download"></i>
                                            Exportar Logs
                                        </button>
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.clearOldLogs()">
                                            <i data-lucide="trash-2"></i>
                                            Limpiar Antiguos
                                        </button>
                                    </div>
                                </div>

                                <!-- Filtros de auditoría -->
                                <div class="audit-filters">
                                    <div class="filter-group">
                                        <select class="filter-select" id="audit-period">
                                            <option value="today">Hoy</option>
                                            <option value="week">Esta semana</option>
                                            <option value="month" selected>Este mes</option>
                                            <option value="quarter">Este trimestre</option>
                                            <option value="custom">Personalizado</option>
                                        </select>
                                        <select class="filter-select" id="audit-action">
                                            <option value="">Todas las acciones</option>
                                            <option value="login">Login</option>
                                            <option value="logout">Logout</option>
                                            <option value="create">Crear</option>
                                            <option value="update">Actualizar</option>
                                            <option value="delete">Eliminar</option>
                                        </select>
                                        <input type="text" class="filter-input" id="audit-user" placeholder="Usuario...">
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.updateAudit()">
                                            <i data-lucide="search"></i>
                                            Buscar
                                        </button>
                                    </div>
                                </div>

                                <!-- Timeline de auditoría -->
                                <div class="audit-timeline" id="audit-timeline">
                                    <!-- Los logs se cargan dinámicamente -->
                                </div>
                            </div>
                        </div>

                        <!-- Security Tab -->
                        <div class="tab-panel" data-panel="security">
                            <div class="security-management">
                                <div class="section-header">
                                    <h2>Configuración de Seguridad</h2>
                                    <div class="section-actions">
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.resetSecuritySettings()">
                                            <i data-lucide="refresh-cw"></i>
                                            Restaurar Defecto
                                        </button>
                                        <button class="btn btn-primary" onclick="window.app.modules.users.saveSecuritySettings()">
                                            <i data-lucide="save"></i>
                                            Guardar Configuración
                                        </button>
                                    </div>
                                </div>

                                <!-- Configuración de seguridad -->
                                <div class="security-grid">
                                    <!-- Políticas de contraseñas -->
                                    <div class="security-card">
                                        <div class="security-card-header">
                                            <div class="security-title">
                                                <i data-lucide="key"></i>
                                                <h3>Políticas de Contraseñas</h3>
                                            </div>
                                        </div>
                                        <div class="security-card-content">
                                            <div class="security-setting">
                                                <label class="security-label">Longitud mínima</label>
                                                <input type="number" class="security-input" value="8" min="6" max="32">
                                            </div>
                                            <div class="security-setting">
                                                <div class="security-toggle">
                                                    <label class="security-label">Requerir mayúsculas</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="require-uppercase" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="security-setting">
                                                <div class="security-toggle">
                                                    <label class="security-label">Requerir números</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="require-numbers" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="security-setting">
                                                <div class="security-toggle">
                                                    <label class="security-label">Requerir símbolos</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="require-symbols">
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Autenticación de dos factores -->
                                    <div class="security-card">
                                        <div class="security-card-header">
                                            <div class="security-title">
                                                <i data-lucide="smartphone"></i>
                                                <h3>Autenticación de Dos Factores</h3>
                                            </div>
                                        </div>
                                        <div class="security-card-content">
                                            <div class="security-setting">
                                                <div class="security-toggle">
                                                    <label class="security-label">Forzar 2FA para administradores</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="force-2fa-admin" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="security-setting">
                                                <div class="security-toggle">
                                                    <label class="security-label">Permitir 2FA opcional</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="allow-2fa-optional" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Bloqueo de cuentas -->
                                    <div class="security-card">
                                        <div class="security-card-header">
                                            <div class="security-title">
                                                <i data-lucide="shield-x"></i>
                                                <h3>Bloqueo de Cuentas</h3>
                                            </div>
                                        </div>
                                        <div class="security-card-content">
                                            <div class="security-setting">
                                                <label class="security-label">Intentos fallidos permitidos</label>
                                                <input type="number" class="security-input" value="5" min="3" max="10">
                                            </div>
                                            <div class="security-setting">
                                                <label class="security-label">Tiempo de bloqueo (minutos)</label>
                                                <input type="number" class="security-input" value="30" min="5" max="1440">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Sesiones -->
                                    <div class="security-card">
                                        <div class="security-card-header">
                                            <div class="security-title">
                                                <i data-lucide="clock"></i>
                                                <h3>Gestión de Sesiones</h3>
                                            </div>
                                        </div>
                                        <div class="security-card-content">
                                            <div class="security-setting">
                                                <label class="security-label">Tiempo de sesión (horas)</label>
                                                <input type="number" class="security-input" value="8" min="1" max="24">
                                            </div>
                                            <div class="security-setting">
                                                <div class="security-toggle">
                                                    <label class="security-label">Cerrar sesión al cerrar navegador</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="close-session-browser">
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Settings Tab -->
                        <div class="tab-panel" data-panel="settings">
                            <div class="users-settings">
                                <div class="section-header">
                                    <h2>Configuración de Usuarios</h2>
                                    <div class="section-actions">
                                        <button class="btn btn-secondary" onclick="window.app.modules.users.resetSettings()">
                                            <i data-lucide="refresh-cw"></i>
                                            Restaurar Defecto
                                        </button>
                                        <button class="btn btn-primary" onclick="window.app.modules.users.saveSettings()">
                                            <i data-lucide="save"></i>
                                            Guardar Configuración
                                        </button>
                                    </div>
                                </div>

                                <!-- Configuración general -->
                                <div class="settings-grid">
                                    <div class="settings-card">
                                        <div class="settings-header">
                                            <div class="settings-title">
                                                <i data-lucide="users"></i>
                                                <h3>Configuración General</h3>
                                            </div>
                                        </div>
                                        <div class="settings-content">
                                            <div class="setting-item">
                                                <div class="setting-toggle">
                                                    <label class="setting-label">Permitir auto-registro</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="allow-registration">
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="setting-item">
                                                <div class="setting-toggle">
                                                    <label class="setting-label">Verificación de email obligatoria</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="require-email-verification" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="setting-item">
                                                <label class="setting-label">Rol por defecto para nuevos usuarios</label>
                                                <select class="setting-select" id="default-role">
                                                    <option value="user">Usuario</option>
                                                    <option value="viewer">Visualizador</option>
                                                    <option value="contributor">Colaborador</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Notificaciones -->
                                    <div class="settings-card">
                                        <div class="settings-header">
                                            <div class="settings-title">
                                                <i data-lucide="bell"></i>
                                                <h3>Notificaciones</h3>
                                            </div>
                                        </div>
                                        <div class="settings-content">
                                            <div class="setting-item">
                                                <div class="setting-toggle">
                                                    <label class="setting-label">Notificar nuevos usuarios</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="notify-new-users" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="setting-item">
                                                <div class="setting-toggle">
                                                    <label class="setting-label">Notificar cambios de rol</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="notify-role-changes" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="setting-item">
                                                <div class="setting-toggle">
                                                    <label class="setting-label">Notificar logins sospechosos</label>
                                                    <div class="toggle-switch">
                                                        <input type="checkbox" id="notify-suspicious-login" checked>
                                                        <span class="toggle-slider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = usersHTML;
            this.isInitialized = true;

        } catch (error) {
            console.error('❌ Error renderizando módulo de Usuarios:', error);
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i data-lucide="alert-triangle"></i>
                    </div>
                    <h3>Error al cargar Usuarios</h3>
                    <p>No se pudo cargar el módulo de usuarios. Inténtalo de nuevo.</p>
                    <button class="btn btn-primary" onclick="window.app.loadModule('users')">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    async afterRender() {
        try {
            console.log('🔧 Configurando módulo de Usuarios...');
            
            // Setup tab navigation
            this.setupTabNavigation();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadData();
            
            // Render initial dashboard content
            this.renderDashboardContent();
            
            console.log('✅ Módulo de Usuarios configurado correctamente');
            
        } catch (error) {
            console.error('❌ Error en afterRender del módulo de Usuarios:', error);
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.users-module .tab-btn');
        const tabPanels = document.querySelectorAll('.users-module .tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
                
                this.currentTab = targetTab;
                console.log(`📂 Cambiando a pestaña de usuarios: ${targetTab}`);
                
                // Load tab-specific data
                this.loadTabData(targetTab);
            });
        });
    }

    setupEventListeners() {
        // Search functionality
        const userSearch = document.getElementById('user-search');
        if (userSearch) {
            userSearch.addEventListener('input', 
                this.debounce((e) => this.handleUserSearch(e.target.value), 300)
            );
        }

        // Filter changes
        const filters = ['role-filter', 'status-filter', 'department-filter'];
        filters.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                filterElement.addEventListener('change', () => this.updateFilters());
            }
        });

        // View controls
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const viewType = button.getAttribute('data-view');
                this.switchView(viewType);
            });
        });

        // Sort controls
        const sortSelect = document.getElementById('sort-users');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.handleSortChange(e.target.value));
        }

        // Audit period change
        const auditPeriod = document.getElementById('audit-period');
        if (auditPeriod) {
            auditPeriod.addEventListener('change', (e) => this.handlePeriodChange(e.target.value));
        }
    }

    async loadData() {
        try {
            console.log('📊 Cargando datos de usuarios...');
            
            // Simulate loading data - replace with actual API calls
            await new Promise(resolve => setTimeout(resolve, 800));
            
            this.data = {
                stats: {
                    totalUsers: 247,
                    activeUsers: 198,
                    last24h: 34,
                    rolesCount: 8
                },
                users: this.generateSampleUsers(),
                roles: this.generateSampleRoles(),
                permissions: this.generateSamplePermissions(),
                auditLogs: this.generateSampleAuditLogs(),
                departments: this.generateSampleDepartments(),
                rolesDistribution: this.generateRolesDistribution(),
                recentUsers: this.generateRecentUsers(),
                loginActivity: this.generateLoginActivity(),
                securityStatus: this.generateSecurityStatus()
            };
            
            console.log('👥 Datos de usuarios cargados:', this.data);
            
        } catch (error) {
            console.error('❌ Error cargando datos de usuarios:', error);
            if (window.app) {
                window.app.showNotification('Error al cargar datos de usuarios', 'error');
            }
        }
    }

    generateSampleUsers() {
        return [
            {
                id: 1,
                name: 'Enrique García',
                email: 'enrique.garcia@mep-projects.com',
                avatar: 'EG',
                role: 'Administrador',
                department: 'Administración',
                status: 'active',
                lastLogin: '2025-06-02 14:30',
                created: '2024-01-15 09:00',
                permissions: ['*'],
                phone: '+34 612 345 678',
                location: 'Madrid, España',
                twoFactorEnabled: true,
                loginCount: 456,
                lastIP: '192.168.1.100'
            },
            {
                id: 2,
                name: 'Carlos López',
                email: 'carlos.lopez@mep-projects.com',
                avatar: 'CL',
                role: 'Desarrollador Senior',
                department: 'Desarrollo',
                status: 'active',
                lastLogin: '2025-06-02 12:15',
                created: '2024-02-20 10:30',
                permissions: ['projects.view', 'projects.edit', 'tasks.manage'],
                phone: '+34 687 234 567',
                location: 'Barcelona, España',
                twoFactorEnabled: true,
                loginCount: 324,
                lastIP: '192.168.1.101'
            },
            {
                id: 3,
                name: 'Laura Sánchez',
                email: 'laura.sanchez@mep-projects.com',
                avatar: 'LS',
                role: 'Diseñadora UX',
                department: 'Diseño',
                status: 'active',
                lastLogin: '2025-06-02 11:45',
                created: '2024-03-10 14:20',
                permissions: ['projects.view', 'design.edit'],
                phone: '+34 623 456 789',
                location: 'Valencia, España',
                twoFactorEnabled: false,
                loginCount: 298,
                lastIP: '192.168.1.102'
            },
            {
                id: 4,
                name: 'Pedro Ruiz',
                email: 'pedro.ruiz@mep-projects.com',
                avatar: 'PR',
                role: 'DevOps Engineer',
                department: 'Infraestructura',
                status: 'active',
                lastLogin: '2025-06-01 18:20',
                created: '2024-01-25 16:45',
                permissions: ['servers.manage', 'deploy.execute'],
                phone: '+34 654 789 012',
                location: 'Sevilla, España',
                twoFactorEnabled: true,
                loginCount: 412,
                lastIP: '192.168.1.103'
            },
            {
                id: 5,
                name: 'Ana Torres',
                email: 'ana.torres@mep-projects.com',
                avatar: 'AT',
                role: 'Marketing Manager',
                department: 'Marketing',
                status: 'inactive',
                lastLogin: '2025-05-28 15:30',
                created: '2024-04-05 11:15',
                permissions: ['marketing.view', 'marketing.edit'],
                phone: '+34 698 345 123',
                location: 'Bilbao, España',
                twoFactorEnabled: false,
                loginCount: 187,
                lastIP: '192.168.1.104'
            },
            {
                id: 6,
                name: 'David Morales',
                email: 'david.morales@mep-projects.com',
                avatar: 'DM',
                role: 'Analista de Datos',
                department: 'Análisis',
                status: 'pending',
                lastLogin: null,
                created: '2025-06-01 09:30',
                permissions: ['analytics.view'],
                phone: '+34 612 789 456',
                location: 'Málaga, España',
                twoFactorEnabled: false,
                loginCount: 0,
                lastIP: null
            }
        ];
    }

    generateSampleRoles() {
        return [
            {
                id: 1,
                name: 'Administrador',
                description: 'Acceso completo al sistema',
                permissions: ['*'],
                userCount: 3,
                color: '#EF4444',
                isSystem: true,
                created: '2024-01-01'
            },
            {
                id: 2,
                name: 'Manager',
                description: 'Gestión de proyectos y equipos',
                permissions: ['projects.manage', 'users.view', 'reports.view'],
                userCount: 12,
                color: '#F59E0B',
                isSystem: true,
                created: '2024-01-01'
            },
            {
                id: 3,
                name: 'Desarrollador Senior',
                description: 'Desarrollo y arquitectura',
                permissions: ['projects.edit', 'code.deploy', 'tasks.manage'],
                userCount: 18,
                color: '#10B981',
                isSystem: true,
                created: '2024-01-01'
            },
            {
                id: 4,
                name: 'Desarrollador',
                description: 'Desarrollo de software',
                permissions: ['projects.view', 'tasks.edit', 'code.commit'],
                userCount: 25,
                color: '#3B82F6',
                isSystem: true,
                created: '2024-01-01'
            },
            {
                id: 5,
                name: 'Diseñador',
                description: 'Diseño y experiencia de usuario',
                permissions: ['projects.view', 'design.edit', 'assets.manage'],
                userCount: 8,
                color: '#8B5CF6',
                isSystem: true,
                created: '2024-01-01'
            },
            {
                id: 6,
                name: 'Analista',
                description: 'Análisis de datos y reportes',
                permissions: ['analytics.view', 'reports.create', 'data.export'],
                userCount: 6,
                color: '#06B6D4',
                isSystem: false,
                created: '2024-02-15'
            },
            {
                id: 7,
                name: 'Cliente',
                description: 'Acceso limitado a proyectos',
                permissions: ['projects.view', 'comments.create'],
                userCount: 15,
                color: '#6B7280',
                isSystem: true,
                created: '2024-01-01'
            },
            {
                id: 8,
                name: 'Visualizador',
                description: 'Solo lectura',
                permissions: ['projects.view'],
                userCount: 4,
                color: '#9CA3AF',
                isSystem: true,
                created: '2024-01-01'
            }
        ];
    }

    generateSamplePermissions() {
        return [
            { id: 'projects.view', name: 'Ver Proyectos', category: 'Proyectos' },
            { id: 'projects.edit', name: 'Editar Proyectos', category: 'Proyectos' },
            { id: 'projects.manage', name: 'Gestionar Proyectos', category: 'Proyectos' },
            { id: 'projects.delete', name: 'Eliminar Proyectos', category: 'Proyectos' },
            { id: 'tasks.view', name: 'Ver Tareas', category: 'Tareas' },
            { id: 'tasks.edit', name: 'Editar Tareas', category: 'Tareas' },
            { id: 'tasks.manage', name: 'Gestionar Tareas', category: 'Tareas' },
            { id: 'users.view', name: 'Ver Usuarios', category: 'Usuarios' },
            { id: 'users.edit', name: 'Editar Usuarios', category: 'Usuarios' },
            { id: 'users.manage', name: 'Gestionar Usuarios', category: 'Usuarios' },
            { id: 'analytics.view', name: 'Ver Analíticas', category: 'Analíticas' },
            { id: 'reports.view', name: 'Ver Reportes', category: 'Reportes' },
            { id: 'reports.create', name: 'Crear Reportes', category: 'Reportes' },
            { id: 'settings.view', name: 'Ver Configuración', category: 'Sistema' },
            { id: 'settings.edit', name: 'Editar Configuración', category: 'Sistema' }
        ];
    }

    generateSampleAuditLogs() {
        return [
            {
                id: 1,
                user: 'Enrique García',
                action: 'login',
                details: 'Inicio de sesión exitoso',
                ip: '192.168.1.100',
                userAgent: 'Chrome 125.0.0.0',
                timestamp: '2025-06-02 14:30:15',
                status: 'success'
            },
            {
                id: 2,
                user: 'Carlos López',
                action: 'update_user',
                details: 'Actualizó el perfil de Laura Sánchez',
                ip: '192.168.1.101',
                userAgent: 'Firefox 126.0.0.0',
                timestamp: '2025-06-02 12:15:42',
                status: 'success'
            },
            {
                id: 3,
                user: 'Sistema',
                action: 'create_user',
                details: 'Nuevo usuario creado: David Morales',
                ip: 'system',
                userAgent: 'Internal',
                timestamp: '2025-06-01 09:30:22',
                status: 'success'
            },
            {
                id: 4,
                user: 'Ana Torres',
                action: 'failed_login',
                details: 'Intento de login fallido - contraseña incorrecta',
                ip: '192.168.1.104',
                userAgent: 'Safari 17.0.0.0',
                timestamp: '2025-05-30 16:45:33',
                status: 'failed'
            },
            {
                id: 5,
                user: 'Pedro Ruiz',
                action: 'change_password',
                details: 'Cambió su contraseña',
                ip: '192.168.1.103',
                userAgent: 'Chrome 125.0.0.0',
                timestamp: '2025-05-29 11:20:18',
                status: 'success'
            }
        ];
    }

    generateSampleDepartments() {
        return [
            'Administración',
            'Desarrollo',
            'Diseño',
            'Marketing',
            'Ventas',
            'Infraestructura',
            'Análisis',
            'Soporte'
        ];
    }

    generateRolesDistribution() {
        return [
            { role: 'Desarrollador', count: 25, percentage: 28, color: '#3B82F6' },
            { role: 'Desarrollador Senior', count: 18, percentage: 20, color: '#10B981' },
            { role: 'Cliente', count: 15, percentage: 17, color: '#6B7280' },
            { role: 'Manager', count: 12, percentage: 13, color: '#F59E0B' },
            { role: 'Diseñador', count: 8, percentage: 9, color: '#8B5CF6' },
            { role: 'Analista', count: 6, percentage: 7, color: '#06B6D4' },
            { role: 'Visualizador', count: 4, percentage: 4, color: '#9CA3AF' },
            { role: 'Administrador', count: 3, percentage: 3, color: '#EF4444' }
        ];
    }

    generateRecentUsers() {
        return [
            {
                id: 6,
                name: 'David Morales',
                email: 'david.morales@mep-projects.com',
                role: 'Analista de Datos',
                status: 'pending',
                created: 'hace 1 día'
            },
            {
                id: 7,
                name: 'María González',
                email: 'maria.gonzalez@cliente.com',
                role: 'Cliente',
                status: 'active',
                created: 'hace 3 días'
            },
            {
                id: 8,
                name: 'Roberto Fernández',
                email: 'roberto.fernandez@mep-projects.com',
                role: 'Desarrollador',
                status: 'active',
                created: 'hace 5 días'
            }
        ];
    }

    generateLoginActivity() {
        return [
            { date: '2025-06-02', logins: 45, unique: 34 },
            { date: '2025-06-01', logins: 52, unique: 38 },
            { date: '2025-05-31', logins: 48, unique: 36 },
            { date: '2025-05-30', logins: 41, unique: 32 },
            { date: '2025-05-29', logins: 39, unique: 29 },
            { date: '2025-05-28', logins: 35, unique: 28 },
            { date: '2025-05-27', logins: 44, unique: 33 }
        ];
    }

    generateSecurityStatus() {
        return [
            { metric: '2FA Habilitado', value: '65%', status: 'warning', target: '80%' },
            { metric: 'Contraseñas Fuertes', value: '78%', status: 'success', target: '90%' },
            { metric: 'Cuentas Bloqueadas', value: '2', status: 'success', target: '< 5' },
            { metric: 'Logins Sospechosos', value: '0', status: 'success', target: '0' }
        ];
    }

    renderDashboardContent() {
        this.renderRolesDistribution();
        this.renderRecentUsers();
        this.renderLoginActivity();
        this.renderSecurityStatus();
    }

    renderRolesDistribution() {
        const container = document.getElementById('roles-distribution');
        if (!container || !this.data.rolesDistribution) return;

        const distributionHTML = this.data.rolesDistribution.map(item => `
            <div class="role-distribution-item">
                <div class="role-info">
                    <div class="role-color" style="background-color: ${item.color}"></div>
                    <span class="role-name">${item.role}</span>
                </div>
                <div class="role-stats">
                    <span class="role-count">${item.count}</span>
                    <div class="role-bar">
                        <div class="role-fill" style="width: ${item.percentage}%; background-color: ${item.color}"></div>
                    </div>
                    <span class="role-percentage">${item.percentage}%</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = distributionHTML;
    }

    renderRecentUsers() {
        const container = document.getElementById('recent-users-list');
        if (!container || !this.data.recentUsers) return;

        const usersHTML = this.data.recentUsers.map(user => `
            <div class="recent-user-item">
                <div class="user-avatar">${user.name.split(' ').map(n => n[0]).join('')}</div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-role">${user.role}</div>
                </div>
                <div class="user-meta">
                    <span class="badge badge-${this.getStatusBadgeClass(user.status)}">${this.getStatusLabel(user.status)}</span>
                    <div class="user-created">${user.created}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = usersHTML;
    }

    renderLoginActivity() {
        const container = document.getElementById('login-activity-chart');
        if (!container || !this.data.loginActivity) return;

        const chartHTML = `
            <div class="activity-chart">
                <div class="chart-header">
                    <span class="chart-metric">Logins Diarios</span>
                    <span class="chart-value">45 hoy</span>
                </div>
                <div class="chart-bars">
                    ${this.data.loginActivity.map(day => `
                        <div class="chart-bar-container">
                            <div class="chart-bar" style="height: ${(day.logins / 60) * 100}%"></div>
                            <span class="chart-label">${day.date.split('-')[2]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = chartHTML;
    }

    renderSecurityStatus() {
        const container = document.getElementById('security-status');
        if (!container || !this.data.securityStatus) return;

        const statusHTML = this.data.securityStatus.map(item => `
            <div class="security-metric">
                <div class="metric-header">
                    <span class="metric-name">${item.metric}</span>
                    <span class="metric-status status-${item.status}"></span>
                </div>
                <div class="metric-value">${item.value}</div>
                <div class="metric-target">Objetivo: ${item.target}</div>
            </div>
        `).join('');

        container.innerHTML = statusHTML;
    }

    async loadTabData(tabName) {
        try {
            console.log(`📈 Cargando datos para pestaña: ${tabName}`);
            
            switch (tabName) {
                case 'dashboard':
                    this.renderDashboardContent();
                    break;
                case 'users':
                    this.renderUsersTab();
                    break;
                case 'roles':
                    this.renderRolesTab();
                    break;
                case 'audit':
                    this.renderAuditTab();
                    break;
                case 'security':
                    this.renderSecurityTab();
                    break;
                case 'settings':
                    this.renderSettingsTab();
                    break;
            }
            
        } catch (error) {
            console.error(`❌ Error cargando datos para ${tabName}:`, error);
        }
    }

    renderUsersTab() {
        this.updateUserFilters();
        this.renderUsersTable();
        this.renderUsersQuickStats();
    }

    updateUserFilters() {
        // Update role filter
        const roleFilter = document.getElementById('role-filter');
        if (roleFilter && this.data.roles) {
            const optionsHTML = '<option value="">Todos los roles</option>' +
                this.data.roles.map(role => `<option value="${role.name}">${role.name}</option>`).join('');
            roleFilter.innerHTML = optionsHTML;
        }

        // Update department filter
        const departmentFilter = document.getElementById('department-filter');
        if (departmentFilter && this.data.departments) {
            const optionsHTML = '<option value="">Todos los departamentos</option>' +
                this.data.departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
            departmentFilter.innerHTML = optionsHTML;
        }
    }

    renderUsersTable() {
        const container = document.getElementById('users-table');
        if (!container || !this.data.users) return;

        const filteredUsers = this.getFilteredUsers();
        
        const tableHTML = `
            <div class="users-table-container">
                <table class="data-table-enhanced">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="select-all" onchange="window.app.modules.users.toggleSelectAll(this)">
                            </th>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Departamento</th>
                            <th>Estado</th>
                            <th>Último Login</th>
                            <th>2FA</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredUsers.map(user => `
                            <tr>
                                <td>
                                    <input type="checkbox" value="${user.id}" onchange="window.app.modules.users.toggleSelectUser(${user.id}, this)">
                                </td>
                                <td>
                                    <div class="user-cell">
                                        <div class="user-avatar">${user.avatar}</div>
                                        <div class="user-details">
                                            <div class="user-name">${user.name}</div>
                                            <div class="user-email">${user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="role-badge" style="background-color: ${this.getRoleColor(user.role)}20; color: ${this.getRoleColor(user.role)}">
                                        ${user.role}
                                    </span>
                                </td>
                                <td>${user.department}</td>
                                <td>
                                    <span class="status-badge status-${user.status}">
                                        ${this.getStatusLabel(user.status)}
                                    </span>
                                </td>
                                <td>${user.lastLogin || 'Nunca'}</td>
                                <td>
                                    ${user.twoFactorEnabled ? 
                                        '<span class="badge badge-success">✓ Habilitado</span>' : 
                                        '<span class="badge badge-warning">✗ Deshabilitado</span>'
                                    }
                                </td>
                                <td>
                                    <div class="table-actions-enhanced">
                                        <button class="btn-icon-enhanced" onclick="window.app.modules.users.viewUser(${user.id})" title="Ver detalles">
                                            <i data-lucide="eye"></i>
                                        </button>
                                        <button class="btn-icon-enhanced" onclick="window.app.modules.users.editUser(${user.id})" title="Editar">
                                            <i data-lucide="edit"></i>
                                        </button>
                                        <button class="btn-icon-enhanced" onclick="window.app.modules.users.resetPassword(${user.id})" title="Reset contraseña">
                                            <i data-lucide="key"></i>
                                        </button>
                                        <button class="btn-icon-enhanced ${user.status === 'active' ? 'btn-warning' : 'btn-success'}" onclick="window.app.modules.users.toggleUserStatus(${user.id})" title="${user.status === 'active' ? 'Desactivar' : 'Activar'}">
                                            <i data-lucide="${user.status === 'active' ? 'user-x' : 'user-check'}"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderUsersQuickStats() {
        const container = document.getElementById('users-quick-stats');
        if (!container) return;

        const filteredUsers = this.getFilteredUsers();
        const activeUsers = filteredUsers.filter(u => u.status === 'active').length;
        const inactiveUsers = filteredUsers.filter(u => u.status === 'inactive').length;
        const pendingUsers = filteredUsers.filter(u => u.status === 'pending').length;
        const users2FA = filteredUsers.filter(u => u.twoFactorEnabled).length;

        container.innerHTML = `
            <div class="quick-stat-enhanced">
                <div class="stat-icon-enhanced">
                    <i data-lucide="users"></i>
                </div>
                <div class="stat-content-enhanced">
                    <span class="stat-label-enhanced">Total</span>
                    <span class="stat-value-enhanced">${filteredUsers.length}</span>
                </div>
            </div>
            <div class="quick-stat-enhanced">
                <div class="stat-icon-enhanced success">
                    <i data-lucide="user-check"></i>
                </div>
                <div class="stat-content-enhanced">
                    <span class="stat-label-enhanced">Activos</span>
                    <span class="stat-value-enhanced">${activeUsers}</span>
                </div>
            </div>
            <div class="quick-stat-enhanced">
                <div class="stat-icon-enhanced warning">
                    <i data-lucide="user-x"></i>
                </div>
                <div class="stat-content-enhanced">
                    <span class="stat-label-enhanced">Inactivos</span>
                    <span class="stat-value-enhanced">${inactiveUsers}</span>
                </div>
            </div>
            <div class="quick-stat-enhanced">
                <div class="stat-icon-enhanced info">
                    <i data-lucide="clock"></i>
                </div>
                <div class="stat-content-enhanced">
                    <span class="stat-label-enhanced">Pendientes</span>
                    <span class="stat-value-enhanced">${pendingUsers}</span>
                </div>
            </div>
            <div class="quick-stat-enhanced">
                <div class="stat-icon-enhanced primary">
                    <i data-lucide="shield"></i>
                </div>
                <div class="stat-content-enhanced">
                    <span class="stat-label-enhanced">Con 2FA</span>
                    <span class="stat-value-enhanced">${users2FA}</span>
                </div>
            </div>
        `;

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderRolesTab() {
        this.renderRolesGrid();
        this.renderPermissionsMatrix();
    }

    renderRolesGrid() {
        const container = document.getElementById('roles-grid');
        if (!container || !this.data.roles) return;

        const rolesHTML = this.data.roles.map(role => `
            <div class="role-card">
                <div class="role-header">
                    <div class="role-color" style="background-color: ${role.color}"></div>
                    <div class="role-info">
                        <h3>${role.name}</h3>
                        <p>${role.description}</p>
                    </div>
                    <div class="role-actions">
                        <button class="btn-icon-enhanced" onclick="window.app.modules.users.editRole(${role.id})" title="Editar rol">
                            <i data-lucide="edit"></i>
                        </button>
                        ${!role.isSystem ? `
                            <button class="btn-icon-enhanced btn-danger" onclick="window.app.modules.users.deleteRole(${role.id})" title="Eliminar rol">
                                <i data-lucide="trash-2"></i>
                            </button>
                        ` : ''}
                    </div>