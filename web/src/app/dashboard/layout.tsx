import PrivyAuthProvider from "@/components/auth/PrivyAuthProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PrivyAuthProvider>
            {children}
        </PrivyAuthProvider>
    );
} 