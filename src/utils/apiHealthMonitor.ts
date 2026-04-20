import apiService from '@/services/api';

interface EndpointHealthStatus {
  endpoint: string;
  isHealthy: boolean;
  lastChecked: number;
  consecutiveFailures: number;
  averageResponseTime?: number;
}

class ApiHealthMonitor {
  private healthStatus = new Map<string, EndpointHealthStatus>();
  private readonly checkInterval = 5 * 60 * 1000; // 5 minutes
  private readonly maxFailures = 3;
  private readonly cacheTime = 10 * 60 * 1000; // 10 minutes

  // Endpoints critiques à monitorer
  private criticalEndpoints = [
    '/products',
    '/categories',
    '/categories/main'
  ];

  // Endpoints optionnels (ne pas logger les erreurs)
  private optionalEndpoints = [
    '/reviews',
    '/products/.*/reviews',
    '/products/.*/reviews/stats'
  ];

  constructor() {
    this.initializeHealthStatus();
    this.startPeriodicHealthCheck();
  }

  private initializeHealthStatus() {
    this.criticalEndpoints.forEach(endpoint => {
      this.healthStatus.set(endpoint, {
        endpoint,
        isHealthy: true,
        lastChecked: 0,
        consecutiveFailures: 0
      });
    });
  }

  private startPeriodicHealthCheck() {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      this.checkCriticalEndpoints();
    }, this.checkInterval);

    // Check initial après 30 secondes
    setTimeout(() => {
      this.checkCriticalEndpoints();
    }, 30000);
  }

  private async checkCriticalEndpoints() {
    for (const endpoint of this.criticalEndpoints) {
      await this.checkEndpointHealth(endpoint);
    }
  }

  async checkEndpointHealth(endpoint: string): Promise<boolean> {
    const status = this.healthStatus.get(endpoint);
    const now = Date.now();

    // Utiliser le cache si disponible
    if (status && (now - status.lastChecked) < this.cacheTime) {
      return status.isHealthy;
    }

    try {
      const startTime = Date.now();
      
      // Faire un appel léger à l'endpoint
      let testUrl = endpoint;
      if (endpoint === '/products') {
        testUrl = '/products?limit=1';
      } else if (endpoint === '/categories') {
        testUrl = '/categories';
      }
      
      await apiService.get(testUrl);
      
      const responseTime = Date.now() - startTime;

      this.updateHealthStatus(endpoint, true, responseTime);
      return true;

    } catch (error: any) {
      this.updateHealthStatus(endpoint, false);
      
      // Logger seulement si c'est un endpoint critique et après plusieurs échecs
      if (this.isCriticalEndpoint(endpoint)) {
        const currentStatus = this.healthStatus.get(endpoint);
        if (currentStatus && currentStatus.consecutiveFailures >= this.maxFailures) {
          console.warn(`🚨 Endpoint critique indisponible: ${endpoint}`, {
            failures: currentStatus.consecutiveFailures,
            error: error.message
          });
        }
      }

      return false;
    }
  }

  private updateHealthStatus(endpoint: string, isHealthy: boolean, responseTime?: number) {
    const existing = this.healthStatus.get(endpoint) || {
      endpoint,
      isHealthy: true,
      lastChecked: 0,
      consecutiveFailures: 0
    };

    const updated: EndpointHealthStatus = {
      ...existing,
      isHealthy,
      lastChecked: Date.now(),
      consecutiveFailures: isHealthy ? 0 : existing.consecutiveFailures + 1,
      averageResponseTime: responseTime ? 
        (existing.averageResponseTime ? (existing.averageResponseTime + responseTime) / 2 : responseTime)
        : existing.averageResponseTime
    };

    this.healthStatus.set(endpoint, updated);

    // Logger le retour en ligne d'un service
    if (isHealthy && !existing.isHealthy && existing.consecutiveFailures >= 2) {
      console.info(`✅ Endpoint ${endpoint} est de nouveau fonctionnel`);
    }
  }

  isEndpointHealthy(endpoint: string): boolean {
    const status = this.healthStatus.get(endpoint);
    if (!status) {
      // Si on ne connaît pas le statut, considérer comme sain
      return true;
    }

    return status.isHealthy && status.consecutiveFailures < this.maxFailures;
  }

  isCriticalEndpoint(endpoint: string): boolean {
    return this.criticalEndpoints.includes(endpoint) ||
           this.criticalEndpoints.some(critical => endpoint.startsWith(critical));
  }

  isOptionalEndpoint(endpoint: string): boolean {
    return this.optionalEndpoints.some(optional => {
      if (optional.includes('.*')) {
        const regex = new RegExp(optional);
        return regex.test(endpoint);
      }
      return endpoint.startsWith(optional);
    });
  }

  shouldSuppressErrorLog(endpoint: string, error: any): boolean {
    // Supprimer les logs pour les endpoints optionnels avec 404
    if (this.isOptionalEndpoint(endpoint) && error.response?.status === 404) {
      return true;
    }

    // Supprimer les logs pour les endpoints en échec récurrent
    const status = this.healthStatus.get(endpoint);
    if (status && !status.isHealthy && status.consecutiveFailures >= this.maxFailures) {
      return true;
    }

    return false;
  }

  getHealthReport(): Record<string, EndpointHealthStatus> {
    const report: Record<string, EndpointHealthStatus> = {};
    this.healthStatus.forEach((status, endpoint) => {
      report[endpoint] = { ...status };
    });
    return report;
  }

  // Méthode publique pour tester un endpoint spécifique
  async testEndpoint(endpoint: string): Promise<{ isHealthy: boolean; responseTime?: number; error?: string }> {
    try {
      const startTime = Date.now();
      await apiService.get(endpoint);
      const responseTime = Date.now() - startTime;
      
      return { isHealthy: true, responseTime };
    } catch (error: any) {
      return { 
        isHealthy: false, 
        error: error.response?.status ? `${error.response.status}: ${error.message}` : error.message 
      };
    }
  }
}

// Instance singleton
export const apiHealthMonitor = new ApiHealthMonitor();

// Méthode utilitaire pour les composants
export function useApiHealth() {
  return {
    isHealthy: (endpoint: string) => apiHealthMonitor.isEndpointHealthy(endpoint),
    isOptional: (endpoint: string) => apiHealthMonitor.isOptionalEndpoint(endpoint),
    shouldSuppressError: (endpoint: string, error: any) => apiHealthMonitor.shouldSuppressErrorLog(endpoint, error),
    checkHealth: (endpoint: string) => apiHealthMonitor.checkEndpointHealth(endpoint),
    getReport: () => apiHealthMonitor.getHealthReport(),
    testEndpoint: (endpoint: string) => apiHealthMonitor.testEndpoint(endpoint)
  };
}