// ========================================
// ⭐ НОВЫЙ МОДУЛЬ ДЛЯ ЛАЙКОВ И РЕЙТИНГОВ
// ========================================
// Улучшенная версия с правильной архитектурой

import { db, auth } from './firebaseConfig.js';
import { 
    collection, query, where, getDocs, setDoc, deleteDoc, 
    doc, getDoc, updateDoc 
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// ========================================
// ЛАЙК НА ВИДЕО
// ========================================
export async function toggleVideoLike(animeId, episodeIndex) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Лайк қою үшін кіру керек!');
        }

        if (episodeIndex === null || episodeIndex === undefined) {
            throw new Error('Бөлімді таңдаңыз!');
        }

        // Правильный составной ID
        const reactionId = `${currentUser.uid}_${animeId}_ep${episodeIndex}`;
        const reactionRef = doc(db, "video_reactions", reactionId);

        const reactionDoc = await getDoc(reactionRef);

        if (reactionDoc.exists()) {
            const currentType = reactionDoc.data().type;

            if (currentType === 'like') {
                // Убираем лайк
                await deleteDoc(reactionRef);
                return { success: true, message: 'Ұнату алынып тасталды', action: 'removed' };
            } else {
                // Меняем дизлайк на лайк
                await setDoc(reactionRef, {
                    userId: currentUser.uid,
                    animeId: animeId,
                    episode: episodeIndex,
                    type: 'like',
                    time: Date.now()
                });
                return { success: true, message: '❤️ Ұнады!', action: 'changed' };
            }
        } else {
            // Ставим новый лайк
            await setDoc(reactionRef, {
                userId: currentUser.uid,
                animeId: animeId,
                episode: episodeIndex,
                type: 'like',
                time: Date.now()
            });
            return { success: true, message: '❤️ Ұнады!', action: 'added' };
        }

    } catch (error) {
        console.error('Toggle video like error:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// ДИЗЛАЙК НА ВИДЕО
// ========================================
export async function toggleVideoDislike(animeId, episodeIndex) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Дизлайк қою үшін кіру керек!');
        }

        if (episodeIndex === null || episodeIndex === undefined) {
            throw new Error('Бөлімді таңдаңыз!');
        }

        // Правильный составной ID
        const reactionId = `${currentUser.uid}_${animeId}_ep${episodeIndex}`;
        const reactionRef = doc(db, "video_reactions", reactionId);

        const reactionDoc = await getDoc(reactionRef);

        if (reactionDoc.exists()) {
            const currentType = reactionDoc.data().type;

            if (currentType === 'dislike') {
                // Убираем дизлайк
                await deleteDoc(reactionRef);
                return { success: true, message: 'Дизлайк алынып тасталды', action: 'removed' };
            } else {
                // Меняем лайк на дизлайк
                await setDoc(reactionRef, {
                    userId: currentUser.uid,
                    animeId: animeId,
                    episode: episodeIndex,
                    type: 'dislike',
                    time: Date.now()
                });
                return { success: true, message: '👎 Ұнамады', action: 'changed' };
            }
        } else {
            // Ставим новый дизлайк
            await setDoc(reactionRef, {
                userId: currentUser.uid,
                animeId: animeId,
                episode: episodeIndex,
                type: 'dislike',
                time: Date.now()
            });
            return { success: true, message: '👎 Ұнамады', action: 'added' };
        }

    } catch (error) {
        console.error('Toggle video dislike error:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// ПОЛУЧИТЬ РЕАКЦИИ НА ВИДЕО
// ========================================
export async function getVideoReactions(animeId, episodeIndex) {
    try {
        if (episodeIndex === null || episodeIndex === undefined) {
            return { likesCount: 0, dislikesCount: 0, userReaction: null };
        }

        const q = query(
            collection(db, "video_reactions"),
            where("animeId", "==", animeId),
            where("episode", "==", episodeIndex)
        );

        const snapshot = await getDocs(q);

        let likesCount = 0;
        let dislikesCount = 0;
        let userReaction = null;

        const currentUser = auth.currentUser;

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.type === 'like') {
                likesCount++;
            } else if (data.type === 'dislike') {
                dislikesCount++;
            }

            // Проверяем реакцию текущего пользователя
            if (currentUser && data.userId === currentUser.uid) {
                userReaction = data.type;
            }
        });

        return {
            success: true,
            likesCount,
            dislikesCount,
            userReaction
        };

    } catch (error) {
        console.error('Get video reactions error:', error);
        return { 
            success: false, 
            likesCount: 0, 
            dislikesCount: 0, 
            userReaction: null 
        };
    }
}

// ========================================
// УСТАНОВИТЬ РЕЙТИНГ
// ========================================
export async function setRating(animeId, stars) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Бағалау үшін кіру керек!');
        }

        if (stars < 1 || stars > 5) {
            throw new Error('Рейтинг 1-ден 5-ке дейін болуы керек!');
        }

        // Сохраняем оценку пользователя
        const ratingId = `${currentUser.uid}_${animeId}`;
        await setDoc(doc(db, "ratings", ratingId), {
            userId: currentUser.uid,
            animeId: animeId,
            stars: stars,
            time: Date.now()
        });

        // Пересчитываем средний рейтинг
        const avgResult = await updateAverageRating(animeId);

        return {
            success: true,
            message: `${stars} ⭐ рейтинг қойылды!`,
            userRating: stars,
            avgRating: avgResult.avgRating,
            ratingsCount: avgResult.count
        };

    } catch (error) {
        console.error('Set rating error:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// ОБНОВИТЬ СРЕДНИЙ РЕЙТИНГ
// ========================================
async function updateAverageRating(animeId) {
    try {
        // Получаем все оценки для этого контента
        const q = query(
            collection(db, "ratings"),
            where("animeId", "==", animeId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { avgRating: 0, count: 0 };
        }

        // Считаем средний рейтинг
        let totalStars = 0;
        let count = 0;

        snapshot.forEach((doc) => {
            totalStars += doc.data().stars;
            count++;
        });

        const avgRating = totalStars / count;

        // Обновляем в документе контента
        await updateDoc(doc(db, "content", animeId), {
            avgRating: parseFloat(avgRating.toFixed(1)),
            ratingsCount: count
        });

        return {
            avgRating: parseFloat(avgRating.toFixed(1)),
            count
        };

    } catch (error) {
        console.error('Update average rating error:', error);
        return { avgRating: 0, count: 0 };
    }
}

// ========================================
// ПОЛУЧИТЬ РЕЙТИНГ ПОЛЬЗОВАТЕЛЯ
// ========================================
export async function getUserRating(animeId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return { success: true, rating: null };
        }

        const ratingId = `${currentUser.uid}_${animeId}`;
        const ratingDoc = await getDoc(doc(db, "ratings", ratingId));

        if (ratingDoc.exists()) {
            return {
                success: true,
                rating: ratingDoc.data().stars
            };
        }

        return { success: true, rating: null };

    } catch (error) {
        console.error('Get user rating error:', error);
        return { success: false, rating: null };
    }
}

// ========================================
// ПОЛУЧИТЬ СРЕДНИЙ РЕЙТИНГ И КОЛИЧЕСТВО
// ========================================
export async function getAverageRating(animeId) {
    try {
        const contentDoc = await getDoc(doc(db, "content", animeId));

        if (contentDoc.exists()) {
            const data = contentDoc.data();
            return {
                success: true,
                avgRating: data.avgRating || 0,
                ratingsCount: data.ratingsCount || 0
            };
        }

        return { success: true, avgRating: 0, ratingsCount: 0 };

    } catch (error) {
        console.error('Get average rating error:', error);
        return { success: false, avgRating: 0, ratingsCount: 0 };
    }
}
