import React, { Fragment, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Table, Button, Input } from 'reactstrap';
import upArrow from '../../../images/upArrow.svg';
import downArrow from '../../../images/downArrow.svg';
import downArrowColoured from '../../../images/downArrowColoured.svg';
import upArrowColoured from '../../../images/upArrowColoured.svg';
import { MdFilterAltOff, MdSearch } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import '../../../stylesheets/ManageUserPage.css';
import { convertSubstring } from '../../../utils/utilFunc';
import TooltipWrapper from '../../../../../Components/Common/TooltipWrapper';

const UserTable = (props) => {
  const [labelSort, setLabelSort] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [sortField, setSortField] = useState('');

  const {
    handleUpdateRole,
    userList,
    handleRefreshList,
    filterInput,
    setFilterInput,
    setSelectedUser,
    selectedUser,
  } = props;

  // const handleSortByLabel = (field) => {
  //   if (labelSort !== field) {
  //     setLabelSort(field);
  //     setSortOrder('asc');
  //     setSortField(field);
  //   } else {
  //     setLabelSort('');
  //     setSortOrder('desc');
  //     setSortField(field);
  //   }
  // };

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

  const handleLockFilter = (e) => {
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

  const handleSelectUser = (id) => {
    const selectedIndex = selectedUser.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUser, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUser.slice(1));
    } else if (selectedIndex === selectedUser?.length - 1) {
      newSelected = newSelected.concat(selectedUser.slice(0, -1));
    } else {
      newSelected = newSelected.concat(
        selectedUser.slice(0, selectedIndex),
        selectedUser.slice(selectedIndex + 1)
      );
    }

    setSelectedUser(newSelected);
  };

  const handleSelectAllUser = (e) => {
    if (e.target.checked) {
      let newSelected = [];
      userList?.forEach((user) => newSelected.push(user.id));
      setSelectedUser(newSelected);
    } else {
      setSelectedUser([]);
    }
  };

  const isSelected = (id) => selectedUser.includes(id);

  const initialFilter = {
    userName: '',
    firstName: '',
    lastName: '',
    locked: false,
    sortOn: '',
    sortType: '',
    pageNo: 0,
    pageSize: 25,
  };

  const handleClearFilter = () => {
    setFilterInput(initialFilter);

    setTimeout(() => {
      handleRefreshList(initialFilter);
    }, 10);
  };

  return (
    <>
      <Table responsive={true} striped={true} hover={true}>
        <thead className='mb-2'>
          <tr>
            <th className='align-bottom'>
              <Input
                type='checkbox'
                checked={
                  userList?.length > 0 &&
                  selectedUser?.length === userList?.length
                }
                onChange={handleSelectAllUser}
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
                    <img
                      src={downArrow}
                      alt='desc'
                      className='label-btn-img-2'
                    />
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
                    <img
                      src={downArrow}
                      alt='desc'
                      className='label-btn-img-2'
                    />
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
                onClick={() => handleSortByLabel('userName')}
              >
                <p>Email</p>
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
                    <img
                      src={downArrow}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  )}
                </div>
              </div>
              <Input
                type='text'
                value={filterInput.userName}
                name='userName'
                placeholder='Email'
                onChange={handleChangeFilter}
                onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
              />
            </th>
            <th>
              <div
                className='d-flex justify-content-between'
                onClick={() => handleSortByLabel('lockStatus')}
              >
                <p>Lock Status</p>
                <div className='associatedContacts-label-btn labelCursor'>
                  {sortOrder === 'asc' && sortField === 'lockStatus' ? (
                    <img
                      src={upArrowColoured}
                      alt='asc'
                      className='label-btn-img-1'
                    />
                  ) : (
                    <img src={upArrow} alt='asc' className='label-btn-img-1' />
                  )}
                  {sortOrder === 'desc' && sortField === 'lockStatus' ? (
                    <img
                      src={downArrowColoured}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  )}
                </div>
              </div>
              <Input
                type='select'
                name='locked'
                onChange={handleLockFilter}
                // onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
              >
                <option
                  value=''
                  selected={
                    filterInput.locked === '' || filterInput.locked === null
                  }
                >
                  All
                </option>
                <option value={true} selected={filterInput.locked === true}>
                  Locked
                </option>
                <option value={false} selected={filterInput.locked === false}>
                  Unlocked
                </option>
              </Input>
            </th>
            <th className='align-top'>
              <div
                className='d-flex justify-content-between'
                onClick={() => handleSortByLabel('loginDate')}
              >
                <p>Last Login Date</p>
                <div className='associatedContacts-label-btn labelCursor'>
                  {sortOrder === 'asc' && sortField === 'loginDate' ? (
                    <img
                      src={upArrowColoured}
                      alt='asc'
                      className='label-btn-img-1'
                    />
                  ) : (
                    <img src={upArrow} alt='asc' className='label-btn-img-1' />
                  )}
                  {sortOrder === 'desc' && sortField === 'loginDate' ? (
                    <img
                      src={downArrowColoured}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  ) : (
                    <img
                      src={downArrow}
                      alt='desc'
                      className='label-btn-img-2'
                    />
                  )}
                </div>
              </div>
            </th>
            <th>
              <div className='d-flex'>
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
                  onClick={() => handleClearFilter()}
                >
                  <MdFilterAltOff size={18} />
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {userList?.map((user, i) => (
            <tr key={user.id} className='pe-cursor'>
              <td>
                <Input
                  type='checkbox'
                  className='user-rowCheck'
                  checked={isSelected(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              {/* <div className="user-contentDiv">
                  <p>{user.id}</p>
                </div> */}
              {/* <div
                  className="user-contentDiv"
                  onClick={handleUpdateRole}
                >
                  <p>Email</p>
                </div> */}
              <td onClick={() => handleUpdateRole(user.id)}>
                <p className='mb-0'>{user.firstName}</p>
              </td>
              <td onClick={() => handleUpdateRole(user.id)}>
                <p className='mb-0'>{user.lastName}</p>
              </td>
              <td onClick={() => handleUpdateRole(user.id)}>
                {/* <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p
                        style={{ textAlign: "left" }}
                        className="mb-0"
                      >
                        {user.userName}
                      </p>
                    </Tooltip>
                  }
                > */}
                <p className='mb-0'>
                  <TooltipWrapper
                    id={`username-${user.id}`}
                    placement='bottom'
                    text={user.userName}
                    content={convertSubstring(user.userName)}
                  ></TooltipWrapper>
                </p>
                {/* </OverlayTrigger> */}
              </td>
              <td onClick={() => handleUpdateRole(user.id)}>
                <p className='mb-0'>{user.locked ? 'Locked' : 'Unlocked'}</p>
              </td>
              <td onClick={() => handleUpdateRole(user.id)}>
                <p className='mb-0'>{''}</p>
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className='user-tableHeader' style={{ display: 'none' }}>
        <div className='user-tableCol-small'>
          <Input
            type='checkbox'
            className='user-tableCheck'
            checked={
              userList?.length > 0 && selectedUser?.length === userList?.length
            }
            onChange={handleSelectAllUser}
          />
        </div>
        {/* <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('employeeId')}
          >
            <p>Employee ID</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'employeeId' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'employeeId' ? (
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
        </div> */}
        {/* <div className='user-tableCol'>
          <div
            className='user-colLabel'
            onClick={() => handleSortByLabel('username')}
          >
            <p>User Name</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'username' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'username' ? (
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
        </div> */}
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
            onClick={() => handleSortByLabel('userName')}
          >
            <p>Email</p>
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
            onClick={() => handleSortByLabel('lockStatus')}
          >
            <p>Lock Status</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'lockStatus' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'lockStatus' ? (
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
            onClick={() => handleSortByLabel('loginDate')}
          >
            <p>Last Login Date</p>
            <div className='associatedContacts-label-btn labelCursor'>
              {sortOrder === 'asc' && sortField === 'loginDate' ? (
                <img
                  src={upArrowColoured}
                  alt='asc'
                  className='label-btn-img-1'
                />
              ) : (
                <img src={upArrow} alt='asc' className='label-btn-img-1' />
              )}
              {sortOrder === 'desc' && sortField === 'loginDate' ? (
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
        {/* <div className='user-tableCol'>
          <input type='text' className='user-filterInput' />
        </div> */}
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
            value={filterInput.userName}
            name='userName'
            onChange={handleChangeFilter}
            onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          />
        </div>
        <div className='user-tableCol'>
          {/* <input type='text' className='user-filterInput' /> */}
          <select
            className='user-filterInput'
            name='locked'
            onChange={handleLockFilter}
            // onKeyDown={(e) => e.key === 'Enter' && handleRefreshList()}
          >
            <option
              value=''
              selected={
                filterInput.locked === '' || filterInput.locked === null
              }
            >
              All
            </option>
            <option value={true} selected={filterInput.locked === true}>
              Locked
            </option>
            <option value={false} selected={filterInput.locked === false}>
              Unlocked
            </option>
          </select>
        </div>
        <div className='user-tableCol'>
          <input type='text' className='user-filterInput hide' />
        </div>
        <div className='user-tableCol-small'>
          <button className='searchButton' onClick={() => handleRefreshList()}>
            <MdSearch size={25} />
          </button>
        </div>
        <div className='user-tableCol-small'>
          <button className='searchButton' onClick={() => handleClearFilter()}>
            <AiOutlineClose size={25} />
          </button>
        </div>
      </div>
      <div className='user-tableContent' style={{ display: 'none' }}>
        {userList?.map((user, i) => (
          <div className='user-tableRowDiv pe-cursor' key={user.id}>
            <div className='user-contentDiv-small'>
              <Input
                type='checkbox'
                className='user-rowCheck'
                checked={isSelected(user.id)}
                onChange={() => handleSelectUser(user.id)}
              />
            </div>
            {/* <div className='user-contentDiv'>
              <p>{user.id}</p>
            </div> */}
            {/* <div className='user-contentDiv' onClick={handleUpdateRole}>
              <p>Email</p>
            </div> */}
            <div
              className='user-contentDiv'
              onClick={() => handleUpdateRole(user.id)}
            >
              <p>{user.firstName}</p>
            </div>
            <div
              className='user-contentDiv'
              onClick={() => handleUpdateRole(user.id)}
            >
              <p>{user.lastName}</p>
            </div>

            <div
              className='user-contentDiv'
              onClick={() => handleUpdateRole(user.id)}
            >
              <OverlayTrigger
                key='bottom'
                placement='bottom-start'
                overlay={
                  <Tooltip id={`tooltip-bottom`}>
                    <p style={{ textAlign: 'left' }}>{user.userName}</p>
                  </Tooltip>
                }
              >
                <p>{convertSubstring(user.userName)}</p>
              </OverlayTrigger>
            </div>
            <div
              className='user-contentDiv'
              onClick={() => handleUpdateRole(user.id)}
            >
              <p>{user.locked ? 'Locked' : 'Unlocked'}</p>
            </div>
            <div
              className='user-contentDiv'
              onClick={() => handleUpdateRole(user.id)}
            >
              <p>{''}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserTable;
