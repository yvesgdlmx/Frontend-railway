import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, meta, actualizarMeta }) => {
    const [nuevaMeta, setNuevaMeta] = useState(meta.meta);

    const handleSave = () => {
        actualizarMeta(meta.id, nuevaMeta);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Editar Meta</h2>
                <input 
                    type="number" 
                    value={nuevaMeta} 
                    onChange={(e) => setNuevaMeta(Number(e.target.value))} 
                />
                <button onClick={handleSave}>Guardar</button>
            </div>
        </div>
    );
};

export default Modal;