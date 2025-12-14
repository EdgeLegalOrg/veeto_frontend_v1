import React from 'react';
import { Input } from 'reactstrap';

const RoleType = (props) => {
  const {
    rightList,
    formData,
    handleChange,
    selectedRights,
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

  return (
    <div className='roleType-container'>
      {/************ Column 1 *********** */}
      <div className='roleType-col'>
        {rightList.map((right) => (
          <div className='roleType-contentDiv pe-cursor' key={right.id}>
            <Input
              type='checkbox'
              className='roleType-check'
              checked={isSelected(right.id)}
              onChange={() => handleSelect(right.id)}
            />
            <p className='roleType-label mb-0 my-1'>{right.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleType;
