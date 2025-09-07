# DineFlow API Documentation

This document outlines the API endpoints required to power the DineFlow restaurant management application.

## Base URL

All endpoints are relative to the base API URL (e.g., `/api`).

---

## 1. Tables API

Handles data related to restaurant tables.

### 1.1. Get All Tables

-   **Endpoint:** `GET /tables`
-   **Description:** Retrieves a list of all tables and their current status. Supports filtering by status.
-   **Query Parameters:**
    -   `status` (optional): Filter tables by status. Can be one of `Free`, `Occupied`, `Serving`, `Billing`.
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "number": 1,
        "status": "Free",
        "customerCount": null
      },
      {
        "id": 2,
        "number": 2,
        "status": "Occupied",
        "customerCount": 4
      }
    ]
    ```

---

## 2. Menu API

Handles data for menu items.

### 2.1. Get All Menu Items

-   **Endpoint:** `GET /menu`
-   **Description:** Retrieves the full list of menu items.
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "Bruschetta",
        "price": 8.50,
        "category": "Starters",
        "image": "https://example.com/images/bruschetta.png"
      },
      {
        "id": 5,
        "name": "Margherita Pizza",
        "price": 15.00,
        "category": "Mains",
        "image": "https://example.com/images/pizza.png"
      }
    ]
    ```

---

## 3. Orders API

Manages customer orders.

### 3.1. Create a New Order

-   **Endpoint:** `POST /orders`
-   **Description:** Submits a new order for a specific table to the kitchen.
-   **Request Body:**
    ```json
    {
      "tableId": 3,
      "items": [
        {
          "menuItemId": 6,
          "quantity": 2
        },
        {
          "menuItemId": 9,
          "quantity": 4
        }
      ]
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "orderId": 101,
      "tableId": 3,
      "status": "Pending",
      "total": 50.00,
      "items": [
        {
          "menuItemId": 6,
          "name": "Spaghetti Carbonara",
          "quantity": 2,
          "price": 18.00
        },
        {
          "menuItemId": 9,
          "name": "Coca-Cola",
          "quantity": 4,
          "price": 3.50
        }
      ]
    }
    ```

---

## 4. Staff API

Manages staff members.

### 4.1. Get All Staff Members

-   **Endpoint:** `GET /staff`
-   **Description:** Retrieves a list of all staff members.
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "James Smith",
        "role": "Head Waiter",
        "shift": "9am - 5pm",
        "status": "On Shift",
        "avatar": "https://example.com/avatars/james.png"
      },
      {
        "id": 5,
        "name": "Michael Brown",
        "role": "Sous Chef",
        "shift": "5pm - 11pm",
        "status": "Off Duty",
        "avatar": "https://example.com/avatars/michael.png"
      }
    ]
    ```

---

## 5. Dashboard API

Endpoints for the manager dashboard.

### 5.1. Get Key Performance Indicators (KPIs)

-   **Endpoint:** `GET /dashboard/kpi`
-   **Description:** Retrieves key performance indicators for the restaurant.
-   **Success Response (200 OK):**
    ```json
    {
      "todaysSales": {
        "value": 1250,
        "change": 0.12
      },
      "activeTables": {
        "value": 8,
        "change": -2
      },
      "staffOnDuty": {
        "value": 6,
        "change": 1
      },
      "totalOrders": {
        "value": 124,
        "change": 20
      }
    }
    ```

### 5.2. Get Sales Overview Data

-   **Endpoint:** `GET /dashboard/sales-overview`
-   **Description:** Retrieves data for the sales chart, typically by hour.
-   **Success Response (200 OK):**
    ```json
    [
        { "name": "9am", "sales": 120 },
        { "name": "10am", "sales": 180 },
        { "name": "11am", "sales": 250 },
        { "name": "12pm", "sales": 450 },
        { "name": "1pm", "sales": 510 },
        { "name": "2pm", "sales": 480 },
        { "name": "3pm", "sales": 320 },
        { "name": "4pm", "sales": 280 },
        { "name": "5pm", "sales": 350 },
        { "name": "6pm", "sales": 550 },
        { "name": "7pm", "sales": 600 },
        { "name": "8pm", "sales": 580 }
    ]
    ```

### 5.3. Get Staff on Duty

-   **Endpoint:** `GET /dashboard/staff-on-duty`
-   **Description:** Retrieves a list of staff members currently on shift.
-   **Success Response (200 OK):**
    (Same format as `GET /staff`, but filtered for `status: "On Shift"`)
    ```json
    [
      {
        "id": 1,
        "name": "James Smith",
        "role": "Head Waiter",
        "shift": "9am - 5pm",
        "status": "On Shift",
        "avatar": "https://example.com/avatars/james.png"
      }
    ]
    ```
