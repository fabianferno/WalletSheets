'use client';

import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";

interface PrivyAuthProviderProps {
    children: ReactNode;
}

export default function PrivyAuthProvider({ children }: PrivyAuthProviderProps) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                loginMethods: ["email", "wallet"],
                appearance: {
                    theme: "light",
                    accentColor: "#3B82F6",
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
} 