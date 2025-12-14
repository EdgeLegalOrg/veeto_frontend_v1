import React from 'react';
import { Navigate } from 'react-router-dom';

import Settings from '../pages/Profile/Settings/Settings';

//login
import Login from '../pages/Authentication/Login';
import ForgetPasswordPage from '../pages/Authentication/ForgetPassword';
import Logout from '../pages/Authentication/Logout';
import Register from '../pages/Authentication/Register';

// User Profile
import UserProfile from '../pages/Authentication/user-profile';

import MatterList from '../pages/Edge/components/Matters/MatterList';
import Contact from '../pages/Edge/components/contacts/contacts';
import DocumentPage from '../pages/Edge/components/Document/DocumentPage';
import AllSafeCustody from '../pages/Edge/components/safeCustody/AllSafeCustody';
import SafeCustodySection from '../pages/Edge/components/safeCustody/safeCustody';
import PropertyList from '../pages/Edge/components/property/property';
import SingleContact from '../pages/Edge/components/contacts/SingleContact';
import DepositListPage from '../pages/Edge/components/AccountingSection/DepositSlip/DepositListPage';
import ServiceLineListPage from '../pages/Edge/components/AccountingSection/ServiceLine/ServiceLineListPage';
import InvoiceListPage from '../pages/Edge/components/AccountingSection/InvoiceListing/InvoiceListPage';
import InvoiceTemplateList from '../pages/Edge/components/AccountingSection/InvoiceTemplate/InvoiceTemplateList';
import XeroAdmin from '../pages/Edge/components/AccountingSection/XeroAdmin/XeroAdmin';
import XeroListing from '../pages/Edge/components/AccountingSection/XeroAdmin/XeroConnected/ListingPage';
import SettingPage from '../pages/Edge/components/Admin/Settings/SettingPage';
import ManageStaffPage from '../pages/Edge/components/Admin/Staff/ManageStaffPage';
import ManageRolePage from '../pages/Edge/components/Admin/Roles/ManageRolePage';
import ManageUserPage from '../pages/Edge/components/Admin/Users/ManageUserPage';
import CompanyInfoPage from '../pages/Edge/components/Admin/CompanyInfo/CompanyInfoPage';
import SiteInfoPage from '../pages/Edge/components/Admin/SiteInfo/SiteInfoPage';
import BaseTemplatePage from '../pages/Edge/components/Admin/BaseTemplates/BaseTemplatePage';
import ManageTemplate from '../pages/Edge/components/Admin/Templates/ManageTemplate';
import AddTaskList from '../pages/Edge/components/Admin/TaskList/TaskList';
import ListPage from '../pages/Edge/components/Admin/CheckList/ListPage';
import LinkedList from '../pages/Edge/components/Admin/LinkToMatter/LinkedList';
import PreviewInvoiceTemplate from '../pages/Edge/components/Matters/InvoiceTab/PreviewInvoiceTemplate';
import PaymentListPage from '../pages/Edge/components/AccountingSection/PaymentListing/PaymentListingPage';

const authProtectedRoutes = [
  //Edge Routes
  { path: '/Matters', component: <MatterList /> },
  { path: '/Contacts', component: <Contact /> },
  { path: '/Documents', component: <DocumentPage /> },
  { path: '/safe-custody', component: <AllSafeCustody /> },
  { path: '/safe-custody/:id', component: <SafeCustodySection /> },
  { path: '/property', component: <PropertyList /> },

  { path: '/singlecontact', component: <SingleContact /> },

  { path: '/account-deposit-slip', component: <DepositListPage /> },
  { path: '/account-service-lines', component: <ServiceLineListPage /> },
  { path: '/account-invoice-list', component: <InvoiceListPage /> },
  { path: '/account-payment-list', component: <PaymentListPage /> },
  {
    path: '/print-invoice/:invoiceId',
    exact: true,
    outsideLayout: true,
    component: <PreviewInvoiceTemplate fetchData={true} />,
  },

  { path: '/account-invoice-template', component: <InvoiceTemplateList /> },
  { path: '/account-xero-admin', component: <XeroAdmin /> },

  { path: '/account-xero-admin-connected', component: <XeroListing /> },

  { path: '/admin-system-numerals', component: <SettingPage /> },
  { path: '/admin-manage-staff', component: <ManageStaffPage /> },
  { path: '/admin-manage-roles', component: <ManageRolePage /> },
  { path: '/admin-manage-users', component: <ManageUserPage /> },
  { path: '/admin-company-info', component: <CompanyInfoPage /> },
  { path: '/admin-site-info', component: <SiteInfoPage /> },
  { path: '/admin-letterheads', component: <BaseTemplatePage /> },

  { path: '/admin-precedents', component: <ManageTemplate /> },
  { path: '/admin-checklist-taskList', component: <AddTaskList /> },
  { path: '/admin-checklist-checkList', component: <ListPage /> },
  { path: '/admin-checklist-linkToMatter', component: <LinkedList /> },

  // User Profile
  { path: '/profile', component: <UserProfile /> },
  { path: '/pages-profile-settings', component: <Settings /> },

  {
    path: '/',
    exact: true,
    component: <Navigate to='/dashboard' />,
  },

  { path: '*', component: <Navigate to='/Matters' /> },
];

const publicRoutes = [
  // Authentication Page
  { path: '/logout', component: <Logout /> },
  { path: '/login', component: <Login /> },
  { path: '/forgot-password', component: <ForgetPasswordPage /> },
  { path: '/register', component: <Register /> },
];

export { authProtectedRoutes, publicRoutes };
