/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Label,
  Modal,
  Table,
  TextInput,
} from "flowbite-react";
import type { FC } from "react";
import { useState } from "react";
import React from "react";
import { HiDocumentDownload, HiOutlinePencilAlt } from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { IUser } from "../../types/user";
import { getUsers, burnUserAccount } from "../../apis/request";

const UserListPage: FC = function () {
  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
        <div className="mb-1 w-full">
          <div className="mb-4">
            <Breadcrumb className="mb-4"></Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All users
            </h1>
          </div>
          <div className="sm:flex">
            <div className="mb-3 hidden items-center dark:divide-gray-700 sm:mb-0 sm:flex sm:divide-x sm:divide-gray-100">
              {/* <form className="lg:pr-3">
                <Label htmlFor="users-search" className="sr-only">
                  Search
                </Label>
                <div className="relative mt-1 lg:w-64 xl:w-96">
                  <TextInput
                    id="users-search"
                    name="users-search"
                    placeholder="Search for users"
                  />
                </div>
              </form> */}
            </div>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              {/* <Button color="gray">
                <div className="flex items-center gap-x-3">
                  <HiDocumentDownload className="text-xl" />
                  <span>Export</span>
                </div>
              </Button> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <AllUsersTable />
            </div>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const AllUsersTable: FC = function () {
  const [users, setUsers] = useState<IUser[]>([]);

  React.useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const userData = await getUsers();
    setUsers(userData);

    console.log(users);
  };

  const burnAccount = async (id: string) => {
    await burnUserAccount(id);
    await getData();
  };
  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>#</Table.HeadCell>
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Phone</Table.HeadCell>
        <Table.HeadCell>User Type</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Actions</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {users.map((user, index) => (
          <Table.Row
            key={index}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Table.Cell className="whitespace-nowrap text-base font-medium text-gray-900 dark:text-white">
              {index + 1}.
            </Table.Cell>
            <Table.Cell className="mr-12 flex items-center space-x-6 whitespace-nowrap p-4 lg:mr-0">
              <img
                className="h-10 w-10 rounded-full"
                src={
                  user.photo
                    ? user.photo.replace(":9443", "/backend")
                    : `http://128.199.191.206/backend/uploads/uploads-6df7988e-7008-11ed-9234-0123456789ab-1669742153412.jpeg`
                }
                alt={`${user.first_name} ${user.last_name}`}
              />
              <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {user.first_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.username}
                </div>
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
              {user.phone ? `+${user.phone}` : `N/A`}
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
              {user.user_type?.toUpperCase()}
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap p-4 text-base font-normal text-gray-900 dark:text-white">
              {
                user.is_active ? (<div className="flex items-center">
                <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400"></div>
                Active
              </div>) :  (<div className="flex items-center">
                <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-400"></div>
                Not Active
              </div>)
              }
            </Table.Cell>
            <Table.Cell>
              <div
                className="flex items-center gap-x-3 whitespace-nowrap"
                id={`selected-user-${user.id}-${index}`}
              >
                {/* <EditUserModal user={user} /> */}
                {user.is_active ? (
                  <Button color="primary" style={{ background: "red" }}>
                  <div
                    className="flex items-center gap-x-2"
                    onClick={() => burnAccount(user.id!)}
                  >
                    <HiOutlinePencilAlt className="text-lg" />
                    Burn
                  </div>
                </Button>
                ) : (
                  
                  <Button color="warning">
                  <div
                    className="flex items-center gap-x-2"
                    onClick={() => burnAccount(user.id!)}
                  >
                    <HiOutlinePencilAlt className="text-lg" />
                    Un-Burn
                  </div>
                </Button>
                )}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
type EditProps = {
  user: IUser;
};

const EditUserModal: FC = function ({ user }: EditProps) {
  const [isOpen, setOpen] = useState(false);
  const [currentUser, _setCurrentUser] = useState({ ...user });

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <HiOutlinePencilAlt className="text-lg" />
          Edit user
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Edit user</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <div className="mt-1">
                <TextInput
                  id="firstName"
                  value={currentUser.first_name}
                  name="firstName"
                  placeholder="Bonnie"
                  onChange={(e) => {
                    _setCurrentUser({
                      ...currentUser,
                      first_name: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <div className="mt-1">
                <TextInput
                  id="lastName"
                  value={currentUser.last_name}
                  name="lastName"
                  onChange={(e) => {
                    _setCurrentUser({
                      ...currentUser,
                      last_name: e.target.value,
                    });
                  }}
                  placeholder="Green"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1">
                <TextInput
                  id="email"
                  name="email"
                  value={currentUser.email}
                  placeholder="yoyr@email.com"
                  onChange={() => {}}
                  type="email"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-1">
                <TextInput
                  id="phone"
                  name="phone"
                  value={currentUser.phone}
                  placeholder="e.g., +(12)3456 789"
                  onChange={() => {}}
                  type="tel"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <div className="mt-1">
                <TextInput
                  id="department"
                  name="department"
                  placeholder="Development"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <div className="mt-1">
                <TextInput
                  id="company"
                  name="company"
                  placeholder="Somewhere"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="userame">Username</Label>
              <div className="mt-1">
                <TextInput
                  id="userame"
                  name="userame"
                  value={currentUser.username}
                  placeholder="username"
                  onChange={() => {}}
                  type="text"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="passwordNew">New password</Label>
              <div className="mt-1">
                <TextInput
                  id="passwordNew"
                  name="passwordNew"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="primary" onClick={() => setOpen(false)}>
            Save all
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserListPage;
