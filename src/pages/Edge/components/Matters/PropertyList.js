import React, { useState, useEffect } from 'react';

const PropertyList = (props) => {
  const [pList, setPList] = useState([]);
  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    setPList(props?.data?.propertyList);
  }, [props.data]);

  return (
    <div>
      <div className='mc-header-btns'>
        <p className='mc-heading'>Property</p>
        <button className='custodyAddbtn'>
          <span className='plusdiv'>+</span>Link
        </button>
      </div>
      <div className='mc-header'>
        <div className='mc-col xsm'>
          <input className='mc-check' type='checkbox' />
        </div>
        <div className='mc-col xlg'>
          <p>Title Ref.</p>
        </div>
        <div className='mc-col xlg'>
          <p>Address</p>
        </div>
      </div>
      {/************Table rows************ */}
      <div className='mc-tBody'>
        {pList?.map((property) => (
          <div
            className='mc-row'
            key={property.id}
            // onClick={}
          >
            <div className='mc-col xsm'>
              <input className='mc-check' type='checkbox' />
            </div>
            <div className='mc-col xlg'>
              <p>
                {property.titleReferences
                  ? property.titleReferences
                  : 'Title Ref.'}
              </p>
            </div>
            <div className='mc-col xlg'>
              <p>{property.address ? property.address : 'Address'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
