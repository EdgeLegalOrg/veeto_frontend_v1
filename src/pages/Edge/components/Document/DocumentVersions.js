import React from "react";
import { Button, Table } from "reactstrap";
import { formatDateFunc } from "../../utils/utilFunc";

const DocumentVersions = ({ docDetails, handleDownloadWithLink }) => {
  return (
    <div className="">
      <Table
        responsive={true}
        striped={true}
        hover={true}
      >
        <thead className="table-light">
          <tr>
            <th>Version</th>
            <th>Uploaded By</th>
            <th>Upload Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {docDetails.documentVersions?.map((version) => (
            <tr key={version?.id}>
              <td>{version?.version}</td>
              <td>{version?.uploadBy}</td>
              <td>
                {version?.uploadDate ? formatDateFunc(version?.uploadDate) : ""}
              </td>
              <td>
                {" "}
                <Button
                  color="success"
                  onClick={() =>
                    handleDownloadWithLink(
                      docDetails?.id,
                      `${docDetails?.name}${
                        docDetails?.type ? `.${docDetails?.type}` : ""
                      }`
                    )
                  }
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DocumentVersions;
