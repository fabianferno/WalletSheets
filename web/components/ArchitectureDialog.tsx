import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";

interface ArchitectureDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ArchitectureDialog({ isOpen, onOpenChange }: ArchitectureDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[65vw] w-full">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-green-600">
                        WalletSheets Architecture
                    </DialogTitle>
                </DialogHeader>
                <div className="relative w-full p-4">
                    <img
                        src="/architecture.png"
                        alt="WalletSheets Architecture Diagram"
                        className="w-full h-auto object-contain rounded-lg shadow-md"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
} 