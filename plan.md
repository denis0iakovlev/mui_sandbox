### Создание страницы заказа 
Изменить схему БД добавить User, Order 
+ Добавить в админку соответсвуюшие таблицы 
+ Добавить аутентификацию через телеграм
+  
# Logging
For users no logging , only telegram logging, when user open my web app
i get user id ,name and nickname
if user open site from desktop then he will have two variants:
+ without authentification, that id stored in session storage with generated auto increment id
+ with tg auth , that id got from id tg
admin might to see admin panel
###
При добавлении в корзину позиции создать/получить из куки номер id заказа
### 06/07/24 Issue 1 (in work)
+ issue duplicate size on main card (main.$id.tsx)
+ handling count param in main card (main.$id.tsx)
+ handling count same item in basket (main.basket.tsx)
+ add functinality for check sold item, if user confirmed and paid on order, then 
     deincrement item  count field - action in main.confirm.order.$id.tsx


