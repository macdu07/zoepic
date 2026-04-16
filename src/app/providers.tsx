'use client';

export function InsforgeProvider({ children }: { children: React.ReactNode }) {
    // Better Auth does not require a root provider.
    return <>{children}</>;
}
