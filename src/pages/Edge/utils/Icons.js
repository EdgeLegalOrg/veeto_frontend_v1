import excel from '../images/fileIcons/excel.png';
import image from '../images/fileIcons/image.png';
import mail from '../images/fileIcons/mail.png';
import pdf from '../images/fileIcons/pdf.png';
import word from '../images/fileIcons/word.png';
import other from '../images/fileIcons/other.png';

export const returnFileIcon = (type) => {
  switch (type ? type.toLowerCase() : type) {
    case 'doc':
    case 'docx':
    case 'rtf':
      return word;
    case 'email':
    case 'eml':
    case 'msg':
      return mail;
    case 'image':
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'tif':
      return image;
    case 'pdf':
      return pdf;
    case 'xls':
    case 'xlsx':
      return excel;
    default:
      return other;
  }
};

export const filterFileType = (list, type) => {
  let word = ['doc', 'docx', 'rtf'];
  let mail = ['email', 'eml', 'msg'];
  let image = ['image', 'jpeg', 'jpg', 'png', 'tif'];
  let pdf = ['pdf'];
  let excel = ['xls', 'xlsx'];

  let arr = [];

  if (type === 'WORD') {
    arr = list.filter((file) => word.includes(file?.type?.toLowerCase()));
  } else if (type === 'MAIL') {
    arr = list.filter((file) => mail.includes(file?.type?.toLowerCase()));
  } else if (type === 'IMAGE') {
    arr = list.filter((file) => image.includes(file?.type?.toLowerCase()));
  } else if (type === 'PDF') {
    arr = list.filter((file) => pdf.includes(file?.type?.toLowerCase()));
  } else if (type === 'EXCEL') {
    arr = list.filter((file) => excel.includes(file?.type?.toLowerCase()));
  } else if (type === 'ALL') {
    // arr = list.filter(
    //   (file) =>
    //     excel.includes(file?.type?.toLowerCase()) ||
    //     word.includes(file?.type?.toLowerCase()) ||
    //     mail.includes(file?.type?.toLowerCase()) ||
    //     image.includes(file?.type?.toLowerCase()) ||
    //     pdf.includes(file?.type?.toLowerCase())
    // );
    arr = list;
  } else {
    arr = list.filter(
      (file) =>
        !excel.includes(file.type.toLowerCase()) &&
        !word.includes(file.type.toLowerCase()) &&
        !mail.includes(file.type.toLowerCase()) &&
        !image.includes(file.type.toLowerCase()) &&
        !pdf.includes(file.type.toLowerCase())
    );
  }

  return arr;
};
