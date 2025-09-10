import os

# List of files to create
files_to_create = [
    "src/contexts/AuthContext.jsx",
    "src/components/ProtectedRoute.jsx",
    "src/pages/Login.jsx",
    "src/components/Header.jsx",
    "src/components/CreateUserDialog.jsx",
    "src/components/EditUserDialog.jsx"
]

# Create each file and its parent directories if they don't exist
for file_path in files_to_create:
    dir_name = os.path.dirname(file_path)
    os.makedirs(dir_name, exist_ok=True)
    with open(file_path, 'w') as f:
        f.write("// This is the initial content for {}\n".format(file_path))

print("All files have been created.")
