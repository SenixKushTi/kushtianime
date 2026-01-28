// ========================================
// 👥 НОВЫЙ МОДУЛЬ ДЛЯ РАБОТЫ С ДРУЗЬЯМИ
// ========================================
// Улучшенная версия с правильной архитектурой

import { db, auth } from './firebaseConfig.js';
import { 
    collection, query, where, getDocs, addDoc, deleteDoc, 
    doc, getDoc, onSnapshot, orderBy 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// ========================================
// ОТПРАВКА ЗАПРОСА В ДРУЗЬЯ
// ========================================
export async function sendFriendRequest(toUserId, toUsername) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Кіру керек!');
        }

        // Проверка 1: Нельзя отправить самому себе
        if (toUserId === currentUser.uid) {
            throw new Error('Өзіңізге сұраныс жібере алмайсыз!');
        }

        // Проверка 2: Уже есть запрос?
        const existingRequest = await getDocs(
            query(
                collection(db, "friend_requests"),
                where("from", "==", currentUser.uid),
                where("to", "==", toUserId)
            )
        );

        if (!existingRequest.empty) {
            throw new Error('Сұраныс бұрын жіберілген!');
        }

        // Проверка 3: Уже друзья?
        const alreadyFriends = await getDocs(
            query(
                collection(db, "friends"),
                where("userId", "==", currentUser.uid),
                where("friendId", "==", toUserId)
            )
        );

        if (!alreadyFriends.empty) {
            throw new Error('Сіз қазірдің өзінде достарсыз!');
        }

        // Получаем данные текущего пользователя
        const myDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!myDoc.exists()) {
            throw new Error('Профиль табылмады!');
        }

        // Отправляем запрос
        await addDoc(collection(db, "friend_requests"), {
            from: currentUser.uid,
            fromUsername: myDoc.data().username,
            to: toUserId,
            toUsername: toUsername,
            time: Date.now(),
            status: 'pending'
        });

        return { success: true, message: '✅ Сұраныс жіберілді!' };

    } catch (error) {
        console.error('Send friend request error:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// ПРИНЯТИЕ ЗАПРОСА В ДРУЗЬЯ
// ========================================
export async function acceptFriendRequest(requestId, friendId, friendUsername) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Кіру керек!');
        }

        // Проверка: уже друзья?
        const alreadyFriends = await getDocs(
            query(
                collection(db, "friends"),
                where("userId", "==", currentUser.uid),
                where("friendId", "==", friendId)
            )
        );

        if (!alreadyFriends.empty) {
            // Удаляем запрос и возвращаем успех
            await deleteDoc(doc(db, "friend_requests", requestId));
            throw new Error('Сіз қазірдің өзінде достарсыз!');
        }

        // Получаем данные текущего пользователя
        const myDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!myDoc.exists()) {
            throw new Error('Профиль табылмады!');
        }

        // Создаем взаимную дружбу (2 документа)
        await addDoc(collection(db, "friends"), {
            userId: currentUser.uid,
            username: myDoc.data().username,
            friendId: friendId,
            friendUsername: friendUsername,
            time: Date.now()
        });

        await addDoc(collection(db, "friends"), {
            userId: friendId,
            username: friendUsername,
            friendId: currentUser.uid,
            friendUsername: myDoc.data().username,
            time: Date.now()
        });

        // Удаляем запрос
        await deleteDoc(doc(db, "friend_requests", requestId));

        return { success: true, message: '✅ Дос қосылды!' };

    } catch (error) {
        console.error('Accept friend request error:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// ОТКЛОНЕНИЕ ЗАПРОСА
// ========================================
export async function rejectFriendRequest(requestId) {
    try {
        await deleteDoc(doc(db, "friend_requests", requestId));
        return { success: true, message: 'Сұраныс жойылды' };
    } catch (error) {
        console.error('Reject friend request error:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// УДАЛЕНИЕ ИЗ ДРУЗЕЙ
// ========================================
export async function removeFriend(docId, friendId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Кіру керек!');
        }

        // Удаляем свою запись
        await deleteDoc(doc(db, "friends", docId));

        // Удаляем запись друга
        const friendDocs = await getDocs(
            query(
                collection(db, "friends"),
                where("userId", "==", friendId),
                where("friendId", "==", currentUser.uid)
            )
        );

        friendDocs.forEach(async (d) => {
            await deleteDoc(d.ref);
        });

        return { success: true, message: 'Дос өшірілді' };

    } catch (error) {
        console.error('Remove friend error:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// ПРОВЕРКА СТАТУСА ДРУЖБЫ
// ========================================
export async function checkFriendshipStatus(userId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return 'not_auth';
        }

        if (userId === currentUser.uid) {
            return 'self';
        }

        // Проверяем друзья ли мы
        const friendsQuery = await getDocs(
            query(
                collection(db, "friends"),
                where("userId", "==", currentUser.uid),
                where("friendId", "==", userId)
            )
        );

        if (!friendsQuery.empty) {
            return 'friends';
        }

        // Проверяем исходящий запрос
        const outgoingRequest = await getDocs(
            query(
                collection(db, "friend_requests"),
                where("from", "==", currentUser.uid),
                where("to", "==", userId)
            )
        );

        if (!outgoingRequest.empty) {
            return 'pending';
        }

        // Проверяем входящий запрос
        const incomingRequest = await getDocs(
            query(
                collection(db, "friend_requests"),
                where("from", "==", userId),
                where("to", "==", currentUser.uid)
            )
        );

        if (!incomingRequest.empty) {
            return 'incoming';
        }

        return 'none';

    } catch (error) {
        console.error('Check friendship status error:', error);
        return 'error';
    }
}

// ========================================
// ПОДПИСКА НА ВХОДЯЩИЕ ЗАПРОСЫ
// ========================================
export function subscribeFriendRequests(callback) {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    return onSnapshot(
        query(
            collection(db, "friend_requests"),
            where("to", "==", currentUser.uid),
            orderBy("time", "desc")
        ),
        (snapshot) => {
            const requests = [];
            snapshot.forEach((doc) => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(requests);
        },
        (error) => {
            console.error('Subscribe friend requests error:', error);
            callback([]);
        }
    );
}

// ========================================
// ПОДПИСКА НА СПИСОК ДРУЗЕЙ
// ========================================
export function subscribeFriends(callback) {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    return onSnapshot(
        query(
            collection(db, "friends"),
            where("userId", "==", currentUser.uid),
            orderBy("time", "desc")
        ),
        (snapshot) => {
            const friends = [];
            snapshot.forEach((doc) => {
                friends.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(friends);
        },
        (error) => {
            console.error('Subscribe friends error:', error);
            callback([]);
        }
    );
}
