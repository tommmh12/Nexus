import React from 'react';
import { ProjectCapabilities } from '../types/project.types';

interface PermissionGateProps {
    /** The capability key to check */
    capability: keyof ProjectCapabilities;

    /** The capabilities object for the current user */
    capabilities: ProjectCapabilities;

    /** Content to render when user has the capability */
    children: React.ReactNode;

    /** Optional content to render when user lacks the capability */
    fallback?: React.ReactNode;

    /** If true, show disabled version instead of hiding completely */
    showDisabled?: boolean;

    /** Custom tooltip message for disabled state */
    disabledTooltip?: string;
}

/**
 * PermissionGate component that conditionally renders content based on user capabilities.
 * 
 * Usage:
 * ```tsx
 * <PermissionGate 
 *   capability="canCreateTask" 
 *   capabilities={capabilities}
 *   disabledTooltip="Bạn không có quyền tạo task"
 * >
 *   <Button>+ Tạo Task</Button>
 * </PermissionGate>
 * ```
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    capability,
    capabilities,
    children,
    fallback = null,
    showDisabled = false,
    disabledTooltip = 'Bạn không có quyền thực hiện hành động này',
}) => {
    const hasCapability = capabilities[capability];

    if (hasCapability) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showDisabled) {
        return (
            <div
                className="opacity-50 cursor-not-allowed relative group"
                title={disabledTooltip}
            >
                <div className="pointer-events-none">
                    {children}
                </div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                    {disabledTooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </div>
            </div>
        );
    }

    return null;
};

/**
 * Hook to check a single capability
 */
export const useHasCapability = (
    capabilities: ProjectCapabilities,
    capability: keyof ProjectCapabilities
): boolean => {
    return capabilities[capability];
};

/**
 * Hook to check multiple capabilities (returns object with all checks)
 */
export const useCapabilities = (
    capabilities: ProjectCapabilities,
    ...checks: (keyof ProjectCapabilities)[]
): Record<string, boolean> => {
    return checks.reduce((acc, key) => {
        acc[key] = capabilities[key];
        return acc;
    }, {} as Record<string, boolean>);
};

export default PermissionGate;
