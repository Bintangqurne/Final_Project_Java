# Dokumentasi Inheritance & Relasi Backend Java

## 1. INHERITANCE (Pewarisan)

### A. Spring Framework Inheritance

#### 1. **AdminBootstrap** `implements ApplicationRunner`
```java
public class AdminBootstrap implements ApplicationRunner
```
- **Tujuan**: Menjalankan kode saat aplikasi startup
- **Method yang diimplementasi**: `run(ApplicationArguments args)`
- **Fungsi**: Bootstrap admin user saat aplikasi pertama kali jalan

#### 2. **UserPrincipal** `implements UserDetails`
```java
public class UserPrincipal implements UserDetails
```
- **Tujuan**: Implementasi security user untuk Spring Security
- **Methods yang diimplementasi**:
  - `getAuthorities()` - Mengembalikan role/permission user
  - `getPassword()` - Password hash dari user
  - `getUsername()` - Username
  - `isAccountNonExpired()`, `isAccountNonLocked()`, `isCredentialsNonExpired()`, `isEnabled()`
- **Fungsi**: Wrapper untuk User entity saat authenticasi

#### 3. **CustomUserDetailsService** `implements UserDetailsService`
```java
public class CustomUserDetailsService implements UserDetailsService
```
- **Tujuan**: Custom user loading untuk authentication
- **Method yang diimplementasi**: `loadUserByUsername(String username)`
- **Fungsi**: Load user dari database saat login

#### 4. **JwtAuthenticationFilter** `extends OncePerRequestFilter`
```java
public class JwtAuthenticationFilter extends OncePerRequestFilter
```
- **Parent**: `OncePerRequestFilter` (Spring Security)
- **Method yang di-override**: `doFilterInternal(...)`
- **Fungsi**: Filter JWT token di setiap request
- **Proses**:
  1. Extract JWT dari header Authorization
  2. Validate JWT
  3. Load user dari database
  4. Set authentication ke Security Context

#### 5. **StaticResourceConfig** `implements WebMvcConfigurer`
```java
public class StaticResourceConfig implements WebMvcConfigurer
```
- **Tujuan**: Konfigurasi static resources
- **Method yang diimplementasi**: `addResourceHandlers(ResourceHandlerRegistry registry)`
- **Fungsi**: Mapping `/uploads/**` ke folder `uploads/` di server

### B. Database Repository Inheritance

Semua Repository extends **`JpaRepository<Entity, ID>`**:

```
JpaRepository
    ├── UserRepository extends JpaRepository<User, Long>
    ├── ProductRepository extends JpaRepository<Product, Long>
    ├── CartItemRepository extends JpaRepository<CartItem, Long>
    ├── OrderRepository extends JpaRepository<Order, Long>
    ├── OrderItemRepository extends JpaRepository<OrderItem, Long>
    └── PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long>
```

**Fitur yang diwariskan dari JpaRepository**:
- CRUD operations: `save()`, `findById()`, `delete()`
- Batch operations: `saveAll()`, `deleteAll()`
- Pagination: `findAll(Pageable)`
- Query methods: `findByXxx()`
- Custom queries: `@Query` annotation

---

## 2. RELASI ANTAR ENTITY (Database Relationships)

### Diagram Relasi
```
┌─────────────┐
│    User     │ (Parent)
│  PK: id     │
└──────┬──────┘
       │
       ├── 1:N ──→ ┌──────────────┐
       │           │  CartItem    │
       │           │  PK: id      │
       │           │  FK: user_id │
       │           └──────────────┘
       │
       ├── 1:N ──→ ┌──────────────┐
       │           │    Order     │
       │           │  PK: id      │
       │           │  FK: user_id │
       │           └──────┬───────┘
       │                  │
       │                  └── 1:N ──→ ┌──────────────┐
       │                             │  OrderItem   │
       │                             │  PK: id      │
       │                             │  FK: order_id│
       │                             └──────────────┘
       │
       └── Belongs to Role (ENUM: ADMIN, USER)

┌─────────────┐ (Parent)
│   Product   │
│  PK: id     │
└──────┬──────┘
       │
       ├── 1:N ──→ ┌──────────────┐
       │           │  CartItem    │
       │           │  FK: product_id
       │           └──────────────┘
       │
       └── 1:N ──→ ┌──────────────┐
                   │  OrderItem   │
                   │  FK: product_id
                   └──────────────┘

┌──────────────┐ (Parent)
│    Order     │
│  PK: id      │
└──────┬───────┘
       │
       ├── 1:N ──→ ┌──────────────────────┐
       │           │ PaymentTransaction   │
       │           │ FK: order_id         │
       │           └──────────────────────┘
       │
       └── 1:N ──→ ┌──────────────┐
                   │  OrderItem   │
                   │  FK: order_id│
                   └──────────────┘
```

### Detail Setiap Relasi

#### 1️⃣ **User → CartItem** (One-to-Many)
```java
// Di CartItem.java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```
- **Jenis**: One-to-Many (1 User bisa punya banyak CartItem)
- **FetchType.LAZY**: Jangan load user saat fetch CartItem (efficient)
- **nullable = false**: Setiap CartItem harus punya user
- **Use Case**: Saat user tambah barang ke cart

#### 2️⃣ **User → Order** (One-to-Many)
```java
// Di Order.java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```
- **Jenis**: One-to-Many (1 User bisa buat banyak Order)
- **Use Case**: Saat user checkout (membuat order)

#### 3️⃣ **Product → CartItem** (One-to-Many)
```java
// Di CartItem.java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "product_id", nullable = false)
private Product product;
```
- **Jenis**: One-to-Many (1 Product bisa ada di banyak CartItem)
- **Use Case**: Banyak user bisa menambahkan product yang sama ke cart

#### 4️⃣ **Product → OrderItem** (One-to-Many)
```java
// Di OrderItem.java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "product_id", nullable = false)
private Product product;
```
- **Jenis**: One-to-Many (1 Product bisa ada di banyak OrderItem)
- **Use Case**: Product bisa ada di banyak order dari user berbeda

#### 5️⃣ **Order → OrderItem** (One-to-Many)
```java
// Di OrderItem.java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "order_id", nullable = false)
private Order order;
```
- **Jenis**: One-to-Many (1 Order bisa punya banyak OrderItem)
- **Use Case**: 1 order bisa berisi banyak produk
- **Contoh**: Order #123 berisi [2x Product A, 1x Product B]

#### 6️⃣ **Order → PaymentTransaction** (One-to-Many)
```java
// Di PaymentTransaction.java
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "order_id", nullable = false)
private Order order;
```
- **Jenis**: One-to-Many (1 Order bisa punya banyak transaksi pembayaran)
- **Use Case**: User retry pembayaran → 1 order, banyak payment records

---

## 3. ENUM (Special Type)

### **Role** (User Role)
```java
enum Role {
  ADMIN,   // Full access
  USER     // Customer access
}
```
- **Location**: `User.java`
- **Field**: `private Role role;`
- **Use Case**: Determine user permissions

### **OrderStatus** (Order Status)
```java
enum OrderStatus {
  PENDING,      // Baru dipesan
  PROCESSING,   // Sedang diproses
  SHIPPED,      // Sudah dikirim
  DELIVERED,    // Sudah diterima
  CANCELLED     // Dibatalkan
}
```
- **Location**: `Order.java`
- **Use Case**: Track order progress

### **PaymentStatus** (Payment Status)
```java
enum PaymentStatus {
  PENDING,      // Menunggu pembayaran
  COMPLETED,    // Pembayaran selesai
  FAILED,       // Pembayaran gagal
  CANCELLED     // Dibatalkan
}
```
- **Location**: `PaymentTransaction.java`
- **Use Case**: Track payment status

### **PaymentProvider** (Payment Provider)
```java
enum PaymentProvider {
  MIDTRANS      // Menggunakan Midtrans
}
```
- **Location**: `PaymentTransaction.java`
- **Use Case**: Track payment provider

---

## 4. LIFECYCLE CALLBACKS (@PrePersist, @PreUpdate)

Beberapa Entity memiliki automatic timestamp management:

### **User.java**
```java
@PrePersist
void onCreate() {
  this.createdAt = Instant.now();
  this.updatedAt = Instant.now();
}

@PreUpdate
void onUpdate() {
  this.updatedAt = Instant.now();
}
```

### **Product.java**
```java
@PrePersist
void onCreate() {
  Instant now = Instant.now();
  this.createdAt = now;
  this.updatedAt = now;
}

@PreUpdate
void onUpdate() {
  this.updatedAt = Instant.now();
}
```

**Tujuan**: Automatically set creation & update timestamps tanpa perlu di-code manually

---

## 5. UNIQUE CONSTRAINTS

### **User.java**
```java
@UniqueConstraint(name = "uk_users_username", columnNames = "username"),
@UniqueConstraint(name = "uk_users_email", columnNames = "email")
```
- **username** harus unique
- **email** harus unique

### **Order.java**
```java
@Column(nullable = false, unique = true)
private String orderCode;
```
- **orderCode** harus unique (contoh: ORD-20231215-001)

### **CartItem.java**
```java
@UniqueConstraint(name = "uk_cart_user_product", columnNames = {"user_id", "product_id"})
```
- **Kombinasi user_id + product_id** harus unique
- **Artinya**: User hanya bisa punya 1 cartitem per product (quantity diupdate, bukan duplicate row)

---

## 6. RINGKASAN STRUKTUR

| Entity | Extends? | Implements? | Relasi As | Relasi ke |
|--------|----------|-------------|-----------|-----------|
| **User** | ❌ | ❌ | Parent | CartItem, Order |
| **Product** | ❌ | ❌ | Parent | CartItem, OrderItem |
| **CartItem** | ❌ | ❌ | Child | User, Product |
| **Order** | ❌ | ❌ | Parent/Child | User, OrderItem, PaymentTransaction |
| **OrderItem** | ❌ | ❌ | Child | Order, Product |
| **PaymentTransaction** | ❌ | ❌ | Child | Order |

---

## 7. FLOW CONTOH

### **User membeli product**:
```
1. User browse → (read) Product
2. User add ke cart → CREATE CartItem(user_id, product_id)
3. User checkout → CREATE Order(user_id)
4. Untuk setiap CartItem → CREATE OrderItem(order_id, product_id, quantity)
5. Create PaymentTransaction(order_id) dengan status PENDING
6. User bayar → UPDATE PaymentTransaction(status = COMPLETED)
7. UPDATE Order(status = PROCESSING)
```

### **Database Query Contoh**:
```sql
-- Get user's cart
SELECT * FROM cart_items 
WHERE user_id = ? 

-- Get order details dengan items
SELECT o.*, oi.* FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = ?

-- Get product yang pernah dibeli user
SELECT DISTINCT p.* FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.user_id = ?
```

---

## 8. KEY CONCEPTS

### **@ManyToOne** vs **@OneToMany**
- **@ManyToOne**: Side yang punya Foreign Key (CartItem → User)
- **@OneToMany**: Side yang tidak punya FK, tapi punya list (User punya list CartItems)

### **FetchType.LAZY** vs **FetchType.EAGER**
- **LAZY** (recommended): Jangan load parent saat fetch child (efficient)
- **EAGER**: Selalu load parent saat fetch child (bisa slow)

### **nullable = false**
- Relasi wajib ada (tidak boleh NULL)
- Setiap CartItem pasti punya User dan Product

### **optional = false** (di @ManyToOne)
- Sama dengan nullable = false
- Relationship mandatory

---

## Kesimpulan

Backend Java ini menggunakan:
1. **Inheritance** untuk Spring framework integration (Filter, Config, Service)
2. **Interface implementation** untuk plugin patterns
3. **ORM (JPA)** untuk database relasi
4. **One-to-Many relationships** sebagai model utama
5. **ENUM** untuk tipe/status fields
6. **Lifecycle callbacks** untuk auto-timestamps
