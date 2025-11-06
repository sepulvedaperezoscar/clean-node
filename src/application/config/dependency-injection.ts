


type Constructor<T> = new (...args: any[]) => T;

/**
 * Contenedor de Inyección de Dependencias
 * Patrón Service Locator para gestionar dependencias
 */
class DIContainer {
    private dependencies: Map<string, any> = new Map();
    private singletons: Map<string, any> = new Map();

    /**
     * Registra una dependencia
     * @param name - Nombre único de la dependencia
     * @param dependency - Clase o instancia a registrar
     * @param isSingleton - Si es true, siempre retorna la misma instancia
     */
    register<T>(name: string, dependency: Constructor<T> | T, isSingleton = true): void {
        this.dependencies.set(name, { dependency, isSingleton });
    }

    /**
     * Resuelve una dependencia por su nombre
     * @param name - Nombre de la dependencia a resolver
     * @returns La instancia de la dependencia
     */
    resolve<T>(name: string): T {
        const registration = this.dependencies.get(name);

        if (!registration) {
            throw new Error(`Dependency '${name}' not found in container`);
        }

        // Si es singleton, retornar la instancia existente o crear una nueva
        if (registration.isSingleton) {
            if (!this.singletons.has(name)) {
                const instance =
                    typeof registration.dependency === 'function'
                        ? new registration.dependency()
                        : registration.dependency;
                this.singletons.set(name, instance);
            }
            return this.singletons.get(name);
        }

        // Si no es singleton, crear una nueva instancia cada vez
        return typeof registration.dependency === 'function'
            ? new registration.dependency()
            : registration.dependency;
    }

    /**
     * Verifica si una dependencia está registrada
     */
    has(name: string): boolean {
        return this.dependencies.has(name);
    }

    /**
     * Limpia todas las dependencias (útil para tests)
     */
    clear(): void {
        this.dependencies.clear();
        this.singletons.clear();
    }

    /**
     * Lista todas las dependencias registradas
     */
    list(): string[] {
        return Array.from(this.dependencies.keys());
    }
}

// Exportar instancia única del contenedor
export const container = new DIContainer();