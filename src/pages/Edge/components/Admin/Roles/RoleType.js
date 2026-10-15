import React from 'react';
import { Input } from 'reactstrap';

// Module category groupings matching the 5 domains specified in 2026-10-09-application-rights-update.sql
const CATEGORY_DEFINITIONS = [
  {
    key: 'MATTERS',
    label: 'MATTERS',
    fallbackRights: [
      'ArchiveMatter',
      'ArchiveUnarchiveMatter',
      'DeleteMatterAttachment',
      'EditArchivedMatter',
      'UnarchiveMatter',
      'UpdateContact',
      'UpdateMatter',
      'UndoFinalInvoice',
      'ViewMatterAccountingPanel',
      'ViewAccountingPanel',
    ],
  },
  {
    key: 'ACCOUNTING',
    label: 'ACCOUNTING',
    fallbackRights: [
      'CreateInvoice',
      'CreateInvoiceTemplate',
      'CreatePayment',
      'CreateServiceLineItem',
      'DeleteBankDepositSlip',
      'DeleteInvoice',
      'DeleteInvoiceTemplate',
      'DeletePayment',
      'DeleteServiceLineItem',
      'UpdateInvoiceTemplate',
      'UpdateServiceLineItem',
      'ViewAccountingTab',
      'ViewXeroAdminTab',
      'XeroConnect',
      'ExportToXero',
    ],
  },
  {
    key: 'REPORTS',
    label: 'REPORTS',
    fallbackRights: [
      'ViewFeesBilledReport',
      'ViewMattersOpenedReport',
      'ViewOutstandingInvoicesReport',
      'ViewSettlementsDueReport',
    ],
  },
  {
    key: 'ADMIN',
    label: 'ADMIN',
    fallbackRights: [
      'AccessAllSites',
      'UserAccessSiteLoggedInOnly',
      'LogoffAllUsers',
      'ViewAdminTab',
      'ViewFeedbackReview',
    ],
  },
  {
    key: 'TRUST_ACCOUNTS',
    label: 'TRUST ACCOUNTS',
    fallbackRights: [
      'ViewTrustAccounting',
      'CreateTrustReceipt',
      'PrepareTrustPayment',
      'AuthoriseTrustPayment',
      'ManageTrustAccount',
      'GenerateTrustMonthEnd',
    ],
  },
];

const RoleType = (props) => {
  const {
    rightList = [],
    selectedRights = [],
    setSelectedRights,
  } = props;

  const handleSelect = (id) => {
    const selectedIndex = selectedRights.indexOf(id);
    let newSelectedId = [];

    if (selectedIndex === -1) {
      newSelectedId = newSelectedId.concat(selectedRights, id);
    } else if (selectedIndex === 0) {
      newSelectedId = newSelectedId.concat(selectedRights.slice(1));
    } else {
      newSelectedId = newSelectedId.concat(
        selectedRights.slice(0, selectedIndex),
        selectedRights.slice(selectedIndex + 1)
      );
    }
    setSelectedRights(newSelectedId);
  };

  const isSelected = (id) => selectedRights.indexOf(id) !== -1;

  // Resolves the category for a right using server-provided category or fallback definition
  const getRightCategory = (right) => {
    if (right.category) {
      return right.category.toUpperCase();
    }
    for (const cat of CATEGORY_DEFINITIONS) {
      if (cat.fallbackRights.includes(right.rightName)) {
        return cat.key;
      }
    }
    return 'MATTERS';
  };

  // Filter out obsolete/deprecated rights like old OutstandingInvoiceReport
  const activeRightList = rightList.filter(
    (r) => r.rightName !== 'OutstandingInvoiceReport'
  );

  return (
    <div className='roleType-categorized-container'>
      {CATEGORY_DEFINITIONS.map((category) => {
        const categoryRights = activeRightList.filter(
          (r) => getRightCategory(r) === category.key
        );

        if (categoryRights.length === 0) return null;

        return (
          <div key={category.key} className='roleType-section mb-4'>
            <h6 className='roleType-section-title font-weight-bold text-dark mb-3 text-uppercase'>
              {category.label}
            </h6>
            <div className='roleType-grid'>
              {categoryRights.map((right) => (
                <div
                  className='roleType-contentDiv pe-cursor'
                  key={right.id}
                  onClick={() => handleSelect(right.id)}
                >
                  <Input
                    type='checkbox'
                    className='roleType-check'
                    checked={isSelected(right.id)}
                    onChange={() => handleSelect(right.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className='roleType-label mb-0 my-1'>{right.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleType;
