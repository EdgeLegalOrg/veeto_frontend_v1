import React, { useEffect, useState } from "react";
import { findDisplayname, formatDateFunc } from "../../../utils/utilFunc";

const ReceivedPaymentDetails = (props) => {
  const [list, setList] = useState([]);
  const [paymentType, setPaymentType] = useState([]);

  useEffect(() => {
    if (props.list && props.list.length > 0) {
      setList(props.list);
    }
  }, [props.list]);

  useEffect(() => {
    fetchEnums();
  }, []);

  const fetchEnums = () => {
    const enums = JSON.parse(window.localStorage.getItem("enumList"));
    if (enums && enums["PaymentType"]) {
      setPaymentType(enums["PaymentType"]);
    }
  };

  const ui = () => {
    if (props.show) {
      return (
        <>
          {list.map((payment) => (
            <tr key={payment.paymentId} className="pe-cursor">
              <td>
			  {/*<p className="mb-0">{payment.paymentNumber}</p>*/}
			  <p className="mb-0">{payment.paymentNumStr}</p>
              </td>
              <td>
                <p className="mb-0">
                  {payment.paymentDate
                    ? formatDateFunc(payment.paymentDate)
                    : ""}
                </p>
              </td>
              <td></td>
              <td>
                <p className="mb-0">
                  {findDisplayname(paymentType, payment.paymentType)}
                </p>
              </td>
              <td>
			    {/*<p className="mb-0">{`$${payment.amount}`}</p>*/}
				<p className="mb-0">{`$${payment.amount}`}</p>
              </td>
              <td></td>
              <td>
                <p className="mb-0">{payment.status}</p>
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </>
      );
    } else {
      return <></>;
    }
  };

  return ui();
};

export default ReceivedPaymentDetails;
