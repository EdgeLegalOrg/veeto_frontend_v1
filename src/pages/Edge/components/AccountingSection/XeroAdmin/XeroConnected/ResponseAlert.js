import React from 'react';

const ResponseAlert = (props) => {
  const ui = () => {
    if (props?.data?.length) {
      return props?.data?.map((error, i) => (
        <div className='m-b2' key={i + 1}>
          <p className='fs-16'>{`${error.entityId || 'id'} : ${
            error.validationErrors[0]
          }`}</p>
        </div>
      ));
    } else {
      return <></>;
    }
  };

  return <div className='p-4'>{ui()}</div>;
};

export default ResponseAlert;
