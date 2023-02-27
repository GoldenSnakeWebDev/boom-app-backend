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
import { IUser, Product } from "../../types/user";
import {
  getUsers,
  burnUserAccount,
  getStripeProducts,
} from "../../apis/request";

const ProductListPage: FC = function () {
  return (
    <NavbarSidebarLayout isFooter={false}>
      <div className="block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex">
        <div className="mb-1 w-full">
          <div className="mb-4">
            <Breadcrumb className="mb-4"></Breadcrumb>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              All products
            </h1>
          </div>
          <div className="sm:flex">
            <div className="mb-3 hidden items-center dark:divide-gray-700 sm:mb-0 sm:flex sm:divide-x sm:divide-gray-100">
              <form className="lg:pr-3">
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
              </form>
            </div>
            <div className="ml-auto flex items-center space-x-2 sm:space-x-3">
              <Button color="gray">
                <div className="flex items-center gap-x-3">
                  <HiDocumentDownload className="text-xl" />
                  <span>Export</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <AllProductsTable />
            </div>
          </div>
        </div>
      </div>
    </NavbarSidebarLayout>
  );
};

const AllProductsTable: FC = function () {
  const [users, setProducts] = useState<Product[]>([]);

  React.useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const productData = await getStripeProducts();
    setProducts(productData.products);

    console.log(users);
  };

  const burnAccount = async (id: string) => {
    await burnUserAccount(id);
    await getData();
  };
  return (
    <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
      <Table.Head className="bg-gray-100 dark:bg-gray-700">
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell>Description</Table.HeadCell>
        <Table.HeadCell>Price (USD)</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Actions</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {users.map((product, index) => (
          <Table.Row
            key={index}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
              {product.name}
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
              {product.description}
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
              ${Number(product.price_in_cents) / 100}
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap p-4 text-base font-normal text-gray-900 dark:text-white">
              <div className="flex items-center">
                <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-400"></div>
                Active
              </div>
            </Table.Cell>
            <Table.Cell>
              <div
                className="flex items-center gap-x-3 whitespace-nowrap"
                id={`selected-user-${product.id}-${index}`}
              >
                {/* <EditProductModal product={product} /> */}
                {product.is_active ? (
                  <Button color="warning">
                    <div
                      className="flex items-center gap-x-2"
                      onClick={() => burnAccount(product.id!)}
                    >
                      <HiOutlinePencilAlt className="text-lg" />
                      De-activatE
                    </div>
                  </Button>
                ) : (
                  <Button color="primary" style={{ background: "red" }}>
                    <div
                      className="flex items-center gap-x-2"
                      onClick={() => burnAccount(product.id!)}
                    >
                      <HiOutlinePencilAlt className="text-lg" />
                      Activate
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

const EditProductModal: FC = function ({ user }: EditProps) {
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

export default ProductListPage;