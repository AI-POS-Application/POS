import type { PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from './AppSidebar';

export default function AppBody({ children }: PropsWithChildren) {
    return (
        <>
            <div className="flex flex-col h-screen w-full bg-secondary">
                <main className="flex-1 flex flex-col overflow-y-auto relative z-10 rounded-t-2xl rounded-b-none bg-background shadow-lg m-4 mb-24">
                    {children}
                </main>
                <AppSidebar />
            </div>
            <Toaster />
        </>
    )
}
