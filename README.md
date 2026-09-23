# Whisker 🐾

Whisker is a student MERN ecommerce prototype for pet products, with catalogue, account, ordering, chat, and operations screens.

## Local setup

Use Node.js 22 and a MongoDB replica set. Copy `server/.env.example` to an ignored `server/.env`, set `MONGODB_URI` and a random session secret, and configure the providers you use. Start the API with `npm ci` and `npm start` in `server/`. In `client/pets/`, run `npm ci`, `npm run build`, and `npm run dev`.

Checkout applies inventory, order, cart, and balance changes in one MongoDB transaction. Orders support cash and account-balance payment.

## Tests

Run `npm test` in `server/`. Set `MONGODB_TEST_URI` to an isolated MongoDB replica set to include checkout rollback, discount, and concurrent-stock tests. Integration tests create and delete uniquely named test databases.

---

## ✅ Features

- Easy login and registration
- Product filtering and search (Cats/Dogs)
- Add favorites, view order history
- Multi-language support (English/Arabic)
- Admin panel to manage items and view stats
- Sales dashboard and detailed reports
- Vet consultation chat
- Customer support chat
- Packing and delivery system for orders

---

## 🖼️ Screenshots

> **Images**

![Login Page](assets/page1.png)  
![Register Page](assets/page2.png)  
![Products Page](assets/page3.png)  
![Checkout Page](assets/page4.png)  
![Account Page](assets/page5.png)  
![Suppliers Page](assets/page6.png)  
![Edit Item Page](assets/page7.png)  
![Add Item Page](assets/page8.png)  
![Dashboard Page](assets/page9.png)  
![Statistics Page](assets/page10.png)  
![Items Page](assets/page11.png)  
![Customers Page](assets/page12.png)  
![Payments Page](assets/page13.png)  
![Vet Chat (Doctor)](assets/page14.png)  
![Vet Chat (User)](assets/page15.png)  
![Support Chat (Support)](assets/page16.png)  
![Support Chat (User)](assets/page17.png)  
![Packagers Page](assets/page18.png)  
![Drivers Page](assets/page19.png)

---

## 🛠️ Tech Stack

- **Frontend**: React.js  
- **Backend**: Node.js, Express.js
- **Database**: MongoDB  
- **Authentication**: Passport OAuth Strategy
- **Other Tools**: Chart.js, Bootstrap  

---
