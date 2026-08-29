import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

const CONTACTS_COL = 'contacts';
const VOTES_COL = 'votes';

export const CATEGORIES = [
  { key: 'plomeria', label: 'Plomería', emoji: '🔧' },
  { key: 'electricidad', label: 'Electricidad', emoji: '⚡' },
  { key: 'carpinteria', label: 'Carpintería', emoji: '🪵' },
  { key: 'mecanica', label: 'Mecánica automotriz', emoji: '🚗' },
  { key: 'albanileria', label: 'Albañilería', emoji: '🧱' },
  { key: 'ac', label: 'Refrigeración / Aire acondicionado', emoji: '❄️' },
  { key: 'cerrajeria', label: 'Cerrajería', emoji: '🔑' },
  { key: 'tecnologia', label: 'Tecnología / PC', emoji: '💻' },
  { key: 'pintura', label: 'Pintura', emoji: '🎨' },
  { key: 'papelAhumado', label: 'Papel Ahumado', emoji: '🪟' },
  { key: 'gas', label: 'Gas / Calentadores', emoji: '🔥' },
  { key: 'limpieza', label: 'Limpieza', emoji: '🧹' },
  { key: 'otro', label: 'Otro', emoji: '📋' },
];

export const SEED_FLAG = 'vault_seed_v1';

export const SEED_CONTACTS = [
  {
    phone: '+584141234567',
    name: 'José Ramírez',
    category: 'plomeria',
    addedBy: 'María González',
    floor: 5,
    apartment: 'A',
    ratingSum: 18,
    ratingCount: 4,
  },
  {
    phone: '+584249876543',
    name: 'Carlos Méndez',
    category: 'electricidad',
    addedBy: 'Luis Pérez',
    floor: 8,
    apartment: 'B',
    ratingSum: 22,
    ratingCount: 5,
  },
  {
    phone: '+584121112233',
    name: 'Pedro Suárez',
    category: 'mecanica',
    addedBy: 'Ana Rodríguez',
    floor: 2,
    apartment: 'C',
    ratingSum: 15,
    ratingCount: 3,
  },
  {
    phone: '+584165554433',
    name: 'Andrés Torres',
    category: 'carpinteria',
    addedBy: 'Roberto Silva',
    floor: 7,
    apartment: 'A',
    ratingSum: 9,
    ratingCount: 2,
  },
  {
    phone: '+584267778899',
    name: 'Miguel Hernández',
    category: 'albanileria',
    addedBy: 'Carmen Díaz',
    floor: 11,
    apartment: 'B',
    ratingSum: 12,
    ratingCount: 3,
  },
  {
    phone: '+584149998877',
    name: 'Luis Ortega',
    category: 'ac',
    addedBy: 'Patricia Morales',
    floor: 4,
    apartment: 'A',
    ratingSum: 20,
    ratingCount: 4,
  },
  {
    phone: '+584245556677',
    name: 'Daniel Castro',
    category: 'cerrajeria',
    addedBy: 'Jorge Hernández',
    floor: 6,
    apartment: 'C',
    ratingSum: 14,
    ratingCount: 3,
  },
  {
    phone: '+584163334455',
    name: 'Fernando Rivas',
    category: 'tecnologia',
    addedBy: 'Sofía Castillo',
    floor: 9,
    apartment: 'B',
    ratingSum: 19,
    ratingCount: 4,
  },
  {
    phone: '+584261112233',
    name: 'Ricardo Vargas',
    category: 'pintura',
    addedBy: 'Eduardo Salazar',
    floor: 3,
    apartment: 'A',
    ratingSum: 16,
    ratingCount: 4,
  },
  {
    phone: '+584147776655',
    name: 'Studio Film Pro',
    category: 'papelAhumado',
    addedBy: 'Gabriela Mendoza',
    floor: 10,
    apartment: 'C',
    ratingSum: 23,
    ratingCount: 5,
  },
  {
    phone: '+584248889900',
    name: 'Roberto Linares',
    category: 'gas',
    addedBy: 'José Castillo',
    floor: 12,
    apartment: 'A',
    ratingSum: 17,
    ratingCount: 4,
  },
  {
    phone: '+584141119988',
    name: 'Limpieza Express',
    category: 'limpieza',
    addedBy: 'Laura Pérez',
    floor: 1,
    apartment: 'B',
    ratingSum: 8,
    ratingCount: 2,
  },
];

export async function seedContactsIfNeeded() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(SEED_FLAG) === '1') {
      return { skipped: true };
    }

    let inserted = 0;
    let skippedExisting = 0;

    for (const c of SEED_CONTACTS) {
      const phoneNormalized = normalizePhone(c.phone);
      const ref = doc(db, CONTACTS_COL, phoneNormalized);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        skippedExisting += 1;
        continue;
      }
      await setDoc(ref, {
        phone: c.phone,
        phoneNormalized,
        name: c.name,
        category: c.category,
        addedBy: c.addedBy,
        floor: c.floor,
        apartment: c.apartment,
        ratingSum: c.ratingSum,
        ratingCount: c.ratingCount,
        averageRating:
          c.ratingCount > 0
            ? Math.round((c.ratingSum / c.ratingCount) * 10) / 10
            : 0,
        createdAt: serverTimestamp(),
      });
      inserted += 1;
    }

    try {
      localStorage.setItem(SEED_FLAG, '1');
    } catch {}

    return { inserted, skippedExisting };
  } catch (err) {
    console.error('seedContactsIfNeeded error:', err);
    return { inserted: 0, skippedExisting: 0, error: err };
  }
}

export function normalizePhone(phone) {
  if (!phone) return '';
  const trimmed = String(phone).trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^0-9]/g, '');
  return hasPlus ? `+${digits}` : digits;
}

function buildVoteId(phoneNormalized, deviceId) {
  return `${phoneNormalized}_${deviceId}`;
}

export async function getAllContacts(category = null) {
  try {
    const constraints = [];
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }
    constraints.push(orderBy('averageRating', 'desc'));
    constraints.push(orderBy('ratingCount', 'desc'));
    constraints.push(limit(200));

    const q = query(collection(db, CONTACTS_COL), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getAllContacts error:', err);
    throw err;
  }
}

export async function getContactById(phoneNormalized) {
  try {
    const ref = doc(db, CONTACTS_COL, phoneNormalized);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('getContactById error:', err);
    throw err;
  }
}

export async function checkContactExists(phoneNormalized) {
  try {
    const ref = doc(db, CONTACTS_COL, phoneNormalized);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (err) {
    console.error('checkContactExists error:', err);
    throw err;
  }
}

export async function addContact(contactData) {
  const { phone, name, category, addedBy, floor, apartment } = contactData;
  const phoneNormalized = normalizePhone(phone);

  const exists = await checkContactExists(phoneNormalized);
  if (exists) {
    throw new Error('Este número ya está registrado en el directorio');
  }

  const ref = doc(db, CONTACTS_COL, phoneNormalized);
  const payload = {
    phone,
    phoneNormalized,
    name,
    category,
    addedBy,
    floor: Number(floor),
    apartment,
    ratingSum: 0,
    ratingCount: 0,
    averageRating: 0,
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, payload);
  return phoneNormalized;
}

export async function hasUserVoted(phoneNormalized, deviceId) {
  try {
    const voteId = buildVoteId(phoneNormalized, deviceId);
    const ref = doc(db, VOTES_COL, voteId);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (err) {
    console.error('hasUserVoted error:', err);
    throw err;
  }
}

export async function submitVote(phoneNormalized, deviceId, rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('La calificación debe estar entre 1 y 5');
  }

  const voteId = buildVoteId(phoneNormalized, deviceId);
  const contactRef = doc(db, CONTACTS_COL, phoneNormalized);
  const voteRef = doc(db, VOTES_COL, voteId);

  await runTransaction(db, async (tx) => {
    const voteSnap = await tx.get(voteRef);
    if (voteSnap.exists()) {
      throw new Error('Ya votaste por este contacto');
    }

    const contactSnap = await tx.get(contactRef);
    if (!contactSnap.exists()) {
      throw new Error('El contacto no existe');
    }

    const currentData = contactSnap.data();
    const currentSum = currentData.ratingSum || 0;
    const currentCount = currentData.ratingCount || 0;

    const newSum = currentSum + rating;
    const newCount = currentCount + 1;
    const newAvg = Math.round((newSum / newCount) * 10) / 10;

    tx.update(contactRef, {
      ratingSum: newSum,
      ratingCount: newCount,
      averageRating: newAvg,
    });

    tx.set(voteRef, {
      contactPhone: phoneNormalized,
      deviceId,
      rating,
      createdAt: serverTimestamp(),
    });
  });
}

export function subscribeToContacts(category, callback) {
  const constraints = [];
  if (category && category !== 'all') {
    constraints.push(where('category', '==', category));
  }
  constraints.push(orderBy('averageRating', 'desc'));
  constraints.push(orderBy('ratingCount', 'desc'));
  constraints.push(limit(200));

  const q = query(collection(db, CONTACTS_COL), ...constraints);
  const unsub = onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    },
    (err) => {
      console.error('subscribeToContacts error:', err);
      callback([], err);
    }
  );
  return unsub;
}
