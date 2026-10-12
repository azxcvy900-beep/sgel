import { ref, set, get, onValue, push, remove } from "firebase/database";
import { rtdb } from "./config";
import { INITIAL_CASES } from "../data/casesData";

const CASES_PATH = "sijill/cases";
const ORDERS_PATH = "sijill/orders";

/**
 * Initializes and listens to Cases in Firebase Realtime Database
 * Automatically seeds initial cases if database is empty.
 */
export function subscribeToCases(onSuccess, onError) {
  try {
    const casesRef = ref(rtdb, CASES_PATH);

    // Set up real-time listener
    const unsubscribe = onValue(
      casesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert object or array to array format
          const casesArray = Array.isArray(data) 
            ? data.filter(Boolean) 
            : Object.values(data);
          onSuccess(casesArray);
        } else {
          // If empty, seed initial cases into Firebase
          console.log("Seeding INITIAL_CASES into Firebase Realtime Database...");
          set(casesRef, INITIAL_CASES)
            .then(() => onSuccess(INITIAL_CASES))
            .catch((err) => {
              console.warn("Could not seed Firebase, falling back to local:", err.message);
              onSuccess(INITIAL_CASES);
            });
        }
      },
      (error) => {
        console.warn("Firebase onValue error (permission or network):", error.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Firebase subscription setup error:", err.message);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Saves a new case or book to Firebase
 */
export async function addCaseToFirebase(newCase) {
  try {
    const caseRef = ref(rtdb, `${CASES_PATH}/${newCase.id}`);
    await set(caseRef, newCase);
    return { success: true };
  } catch (error) {
    console.warn("Failed to add case to Firebase:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a case or book from Firebase
 */
export async function deleteCaseFromFirebase(caseId) {
  try {
    const caseRef = ref(rtdb, `${CASES_PATH}/${caseId}`);
    await remove(caseRef);
    return { success: true };
  } catch (error) {
    console.warn("Failed to delete case from Firebase:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Records a new purchase order in Firebase
 */
export async function saveOrderToFirebase(order) {
  try {
    const ordersRef = ref(rtdb, ORDERS_PATH);
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, {
      ...order,
      createdAt: new Date().toISOString()
    });
    return { success: true, orderId: order.orderId };
  } catch (error) {
    console.warn("Failed to save order to Firebase:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribes to customer orders in Firebase
 */
export function subscribeToOrders(onSuccess, onError) {
  try {
    const ordersRef = ref(rtdb, ORDERS_PATH);
    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const ordersArray = Object.entries(data).map(([key, val]) => ({
            id: key,
            ...val
          })).reverse();
          onSuccess(ordersArray);
        } else {
          onSuccess([]);
        }
      },
      (error) => {
        console.warn("Orders subscription error:", error.message);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
}
