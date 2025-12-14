import React, { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { AiOutlineClose } from 'react-icons/ai';
import { formatDateFunc } from 'pages/Edge/utils/utilFunc';

const SelectedTimedList = (props) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (props.selectedList && props.selectedList.length) {
      setList(props.selectedList);
    }
  }, [props.selectedList]);

  const handleDelete = (e, arg) => {
    e.stopPropagation();

    let arr = list.filter((s) => s.id !== arg.id);

    setTimeout(() => {
      setList(arr);
    }, 10);

    if (props.onChange) {
      props.onChange('timeBillingList', arr);
    }
  };

  const ui = () => {
    if (list && list.length > 0) {
      return (
        <div>
          <div className='bg-light'>
            <p className='p-3'>Time Billing Items</p>
          </div>
          <Table responsive={true} striped={true} hover={true}>
            <thead>
              <tr>
                <td>
                  <p className='m-0'>Billed Date</p>
                </td>
                <td>
                  <p className='m-0'>Description</p>
                </td>
                <td>
                  <p className='m-0'>Units</p>
                </td>
                <td>
                  <p className='m-0'>Amount</p>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.id}>
                  <td>
                    <p className='m-0'>{formatDateFunc(l.billingDate)}</p>
                  </td>
                  <td>
                    <p className='m-0'>{l.description}</p>
                  </td>
                  <td>
                    <p className='m-0'>{l.units}</p>
                  </td>
                  <td>
                    <p className='m-0'>{l.total}</p>
                  </td>
                  <td>
                    <Button
                      onClick={(e) => handleDelete(e, l)}
                      disabled={props.disabled}
                      color='danger'
                    >
                      <AiOutlineClose size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    } else {
      return <></>;
    }
  };

  return ui();
};

export default SelectedTimedList;
