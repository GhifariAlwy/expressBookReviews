#!/bin/bash
# ============================================================
# generate_evidence.sh
# Runs the API server fresh, exercises every endpoint with cURL,
# and saves command + output as evidence files in ./evidence/
# (one file per grading task, no file extension).
#
# Usage:  bash generate_evidence.sh
# ============================================================
set -u

PORT="${PORT:-5001}"
BASE="http://localhost:$PORT"
DIR="$(cd "$(dirname "$0")" && pwd)"   # final_project/
EV="$DIR/evidence"
mkdir -p "$EV"

# --- Kill any leftover server on the port, then start a fresh one ---
lsof -ti tcp:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
cd "$DIR"
PORT="$PORT" node index.js > /tmp/bookapp.log 2>&1 &
SERVER_PID=$!
cd - > /dev/null

# --- Wait until the server is ready ---
for _ in $(seq 1 30); do
  curl -s -o /dev/null "$BASE/" && break
  sleep 0.5
done

cleanup() { kill "$SERVER_PID" 2>/dev/null; }
trap cleanup EXIT

# Helper: save displayed command + its output into an evidence file
save() { # $1 = filename, $2 = command string to display & run
  { echo "\$ $2"; echo; eval "$2"; echo; } > "$EV/$1"
}
append() { # $1 = filename, $2 = command string (append to existing file)
  { echo "\$ $2"; echo; eval "$2"; echo; } >> "$EV/$1"
}

echo "=== Generating evidence files in $EV ==="

# ---------- Task 1: GET all books ----------
save getallbooks "curl -s -w '\nHTTP %{http_code}\n' $BASE/"

# ---------- Task 2: GET book by ISBN (Promise) ----------
save getbooksbyISBN "curl -s -w '\nHTTP %{http_code}\n' $BASE/isbn/1"

# ---------- Task 3: GET books by author (Promise) ----------
save getbooksbyauthor "curl -s -w '\nHTTP %{http_code}\n' $BASE/author/Unknown"

# ---------- Task 4: GET books by title (Promise) ----------
save getbooksbytitle "curl -s -w '\nHTTP %{http_code}\n' '$BASE/title/Things%20Fall%20Apart'"

# ---------- Task 5: GET review of the first book (before any review) ----------
save getbookreview "curl -s -w '\nHTTP %{http_code}\n' $BASE/review/1"

# ---------- Task 6: POST register (new user + duplicate rejection) ----------
cmd_register="curl -s -w '\nHTTP %{http_code}\n' -X POST $BASE/customer/register -H 'Content-Type: application/json' -d '{\"username\":\"john\",\"password\":\"password123\"}'"
save register "$cmd_register"
echo "# (tes duplikat - harus ditolak dengan 400):" >> "$EV/register"
append register "$cmd_register"

# ---------- Task 7: POST login (wrong credentials + success + JWT) ----------
save login "curl -s -w '\nHTTP %{http_code}\n' -X POST $BASE/customer/login -H 'Content-Type: application/json' -d '{\"username\":\"john\",\"password\":\"salahpassword\"}'"
LOGIN_OUT=$(curl -s -X POST "$BASE/customer/login" -H 'Content-Type: application/json' -d '{"username":"john","password":"password123"}')
TOKEN=$(echo "$LOGIN_OUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).token||'')}catch(e){console.log('')}})")
echo "# (login dengan kredensial benar - JWT dihasilkan):" >> "$EV/login"
append login "curl -s -w '\nHTTP %{http_code}\n' -X POST $BASE/customer/login -H 'Content-Type: application/json' -d '{\"username\":\"john\",\"password\":\"password123\"}'"

AUTH="Authorization: Bearer $TOKEN"

# ---------- Task 8: PUT add/modify review (JWT protected) ----------
save reviewadded "curl -s -w '\nHTTP %{http_code}\n' -X PUT $BASE/customer/auth/review/1?review=Great%20book%2C%20highly%20recommended!"
echo "# (tanpa token - harus ditolak dengan 401):" >> "$EV/reviewadded"
append reviewadded "curl -s -w '\nHTTP %{http_code}\n' -X PUT $BASE/customer/auth/review/1?review=Great%20book%2C%20highly%20recommended!"
echo "# (dengan JWT - review ditambahkan):" >> "$EV/reviewadded"
append reviewadded "curl -s -w '\nHTTP %{http_code}\n' -X PUT -H '$AUTH' $BASE/customer/auth/review/1?review=Great%20book%2C%20highly%20recommended!"
echo "# (dengan JWT - review yang sama diubah isinya):" >> "$EV/reviewadded"
append reviewadded "curl -s -w '\nHTTP %{http_code}\n' -X PUT -H '$AUTH' $BASE/customer/auth/review/1?review=Updated%3A%20still%20a%20great%20book"

# Second user proves reviews are per-user (jane cannot touch john's review)
curl -s -o /dev/null -X POST "$BASE/customer/register" -H 'Content-Type: application/json' -d '{"username":"jane","password":"secret456"}'
JANE_OUT=$(curl -s -X POST "$BASE/customer/login" -H 'Content-Type: application/json' -d '{"username":"jane","password":"secret456"}')
JANE_TOKEN=$(echo "$JANE_OUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).token||'')}catch(e){console.log('')}})")
echo "# (user kedua 'jane' menambah review miliknya sendiri):" >> "$EV/reviewadded"
append reviewadded "curl -s -w '\nHTTP %{http_code}\n' -X PUT -H 'Authorization: Bearer $JANE_TOKEN' $BASE/customer/auth/review/1?review=Could%20not%20put%20it%20down"

# ---------- Task 5 (bukti tambahan): GET review buku pertama setelah review ditambah ----------
echo "# (bukti tambahan: GET review buku pertama setelah review john & jane ditambahkan):" >> "$EV/getbookreview"
append getbookreview "curl -s -w '\nHTTP %{http_code}\n' $BASE/review/1"

# ---------- Task 9: DELETE own review ----------
save deletereview "curl -s -w '\nHTTP %{http_code}\n' -X DELETE -H '$AUTH' $BASE/customer/auth/review/1"
echo "# (verifikasi: GET review setelah john menghapus review-nya - hanya review jane yang tersisa):" >> "$EV/deletereview"
append deletereview "curl -s -w '\nHTTP %{http_code}\n' $BASE/review/1"

# ---------- Task 11: Verify fork via GitHub API ----------
save githubrepo "curl -s https://api.github.com/repos/GhifariAlwy/expressBookReviews"

echo "=== Done. Files: ==="
ls -1 "$EV"
