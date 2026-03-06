import React, { Fragment, useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Table, Button, Input } from 'reactstrap';
import upArrow from '../../../images/upArrow.svg';
import downArrow from '../../../images/downArrow.svg';
import downArrowColoured from '../../../images/downArrowColoured.svg';
import upArrowColoured from '../../../images/upArrowColoured.svg';
import '../../../stylesheets/ManageUserPage.css';
import { convertSubstring } from '../../../utils/utilFunc';
import TooltipWrapper from '../../../../../Components/Common/TooltipWrapper';
import { MdFilterAlt, MdFilterAltOff, MdSearch } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';

const StaffTable = (props) => {
  const [labelSort, setLabelSort] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [sortField, setSortField] = useState('');
  const [staffList, setStaffList] = useState([]);

  const {
    handleShow,
    handleRefreshList,
    initialFilter,
    filterInput,
    setFilterInput,
    setSelectedStaff,
    selectedStaff = [],
  } = props;

  useEffect(() => {
    setStaffList(props.staffList);
  }, [props.staffList]);

  const handleSortByLabel = (field) => {
    if (labelSort !== field) {
      setLabelSort(field);
      setSortOrder('asc');
      setSortField(field);
      handleRefreshList({ ...filterInput, sortOn: field, sortType: 'ASC' });
    } else {
      setLabelSort('');
      setSortOrder('desc');
      setSortField(field);
      handleRefreshList({ ...filterInput, sortOn: field, sortType: 'DESC' });
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({ ...filterInput, [name]: value });
  };

  const handleStatusFilter = (e) => {
    const { name, value } = e.target;
    setFilterInput({
      ...filterInput,
      [name]: value === '' || value === 'None' ? '' : value,
    });
    handleRefreshList({
      ...filterInput,
      [name]: value === '' || value === 'None' ? '' : value,
    });
  };

  const handleStaff = (id) => {
    const selectedIndex = selectedStaff.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedStaff, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedStaff.slice(1));
    } else if (selectedIndex === selectedStaff?.length - 1) {
      newSelected = newSelected.concat(selectedStaff.slice(0, -1));
    } else {
      newSelected = newSelected.concat(
        selectedStaff.slice(0, selectedIndex),
        selectedStaff.slice(selectedIndex + 1)
      );
    }

    setSelectedStaff(newSelected);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      let newSelected = [];
      staffList?.forEach((user) => newSelected.push(user.id));
      setSelectedStaff(newSelected);
    } else {
      setSelectedStaff([]);
    }
  };

  const isSelected = (id) => selectedStaff.includes(id);

  const handleResetFilter = () => {
    setFilterInput(initialFilter);
    setLabelSort('');
    setSortOrder('');
    setSortField('');
    handleRefreshList(initialFilter);
  };

  return (
    <Table responsive={true} striped={true} hover={true}>
      <thead className='mb-2'>
        <tr>
          <th>
            <Input
              type='checkbox'
              checked={
                staffList?.length > 0 &&
                selectedStaff?.length === staffList?.length
              }
              onChange={handleSelectAll}
            />
          </th>
          <th>
            <div
              className='d-flex justify-content-between'
              onClick={() => handleSortByLabel('userName')}
            >
              <p>Username</p>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'userName' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'userName' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>
            <Input
              type='text'
              value={filterInput.userName}
              name='userName'
              placeholder='Username'
              onChange={handleChangeFilter}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </th>
          <th>
            <div
              className='d-flex justify-content-between'
              onClick={() => handleSortByLabel('firstName')}
            >
              <p>First Name</p>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'firstName' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'firstName' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>
            <Input
              type='text'
              value={filterInput.firstName}
              name='firstName'
              placeholder='First Name'
              onChange={handleChangeFilter}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </th>
          <th>
            <div
              className='d-flex justify-content-between'
              onClick={() => handleSortByLabel('lastName')}
            >
              <p>Last Name</p>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'lastName' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'lastName' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>
            <Input
              type='text'
              value={filterInput.lastName}
              name='lastName'
              placeholder='Last Name'
              onChange={handleChangeFilter}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </th>
          <th>
            <div
              className='d-flex justify-content-between'
              onClick={() => handleSortByLabel('emailId1')}
            >
              <p>Email</p>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'emailId1' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'emailId1' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>
            <Input
              type='text'
              value={filterInput.emailId1}
              name='emailId1'
              placeholder='Email'
              onChange={handleChangeFilter}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </th>
          <th>
            <div
              className='d-flex justify-content-between'
              onClick={() => handleSortByLabel('phoneNumber1')}
            >
              <p>Phone Number</p>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'phoneNumber1' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'phoneNumber1' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>
            <Input
              type='text'
              value={filterInput.phoneNumber1}
              name='phoneNumber1'
              placeholder='Phone Number'
              onChange={handleChangeFilter}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </th>
          <th>
            <div
              className='d-flex justify-content-between'
              onClick={() => handleSortByLabel('staffActive')}
            >
              <p>Status</p>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'staffActive' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'staffActive' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>
            <Input
              type='select'
              name='staffActive'
              onChange={handleStatusFilter}
              // onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            >
              <option
                value=''
                selected={
                  filterInput.staffActive === '' ||
                  filterInput.staffActive === null
                }
              >
                All
              </option>
              <option value={true} selected={filterInput.staffActive === true}>
                Active
              </option>
              <option
                value={false}
                selected={filterInput.staffActive === false}
              >
                Disabled
              </option>
            </Input>
          </th>
          <th>
            <div
              className='d-flex justify-content-between'
              onClick={() => handleSortByLabel('roleName')}
            >
              <p>Role</p>
              <div className='associatedContacts-label-btn labelCursor'>
                {sortOrder === 'asc' && sortField === 'roleName' ? (
                  <img
                    src={upArrowColoured}
                    alt='asc'
                    className='label-btn-img-1'
                  />
                ) : (
                  <img src={upArrow} alt='asc' className='label-btn-img-1' />
                )}
                {sortOrder === 'desc' && sortField === 'roleName' ? (
                  <img
                    src={downArrowColoured}
                    alt='desc'
                    className='label-btn-img-2'
                  />
                ) : (
                  <img src={downArrow} alt='desc' className='label-btn-img-2' />
                )}
              </div>
            </div>
            <Input
              type='text'
              value={filterInput.roleName}
              name='roleName'
              placeholder='Role'
              onChange={handleChangeFilter}
              onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
            />
          </th>
          <th>
            <div className='d-flex justify-content-end'>
              <Button
                type='button'
                color='success'
                className='mx-1'
                onClick={() => handleRefreshList()}
              >
                <MdSearch size={18} />
              </Button>
              <Button
                type='button'
                color='danger'
                className='mx-1'
                onClick={() => handleResetFilter()}
              >
                <MdFilterAltOff size={18} />
              </Button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {staffList?.map((staff, i) => (
          <tr
            key={staff.id}
            onClick={(e) => {
              e.stopPropagation();
              handleShow(staff.id);
            }}
            className='pe-cursor'
          >
            <td>
              <Input
                type='checkbox'
                checked={isSelected(staff.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleStaff(staff.id);
                }}
              />
            </td>
            <td>
              {/* <OverlayTrigger
                key="bottom"
                placement="bottom-start"
                overlay={
                  <Tooltip id={`tooltip-bottom`}>
                    <p
                      style={{ textAlign: "left" }}
                      className="mb-0"
                    >
                      {staff.userName}
                    </p>
                  </Tooltip>
                }
              > */}
              <p className='mb-0'>
                <TooltipWrapper
                  id={`username-${staff.id}`}
                  placement='bottom'
                  text={staff.userName}
                  content={convertSubstring(staff.userName)}
                ></TooltipWrapper>
                {/* {convertSubstring(staff.userName)} */}
              </p>
              {/* </OverlayTrigger> */}
            </td>
            <td>
              <p className='mb-0'>{staff.firstName}</p>
            </td>
            <td>
              <p className='mb-0'>{staff.lastName}</p>
            </td>
            <td>
              {/* <OverlayTrigger
                key="bottom"
                placement="bottom-start"
                overlay={
                  <Tooltip id={`tooltip-bottom`}>
                    <p
                      style={{ textAlign: "left" }}
                      className="mb-0"
                    >
                      {staff.emailId1}
                    </p>
                  </Tooltip>
                }
              > */}
              <p className='mb-0'>
                <TooltipWrapper
                  id={`email-${staff.id}`}
                  placement='bottom'
                  text={staff.emailId1}
                  content={convertSubstring(staff.emailId1)}
                ></TooltipWrapper>
              </p>
              {/* </OverlayTrigger> */}
            </td>
            <td>
              <p className='mb-0'>{staff.phoneNumber1}</p>
            </td>
            <td>
              <p className='mb-0'>
                {staff.staffActive ? 'Active' : 'Disabled'}
              </p>
            </td>
            <td>
              {/* <OverlayTrigger
                key="bottom"
                placement="bottom-start"
                overlay={
                  <Tooltip id={`tooltip-bottom`}>
                    <p
                      style={{ textAlign: "left" }}
                      className="mb-0"
                    >
                      {staff.roleName}
                    </p>
                  </Tooltip>
                }
              > */}
              <p className='mb-0'>
                <TooltipWrapper
                  id={`role-${staff.id}`}
                  placement='bottom'
                  text={staff.roleName}
                  content={convertSubstring(staff.roleName)}
                ></TooltipWrapper>
              </p>
              {/* </OverlayTrigger> */}
            </td>
            <td></td>
          </tr>
        ))}
      </tbody>

      <div className='user-tableHeader' style={{ display: 'none' }}>
        <div className='user-tableCol-small'>
          <Input
            type='checkbox'
            checked={
              staffList?.length > 0 &&
              selectedStaff?.length === staffList?.length
            }
            onChange={handleSelectAll}
          />
        </div>
        <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('userName')}
          >
            <p>Username</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'userName' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'userName' ? (
                <img
                  src={downArrowColoured}
                  alt='desc'
                  className='label-btn-img-2'
                />
              ) : (
                <img src={downArrow} alt='desc' className='label-btn-img-2' />
              )}
            </div>
          </div>
        </div>

        <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('firstName')}
          >
            <p>First Name</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'firstName' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'firstName' ? (
                <img
                  src={downArrowColoured}
                  alt='desc'
                  className='label-btn-img-2'
                />
              ) : (
                <img src={downArrow} alt='desc' className='label-btn-img-2' />
              )}
            </div>
          </div>
        </div>
        <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('lastName')}
          >
            <p>Last Name</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'lastName' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'lastName' ? (
                <img
                  src={downArrowColoured}
                  alt='desc'
                  className='label-btn-img-2'
                />
              ) : (
                <img src={downArrow} alt='desc' className='label-btn-img-2' />
              )}
            </div>
          </div>
        </div>
        <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('emailId1')}
          >
            <p>Email</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'emailId1' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'emailId1' ? (
                <img
                  src={downArrowColoured}
                  alt='desc'
                  className='label-btn-img-2'
                />
              ) : (
                <img src={downArrow} alt='desc' className='label-btn-img-2' />
              )}
            </div>
          </div>
        </div>
        <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('phoneNumber1')}
          >
            <p>Phone Number</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'phoneNumber1' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'phoneNumber1' ? (
                <img
                  src={downArrowColoured}
                  alt='desc'
                  className='label-btn-img-2'
                />
              ) : (
                <img src={downArrow} alt='desc' className='label-btn-img-2' />
              )}
            </div>
          </div>
        </div>
        <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('staffActive')}
          >
            <p>Status</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'staffActive' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'staffActive' ? (
                <img
                  src={downArrowColoured}
                  alt='desc'
                  className='label-btn-img-2'
                />
              ) : (
                <img src={downArrow} alt='desc' className='label-btn-img-2' />
              )}
            </div>
          </div>
        </div>
        <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('roleName')}
          >
            <p>Role</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'roleName' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'roleName' ? (
                <img
                  src={downArrowColoured}
                  alt='desc'
                  className='label-btn-img-2'
                />
              ) : (
                <img src={downArrow} alt='desc' className='label-btn-img-2' />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='user-tableFilter' style={{ display: 'none' }}>
        <div className='user-tableCol-small'>
          {/* <input type='checkbox' className='user-tableCheck' /> */}
        </div>
        {/* <div className='user-tableCol'>
          <input type='text' className='user-filterInput' />
        </div> */}
        <div className='user-tableCol'>
          <input
            type='text'
            className='user-filterInput'
            value={filterInput.userName}
            name='userName'
            onChange={handleChangeFilter}
            onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          />
        </div>
        <div className='user-tableCol'>
          <input
            type='text'
            className='user-filterInput'
            value={filterInput.firstName}
            name='firstName'
            onChange={handleChangeFilter}
            onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          />
        </div>
        <div className='user-tableCol'>
          <input
            type='text'
            className='user-filterInput'
            value={filterInput.lastName}
            name='lastName'
            onChange={handleChangeFilter}
            onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          />
        </div>
        <div className='user-tableCol'>
          <input
            type='text'
            className='user-filterInput'
            value={filterInput.emailId1}
            name='emailId1'
            onChange={handleChangeFilter}
            onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          />
        </div>
        <div className='user-tableCol'>
          <input
            type='text'
            className='user-filterInput'
            value={filterInput.phoneNumber1}
            name='phoneNumber1'
            onChange={handleChangeFilter}
            onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          />
        </div>
        <div className='user-tableCol'>
          {/* <input type='text' className='user-filterInput' /> */}
          <select
            className='user-filterInput'
            name='staffActive'
            onChange={handleStatusFilter}
            // onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          >
            <option
              value=''
              selected={
                filterInput.staffActive === '' ||
                filterInput.staffActive === null
              }
            >
              All
            </option>
            <option value={true} selected={filterInput.staffActive === true}>
              Active
            </option>
            <option value={false} selected={filterInput.staffActive === false}>
              Disabled
            </option>
          </select>
        </div>
        <div className='user-tableCol'>
          <input
            type='text'
            className='user-filterInput'
            value={filterInput.roleName}
            name='roleName'
            onChange={handleChangeFilter}
            onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          />
        </div>
      </div>
      <div className='user-tableContent' style={{ display: 'none' }}>
        {staffList?.map((staff, i) => (
          <div
            className='user-tableRowDiv pe-cursor'
            key={staff.id}
            onClick={(e) => {
              e.stopPropagation();
              handleShow(staff.id);
            }}
          >
            <div className='user-contentDiv-small'>
              <Input
                type='checkbox'
                checked={isSelected(staff.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleStaff(staff.id);
                }}
              />
            </div>
            <div className='user-contentDiv'>
              <OverlayTrigger
                key='bottom'
                placement='bottom-start'
                overlay={
                  <Tooltip id={`tooltip-bottom`}>
                    <p style={{ textAlign: 'left' }}>{staff.userName}</p>
                  </Tooltip>
                }
              >
                <p>{convertSubstring(staff.userName)}</p>
              </OverlayTrigger>
            </div>
            <div className='user-contentDiv'>
              <p>{staff.firstName}</p>
            </div>
            <div className='user-contentDiv'>
              <p>{staff.lastName}</p>
            </div>

            <div className='user-contentDiv'>
              <OverlayTrigger
                key='bottom'
                placement='bottom-start'
                overlay={
                  <Tooltip id={`tooltip-bottom`}>
                    <p style={{ textAlign: 'left' }}>{staff.emailId1}</p>
                  </Tooltip>
                }
              >
                <p>{convertSubstring(staff.emailId1)}</p>
              </OverlayTrigger>
            </div>
            <div className='user-contentDiv'>
              <p>{staff.phoneNumber1}</p>
            </div>
            <div className='user-contentDiv'>
              <p>{staff.staffActive ? 'Active' : 'Disabled'}</p>
            </div>
            <div className='user-contentDiv'>
              <OverlayTrigger
                key='bottom'
                placement='bottom-start'
                overlay={
                  <Tooltip id={`tooltip-bottom`}>
                    <p style={{ textAlign: 'left' }}>{staff.roleName}</p>
                  </Tooltip>
                }
              >
                <p>{convertSubstring(staff.roleName)}</p>
              </OverlayTrigger>
            </div>
          </div>
        ))}
      </div>
    </Table>
  );
};

export default StaffTable;
