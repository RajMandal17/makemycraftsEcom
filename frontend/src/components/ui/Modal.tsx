import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import Button from './Button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: ModalSize;
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
    footer?: React.ReactNode;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdropClick = true,
    footer,
    className = '',
}) => {
    // Size styles
    const sizeStyles: Record<ModalSize, string> = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full mx-4',
    };

    const handleClose = () => {
        if (closeOnBackdropClick) {
            onClose();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal Container */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`
                  w-full ${sizeStyles[size]}
                  transform overflow-hidden rounded-2xl bg-white
                  shadow-2xl transition-all
                  ${className}
                `}
                            >
                                {/* Header */}
                                {(title || showCloseButton) && (
                                    <div className="flex items-start justify-between p-6 border-b border-neutral-100">
                                        <div className="flex-1">
                                            {title && (
                                                <Dialog.Title className="text-2xl font-display font-bold text-neutral-900">
                                                    {title}
                                                </Dialog.Title>
                                            )}
                                            {description && (
                                                <Dialog.Description className="mt-2 text-sm text-neutral-600">
                                                    {description}
                                                </Dialog.Description>
                                            )}
                                        </div>
                                        {showCloseButton && (
                                            <button
                                                onClick={onClose}
                                                className="ml-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                                aria-label="Close modal"
                                            >
                                                <X className="h-5 w-5 text-neutral-500" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6">
                                    {children}
                                </div>

                                {/* Footer */}
                                {footer && (
                                    <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50">
                                        {footer}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

// Confirmation Modal Variant
export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    loading = false,
}) => {
    const buttonVariant = variant === 'danger' ? 'danger' : 'primary';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={buttonVariant}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <p className="text-neutral-700">{message}</p>
        </Modal>
    );
};

export default Modal;
