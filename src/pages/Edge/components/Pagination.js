import React, { useState, Fragment } from "react";
import { Button, Input } from "reactstrap";

const Pagination = (props) => {
  const {
    pageNo,
    pageSize,
    totalRecords,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    handleJumpToPage,
    changeNumberOfRows,
  } = props;

  const [longLeftShift, setLongLeftShift] = useState(false);
  const [longRightShift, setLongRightShift] = useState(false);

  if (!totalRecords && !totalPages) {
    return null;
  }

  return (
    <div className="d-flex align-items-center justify-content-between mt-2 g-3 text-center text-sm-start">
      <div className="d-flex">
        {totalRecords === 0 ? (
          <div className="text-muted">
            Showing
            <span className="mx-1 fw-semibold">{`${0} to ${0} of ${totalRecords}`}</span>
          </div>
        ) : pageNo + 1 === totalPages ? (
          <div className="text-muted">
            Showing
            <span className="mx-1 fw-semibold">{`${
              1 + pageNo * pageSize
            }`}</span>
            to <span className="mx-1 fw-semibold">{totalRecords}</span>
            of <span className="mx-1 fw-semibold">{totalRecords}</span>
          </div>
        ) : (
          <div className="text-muted">
            Showing
            <span className="mx-1 fw-semibold">{`${
              1 + pageNo * pageSize
            }`}</span>
            to
            <span className="mx-1 fw-semibold">{(pageNo + 1) * pageSize}</span>
            of <span className="mx-1 fw-semibold">{totalRecords}</span>
          </div>
        )}
      </div>
      <div className="d-flex">
        <Button
          type="button"
          disabled={pageNo === 0}
          onClick={handlePreviousPage}
          color="light"
          className="mx-1"
        >
          Previous
        </Button>
        {pageNo + 1 >= 5 ? (
          <Fragment>
            <Button
              type="button"
              disabled={totalPages < 1}
              onClick={() => handleJumpToPage(1)}
              color={pageNo + 1 === 1 ? "primary" : "light"}
              className="mx-1"
            >
              1
            </Button>
            {!longLeftShift && (
              <Button
                onMouseEnter={() => setLongLeftShift(true)}
                color="light"
                className="mx-1"
              >
                ...
              </Button>
            )}
            {longLeftShift && (
              <Button
                type="button"
                onMouseLeave={() => setLongLeftShift(false)}
                onClick={() => {
                  setLongLeftShift(false);
                  handleJumpToPage(pageNo - 4);
                }}
                color="light"
                className="mx-1"
              >
                {"<<"}
              </Button>
            )}
            <Button
              type="button"
              disabled={totalPages < pageNo}
              onClick={() => handleJumpToPage(pageNo)}
              color={pageNo + 1 === pageNo ? "primary" : "light"}
              className="mx-1"
            >
              {pageNo}
            </Button>
            {pageNo + 1 !== totalPages && (
              <Button
                type="button"
                disabled={totalPages < pageNo + 1}
                onClick={() => handleJumpToPage(pageNo + 1)}
                color="primary"
                className="mx-1"
              >
                {pageNo + 1}
              </Button>
            )}
            {pageNo + 1 === totalPages || pageNo + 2 === totalPages ? (
              ""
            ) : (
              <Button
                type="button"
                disabled={totalPages < pageNo + 2}
                onClick={() => handleJumpToPage(pageNo + 2)}
                color={pageNo + 1 === pageNo + 2 ? "primary" : "light"}
                className="mx-1"
              >
                {pageNo + 2}
              </Button>
            )}
            {!longRightShift && (
              <Button
                type="button"
                disabled={totalPages <= pageNo + 5}
                onMouseEnter={() => setLongRightShift(true)}
                color="light"
                className="mx-1"
              >
                ...
              </Button>
            )}
            {longRightShift && (
              <Button
                type="button"
                disabled={totalPages <= pageNo + 5}
                onMouseLeave={() => setLongRightShift(false)}
                onClick={() => {
                  setLongRightShift(false);
                  handleJumpToPage(pageNo + 6);
                }}
                color="light"
                className="mx-1"
              >
                {">>"}
              </Button>
            )}
            <Button
              type="button"
              onClick={() => handleJumpToPage(totalPages)}
              color={pageNo + 1 === totalPages ? "primary" : "light"}
              className="mx-1"
            >
              {totalPages}
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            {totalPages >= 1 && (
              <Button
                type="button"
                disabled={totalPages < 1}
                onClick={() => handleJumpToPage(1)}
                color={pageNo + 1 === 1 ? "primary" : "light"}
                className="mx-1"
              >
                1
              </Button>
            )}
            {totalPages >= 2 && (
              <Button
                type="button"
                disabled={totalPages < 2}
                onClick={() => handleJumpToPage(2)}
                color={pageNo + 1 === 2 ? "primary" : "light"}
                className="mx-1"
              >
                2
              </Button>
            )}
            {totalPages >= 3 && (
              <Button
                type="button"
                disabled={totalPages < 3}
                onClick={() => handleJumpToPage(3)}
                color={pageNo + 1 === 3 ? "primary" : "light"}
                className="mx-1"
              >
                3
              </Button>
            )}
            {totalPages >= 4 && (
              <Button
                type="button"
                disabled={totalPages < 4}
                onClick={() => handleJumpToPage(4)}
                color={pageNo + 1 === 4 ? "primary" : "light"}
                className="mx-1"
              >
                4
              </Button>
            )}
            {totalPages >= 5 && (
              <Button
                type="button"
                disabled={totalPages < 5}
                onClick={() => handleJumpToPage(5)}
                color={pageNo + 1 === 5 ? "primary" : "light"}
                className="mx-1"
              >
                5
              </Button>
            )}
            {!longRightShift && totalPages > pageNo + 5 && (
              <Button
                type="button"
                disabled={totalPages < pageNo + 5}
                onMouseEnter={() => setLongRightShift(true)}
                color="light"
                className="mx-1"
              >
                ...
              </Button>
            )}
            {longRightShift && totalPages >= pageNo + 5 && (
              <Button
                type="button"
                disabled={totalPages <= pageNo + 5}
                onMouseLeave={() => setLongRightShift(false)}
                onClick={() => {
                  setLongRightShift(false);
                  handleJumpToPage(pageNo + 6);
                }}
                color="light"
                className="mx-1"
              >
                {">>"}
              </Button>
            )}
            {totalPages > 5 && (
              <Button
                type="button"
                onClick={() => handleJumpToPage(totalPages)}
                color={pageNo + 1 === totalPages ? "primary" : "light"}
                className="mx-1"
              >
                {totalPages}
              </Button>
            )}
          </Fragment>
        )}
        <Button
          type="button"
          disabled={pageNo === totalPages - 1 || totalPages === 0}
          color="light"
          className="mx-1"
          onClick={handleNextPage}
        >
          Next
        </Button>
      </div>
      <div className="d-flex">
        <Input
          type="select"
          name="select"
          onChange={changeNumberOfRows}
          value={pageSize}
        >
          <option value={25} selected={pageSize === 25}>
            25/page
          </option>
          <option value={50} selected={pageSize === 50}>
            50/page
          </option>
          <option value={100} selected={pageSize === 100}>
            100/page
          </option>
        </Input>
      </div>
    </div>
  );
};

export default Pagination;
