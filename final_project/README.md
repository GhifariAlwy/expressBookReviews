# Book Review App — Proyek Akhir Node.js & Express.js

REST API aplikasi ulasan buku dengan autentikasi **Session (express-session) + JWT (jsonwebtoken)**.
Proyek ini adalah hasil fork dari `ibm-developer-skills-network/expressBookReviews`.

## Cara menjalankan secara lokal

```bash
cd final_project
npm install
npm start          # atau: node index.js
```

- Port default **5001** (`PORT=5001`). Jika ingin port lain: `PORT=3000 npm start`
  (di macOS port 5000 biasanya dipakai ControlCenter/AirPlay).
- Opsional (produksi): set `JWT_SECRET` dan `SESSION_SECRET` sebagai environment variable
  agar tidak memakai nilai fallback.
- Server non-blocking: semua handler async/Promise, tidak ada operasi sync yang blocking.

## Endpoint

### Publik (tanpa login)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/` | Semua buku (async callback) |
| GET | `/isbn/:isbn` | Buku berdasarkan ISBN (Promise) |
| GET | `/author/:author` | Buku berdasarkan penulis (Promise) |
| GET | `/title/:title` | Buku berdasarkan judul (Promise) |
| GET | `/review/:isbn` | Review sebuah buku |
| POST | `/customer/register` | Registrasi user baru (duplikat → 400) |

### Terproteksi (butuh JWT — header `Authorization: Bearer <token>` atau session)
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/customer/login` | Login → JWT (1 jam) + disimpan di session |
| PUT | `/customer/auth/review/:isbn?review=...` | Tambah/ubah review milik sendiri |
| DELETE | `/customer/auth/review/:isbn` | Hapus review milik sendiri |

## Task 10 — general.js (klien Axios)

File `general.js` memanggil 4 endpoint publik via HTTP menggunakan **Axios**:
- `getAllBooks` & `getBooksByISBN` → `async/await` + `try/catch`
- `getBooksByAuthor` & `getBooksByTitle` → `Promise` + `.then()/.catch()`

Jalankan saat server hidup:

```bash
node general.js   # BASE_URL=http://localhost:5001 (default)
```

## Bukti penilaian (task 1–9 + 11)

Folder `evidence/` berisi satu file per task: `getallbooks`, `getbooksbyISBN`,
`getbooksbyauthor`, `getbooksbytitle`, `getbookreview`, `register`, `login`,
`reviewadded`, `deletereview`, `githubrepo` — masing-masing berisi perintah cURL
persis + output JSON yang dihasilkan.

Regenerasi semua bukti dengan satu perintah:

```bash
bash generate_evidence.sh
```

## URL penting

- Repo: https://github.com/GhifariAlwy/expressBookReviews
- general.js (Task 10): https://github.com/GhifariAlwy/expressBookReviews/blob/main/final_project/general.js
- Verifikasi fork (Task 11): `curl -s https://api.github.com/repos/GhifariAlwy/expressBookReviews`
  → `"fork": true` dengan parent `ibm-developer-skills-network/expressBookReviews`
