DROP DATABASE IF EXISTS `freelancer`;

CREATE DATABASE `freelancer`
DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE `freelancer`;

CREATE TABLE `categories`
(
    `category_id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `icon` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`category_id`)
);

CREATE TABLE `skills`
(
    `skill_id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `category_id` INT NOT NULL,
    PRIMARY KEY (`skill_id`)
);

CREATE TABLE `projects`
(
    `project_id` INT NOT NULL AUTO_INCREMENT,
    `category_id` INT,
    `title` VARCHAR(50),
    `description` VARCHAR(3000),
    `price` INT,
    `status_id` INT NOT NULL,
    `accepted_offer_id` INT,
    `author_id` INT,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`project_id`)
);
CREATE TABLE `project_skills`
(
    `project_skills_id` INT NOT NULL AUTO_INCREMENT,
    `project_id` INT,
    `skill_id` INT,
    PRIMARY KEY (`project_skills_id`)
);

CREATE TABLE `offers`
(
    `offer_id` INT NOT NULL AUTO_INCREMENT,
    `category_id` INT,
    `message` VARCHAR(3000),
    `estimated_time` INT,
    `price` INT,
    `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `project_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`offer_id`)
);

CREATE TABLE `offer_skills`
(
    `offer_skills_id` INT NOT NULL AUTO_INCREMENT,
    `offer_id` INT NOT NULL,
    `skill_id` INT NOT NULL,
    PRIMARY KEY (`offer_skills_id`)
);

CREATE TABLE `users`
(
    `user_id` INT NOT NULL AUTO_INCREMENT,
    `login` VARCHAR(30) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `email` VARCHAR(30) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `role_id` INT NOT NULL,
    PRIMARY KEY (`user_id`)
);
CREATE TABLE `roles`
(
    `role_id` INT NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    PRIMARY KEY (`role_id`)
);
CREATE TABLE `statuses`
(
    `status_id` INT NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    PRIMARY KEY (`status_id`)
);
ALTER TABLE `skills`
ADD FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`); 

ALTER TABLE `projects`
ADD FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`); 

ALTER TABLE `projects`
ADD FOREIGN KEY (`author_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE; 

ALTER TABLE `projects`
ADD FOREIGN KEY (`accepted_offer_id`) REFERENCES `offers`(`offer_id`) ON DELETE CASCADE;

ALTER TABLE `project_skills`
ADD FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE; 

ALTER TABLE `project_skills`
ADD FOREIGN KEY (`skill_id`) REFERENCES `skills`(`skill_id`); 

ALTER TABLE `offers`
ADD FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE; 

ALTER TABLE `offers`
ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `offer_skills`
ADD FOREIGN KEY (`offer_id`) REFERENCES `offers`(`offer_id`) ON DELETE CASCADE; 

ALTER TABLE `offer_skills`
ADD FOREIGN KEY (`skill_id`) REFERENCES `skills`(`skill_id`); 

ALTER TABLE `users`
ADD FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`);

ALTER TABLE `projects`
ADD FOREIGN KEY (`status_id`) REFERENCES `statuses`(`status_id`);
