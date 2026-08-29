import { useEffect, useRef, useState } from 'react';
import DisclaimerModal from './components/DisclaimerModal';
import CategorySelector from './components/CategorySelector';
import ContactList from './components/ContactList';
import ContactDetailModal from './components/ContactDetailModal';
import VoteModal from './components/VoteModal';
import RegisterModal from './components/RegisterModal';
import Toast from './components/Toast';
import { getDeviceId } from './utils/deviceId';
import {
  subscribeToContacts,
  hasUserVoted,
  seedContactsIfNeeded,
} from './services/firestoreService';

export default function App() {
  const [screen, setScreen] = useState('disclaimer');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const [toast, setToast] = useState(null);

  const deviceIdRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    deviceIdRef.current = getDeviceId();
    seedContactsIfNeeded().then((res) => {
      if (res?.inserted > 0) {
        showToast(`Se cargaron ${res.inserted} contactos de ejemplo`, 'info');
      }
    });
  }, []);

  function showToast(message, type = 'info') {
    setToast({ message, type });
  }

  function handleAcceptDisclaimer() {
    setScreen('selector');
  }

  function handleSelectCategory(cat) {
    setSelectedCategory(cat);
    setContacts([]);
    setLoading(true);
    setScreen('list');
  }

  function handleBackToSelector() {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setScreen('selector');
    setSelectedCategory(null);
  }

  useEffect(() => {
    if (screen !== 'list' || !selectedCategory) return undefined;

    setLoading(true);
    const unsub = subscribeToContacts(selectedCategory.key, (list) => {
      setContacts(list);
      setLoading(false);
    });
    unsubscribeRef.current = unsub;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [screen, selectedCategory]);

  async function handleCardTap(contact) {
    setSelectedContact(contact);
    setHasVoted(false);
    setShowDetailModal(true);
    try {
      const voted = await hasUserVoted(contact.phoneNormalized, deviceIdRef.current);
      setHasVoted(voted);
    } catch (err) {
      showToast('No se pudo verificar tu voto anterior', 'error');
    }
  }

  function handleDetailClose(payload) {
    setShowDetailModal(false);
    if (payload && payload.type === 'toast') {
      showToast(payload.message, payload.level);
    }
    setSelectedContact(null);
    setHasVoted(false);
  }

  function handleOpenVote() {
    setShowVoteModal(true);
  }

  function handleVoteSuccess() {
    setShowVoteModal(false);
    setHasVoted(true);
    showToast('¡Gracias por calificar!', 'success');
  }

  function handleVoteClose() {
    setShowVoteModal(false);
  }

  function handleRegisterSuccess() {
    setShowRegisterModal(false);
    showToast('¡Contacto agregado exitosamente!', 'success');
  }

  function handleRegisterClose() {
    setShowRegisterModal(false);
  }

  return (
    <div className="app-container">
      {screen === 'disclaimer' && (
        <DisclaimerModal onAccept={handleAcceptDisclaimer} />
      )}

      {screen === 'selector' && (
        <CategorySelector
          onSelect={handleSelectCategory}
          onAddClick={() => setShowRegisterModal(true)}
        />
      )}

      {screen === 'list' && selectedCategory && (
        <>
          <header className="list-header">
            <button
              type="button"
              className="btn-back"
              onClick={handleBackToSelector}
              aria-label="Volver a categorías"
            >
              ←
            </button>
            <div className="list-header-center">
              <span className="list-header-brand">Colina Del Este</span>
              <span className="list-header-subtitle">
                {selectedCategory.emoji} {selectedCategory.label}
              </span>
            </div>
            <span className="list-header-placeholder" aria-hidden="true" />
          </header>

          <ContactList
            contacts={contacts}
            loading={loading}
            onCardTap={handleCardTap}
            onAddClick={() => setShowRegisterModal(true)}
          />

          <button
            type="button"
            className="fab"
            onClick={() => setShowRegisterModal(true)}
            aria-label="Agregar contacto"
          >
            +
          </button>
        </>
      )}

      {showDetailModal && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          hasVoted={hasVoted}
          onClose={handleDetailClose}
          onVote={handleOpenVote}
        />
      )}

      {showVoteModal && selectedContact && (
        <VoteModal
          contact={selectedContact}
          deviceId={deviceIdRef.current}
          onClose={handleVoteClose}
          onSuccess={handleVoteSuccess}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={handleRegisterClose}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
