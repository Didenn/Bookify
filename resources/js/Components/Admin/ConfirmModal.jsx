import { useEffect, useState } from 'react';
import Button from './Button';
import Modal from './Modal';

export default function ConfirmModal() {
    const [state, setState] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
    });

    useEffect(() => {
        const handler = (e) => {
            setState({
                open: true,
                title: e.detail.title || 'Are you sure?',
                message: e.detail.message || 'This action cannot be undone',
                onConfirm: e.detail.onConfirm,
                onCancel: e.detail.onCancel,
            });
        };

        window.addEventListener('ux-confirm', handler);
        return () => window.removeEventListener('ux-confirm', handler);
    }, []);

    const close = () => {
        if (state.onCancel) state.onCancel();
        setState((s) => ({ ...s, open: false }));
    };

    const confirm = () => {
        if (state.onConfirm) state.onConfirm();
        setState((s) => ({ ...s, open: false }));
    };

    return (
        <Modal
            open={state.open}
            title={state.title}
            description={state.message}
            onClose={close}
        >
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={close}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={confirm}>
                    Delete
                </Button>
            </div>
        </Modal>
    );
}
