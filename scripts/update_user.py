import sqlite3

conn = sqlite3.connect('backend/foodsense.db')
conn.execute("UPDATE users SET full_name = 'Nimsara Perera' WHERE email = 'manager@foodsense.lk'")
conn.commit()
print("Updated users:", conn.execute("SELECT email, full_name, role FROM users").fetchall())
conn.close()
