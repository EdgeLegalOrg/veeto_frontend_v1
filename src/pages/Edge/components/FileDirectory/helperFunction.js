import word from "../../icons/fileDirectory/ms-word.svg";
import zip from "../../icons/fileDirectory/zip.svg";
import excel from "../../icons/fileDirectory/ms-excel.svg";
import pdf from "../../icons/fileDirectory/pdf.svg";

export const convertTitleCase = (str) => {
  const words = str?.toLowerCase().split("_");
  const convertedString = words
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return convertedString;
};

export const getFileIcon = (fileFormat) => {
  switch (fileFormat) {
    case "doc":
    case "docx":
      return word;
    case "zip":
      return zip;
    case "xls":
    case "xlsx":
      return excel;
    case "pdf":
      return pdf;
    default:
      return word; // Return a default icon or null for unsupported formats
  }
};
