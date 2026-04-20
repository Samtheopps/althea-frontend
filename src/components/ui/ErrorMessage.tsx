'use client';

import { AlertCircle, RefreshCw, Wifi, Lock, Server, Clock, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'error' | 'warning' | 'info';
  type?: 'api' | 'network' | 'auth' | 'timeout' | 'server' | 'generic';
  className?: string;
  children?: ReactNode;
}

export default function ErrorMessage({
  title,
  message = 'Nous rencontrons actuellement des difficultés techniques. Veuillez réessayer dans quelques instants.',
  onRetry,
  retryLabel = 'Réessayer',
  variant = 'error',
  type = 'generic',
  className = '',
  children
}: ErrorMessageProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'api':
        return {
          icon: <Server className="h-5 w-5" />,
          defaultTitle: 'Erreur API',
          description: 'Un problème est survenu avec notre service.'
        };
      case 'network':
        return {
          icon: <Wifi className="h-5 w-5" />,
          defaultTitle: 'Problème de connexion',
          description: 'Vérifiez votre connexion internet.'
        };
      case 'auth':
        return {
          icon: <Lock className="h-5 w-5" />,
          defaultTitle: 'Authentification requise',
          description: 'Vous devez être connecté.'
        };
      case 'timeout':
        return {
          icon: <Clock className="h-5 w-5" />,
          defaultTitle: 'Délai d\'attente dépassé',
          description: 'La requête a pris trop de temps.'
        };
      case 'server':
        return {
          icon: <Server className="h-5 w-5" />,
          defaultTitle: 'Serveur indisponible',
          description: 'Service temporairement indisponible.'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          defaultTitle: 'Une erreur est survenue',
          description: null
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-amber-50 border-amber-200',
          icon: 'text-amber-600',
          title: 'text-amber-900',
          message: 'text-amber-700',
          button: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default: // error
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
    }
  };

  const typeConfig = getTypeConfig();
  const styles = getVariantStyles();

  return (
    <div className={`rounded-lg border p-6 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={styles.icon}>
            {typeConfig.icon}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title || typeConfig.defaultTitle}
          </h3>
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{message}</p>
            {typeConfig.description && (
              <p className="mt-1 opacity-75 text-xs">{typeConfig.description}</p>
            )}
          </div>
          
          {/* Actions */}
          {(onRetry || children) && (
            <div className="mt-4 flex items-center space-x-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors ${styles.button}`}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {retryLabel}
                </button>
              )}
              {children}
            </div>
          )}

          {/* Détails techniques (développement) */}
          {process.env.NODE_ENV === 'development' && type !== 'generic' && (
            <details className="mt-3">
              <summary className={`text-xs ${styles.message} opacity-60 cursor-pointer hover:opacity-80`}>
                Détails techniques
              </summary>
              <pre className={`text-xs ${styles.message} opacity-50 mt-1 whitespace-pre-wrap break-all`}>
                {JSON.stringify({
                  type,
                  variant,
                  message,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// Composants pré-configurés pour les cas courants
export function ApiErrorMessage({ 
  message, 
  onRetry, 
  className 
}: { 
  message: string; 
  onRetry?: () => void; 
  className?: string 
}) {
  return (
    <ErrorMessage
      type="api"
      variant="error"
      message={message}
      onRetry={onRetry}
      className={className}
    />
  );
}

export function NetworkErrorMessage({ 
  onRetry, 
  className 
}: { 
  onRetry?: () => void; 
  className?: string 
}) {
  return (
    <ErrorMessage
      type="network"
      variant="warning"
      message="Impossible de se connecter au serveur"
      onRetry={onRetry}
      className={className}
    />
  );
}

export function AuthErrorMessage({ 
  onLogin, 
  className 
}: { 
  onLogin?: () => void; 
  className?: string 
}) {
  return (
    <ErrorMessage
      type="auth"
      variant="warning"
      message="Connectez-vous pour accéder à cette fonctionnalité"
      className={className}
    >
      {onLogin && (
        <button
          onClick={onLogin}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md 
            text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors border border-amber-300"
        >
          <Lock className="h-4 w-4 mr-1.5" />
          Se connecter
        </button>
      )}
    </ErrorMessage>
  );
}