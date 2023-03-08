/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Breadcrumb,
  Button,
  Label,
  Modal,
  Table,
  Textarea,
  TextInput,
} from "flowbite-react";
import type { FC } from "react";
import { useState } from "react";
import React from "react";
import {
  HiDocumentDownload,
  HiOutlinePencilAlt,
  HiOutlinePlusCircle,
} from "react-icons/hi";
import NavbarSidebarLayout from "../../layouts/navbar-sidebar";
import { Product } from "../../types/user";
import {
  getStripeProducts,
  createStripeProduct,
  updateStripeProduct,
} from "../../apis/request";

import { Pagination } from "./../../components/Pagination/Pagination";
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
              <AddProductModal />
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
  const [products, setProducts] = useState<Product[]>([]);
  const [limit, _setLimit] = useState(3);
  const [page, setPage] = useState({});
  const [newPage, setNewPage] = useState(1);
  const [pages, setPages] = useState([1, 2, 3]);

  React.useEffect(() => {
    getData();
  }, []);

  const getData = async (_page = newPage) => {
    const productData = await getStripeProducts(_page, limit);
    setProducts(productData.products);
    setNewPage(productData.page.current);
    setPage(productData.page);
  };

  const updateProduct = async (currentProduct: any) => {
    await updateStripeProduct(currentProduct);
    await getData(newPage);
  };

  const setCurrentPage = async (new_page: number) => {
    setNewPage(new_page);
    await getData(new_page);
  };

  return (
    <div>
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
        <Table.Head className="bg-gray-100 dark:bg-gray-700">
          <Table.HeadCell>#</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Price (USD)</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {products.map((product, index) => (
            <Table.Row
              key={index}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Table.Cell className="whitespace-nowrap p-4 text-base font-medium text-gray-900 dark:text-white">
                {index + 1}.
              </Table.Cell>
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
                  <EditProductModal product={product} />
                  {product.is_active ? (
                    <Button color="warning">
                      <div
                        className="flex items-center gap-x-2"
                        onClick={() =>
                          updateProduct({ ...product, is_active: false })
                        }
                      >
                        <HiOutlinePencilAlt className="text-lg" />
                        De-activate
                      </div>
                    </Button>
                  ) : (
                    <Button color="primary" style={{ background: "red" }}>
                      <div
                        className="flex items-center gap-x-2"
                        onClick={() =>
                          updateProduct({ ...product, is_active: true })
                        }
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
      <Pagination
        pages={[1, 2, 4]}
        page={page}
        currentPage={1}
        pagedChanged={setCurrentPage}
      />
    </div>
  );
};
type EditProps = {
  product: Product;
};

const EditProductModal: FC = function ({ product }: any) {
  const [isOpen, setOpen] = useState(false);
  const [currentProduct, _setcurrentProduct] = useState({ ...product });

  const updateProduct = async () => {
    await updateStripeProduct(currentProduct);
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <HiOutlinePencilAlt className="text-lg" />
          Edit Product
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Edit Product</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <div className="mt-1">
                <TextInput
                  id="firstName"
                  value={currentProduct.name}
                  name="firstName"
                  placeholder="Bonnie"
                  onChange={(e) => {
                    _setcurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Price In Cents (USD)</Label>
              <div className="mt-1">
                <TextInput
                  id="lastName"
                  value={currentProduct.price_in_cents}
                  name="lastName"
                  onChange={(e) => {
                    _setcurrentProduct({
                      ...currentProduct,
                      price_in_cents: Number(e.target.value),
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
                  value={currentProduct.description}
                  placeholder="yoyr@email.com"
                  onChange={(e) => {
                    _setcurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    });
                  }}
                  type="text"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="primary"
            onClick={() => {
              updateProduct();
              setOpen(false);
            }}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const AddProductModal: FC = function () {
  const [isOpen, setOpen] = useState(false);
  const [product, _setProduct] = useState<{
    name: string;
    price_in_units: number;
    description: string;
  }>({
    name: "",
    price_in_units: 0,
    description: "",
  });

  const saveRecord = async () => {
    await createStripeProduct({ ...product });
    // window.location.reload();
  };

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-x-2">
          <HiOutlinePlusCircle className="text-lg" />
          Add Product
        </div>
      </Button>
      <Modal onClose={() => setOpen(false)} show={isOpen}>
        <Modal.Header className="border-b border-gray-200 !p-6 dark:border-gray-700">
          <strong>Add Product</strong>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <div className="mt-1">
                <TextInput
                  id="name"
                  value={product.name}
                  name="name"
                  placeholder="Basic Package"
                  onChange={(e) => {
                    _setProduct({
                      ...product,
                      name: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="amount">Amount In Cents (USD)</Label>
              <div className="mt-1">
                <TextInput
                  id="amount"
                  value={product.price_in_units}
                  name="amount"
                  onChange={(e) => {
                    _setProduct({
                      ...product,
                      price_in_units: Number(e.target.value),
                    });
                  }}
                  placeholder="Amount In Cents"
                />
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <Label htmlFor="email">Description</Label>
              <div className="mt-1">
                <Textarea
                  id="email"
                  value={product.description}
                  placeholder="Description"
                  onChange={(e) => {
                    _setProduct({
                      ...product,
                      description: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="primary"
            onClick={() => {
              // save record
              saveRecord();
              // close popup
              setOpen(false);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductListPage;
