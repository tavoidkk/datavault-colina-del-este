import { useState, useRef } from 'react';
import {
  CATEGORIES,
  addContact,
  checkContactExists,
  normalizePhone,
} from '../services/firestoreService';
import LoadingSpinner from './LoadingSpinner';

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const FLOORS = Array.from({ length: 13 }, (_, i) => i + 1);
const APARTMENTS = ['A', 'B', 'C'];
const PHONE_REGEX = /^[+0-9\s\-]+$/;

function isValidName(v) {
  if (!v) return false;
  if (!NAME_REGEX.test(v)) return false;
  return v.trim().length >= 3;
}

function countDigits(s) {
  return (s || '').replace(/[^0-9]/g, '').length;
}

export default function RegisterModal({ onClose, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [phoneCheckStatus, setPhoneCheckStatus] = useState(null);

  const checkTimerRef = useRef(null);

  function clearError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handlePhoneChange(e) {
    const v = e.target.value;
    if (v !== '' && !PHONE_REGEX.test(v)) return;
    setPhone(v);
    clearError('phone');
    setPhoneCheckStatus(null);

    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    const normalized = normalizePhone(v);
    if (countDigits(normalized) >= 7) {
      checkTimerRef.current = setTimeout(() => {
        runPhoneCheck(normalized);
      }, 500);
    }
  }

  async function runPhoneCheck(normalized) {
    setCheckingPhone(true);
    try {
      const exists = await checkContactExists(normalized);
      setPhoneCheckStatus(exists ? 'exists' : 'ok');
    } catch {
      setPhoneCheckStatus(null);
    } finally {
      setCheckingPhone(false);
    }
  }

  function handleNameKeyDown(e) {
    if (
      e.key.length === 1 &&
      !NAME_REGEX.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight'
    ) {
      e.preventDefault();
    }
  }

  function handleAddedByKeyDown(e) {
    handleNameKeyDown(e);
  }

  function validate() {
    const next = {};
    const normalized = normalizePhone(phone);
    if (countDigits(normalized) < 7) {
      next.phone = 'Ingresa un número válido (mínimo 7 dígitos)';
    } else if (phoneCheckStatus === 'exists') {
      next.phone = 'Este número ya está en el directorio';
    }
    if (!isValidName(name)) {
      next.name = 'Solo letras y espacios, mínimo 3 caracteres';
    }
    if (!category) {
      next.category = 'Selecciona una categoría';
    }
    if (!isValidName(addedBy)) {
      next.addedBy = 'Ingresa tu nombre (mínimo 3 letras)';
    }
    if (!floor) {
      next.floor = 'Selecciona tu piso';
    }
    if (!apartment) {
      next.apartment = 'Selecciona tu apartamento';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addContact({
        phone: phone.trim(),
        name: name.trim(),
        category,
        addedBy: addedBy.trim(),
        floor: Number(floor),
        apartment,
      });
      onSuccess?.();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        phone: err?.message || 'No se pudo registrar el contacto',
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Agregar contacto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose?.();
      }}
    >
      <div className="modal-panel-bottom">
        <div className="modal-handle" />
        <button
          type="button"
          className="modal-close"
          onClick={() => onClose?.()}
          aria-label="Cerrar"
          disabled={submitting}
        >
          ✕
        </button>

        <div className="register-header">
          <h2 className="register-title">Agregar contacto</h2>
          <p className="register-subtitle">
            Comparte un contacto de confianza con tus vecinos
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Número de teléfono
            </label>
            <div className="form-input-wrap">
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="+58 412 123 4567"
                value={phone}
                onChange={handlePhoneChange}
                disabled={submitting}
                autoComplete="tel"
              />
              <span className="form-input-status" aria-hidden="true">
                {checkingPhone && '⏳'}
                {!checkingPhone && phoneCheckStatus === 'ok' && '✓'}
                {!checkingPhone && phoneCheckStatus === 'exists' && '⚠️'}
              </span>
            </div>
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Nombre del prestador
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError('name');
              }}
              onKeyDown={handleNameKeyDown}
              disabled={submitting}
              autoComplete="off"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="category" className="form-label">
              Categoría del servicio
            </label>
            <div className="select-wrap">
              <select
                id="category"
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearError('category');
                }}
                disabled={submitting}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && <div className="form-error">{errors.category}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="addedBy" className="form-label">
              Tu nombre (quien lo agrega)
            </label>
            <input
              id="addedBy"
              type="text"
              className={`form-input ${errors.addedBy ? 'error' : ''}`}
              placeholder="Ej: María García"
              value={addedBy}
              onChange={(e) => {
                setAddedBy(e.target.value);
                clearError('addedBy');
              }}
              onKeyDown={handleAddedByKeyDown}
              disabled={submitting}
              autoComplete="name"
            />
            {errors.addedBy && <div className="form-error">{errors.addedBy}</div>}
            <p className="form-hint">
              Tu nombre aparecerá como referencia para tus vecinos.
            </p>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="floor" className="form-label">
                Tu piso
              </label>
              <div className="select-wrap">
                <select
                  id="floor"
                  className={`form-select ${errors.floor ? 'error' : ''}`}
                  value={floor}
                  onChange={(e) => {
                    setFloor(e.target.value);
                    clearError('floor');
                  }}
                  disabled={submitting}
                >
                  <option value="" disabled>
                    Piso
                  </option>
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              {errors.floor && <div className="form-error">{errors.floor}</div>}
            </div>

            <div className="form-field">
              <label htmlFor="apartment" className="form-label">
                Tu apartamento
              </label>
              <div className="select-wrap">
                <select
                  id="apartment"
                  className={`form-select ${errors.apartment ? 'error' : ''}`}
                  value={apartment}
                  onChange={(e) => {
                    setApartment(e.target.value);
                    clearError('apartment');
                  }}
                  disabled={submitting}
                >
                  <option value="" disabled>
                    Apt
                  </option>
                  {APARTMENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              {errors.apartment && (
                <div className="form-error">{errors.apartment}</div>
              )}
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? <LoadingSpinner size={22} color="#ffffff" /> : 'Registrar contacto'}
          </button>
        </form>
      </div>
    </div>
  );
}
