-- Luo tietokanta
CREATE DATABASE IF NOT EXISTS pawpics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pawpics;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- Käyttäjät-taulu
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    image VARCHAR(255),
    location VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Postaukset-taulu
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    authorId INT NOT NULL,
    content TEXT,
    image VARCHAR(255),
    video VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likesCount INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    CONSTRAINT fk_posts_author FOREIGN KEY (authorId)
        REFERENCES users(id) ON DELETE CASCADE
);

-- Kommentit-taulu
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId INT NOT NULL,
    userId INT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_post FOREIGN KEY (postId)
        REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (userId)
        REFERENCES users(id) ON DELETE CASCADE
);

-- Tykkäykset-taulu
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId INT NOT NULL,
    userId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_likes_post FOREIGN KEY (postId)
        REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_user FOREIGN KEY (userId)
        REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (postId, userId)
);

-- Seuraus-taulu
CREATE TABLE follows (
    followerId INT NOT NULL,
    followingId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (followerId, followingId),
    CONSTRAINT fk_follows_follower FOREIGN KEY (followerId)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (followingId)
        REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications-taulu
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    creatorId INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    postId INT,
    commentId INT,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (userId)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_creator FOREIGN KEY (creatorId)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_post FOREIGN KEY (postId)
        REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_comment FOREIGN KEY (commentId)
        REFERENCES comments(id) ON DELETE CASCADE
);
