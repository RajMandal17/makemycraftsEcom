import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Users, Search, Filter, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminAPI } from '../../../services/adminAPI';

const STATUS_OPTIONS = ['APPROVED', 'PENDING', 'REJECTED', 'SUSPENDED'];

const formatStatusLabel = (status: string) => {
  if (!status) return 'Pending';
  const normalized = status.replace(/_/g, ' ').toLowerCase();
  return normalized.replace(/(^|\s)([a-z])/g, (_, boundary: string, char: string) => `${boundary}${char.toUpperCase()}`);
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStatusOption, setSelectedStatusOption] = useState('PENDING');
  const [selectedRoleOption, setSelectedRoleOption] = useState('');

  const fetchUsers = async (page = 1, role = selectedRole, status = selectedStatus) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getUsers({ page, limit: 10, role, status });

      if (response && response.users) {
        setUsers(response.users || []);
        setTotalUsers(response.total || 0);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(page);
      } else if (Array.isArray(response)) {
        setUsers(response);
        setTotalUsers(response.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        console.warn('Unexpected response format:', response);
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handleFilterChange = () => {
    fetchUsers(1, selectedRole, selectedStatus);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, selectedRole, selectedStatus);
  };

  const handleStatusModalOpen = (user: any) => {
    setUserToEdit(user);
    setSelectedStatusOption((user.status || 'PENDING').toUpperCase());
    setShowStatusModal(true);
  };

  const handleRoleModalOpen = (user: any) => {
    setUserToEdit(user);
    setSelectedRoleOption(user.role || 'CUSTOMER');
    setShowRoleModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!userToEdit) return;

    try {
      await adminAPI.updateUserStatus(userToEdit.id, selectedStatusOption);
      toast.success(`Status updated for ${userToEdit.firstName} ${userToEdit.lastName}`);

      setUsers((prevUsers) => prevUsers.map((user) =>
        (user.id === userToEdit.id ? { ...user, status: selectedStatusOption } : user)));

      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleRoleUpdate = async () => {
    if (!userToEdit) return;

    try {
      await adminAPI.updateUserRole(userToEdit.id, selectedRoleOption);
      toast.success(`Role updated for ${userToEdit.firstName} ${userToEdit.lastName}`);

      setUsers((prevUsers) => prevUsers.map((user) =>
        (user.id === userToEdit.id ? { ...user, role: selectedRoleOption } : user)));

      setShowRoleModal(false);
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ARTIST':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-orange-100 text-orange-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <Users className="mr-2 h-6 w-6" /> Manage Users
        </h1>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="ARTIST">Artist</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {formatStatusLabel(statusOption)}
              </option>
            ))}
          </select>

          <button
            onClick={handleFilterChange}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" /> Filter
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImage ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {user.firstName?.charAt(0)}
                                {user.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {formatStatusLabel(user.status || 'PENDING')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleStatusModalOpen(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Change Status
                      </button>
                      <button onClick={() => handleRoleModalOpen(user)} className="text-purple-600 hover:text-purple-900">
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-700">
            Showing
            {' '}
            <span className="font-medium">{users.length}</span>
            {' '}
            of
            {' '}
            <span className="font-medium">{totalUsers}</span>
            {' '}
            users
          </p>

          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button className="px-4 py-2 border bg-purple-50 text-purple-600 font-medium rounded-md">
              {currentPage}
            </button>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-2 border rounded-md disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Status update modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Update User Status</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <p>
                {userToEdit?.firstName}
                {' '}
                {userToEdit?.lastName}
                {' '}
                ({userToEdit?.email})
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatusOption}
                onChange={(e) => setSelectedStatusOption(e.target.value.toUpperCase())}
                className="w-full border rounded-md px-3 py-2"
              >
                {STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {formatStatusLabel(statusOption)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 border rounded-md hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleStatusUpdate} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role update modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Update User Role</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <p>
                {userToEdit?.firstName}
                {' '}
                {userToEdit?.lastName}
                {' '}
                ({userToEdit?.email})
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={selectedRoleOption}
                onChange={(e) => setSelectedRoleOption(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="ADMIN">Admin</option>
                <option value="ARTIST">Artist</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 border rounded-md hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleRoleUpdate} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
