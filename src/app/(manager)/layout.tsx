
import type { PropsWithChildren } from 'react';

export default function ManagerLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    )
}
