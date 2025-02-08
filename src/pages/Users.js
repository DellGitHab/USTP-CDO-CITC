import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Users.css";  // Make sure this is the correct path for your styles

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "", email: "" });
  const [editUser, setEditUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/ezmonitor/api/users/get_users.php")
      .then((response) => setUsers(response.data.users))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleSaveUser = () => {
    if (!newUser.username || !newUser.role || !newUser.email) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = isEditMode
      ? { ...newUser, id: editUser.id, password: newUser.password || null }
      : newUser;

    const url = isEditMode
      ? "http://localhost/ezmonitor/api/users/edit_user.php"
      : "http://localhost/ezmonitor/api/users/add_user.php";

    axios
      .post(url, payload)
      .then((response) => {
        if (response.data.success) {
          alert(isEditMode ? "User updated successfully!" : "User added successfully!");
          setUsers((prevUsers) =>
            isEditMode
              ? prevUsers.map((user) =>
                  user.id === editUser.id ? { ...user, ...payload } : user
                )
              : [...prevUsers, response.data.user]
          );
          setIsModalOpen(false);
          setNewUser({ username: "", password: "", role: "", email: "" });
          setIsEditMode(false);
        } else {
          alert("Operation failed. Try again.");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .post("http://localhost/ezmonitor/api/users/delete_user.php", { id: userId })
        .then((response) => {
          if (response.data.success) {
            alert("User deleted successfully!");
            setUsers(response.data.users); // Update the user list with reordered IDs
          } else {
            alert("Failed to delete user: " + response.data.error);
          }
        })
        .catch((error) => console.error("Error deleting user:", error));
    }
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2 className="user-management-title">Users</h2>
        <button
          className="user-management-add-button"
          onClick={() => {
            setNewUser({ username: "", password: "", role: "", email: "" });
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
        >
          Add User
        </button>
      </div>

      <div className="user-management-content">
        <table className="user-management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="user-management-actions">
                  <button
                    onClick={() => {
                      setEditUser(user);
                      setNewUser({ ...user, password: "" });
                      setIsEditMode(true);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modals">
          <div className="modals-content">
            <h3>{isEditMode ? "Edit User" : "Add User"}</h3>
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password (Leave blank to keep unchanged)"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="personnel">Personnel</option>
            </select>
            <div className="button-group">
            <button className="save-button" onClick={handleSaveUser}>
              {isEditMode ? "Save Changes" : "Add User"}
            </button>
            <button className="close-modals" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
