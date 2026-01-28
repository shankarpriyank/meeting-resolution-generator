'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            position="top-right"
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-[#151515] group-[.toaster]:text-white group-[.toaster]:border-[#2A2A2A] group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-gray-400',
                    actionButton:
                        'group-[.toast]:bg-white group-[.toast]:text-[#1A1A1A]',
                    cancelButton:
                        'group-[.toast]:bg-[#2A2A2A] group-[.toast]:text-white',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
