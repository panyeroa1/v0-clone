/**
 * Permission types that require user approval
 */
export enum PermissionType {
  FILE_WRITE = 'file_write',
  NETWORK_ACCESS = 'network_access',
  DEPLOY = 'deploy',
  DATABASE_WRITE = 'database_write',
  DATABASE_READ = 'database_read',
}

export interface PermissionRequest {
  type: PermissionType
  resource: string
  reason: string
  timestamp: Date
}

export interface PermissionGrant {
  type: PermissionType
  resource: string
  granted: boolean
  grantedAt: Date
  expiresAt?: Date
}

/**
 * Permission manager for gating operations
 */
export class PermissionManager {
  private grants: Map<string, PermissionGrant> = new Map()
  
  /**
   * Request permission for an operation
   */
  async requestPermission(request: PermissionRequest): Promise<boolean> {
    const key = `${request.type}:${request.resource}`
    const existingGrant = this.grants.get(key)
    
    // Check if permission is already granted and not expired
    if (existingGrant && existingGrant.granted) {
      if (!existingGrant.expiresAt || existingGrant.expiresAt > new Date()) {
        return true
      }
    }
    
    // In a real implementation, this would show a UI prompt
    // For now, we'll log and auto-approve for testing
    console.log(`[Permission Request] ${request.type} for ${request.resource}`)
    console.log(`Reason: ${request.reason}`)
    
    // Auto-grant for testing (replace with actual permission UI)
    const granted = await this.promptUser(request)
    
    if (granted) {
      this.grants.set(key, {
        type: request.type,
        resource: request.resource,
        granted: true,
        grantedAt: new Date(),
      })
    }
    
    return granted
  }
  
  /**
   * Check if permission is granted
   */
  hasPermission(type: PermissionType, resource: string): boolean {
    const key = `${type}:${resource}`
    const grant = this.grants.get(key)
    
    if (!grant || !grant.granted) {
      return false
    }
    
    // Check expiration
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      return false
    }
    
    return true
  }
  
  /**
   * Revoke a permission
   */
  revokePermission(type: PermissionType, resource: string): void {
    const key = `${type}:${resource}`
    this.grants.delete(key)
  }
  
  /**
   * Clear all permissions
   */
  clearAll(): void {
    this.grants.clear()
  }
  
  /**
   * Prompt user for permission (to be implemented with UI)
   */
  private async promptUser(request: PermissionRequest): Promise<boolean> {
    // TODO: Implement actual UI prompt
    // For now, auto-approve read operations, prompt for writes
    if (request.type === PermissionType.DATABASE_READ) {
      return true
    }
    
    // In production, show modal/dialog for approval
    return true // Auto-approve for testing
  }
}

// Singleton instance
export const permissionManager = new PermissionManager()

/**
 * Decorator for methods that require permissions
 */
export function requiresPermission(type: PermissionType, getResource: (args: any[]) => string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const resource = getResource(args)
      const hasPermission = permissionManager.hasPermission(type, resource)
      
      if (!hasPermission) {
        const granted = await permissionManager.requestPermission({
          type,
          resource,
          reason: `Required for ${propertyKey} operation`,
          timestamp: new Date(),
        })
        
        if (!granted) {
          throw new Error(`Permission denied for ${type} on ${resource}`)
        }
      }
      
      return originalMethod.apply(this, args)
    }
    
    return descriptor
  }
}
