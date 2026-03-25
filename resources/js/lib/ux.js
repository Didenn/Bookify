/**
 * Minimal lightweight event emitters for Global Toast & Confirm Modal contexts.
 * Helps prevent dirtying standard component hierarchies.
 */

export function toast(message, type = 'success') {
    window.dispatchEvent(new CustomEvent('ux-toast', { detail: { message, type } }));
}

export function confirmAction({ title, message, onConfirm, onCancel }) {
    window.dispatchEvent(
        new CustomEvent('ux-confirm', {
            detail: { title, message, onConfirm, onCancel },
        })
    );
}
